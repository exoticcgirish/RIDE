import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getDriverLocation } from "../../services/rideRequest.service";

const driverIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3203/3203071.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const MapUpdater = ({ location }) => {
  const map = useMap();

  useEffect(() => {
    if (location) {
      map.setView([location.latitude, location.longitude], 15);
    }
  }, [location, map]);

  return null;
};

const DriverLocationMap = ({ rideRequestId }) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let interval;

    const fetchLocation = async () => {
      try {
        const response = await getDriverLocation(rideRequestId);

        if (response.data.success) {
          setLocation(response.data.driverLocation);
          setError("");
        }
      } catch (err) {
        console.error("Failed to get driver location:", err);

        setError(
          err.response?.data?.message || "Unable to get driver location"
        );
      }
    };

    fetchLocation();

    interval = setInterval(fetchLocation, 5000);

    return () => clearInterval(interval);
  }, [rideRequestId]);

  if (error) {
    return (
      <div>
        <p>{error}</p>
      </div>
    );
  }

  if (!location) {
    return <p>Getting driver location...</p>;
  }

  return (
    <MapContainer
      center={[location.latitude, location.longitude]}
      zoom={15}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapUpdater location={location} />

      <Marker
        position={[location.latitude, location.longitude]}
        icon={driverIcon}
      >
        <Popup>
          <strong>Driver Location</strong>
          <br />
          Latitude: {location.latitude}
          <br />
          Longitude: {location.longitude}
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default DriverLocationMap;