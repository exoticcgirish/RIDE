import { useEffect, useRef } from "react";
import { mappls, mappls_plugin } from "mappls-web-maps";

const mapplsClassObject = new mappls();
const mapplsPluginObject = new mappls_plugin();

const RideMap = ({
  pickupInputId = "pickup-location-input",
  destinationInputId = "destination-location-input",
  onLocationSelect,
}) => {
  const mapRef = useRef(null);

  const pickupSearchRef = useRef(null);
  const destinationSearchRef = useRef(null);

  const callbackRef = useRef(onLocationSelect);

  /*
   * Keep latest callback without
   * recreating Mappls search.
   */
  useEffect(() => {
    callbackRef.current = onLocationSelect;
  }, [onLocationSelect]);

  /*
   * ---------------------------------------------------------
   * Validate coordinates
   * ---------------------------------------------------------
   */
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

  /*
   * ---------------------------------------------------------
   * Extract coordinates from Mappls result
   * ---------------------------------------------------------
   *
   * Mappls Search versions can return slightly
   * different response structures.
   */
  const extractCoordinates = (place) => {
    if (!place || typeof place !== "object") {
      return null;
    }

    const latitudeCandidates = [
      place.latitude,
      place.lat,
      place.Latitude,
      place.Lat,
      place.location?.latitude,
      place.location?.lat,
      place.geometry?.coordinates?.[1],
    ];

    const longitudeCandidates = [
      place.longitude,
      place.lng,
      place.lon,
      place.Longitude,
      place.Lng,
      place.Lon,
      place.location?.longitude,
      place.location?.lng,
      place.geometry?.coordinates?.[0],
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

    /*
     * Sometimes coordinates are directly
     * available as an array.
     *
     * GeoJSON:
     * [longitude, latitude]
     */
    if (Array.isArray(place.coordinates) && place.coordinates.length >= 2) {
      const longitude = Number(place.coordinates[0]);

      const latitude = Number(place.coordinates[1]);

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
    const nestedObjects = [
      place.result,
      place.data,
      place.location,
      place.geometry,
      place.place,
      place.placeDetails,
    ];

    for (const nested of nestedObjects) {
      if (nested && typeof nested === "object") {
        const result = extractCoordinates(nested);

        if (result) {
          return result;
        }
      }
    }

    return null;
  };

  /*
   * ---------------------------------------------------------
   * Normalize Mappls Search result
   * ---------------------------------------------------------
   */
  const normalizeSearchResult = (response) => {
    if (!response) {
      return null;
    }

    console.log("[RideMap] Raw Mappls response:", response);

    let place = response;

    /*
     * Mappls may return an array.
     */
    if (Array.isArray(place)) {
      place = place[0];
    }

    /*
     * result wrapper
     */
    if (place?.result) {
      place = place.result;

      if (Array.isArray(place)) {
        place = place[0];
      }
    }

    /*
     * data wrapper
     */
    if (place?.data) {
      place = place.data;

      if (Array.isArray(place)) {
        place = place[0];
      }
    }

    if (!place || typeof place !== "object") {
      console.error("[RideMap] Invalid Mappls selection:", response);

      return null;
    }

    /*
     * -------------------------------------------------------
     * Place name
     * -------------------------------------------------------
     */
    const placeName = String(
      place.placeName || place.name || place.place_name || "",
    ).trim();

    /*
     * -------------------------------------------------------
     * Place address
     * -------------------------------------------------------
     */
    const placeAddress = String(
      place.placeAddress || place.address || place.place_address || "",
    ).trim();

    /*
     * -------------------------------------------------------
     * eLoc
     * -------------------------------------------------------
     */
    const eLoc = String(
      place.eLoc || place.eloc || place.mapplsPin || place.mappls_pin || "",
    ).trim();

    if (!eLoc) {
      console.error("[RideMap] Selected Mappls location has no eLoc:", place);

      return null;
    }

    /*
     * -------------------------------------------------------
     * Full address
     * -------------------------------------------------------
     */
    let fullAddress = placeAddress;

    if (
      placeName &&
      placeAddress &&
      !placeAddress.toLowerCase().includes(placeName.toLowerCase())
    ) {
      fullAddress = `${placeName}, ${placeAddress}`;
    }

    if (!fullAddress) {
      fullAddress = placeName;
    }

    /*
     * -------------------------------------------------------
     * Coordinates
     * -------------------------------------------------------
     *
     * If Mappls Search provides them,
     * use them immediately.
     *
     * Otherwise backend will resolve them
     * using eLoc + Gemini.
     */
    const coordinates = extractCoordinates(place);

    const selectedPlace = {
      location: fullAddress,

      placeName: placeName || null,

      placeAddress: placeAddress || null,

      eLoc,

      coordinates,

      raw: place,
    };

    console.log("[RideMap] Normalized selected place:", selectedPlace);

    return selectedPlace;
  };

  /*
   * ---------------------------------------------------------
   * Handle selection
   * ---------------------------------------------------------
   */
  const handleSelection = (response, locationType) => {
    console.log(`[RideMap] Mappls selected ${locationType}:`, response);

    const selectedPlace = normalizeSearchResult(response);

    if (!selectedPlace) {
      return;
    }

    console.log(`[RideMap] Final ${locationType} selection:`, selectedPlace);

    if (typeof callbackRef.current === "function") {
      callbackRef.current(selectedPlace, locationType);
    }
  };

  /*
   * ---------------------------------------------------------
   * Initialize Mappls
   * ---------------------------------------------------------
   */
  useEffect(() => {
    const token = import.meta.env.VITE_MAPPLS_KEY;

    if (!token) {
      console.error("[RideMap] Mappls key is missing.");

      return;
    }

    let mounted = true;

    mapplsClassObject.initialize(
      token,
      {
        map: true,
        plugins: ["search"],
      },
      () => {
        if (!mounted) {
          return;
        }

        /*
         * ---------------------------------------------------
         * Create map
         * ---------------------------------------------------
         */
        const map = mapplsClassObject.Map({
          id: "ridelink-map",

          properties: {
            center: [28.6139, 77.209],

            zoom: 10,

            traffic: false,

            geolocation: false,
          },
        });

        mapRef.current = map;

        map.addListener("load", () => {
          if (!mounted) {
            return;
          }

          console.log("[RideMap] Mappls map loaded.");

          /*
           * ------------------------------------------------
           * Pickup search
           * ------------------------------------------------
           */
          const pickupInput = document.getElementById(pickupInputId);

          if (pickupInput) {
            pickupSearchRef.current = mapplsPluginObject.search(
              pickupInput,

              {
                location: [28.6139, 77.209],

                region: "IND",

                height: 300,

                width: "100%",

                tokenizeAddress: true,

                geolocation: false,

                clearButton: true,

                searchChars: 2,
              },

              (response) => {
                handleSelection(response, "pickup");
              },
            );

            console.log("[RideMap] Pickup search initialized.");
          } else {
            console.warn(`[RideMap] Pickup input #${pickupInputId} not found.`);
          }

          /*
           * ------------------------------------------------
           * Destination search
           * ------------------------------------------------
           */
          const destinationInput = document.getElementById(destinationInputId);

          if (destinationInput) {
            destinationSearchRef.current = mapplsPluginObject.search(
              destinationInput,

              {
                location: [28.6139, 77.209],

                region: "IND",

                height: 300,

                width: "100%",

                tokenizeAddress: true,

                geolocation: false,

                clearButton: true,

                searchChars: 2,
              },

              (response) => {
                handleSelection(response, "destination");
              },
            );

            console.log("[RideMap] Destination search initialized.");
          } else {
            console.warn(
              `[RideMap] Destination input #${destinationInputId} not found.`,
            );
          }
        });
      },
    );

    /*
     * -------------------------------------------------------
     * Cleanup
     * -------------------------------------------------------
     */
    return () => {
      mounted = false;

      try {
        if (pickupSearchRef.current?.remove) {
          pickupSearchRef.current.remove();
        }
      } catch (error) {
        console.warn("[RideMap] Pickup search cleanup failed:", error);
      }

      try {
        if (destinationSearchRef.current?.remove) {
          destinationSearchRef.current.remove();
        }
      } catch (error) {
        console.warn("[RideMap] Destination search cleanup failed:", error);
      }

      pickupSearchRef.current = null;

      destinationSearchRef.current = null;

      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (error) {
          console.warn("[RideMap] Map cleanup failed:", error);
        }

        mapRef.current = null;
      }
    };
  }, [pickupInputId, destinationInputId]);

  return (
    <div className='space-y-2'>
      <div
        style={{
          width: "100%",
          height: "500px",
          overflow: "hidden",
          borderRadius: "16px",
        }}
      >
        <div
          id='ridelink-map'
          style={{
            width: "100%",
            height: "100%",
          }}
        />
      </div>

      <p className='text-sm text-gray-500'>
        Select pickup and destination from the Mappls suggestions. Coordinates
        are automatically resolved and stored with the selected locations.
      </p>
    </div>
  );
};

export default RideMap;
