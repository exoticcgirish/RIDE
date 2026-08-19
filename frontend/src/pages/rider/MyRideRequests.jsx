import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, RefreshCw } from "lucide-react";

import {
  getMyRideRequests,
  cancelRideRequest,
  deleteRideRequest,
} from "../../services/rideApi";

import RideRequestCard from "../../components/rider/RideRequestCard";

function MyRideRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRequests = async (showLoader = false) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      setError("");

      const res = await getMyRideRequests();

      console.log("🚗 UPDATED RIDE DATA:", res.data);

      setRequests(
        res.data?.data ||
          res.data?.rideRequests ||
          res.data?.requests ||
          res.data ||
          [],
      );
    } catch (err) {
      console.error("❌ Load requests failed:", err);

      setError(
        err.response?.data?.message || "Failed to load your ride requests.",
      );
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadRequests(true);
    const interval = setInterval(() => {
      loadRequests(false);
    }, 3000);

    return () => clearInterval(interval);
  }, []);
  const handleEdit = async (id) => {
    const confirmed = window.alert("this is not currently available");
    return;
  };
  const handleCancel = async (id) => {
    const confirmed = window.confirm("Are you sure you want to cancel This?");

    if (!confirmed) return;
    try {
      await cancelRideRequest(id);
      loadRequests();
    } catch (err) {
      console.error("Cancel failed:", err);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete This?");

    if (!confirmed) return;
    try {
      await deleteRideRequest(id);
      loadRequests();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className='min-h-screen bg-gray-100'>
      <div className='max-w-7xl mx-auto px-6 py-8'>
        <div className='flex items-center justify-between mb-10'>
          <div className='flex items-center gap-5'>
            <button
              onClick={() => navigate("/dashboard")}
              className='w-12 h-12 rounded-full bg-yellow-400 hover:bg-yellow-500 flex items-center justify-center transition cursor-pointer'
            >
              <ArrowLeft size={22} />
            </button>

            <div>
              <p className='text-yellow-500 font-semibold uppercase tracking-wider'>
                Manage Rides
              </p>
              <h1 className='text-4xl font-bold text-gray-900'>
                My Ride Requests
              </h1>
              <p className='text-gray-500 mt-2'>
                View, cancel, or remove your posted ride requests.
              </p>
            </div>
          </div>

          <div className='hidden md:flex items-center gap-3'>
            <div className='bg-white rounded-2xl shadow-md px-6 py-4'>
              <p className='text-sm text-gray-500'>Active Requests</p>
              <h2 className='text-3xl font-bold'>{requests.length}</h2>
            </div>
          </div>
        </div>

        {loading && (
          <div className='bg-white rounded-3xl shadow-lg p-16 text-center'>
            <div className='flex justify-center'>
              <div className='w-14 h-14 rounded-full border-4 border-yellow-400 border-t-transparent animate-spin'></div>
            </div>
            <h2 className='text-2xl font-bold mt-8'>Loading Requests...</h2>
            <p className='text-gray-500 mt-3'>
              Please wait while we fetch your active requests.
            </p>
          </div>
        )}

        {!loading && error && (
          <div className='bg-red-100 border border-red-200 rounded-3xl p-8'>
            <h2 className='text-2xl font-bold text-red-700'>Failed to Load</h2>
            <p className='mt-3 text-red-600'>{error}</p>
            <button
              onClick={loadRequests}
              className='mt-6 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition cursor-pointer inline-flex items-center gap-2'
            >
              <RefreshCw size={18} /> Try Again
            </button>
          </div>
        )}

        {!loading && !error && requests.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='bg-white rounded-3xl shadow-lg p-16 text-center'
          >
            <div className='text-7xl'>🚗</div>
            <h2 className='text-3xl font-bold mt-6'>No Ride Requests Found</h2>
            <p className='text-gray-500 mt-3'>
              You haven't posted any active ride requests.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className='mt-8 bg-yellow-400 hover:bg-yellow-500 px-8 py-3 rounded-xl font-semibold transition cursor-pointer'
            >
              Request a Ride Now
            </button>
          </motion.div>
        )}

        {!loading && !error && requests.length > 0 && (
          <div className='grid md:grid-cols-2 xl:grid-cols-3 gap-6'>
            {requests.map((request) => (
              <RideRequestCard
                key={request._id || request.id}
                request={request}
                // onEdit={() =>
                //   navigate(`/ride-requests/edit/${request._id || request.id}`)
                // }
                onEdit={handleEdit}
                onCancel={handleCancel}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyRideRequests;
