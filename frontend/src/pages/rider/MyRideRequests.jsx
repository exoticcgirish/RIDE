import { useEffect, useState } from "react";

import {
  getMyRideRequests,
  cancelRideRequest,
  deleteRideRequest,
} from "../../services/rideApi";

import RideRequestCard from "../../components/rider/RideRequestCard";

function MyRideRequests() {
  const [requests, setRequests] = useState([]);

  const loadRequests = async () => {
    try {
      const res = await getMyRideRequests();
      setRequests(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleCancel = async (id) => {
    await cancelRideRequest(id);
    loadRequests();
  };

  const handleDelete = async (id) => {
    await deleteRideRequest(id);
    loadRequests();
  };

  return (
    <div>
      <h2>My Ride Requests</h2>

      {requests.length === 0 ? (
        <p>No Ride Requests Found.</p>
      ) : (
        requests.map((request) => (
          <RideRequestCard
            key={request._id}
            request={request}
            onEdit={() => {}}
            onCancel={handleCancel}
            onDelete={handleDelete}
          />
        ))
      )}
    </div>
  );
}

export default MyRideRequests;
