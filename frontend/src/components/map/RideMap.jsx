import { useEffect, useRef } from "react";
import { mappls } from "mappls-web-maps";

const mapplsClassObject = new mappls();

const RideMap = ({ onLocationSelect, locationType }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const callbackRef = useRef(onLocationSelect);

  useEffect(() => {
    callbackRef.current = onLocationSelect;
  }, [onLocationSelect]);

  useEffect(() => {
    const token = import.meta.env.VITE_MAPPLS_KEY;

    if (!token) {
      console.error("Mappls key is missing");
      return;
    }

    mapplsClassObject.initialize(
      token,
      { map: true },
      () => {
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
          console.log("Map loaded");

          map.addListener("click", (event) => {
            console.log("Map clicked:", event);

            const lat = event?.lngLat?.lat;
            const lng = event?.lngLat?.lng;

            if (
              typeof lat !== "number" ||
              typeof lng !== "number"
            ) {
              console.error("Invalid coordinates:", event);
              return;
            }

            const coordinates = {
              latitude: lat,
              longitude: lng,
            };

            console.log("Selected coordinates:", coordinates);

            if (markerRef.current) {
              markerRef.current.remove();
              markerRef.current = null;
            }

            markerRef.current = new mapplsClassObject.Marker({
              map,
              position: {
                lat,
                lng,
              },
            });

            if (typeof callbackRef.current === "function") {
              callbackRef.current(coordinates);
            }
          });
        });
      }
    );

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div>
      <div
        style={{
          width: "100%",
          height: "500px",
        }}
      >
        <div
          id="ridelink-map"
          style={{
            width: "100%",
            height: "100%",
          }}
        />
      </div>

      <p className="mt-2 text-sm text-gray-500">
        Click on the map to select your{" "}
        {locationType === "pickup" ? "pickup" : "destination"} location.
      </p>
    </div>
  );
};

export default RideMap;