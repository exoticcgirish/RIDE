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
  ChevronRight,
  RefreshCw,
  History,
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
      setError("");

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

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "waiting":
        return {
          label: "Waiting",
          className: "bg-amber-50 text-amber-700 border-amber-200",
          dot: "bg-amber-500",
        };

      case "accepted":
        return {
          label: "Accepted",
          className: "bg-blue-50 text-blue-700 border-blue-200",
          dot: "bg-blue-500",
        };

      case "in_progress":
      case "in-progress":
        return {
          label: "In Progress",
          className: "bg-indigo-50 text-indigo-700 border-indigo-200",
          dot: "bg-indigo-500",
        };

      case "completed":
        return {
          label: "Completed",
          className: "bg-emerald-50 text-emerald-700 border-emerald-200",
          dot: "bg-emerald-500",
        };

      case "cancelled":
      case "canceled":
        return {
          label: "Cancelled",
          className: "bg-red-50 text-red-700 border-red-200",
          dot: "bg-red-500",
        };

      default:
        return {
          label: status || "Unknown",
          className: "bg-gray-50 text-gray-600 border-gray-200",
          dot: "bg-gray-400",
        };
    }
  };

  const handleCardClick = (e, id) => {
    if (e?.stopPropagation) {
      e.stopPropagation();
    }

    if (!id || id === "undefined") {
      console.error("Ride ID is missing on this object:", id);
      return;
    }

    navigate(`/ride-requests/${id}`);
  };

  return (
    <div className='min-h-screen bg-slate-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 lg:py-10'>
        <div className='flex items-start justify-between gap-4 mb-7 sm:mb-10'>
          <div className='flex items-start gap-3 sm:gap-5 min-w-0'>
            <button
              type='button'
              onClick={() => navigate("/dashboard")}
              aria-label='Back to dashboard'
              className='w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-yellow-400 hover:bg-yellow-500 active:scale-95 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm shrink-0'
            >
              <ArrowLeft size={20} className='sm:w-[22px] sm:h-[22px]' />
            </button>

            <div className='min-w-0'>
              <div className='flex items-center gap-2 mb-1'>
                <History size={15} className='text-yellow-500' />

                <p className='text-yellow-600 font-bold uppercase tracking-[0.14em] text-[10px] sm:text-xs'>
                  Ride History
                </p>
              </div>

              <h1 className='text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight'>
                Your Trips
              </h1>

              <p className='text-gray-500 mt-1.5 text-sm sm:text-base max-w-xl'>
                View your previous ride requests and their current status.
              </p>
            </div>
          </div>

          <div className='hidden sm:block shrink-0'>
            <div className='bg-white border border-gray-100 rounded-2xl shadow-sm px-5 py-4 min-w-[145px]'>
              <p className='text-xs font-medium text-gray-500 uppercase tracking-wide'>
                Total Rides
              </p>

              <div className='flex items-end gap-2 mt-1'>
                <h2 className='text-2xl sm:text-3xl font-extrabold text-gray-900'>
                  {rides.length}
                </h2>

                <span className='text-xs text-gray-400 mb-1.5'>requests</span>
              </div>
            </div>
          </div>
        </div>

        <div className='sm:hidden bg-white border border-gray-100 rounded-2xl shadow-sm px-4 py-3 mb-6 flex items-center justify-between'>
          <div>
            <p className='text-xs font-medium text-gray-500 uppercase tracking-wide'>
              Total Rides
            </p>

            <p className='text-2xl font-extrabold text-gray-900 mt-0.5'>
              {rides.length}
            </p>
          </div>

          <div className='w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center'>
            <History size={19} className='text-yellow-600' />
          </div>
        </div>

        {loading && (
          <div className='bg-white border border-gray-100 rounded-3xl shadow-sm p-10 sm:p-16 text-center'>
            <div className='w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-yellow-50 mx-auto flex items-center justify-center'>
              <div className='w-7 h-7 sm:w-8 sm:h-8 rounded-full border-[3px] border-yellow-400 border-t-transparent animate-spin' />
            </div>

            <h2 className='text-xl sm:text-2xl font-bold text-gray-900 mt-6'>
              Loading your trips
            </h2>

            <p className='text-gray-500 mt-2 text-sm sm:text-base'>
              Please wait while we fetch your ride history.
            </p>
          </div>
        )}

        {!loading && error && (
          <div className='bg-white border border-red-100 rounded-3xl shadow-sm p-6 sm:p-10 text-center'>
            <div className='w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto'>
              <RefreshCw size={24} className='text-red-500' />
            </div>

            <h2 className='text-xl sm:text-2xl font-bold text-gray-900 mt-5'>
              Unable to load rides
            </h2>

            <p className='text-gray-500 mt-2 max-w-md mx-auto text-sm sm:text-base'>
              {error}
            </p>

            <button
              type='button'
              onClick={fetchRideHistory}
              className='mt-6 inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 active:scale-[0.98] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 cursor-pointer'
            >
              <RefreshCw size={17} />
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && rides.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className='bg-white border border-gray-100 rounded-3xl shadow-sm p-8 sm:p-14 text-center'
          >
            <div className='w-20 h-20 rounded-3xl bg-yellow-50 mx-auto flex items-center justify-center'>
              <History size={34} className='text-yellow-500' />
            </div>

            <h2 className='text-2xl sm:text-3xl font-extrabold text-gray-900 mt-6'>
              No ride history yet
            </h2>

            <p className='text-gray-500 mt-2 max-w-md mx-auto text-sm sm:text-base leading-6'>
              You haven't created any ride requests yet. Your trips will appear
              here once you book a ride.
            </p>

            <button
              type='button'
              onClick={() => navigate("/dashboard")}
              className='mt-7 bg-yellow-400 hover:bg-yellow-500 active:scale-[0.98] text-gray-900 px-7 py-3.5 rounded-xl font-bold transition-all duration-200 cursor-pointer shadow-sm'
            >
              Create Your First Ride
            </button>
          </motion.div>
        )}

        {!loading && !error && rides.length > 0 && (
          <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6'>
            {rides.map((ride, index) => {
              const rideId = ride._id || ride.id;
              const pickupLocation = ride.pickupLocation || "N/A";
              const destination =
                ride.destination || ride.dropoffLocation || "N/A";
              const status = getStatusConfig(ride.status);

              return (
                <motion.div
                  key={rideId || index}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.25,
                    delay: Math.min(index * 0.04, 0.2),
                  }}
                  whileHover={{ y: -4 }}
                  onClick={() => handleCardClick(null, rideId)}
                  className='group cursor-pointer bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-xl hover:border-gray-200 transition-all duration-300 p-4 sm:p-6 flex flex-col min-w-0 overflow-hidden'
                >
                  <div className='flex items-center justify-between gap-3 pb-4 border-b border-gray-100'>
                    <div className='flex items-center gap-3 min-w-0'>
                      <div className='w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0'>
                        <History size={19} className='text-gray-600' />
                      </div>

                      <div className='min-w-0'>
                        <p className='text-[11px] uppercase tracking-wider text-gray-400 font-semibold'>
                          Trip
                        </p>

                        <h2 className='font-bold text-gray-900 text-base sm:text-lg truncate'>
                          Ride Request
                        </h2>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border text-[11px] sm:text-xs font-bold shrink-0 ${status.className}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${status.dot}`}
                      />
                      {status.label}
                    </span>
                  </div>

                  <div className='py-5'>
                    <div className='flex gap-3 sm:gap-4 min-w-0'>
                      <div className='flex flex-col items-center shrink-0'>
                        <div className='w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center'>
                          <MapPin className='text-emerald-600' size={19} />
                        </div>

                        <div className='w-px h-10 border-l border-dashed border-gray-300 my-1' />

                        <div className='w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center'>
                          <MapPin className='text-red-500' size={19} />
                        </div>
                      </div>

                      <div className='flex-1 min-w-0'>
                        <div className='h-11'>
                          <p className='text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-gray-400'>
                            Pickup
                          </p>

                          <h3
                            title={pickupLocation}
                            className='font-semibold text-gray-900 text-sm sm:text-base mt-1 leading-5 line-clamp-2 break-words'
                          >
                            {pickupLocation}
                          </h3>
                        </div>

                        <div className='h-12' />

                        <div className='min-w-0'>
                          <p className='text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-gray-400'>
                            Destination
                          </p>

                          <h3
                            title={destination}
                            className='font-semibold text-gray-900 text-sm sm:text-base mt-1 leading-5 line-clamp-2 break-words'
                          >
                            {destination}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-2.5 sm:gap-3'>
                    <div className='bg-slate-50 rounded-2xl p-3 sm:p-3.5'>
                      <div className='flex items-center gap-2'>
                        <Calendar
                          size={16}
                          className='text-yellow-500 shrink-0'
                        />

                        <span className='text-[11px] sm:text-xs font-medium text-gray-500'>
                          Date
                        </span>
                      </div>

                      <p className='font-bold text-gray-900 text-xs sm:text-sm mt-2 truncate'>
                        {ride.departureDate
                          ? new Date(ride.departureDate).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>

                    <div className='bg-slate-50 rounded-2xl p-3 sm:p-3.5'>
                      <div className='flex items-center gap-2'>
                        <Clock size={16} className='text-yellow-500 shrink-0' />

                        <span className='text-[11px] sm:text-xs font-medium text-gray-500'>
                          Time
                        </span>
                      </div>

                      <p className='font-bold text-gray-900 text-xs sm:text-sm mt-2 truncate'>
                        {ride.departureTime || "N/A"}
                      </p>
                    </div>

                    <div className='bg-slate-50 rounded-2xl p-3 sm:p-3.5'>
                      <div className='flex items-center gap-2'>
                        <Users size={16} className='text-yellow-500 shrink-0' />

                        <span className='text-[11px] sm:text-xs font-medium text-gray-500'>
                          Seats
                        </span>
                      </div>

                      <p className='font-bold text-gray-900 text-xs sm:text-sm mt-2'>
                        {ride.seatsRequired || ride.seats || 1}
                      </p>
                    </div>

                    <div className='bg-slate-50 rounded-2xl p-3 sm:p-3.5 min-w-0'>
                      <div className='flex items-center gap-2'>
                        <FileText
                          size={16}
                          className='text-yellow-500 shrink-0'
                        />

                        <span className='text-[11px] sm:text-xs font-medium text-gray-500'>
                          Notes
                        </span>
                      </div>

                      <p
                        title={ride.notes || "N/A"}
                        className='font-bold text-gray-900 text-xs sm:text-sm mt-2 truncate'
                      >
                        {ride.notes || "N/A"}
                      </p>
                    </div>
                  </div>

                  <button
                    type='button'
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardClick(null, rideId);
                    }}
                    className='mt-4 sm:mt-5 w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 active:scale-[0.99] text-gray-900 py-3 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer'
                  >
                    View Ride Details
                    <ChevronRight
                      size={17}
                      className='group-hover:translate-x-0.5 transition-transform'
                    />
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
