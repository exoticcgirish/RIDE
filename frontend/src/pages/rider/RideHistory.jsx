import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  FileText,
} from "lucide-react";

import { getMyRideRequests } from "../../services/rideApi";

function RideHistory() {
  const navigate = useNavigate();

  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRideHistory();
  }, []);

  const fetchRideHistory = async () => {
    try {
      setLoading(true);
      const res = await getMyRideRequests();

      setRides(
        res.data?.data ||
          res.data?.rideRequests ||
          res.data?.requests ||
          res.data ||
          [],
      );
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load ride history.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "waiting":
        return "bg-yellow-100 text-yellow-700";
      case "accepted":
        return "bg-blue-100 text-blue-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleCardClick = (e, id) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }

    if (!id || id === "undefined") {
      console.error("Ride ID is missing on this object:", id);
      return;
    }

    navigate(`/ride-requests/${id}`);
  };

  return (
    <div className='min-h-screen bg-gray-100'>
      <div className='max-w-7xl mx-auto px-6 py-8'>
        {/* Header */}
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
                Ride History
              </p>
              <h1 className='text-4xl font-bold text-gray-900'>Your Trips</h1>
              <p className='text-gray-500 mt-2'>
                View all your ride requests and their status.
              </p>
            </div>
          </div>

          <div className='hidden md:flex items-center gap-3'>
            <div className='bg-white rounded-2xl shadow-md px-6 py-4'>
              <p className='text-sm text-gray-500'>Total Requests</p>
              <h2 className='text-3xl font-bold'>{rides.length}</h2>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className='bg-white rounded-3xl shadow-lg p-16 text-center'>
            <div className='flex justify-center'>
              <div className='w-14 h-14 rounded-full border-4 border-yellow-400 border-t-transparent animate-spin'></div>
            </div>
            <h2 className='text-2xl font-bold mt-8'>Loading Ride History...</h2>
            <p className='text-gray-500 mt-3'>
              Please wait while we fetch your rides.
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className='bg-red-100 border border-red-200 rounded-3xl p-8'>
            <h2 className='text-2xl font-bold text-red-700'>Failed to Load</h2>
            <p className='mt-3 text-red-600'>{error}</p>
            <button
              onClick={fetchRideHistory}
              className='mt-6 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl'
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && rides.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='bg-white rounded-3xl shadow-lg p-16 text-center'
          >
            <div className='text-7xl'>🚗</div>
            <h2 className='text-3xl font-bold mt-6'>No Ride History Found</h2>
            <p className='text-gray-500 mt-3'>
              You haven't created any ride requests yet.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className='mt-8 bg-yellow-400 hover:bg-yellow-500 px-8 py-3 rounded-xl font-semibold transition'
            >
              Create Your First Ride
            </button>
          </motion.div>
        )}

        {/* Ride Cards */}
        {!loading && !error && rides.length > 0 && (
          <div className='grid md:grid-cols-2 xl:grid-cols-3 gap-6'>
            {rides.map((ride) => {
              const rideId = ride._id || ride.id;

              return (
                <motion.div
                  key={rideId}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ duration: 0.25 }}
                  onClick={() => handleCardClick(rideId)}
                  className='cursor-pointer bg-white rounded-3xl shadow-lg hover:shadow-2xl p-6 flex flex-col justify-between'
                >
                  <div>
                    {/* Header */}
                    <div className='flex justify-between items-center'>
                      <h2 className='font-bold text-xl'>Ride Request</h2>
                      <span
                        className={`px-4 py-1 rounded-full text-sm font-semibold capitalize ${getStatusClass(
                          ride.status,
                        )}`}
                      >
                        {ride.status}
                      </span>
                    </div>

                    {/* Route */}
                    <div className='mt-8 space-y-5'>
                      <div className='flex gap-4'>
                        <div className='w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0'>
                          <MapPin className='text-green-600' size={20} />
                        </div>
                        <div>
                          <p className='text-gray-500 text-sm'>Pickup</p>
                          <h3 className='font-semibold text-lg'>
                            {ride.pickupLocation}
                          </h3>
                        </div>
                      </div>

                      <div className='ml-6 h-10 border-l-2 border-dashed border-gray-300'></div>

                      <div className='flex gap-4'>
                        <div className='w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0'>
                          <MapPin className='text-red-600' size={20} />
                        </div>
                        <div>
                          <p className='text-gray-500 text-sm'>Destination</p>
                          <h3 className='font-semibold text-lg'>
                            {ride.destination || ride.dropoffLocation}
                          </h3>
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className='grid grid-cols-2 gap-4 mt-8'>
                      <div className='bg-gray-50 rounded-2xl p-4'>
                        <div className='flex items-center gap-2'>
                          <Calendar size={18} className='text-yellow-500' />
                          <span className='text-gray-500 text-sm'>Date</span>
                        </div>
                        <p className='font-semibold mt-2 text-sm'>
                          {ride.departureDate
                            ? new Date(ride.departureDate).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>

                      <div className='bg-gray-50 rounded-2xl p-4'>
                        <div className='flex items-center gap-2'>
                          <Clock size={18} className='text-yellow-500' />
                          <span className='text-gray-500 text-sm'>Time</span>
                        </div>
                        <p className='font-semibold mt-2 text-sm'>
                          {ride.departureTime || "N/A"}
                        </p>
                      </div>

                      <div className='bg-gray-50 rounded-2xl p-4'>
                        <div className='flex items-center gap-2'>
                          <Users size={18} className='text-yellow-500' />
                          <span className='text-gray-500 text-sm'>Seats</span>
                        </div>
                        <p className='font-semibold mt-2 text-sm'>
                          {ride.seatsRequired || ride.seats || 1}
                        </p>
                      </div>

                      <div className='bg-gray-50 rounded-2xl p-4'>
                        <div className='flex items-center gap-2'>
                          <FileText size={18} className='text-yellow-500' />
                          <span className='text-gray-500 text-sm'>Notes</span>
                        </div>
                        <p className='font-semibold mt-2 text-sm truncate'>
                          {ride.notes || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type='button'
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardClick(rideId);
                    }}
                    className='mt-8 w-full bg-yellow-400 hover:bg-yellow-500 py-3 rounded-xl font-semibold transition cursor-pointer'
                  >
                    View Details
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default RideHistory;
