const axios = require("axios");

const MAPPLS_KEY = process.env.MAPPLS_KEY || process.env.VITE_MAPPLS_KEY;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const isValidCoordinates = (latitude, longitude) => {
  return (
    Number.isFinite(Number(latitude)) &&
    Number.isFinite(Number(longitude)) &&
    Number(latitude) >= -90 &&
    Number(latitude) <= 90 &&
    Number(longitude) >= -180 &&
    Number(longitude) <= 180
  );
};
const extractCoordinates = (data) => {
  if (!data) {
    return null;
  }
  const latitudeCandidates = [data.latitude, data.lat, data.Latitude, data.Lat];

  const longitudeCandidates = [
    data.longitude,
    data.lng,
    data.lon,
    data.Longitude,
    data.Lng,
    data.Lon,
  ];

  for (let i = 0; i < latitudeCandidates.length; i++) {
    const latitude = Number(latitudeCandidates[i]);

    const longitude = Number(longitudeCandidates[i]);

    if (isValidCoordinates(latitude, longitude)) {
      return {
        latitude,
        longitude,
      };
    }
  }

  if (Array.isArray(data.coordinates) && data.coordinates.length >= 2) {
    const longitude = Number(data.coordinates[0]);

    const latitude = Number(data.coordinates[1]);

    if (isValidCoordinates(latitude, longitude)) {
      return {
        latitude,
        longitude,
      };
    }
  }

  /*
   * Search nested objects.
   */

  const nestedKeys = [
    "location",
    "geometry",
    "result",
    "data",
    "place",
    "placeDetails",
    "response",
    "properties",
  ];

  for (const key of nestedKeys) {
    if (!data[key]) {
      continue;
    }

    const result = extractCoordinates(data[key]);

    if (result) {
      return result;
    }
  }

  /*
   * Array.
   */

  if (Array.isArray(data)) {
    if (data.length >= 2) {
      const first = Number(data[0]);

      const second = Number(data[1]);

      if (first >= -180 && first <= 180 && second >= -90 && second <= 90) {
        return {
          latitude: second,
          longitude: first,
        };
      }
    }

    for (const item of data) {
      const result = extractCoordinates(item);

      if (result) {
        return result;
      }
    }
  }

  return null;
};

const KNOWN_LOCATIONS = {
  A63442: {
    latitude: 28.461281,
    longitude: 77.494908,

    name: "GNIOT Group of Institutions",

    source: "known-eloc",
  },
};

const resolveKnownELoc = (eLoc) => {
  if (!eLoc) {
    return null;
  }

  const normalized = String(eLoc).trim().toUpperCase();

  const known = KNOWN_LOCATIONS[normalized];

  if (!known) {
    return null;
  }

  const result = {
    latitude: known.latitude,

    longitude: known.longitude,

    source: known.source,

    eLoc: normalized,
  };

  console.log("[location] Known eLoc coordinates:", result);

  return result;
};

const resolveFromMapplsPlaceDetails = async (eLoc) => {
  if (!eLoc) {
    return null;
  }

  if (!MAPPLS_KEY) {
    console.warn("[location] MAPPLS_KEY is missing.");

    return null;
  }

  try {
    console.log("[location] Trying Mappls Place Details:", eLoc);

    const url = `https://place.mappls.com/O2O/entity/place-details/${encodeURIComponent(
      eLoc,
    )}`;

    const response = await axios.get(url, {
      params: {
        access_token: MAPPLS_KEY,
      },

      timeout: 10000,
    });

    console.log(
      "[location] Mappls Place Details:",
      JSON.stringify(response.data, null, 2),
    );

    const coordinates = extractCoordinates(response.data);

    if (coordinates) {
      const result = {
        ...coordinates,

        source: "mappls-place-details",

        eLoc,
      };

      console.log("[location] Mappls Place Details coordinates:", result);

      return result;
    }

    console.warn("[location] Mappls Place Details has no coordinates.");

    return null;
  } catch (error) {
    console.error(
      "[location] Mappls Place Details failed:",
      error.response?.data || error.message,
    );

    return null;
  }
};

const resolveFromMapplsGeocoding = async ({
  address,
  placeName,
  placeAddress,
  eLoc,
}) => {
  if (!MAPPLS_KEY) {
    console.warn("[location] MAPPLS_KEY is missing.");

    return null;
  }

  /*
   * Build clean address.
   */

  const cleanPlaceName = String(placeName || "")
    .trim()
    .replace(/\s+/g, " ");

  const cleanPlaceAddress = String(placeAddress || address || "")
    .trim()
    .replace(/\s+/g, " ");

  /*
   * Avoid leading comma.
   */

  let fullAddress = "";

  if (cleanPlaceName && cleanPlaceAddress) {
    fullAddress = `${cleanPlaceName}, ${cleanPlaceAddress}`;
  } else {
    fullAddress = cleanPlaceName || cleanPlaceAddress;
  }

  if (!fullAddress) {
    return null;
  }

  /*
   * Try multiple queries.
   *
   * POI query first.
   */

  const queries = [];

  if (cleanPlaceName) {
    queries.push({
      address: fullAddress,

      podFilter: "poi",
    });
  }

  queries.push({
    address: fullAddress,
  });

  if (cleanPlaceAddress && cleanPlaceAddress !== fullAddress) {
    queries.push({
      address: cleanPlaceAddress,
    });
  }

  for (const query of queries) {
    try {
      console.log("[location] Trying Mappls Geocoding:", query);

      const response = await axios.get(
        "https://search.mappls.com/search/address/geocode",
        {
          params: {
            address: query.address,

            itemCount: 5,

            region: "IND",

            access_token: MAPPLS_KEY,

            ...(query.podFilter
              ? {
                  podFilter: query.podFilter,
                }
              : {}),
          },

          timeout: 10000,
        },
      );

      console.log(
        "[location] Mappls Geocoding response:",
        JSON.stringify(response.data, null, 2),
      );

      const data = response.data;

      let results =
        data?.copResults ?? data?.results ?? data?.result ?? data?.data ?? data;

      if (!Array.isArray(results)) {
        results = [results];
      }

      for (const result of results) {
        if (!result || typeof result !== "object") {
          continue;
        }

        const coordinates = extractCoordinates(result);

        if (!coordinates) {
          continue;
        }

        /*
         * Prefer POI / exact matches.
         */

        const geocodeLevel = String(
          result.geocodeLevel || result.geocodelevel || "",
        ).toLowerCase();

        const resultELoc = String(result.eLoc || result.eloc || "").trim();

        const confidence = Number(result.confidenceScore);

        const output = {
          ...coordinates,

          source: "mappls-geocoding",

          eLoc: resultELoc || eLoc || null,

          geocodeLevel: geocodeLevel || null,

          confidenceScore: Number.isFinite(confidence) ? confidence : null,
        };

        console.log("[location] Mappls Geocoding coordinates found:", output);

        return output;
      }

      console.warn(
        "[location] Mappls Geocoding returned no usable coordinates.",
      );
    } catch (error) {
      console.error(
        "[location] Mappls Geocoding failed:",
        error.response?.data || error.message,
      );
    }
  }

  return null;
};

const resolveFromOSM = async ({ address, placeName, placeAddress }) => {
  const cleanPlaceName = String(placeName || "")
    .trim()
    .replace(/\s+/g, " ");

  const cleanPlaceAddress = String(placeAddress || address || "")
    .trim()
    .replace(/\s+/g, " ");

  const queries = [];

  if (cleanPlaceName && cleanPlaceAddress) {
    queries.push(`${cleanPlaceName}, ${cleanPlaceAddress}`);
  }

  if (cleanPlaceAddress) {
    queries.push(cleanPlaceAddress);
  }

  if (cleanPlaceName) {
    queries.push(cleanPlaceName + ", Greater Noida, Uttar Pradesh, India");
  }

  for (const query of queries) {
    try {
      console.log("[location] Trying OpenStreetMap:", query);

      const response = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params: {
            format: "json",

            q: query,

            limit: 3,

            countrycodes: "in",
          },

          headers: {
            "User-Agent": "RideLink/1.0",
          },

          timeout: 10000,
        },
      );

      const results = response.data;

      if (Array.isArray(results)) {
        for (const result of results) {
          const latitude = Number(result.lat);

          const longitude = Number(result.lon);

          if (isValidCoordinates(latitude, longitude)) {
            const output = {
              latitude,
              longitude,

              source: "osm",

              eLoc: null,
            };

            console.log("[location] OSM coordinates found:", output);

            return output;
          }
        }
      }

      console.warn("[location] OSM returned no coordinates:", query);
    } catch (error) {
      console.error(
        "[location] OSM failed:",
        error.response?.data || error.message,
      );
    }
  }

  return null;
};

const resolveFromGemini = async ({
  address,
  placeName,
  placeAddress,
  eLoc,
}) => {
  if (!GEMINI_API_KEY) {
    return null;
  }

  const cleanAddress = String(placeAddress || address || placeName || "")
    .trim()
    .replace(/\s+/g, " ");

  if (!cleanAddress) {
    return null;
  }

  try {
    console.log("[location] Gemini coordinate fallback:", {
      address: cleanAddress,

      placeName,

      eLoc,
    });

    const prompt = `
Find the exact latitude and longitude of this real location in India.

Name:
${placeName || "Unknown"}

Address:
${cleanAddress}

Mappls eLoc:
${eLoc || "Unknown"}

Return JSON only:

{
  "latitude": 0,
  "longitude": 0,
  "confidence": "high"
}

If you cannot confidently identify the exact location:

{
  "latitude": null,
  "longitude": null,
  "confidence": "low"
}
`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],

        generationConfig: {
          temperature: 0,

          responseMimeType: "application/json",
        },
      },
      {
        params: {
          key: GEMINI_API_KEY,
        },

        timeout: 20000,
      },
    );

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return null;
    }

    const parsed = JSON.parse(text);

    const latitude = Number(parsed.latitude);

    const longitude = Number(parsed.longitude);

    if (!isValidCoordinates(latitude, longitude)) {
      return null;
    }

    if (String(parsed.confidence || "").toLowerCase() === "low") {
      return null;
    }

    return {
      latitude,
      longitude,

      source: "gemini",

      eLoc: eLoc || null,

      confidence: parsed.confidence || "medium",
    };
  } catch (error) {
    if (error.response?.status === 429) {
      console.warn("[location] Gemini quota exceeded. Skipping Gemini.");

      return null;
    }

    console.error(
      "[location] Gemini failed:",
      error.response?.data || error.message,
    );

    return null;
  }
};

const resolveCoordinates = async ({
  address,
  eLoc = null,
  placeName = null,
  placeAddress = null,
  coordinates = null,
}) => {
  const finalAddress = String(placeAddress || address || placeName || "")
    .trim()
    .replace(/\s+/g, " ");

  if (!finalAddress) {
    throw new Error("Location address is required.");
  }

  console.log("[location] Resolving location:", {
    address: finalAddress,

    eLoc,

    placeName,

    placeAddress,

    coordinates,
  });

  if (
    coordinates &&
    isValidCoordinates(coordinates.latitude, coordinates.longitude)
  ) {
    const result = {
      latitude: Number(coordinates.latitude),

      longitude: Number(coordinates.longitude),

      source: "frontend",

      eLoc: eLoc || null,
    };

    console.log("[location] Using frontend coordinates:", result);

    return result;
  }

  if (eLoc) {
    const knownResult = resolveKnownELoc(eLoc);

    if (knownResult) {
      return knownResult;
    }
  }

  if (eLoc) {
    const placeDetailsResult = await resolveFromMapplsPlaceDetails(eLoc);

    if (placeDetailsResult) {
      return placeDetailsResult;
    }
  }

  const mapplsGeocodeResult = await resolveFromMapplsGeocoding({
    address: finalAddress,

    placeName,

    placeAddress,

    eLoc,
  });

  if (mapplsGeocodeResult) {
    console.log("[location] Successfully resolved using Mappls Geocoding.");

    return mapplsGeocodeResult;
  }

  const osmResult = await resolveFromOSM({
    address: finalAddress,

    placeName,

    placeAddress,
  });

  if (osmResult) {
    console.log("[location] Successfully resolved using OpenStreetMap.");

    return {
      ...osmResult,

      eLoc: eLoc || null,
    };
  }

  const geminiResult = await resolveFromGemini({
    address: finalAddress,

    placeName,

    placeAddress,

    eLoc,
  });

  if (geminiResult) {
    console.log("[location] Successfully resolved using Gemini:", geminiResult);

    return geminiResult;
  }
  console.error("[location] ALL coordinate resolution methods failed:", {
    address: finalAddress,

    eLoc,
  });

  throw new Error(`Could not determine coordinates for "${finalAddress}".`);
};

module.exports = {
  resolveCoordinates,
};
