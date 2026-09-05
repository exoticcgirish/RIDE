import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { ArrowLeft, RefreshCw, Trash2, Ban, AlertTriangle } from "lucide-react";

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

  const [confirmModal, setConfirmModal] = useState({
    open: false,
    type: null,
    id: null,
  });

  const [actionLoading, setActionLoading] = useState(false);

  const handleViewDriverDetails = (request) => {
    navigate(`/driver-details/${request._id}`, {
      state: {
        request,
      },
    });
  };

  const extractRequests = (responseData) => {
    if (Array.isArray(responseData)) {
      return responseData;
    }

    if (Array.isArray(responseData?.data)) {
      return responseData.data;
    }

    if (Array.isArray(responseData?.rideRequests)) {
      return responseData.rideRequests;
    }

    if (Array.isArray(responseData?.requests)) {
      return responseData.requests;
    }

    return [];
  };

  const loadRequests = async (showLoader = false) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      setError("");

      const response = await getMyRideRequests();

      console.log("UPDATED RIDE DATA:", response.data);

      const nextRequests = extractRequests(response.data);

      setRequests(nextRequests);
    } catch (err) {
      console.error("Load requests failed:", err);

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

    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleEdit = () => {
    toast.info("Edit ride is currently not available.", {
      position: "top-center",
      autoClose: 2500,
      closeOnClick: true,
      pauseOnHover: true,
    });
  };

  const openConfirmModal = (type, id) => {
    setConfirmModal({
      open: true,
      type,
      id,
    });
  };

  const closeConfirmModal = () => {
    if (actionLoading) {
      return;
    }

    setConfirmModal({
      open: false,
      type: null,
      id: null,
    });
  };

  const handleCancel = (id) => {
    openConfirmModal("cancel", id);
  };

  const handleDelete = (id) => {
    openConfirmModal("delete", id);
  };

  const handleConfirmAction = async () => {
    if (!confirmModal.id || !confirmModal.type) {
      return;
    }

    try {
      setActionLoading(true);

      if (confirmModal.type === "cancel") {
        await cancelRideRequest(confirmModal.id);

        toast.success("Ride request cancelled successfully.", {
          position: "top-center",
          autoClose: 2500,
        });
      }

      if (confirmModal.type === "delete") {
        await deleteRideRequest(confirmModal.id);

        toast.success("Ride request deleted successfully.", {
          position: "top-center",
          autoClose: 2500,
        });
      }

      setConfirmModal({
        open: false,
        type: null,
        id: null,
      });

      await loadRequests(false);
    } catch (err) {
      console.error(`${confirmModal.type} ride failed:`, err);

      toast.error(
        err.response?.data?.message ||
          `Failed to ${confirmModal.type} ride request.`,
        {
          position: "top-center",
          autoClose: 3000,
        },
      );
    } finally {
      setActionLoading(false);
    }
  };

  const isDelete = confirmModal.type === "delete";
  const isCancel = confirmModal.type === "cancel";

  const modalTitle = isDelete ? "Delete this ride?" : "Cancel this ride?";

  const modalMessage = isDelete
    ? "This ride request will be permanently deleted. This action cannot be undone."
    : "This ride request will be cancelled and you will no longer be matched with a driver.";

  return (
    <div className='min-h-screen bg-gray-100 overflow-x-hidden'>
      <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 lg:py-8'>
        <div className='flex items-center justify-between gap-3 mb-6 sm:mb-8 lg:mb-10'>
          <div className='flex items-center gap-3 sm:gap-5 min-w-0'>
            <button
              type='button'
              onClick={() => navigate("/dashboard")}
              className='w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-yellow-400 hover:bg-yellow-500 flex items-center justify-center transition cursor-pointer shadow-sm shrink-0'
              aria-label='Back to dashboard'
            >
              <ArrowLeft size={19} className='sm:w-[22px] sm:h-[22px]' />
            </button>

            <div className='min-w-0'>
              <p className='text-yellow-500 font-semibold uppercase tracking-wider text-[10px] sm:text-xs'>
                Manage Rides
              </p>

              <h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight'>
                My Ride Requests
              </h1>

              <p className='text-gray-500 mt-1 sm:mt-2 text-xs sm:text-sm lg:text-base'>
                View your ride status, driver, OTP, and completed rides.
              </p>
            </div>
          </div>

          <div className='hidden sm:flex items-center gap-3 shrink-0'>
            <div className='bg-white rounded-xl sm:rounded-2xl shadow-sm sm:shadow-md px-4 sm:px-6 py-3 sm:py-4'>
              <p className='text-xs sm:text-sm text-gray-500'>
                Active Requests
              </p>

              <h2 className='text-xl sm:text-3xl font-bold'>
                {requests.length}
              </h2>
            </div>
          </div>
        </div>

        <div className='sm:hidden bg-white rounded-xl shadow-sm px-4 py-3 mb-5 flex items-center justify-between'>
          <span className='text-sm text-gray-500'>Active Requests</span>

          <span className='text-xl font-bold'>{requests.length}</span>
        </div>

        {loading && (
          <div className='bg-white rounded-2xl sm:rounded-3xl shadow-md sm:shadow-lg p-8 sm:p-12 lg:p-16 text-center'>
            <div className='flex justify-center'>
              <div className='w-11 h-11 sm:w-14 sm:h-14 rounded-full border-4 border-yellow-400 border-t-transparent animate-spin' />
            </div>

            <h2 className='text-xl sm:text-2xl font-bold mt-6 sm:mt-8'>
              Loading Requests...
            </h2>

            <p className='text-gray-500 mt-2 sm:mt-3 text-sm sm:text-base'>
              Please wait while we fetch your ride requests.
            </p>
          </div>
        )}

        {!loading && error && (
          <div className='bg-red-50 border border-red-200 rounded-2xl sm:rounded-3xl p-5 sm:p-8'>
            <h2 className='text-xl sm:text-2xl font-bold text-red-700'>
              Failed to Load
            </h2>

            <p className='mt-2 sm:mt-3 text-red-600 text-sm sm:text-base'>
              {error}
            </p>

            <button
              type='button'
              onClick={() => loadRequests(true)}
              className='mt-5 bg-red-500 hover:bg-red-600 text-white px-5 sm:px-6 py-3 rounded-xl font-semibold transition cursor-pointer inline-flex items-center gap-2 text-sm sm:text-base'
            >
              <RefreshCw size={18} />
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && requests.length === 0 && (
          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className='bg-white rounded-2xl sm:rounded-3xl shadow-md sm:shadow-lg p-8 sm:p-12 lg:p-16 text-center'
          >
            <div className='text-5xl sm:text-7xl'>🚗</div>

            <h2 className='text-2xl sm:text-3xl font-bold mt-5 sm:mt-6'>
              No Ride Requests Found
            </h2>

            <p className='text-gray-500 mt-2 sm:mt-3 text-sm sm:text-base max-w-md mx-auto'>
              You haven't posted any active ride requests.
            </p>

            <button
              type='button'
              onClick={() => navigate("/dashboard")}
              className='mt-6 sm:mt-8 bg-yellow-400 hover:bg-yellow-500 px-6 sm:px-8 py-3 rounded-xl font-semibold transition cursor-pointer text-sm sm:text-base'
            >
              Request a Ride Now
            </button>
          </motion.div>
        )}

        {!loading && !error && requests.length > 0 && (
          <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 items-start'>
            {requests.map((request) => (
              <RideRequestCard
                key={request._id || request.id}
                request={request}
                onEdit={handleEdit}
                onCancel={handleCancel}
                onDelete={handleDelete}
                onViewDriverDetails={handleViewDriverDetails}
              />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {confirmModal.open && (
          <motion.div
            className='fixed inset-0 z-[9999] flex items-center justify-center p-4'
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
          >
            <motion.div
              className='absolute inset-0 bg-black/40 backdrop-blur-sm'
              onClick={closeConfirmModal}
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
            />

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.94,
                y: 15,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.94,
                y: 15,
              }}
              transition={{
                duration: 0.2,
              }}
              className='relative z-10 w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-8 max-h-[90vh] overflow-y-auto'
              onClick={(event) => event.stopPropagation()}
            >
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mb-4 sm:mb-5 ${
                  isDelete
                    ? "bg-red-100 text-red-600"
                    : "bg-orange-100 text-orange-600"
                }`}
              >
                {isDelete ? <Trash2 size={24} /> : <Ban size={24} />}
              </div>

              <h2 className='text-xl sm:text-2xl font-bold text-gray-900'>
                {modalTitle}
              </h2>

              <p className='text-gray-500 mt-2 sm:mt-3 leading-relaxed text-sm sm:text-base'>
                {modalMessage}
              </p>

              <div className='mt-4 sm:mt-5 flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-4'>
                <AlertTriangle
                  size={19}
                  className='text-yellow-500 flex-shrink-0 mt-0.5'
                />

                <p className='text-xs sm:text-sm text-gray-600'>
                  Please make sure you want to continue before confirming this
                  action.
                </p>
              </div>

              <div className='flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 sm:gap-3 mt-6 sm:mt-7'>
                <button
                  type='button'
                  onClick={closeConfirmModal}
                  disabled={actionLoading}
                  className='w-full sm:w-auto px-5 sm:px-6 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base'
                >
                  No, Keep It
                </button>

                <button
                  type='button'
                  onClick={handleConfirmAction}
                  disabled={actionLoading}
                  className={`w-full sm:w-auto px-5 sm:px-6 py-3 rounded-xl text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base ${
                    isDelete
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-orange-500 hover:bg-orange-600"
                  }`}
                >
                  {actionLoading ? (
                    <>
                      <span className='w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin' />
                      Processing...
                    </>
                  ) : isDelete ? (
                    <>
                      <Trash2 size={18} />
                      Yes, Delete
                    </>
                  ) : (
                    <>
                      <Ban size={18} />
                      Yes, Cancel
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MyRideRequests;
