import { motion } from "framer-motion";
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  FileText,
  Edit,
  Trash2,
  Ban,
  Phone,
  Car,
  User,
  ShieldCheck,
  Play,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

function RideRequestCard({
  request,
  onEdit,
  onCancel,
  onDelete,
  onViewDriverDetails,
}) {
  const group =
    request?.groupId && typeof request.groupId === "object"
      ? request.groupId
      : null;

  const status = group?.status || request?.status || "waiting";

  const driver =
    request?.assignedDriver && typeof request.assignedDriver === "object"
      ? request.assignedDriver
      : group?.assignedDriver && typeof group.assignedDriver === "object"
        ? group.assignedDriver
        : null;

  const rideOtp = group?.rideOtp || request?.rideOtp || null;

  const statusColors = {
    waiting: "bg-yellow-100 text-yellow-700",
    grouped: "bg-indigo-100 text-indigo-700",
    accepted: "bg-green-100 text-green-700",
    in_progress: "bg-blue-100 text-blue-700",
    completed: "bg-gray-100 text-gray-700",
    cancelled: "bg-red-100 text-red-700",
  };

  const statusLabels = {
    waiting: "Waiting",
    grouped: "Group Ready",
    accepted: "Driver Accepted",
    in_progress: "Ride In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  const getDriverName = () => {
    if (!driver) {
      return "Driver";
    }

    return (
      driver.full_name ||
      driver.fullName ||
      driver.name ||
      driver.username ||
      driver.email ||
      "Driver"
    );
  };

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Not specified";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Not specified";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <motion.div
      whileHover={{
        y: -4,
        scale: 1.005,
      }}
      transition={{
        duration: 0.2,
      }}
      className='rounded-3xl bg-white shadow-xl border border-gray-100 p-6'
    >
      <div className='flex justify-between items-start gap-4'>
        <div className='min-w-0 flex-1'>
          <div className='flex items-center gap-2 min-w-0'>
            <MapPin className='text-indigo-600 flex-shrink-0' size={22} />

            <h2
              className='text-xl font-bold text-gray-800 truncate min-w-0'
              title={request.pickupLocation || "Pickup location"}
            >
              {request.pickupLocation || "Pickup location"}
            </h2>
          </div>

          <div className='text-center text-gray-400 my-1 text-lg'>↓</div>

          <h2
            className='text-xl font-bold text-gray-800 truncate min-w-0'
            title={request.destination || "Destination"}
          >
            {request.destination || "Destination"}
          </h2>
        </div>

        <span
          className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap flex-shrink-0 ${
            statusColors[status] || "bg-gray-100 text-gray-700"
          }`}
        >
          {statusLabels[status] || status}
        </span>
      </div>

      <div className='border-t my-5' />

      <div className='grid md:grid-cols-2 gap-4 text-gray-700'>
        <div className='flex items-center gap-3 min-w-0'>
          <Calendar className='text-indigo-600 flex-shrink-0' size={18} />

          <span className='truncate'>{formatDate(request.departureDate)}</span>
        </div>

        <div className='flex items-center gap-3 min-w-0'>
          <Clock className='text-indigo-600 flex-shrink-0' size={18} />

          <span className='truncate'>
            {request.departureTime || "Not specified"}
          </span>
        </div>

        <div className='flex items-center gap-3 min-w-0'>
          <Users className='text-indigo-600 flex-shrink-0' size={18} />

          <span>{request.seatsRequired || 1} Seat(s)</span>
        </div>

        <div className='flex items-start gap-3 md:col-span-2'>
          <FileText className='text-indigo-600 mt-1 flex-shrink-0' size={18} />

          <p className='text-gray-600 break-words'>
            {request.notes || "No additional notes."}
          </p>
        </div>
      </div>

      {status === "grouped" && (
        <div className='mt-6 rounded-2xl bg-indigo-50 border border-indigo-200 p-5'>
          <div className='flex items-start gap-3'>
            <div className='w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0'>
              <Users size={20} className='text-indigo-600' />
            </div>

            <div>
              <p className='font-extrabold text-indigo-800'>
                Ride group is ready
              </p>

              <p className='text-sm text-indigo-600 mt-1'>
                Your ride has been grouped. Waiting for a driver to accept the
                group.
              </p>
            </div>
          </div>
        </div>
      )}

      {status === "accepted" && (
        <div className='mt-6 space-y-3'>
          {driver && (
            <div className='bg-green-50 border border-green-200 rounded-2xl p-4'>
              <div className='flex items-center gap-3 mb-3'>
                <div className='w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0'>
                  <Car className='text-green-600' size={20} />
                </div>

                <div>
                  <h3 className='text-base font-extrabold text-green-800'>
                    Driver Assigned
                  </h3>

                  <p className='text-xs text-green-600'>
                    Your ride has been accepted
                  </p>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-2'>
                <div className='bg-white rounded-xl p-3 border border-green-100 min-w-0'>
                  <div className='flex items-center gap-2'>
                    <User className='text-green-600 shrink-0' size={17} />

                    <div className='min-w-0'>
                      <p className='text-[11px] text-gray-500'>Driver</p>

                      <p
                        className='font-bold text-gray-800 truncate'
                        title={getDriverName()}
                      >
                        {getDriverName()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className='bg-white rounded-xl p-3 border border-green-100 min-w-0'>
                  <div className='flex items-center gap-2'>
                    <Phone className='text-green-600 shrink-0' size={17} />

                    <div className='min-w-0'>
                      <p className='text-[11px] text-gray-500'>Phone</p>

                      {driver.phone ? (
                        <a
                          href={`tel:${driver.phone}`}
                          className='font-bold text-gray-800 hover:text-green-600 truncate block'
                        >
                          {driver.phone}
                        </a>
                      ) : (
                        <p className='font-bold text-gray-800'>Not available</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type='button'
                onClick={() => onViewDriverDetails?.(request)}
                className='w-full mt-3 inline-flex items-center justify-center gap-2 bg-white hover:bg-green-50 border border-green-200 text-green-700 px-4 py-2.5 rounded-xl font-bold text-sm transition-all'
              >
                View Driver Details
                <ArrowRight size={17} />
              </button>
            </div>
          )}

          {rideOtp ? (
            <div className='rounded-2xl bg-[#fffaf0] border-2 border-[#fdbd00] px-4 py-3'>
              <div className='flex items-center justify-between gap-4'>
                <div className='flex items-center gap-3 min-w-0'>
                  <div className='w-9 h-9 rounded-lg bg-[#fff0bd] flex items-center justify-center shrink-0'>
                    <ShieldCheck size={19} className='text-[#b98200]' />
                  </div>

                  <div>
                    <p className='text-[11px] font-bold uppercase tracking-wide text-[#9a7000]'>
                      Ride OTP
                    </p>

                    <p className='text-xs text-gray-500'>
                      Give this to your driver
                    </p>
                  </div>
                </div>

                <div className='bg-white border border-[#f3df9a] rounded-lg px-4 py-2 shrink-0'>
                  <p className='text-2xl font-extrabold tracking-[0.3em] text-[#172033] pl-[0.3em]'>
                    {rideOtp}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className='rounded-2xl bg-yellow-50 border border-yellow-200 p-3 flex items-center gap-3'>
              <AlertCircle size={19} className='text-yellow-600 shrink-0' />

              <div>
                <p className='font-bold text-yellow-800 text-sm'>
                  Driver accepted
                </p>

                <p className='text-xs text-yellow-700 mt-0.5'>
                  Waiting for the ride OTP.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {status === "in_progress" && (
        <div className='mt-6 rounded-2xl bg-blue-50 border border-blue-200 p-5'>
          <div className='flex items-start gap-4'>
            <div className='w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center shrink-0'>
              <Play size={21} className='text-blue-600 fill-blue-600' />
            </div>

            <div>
              <p className='font-extrabold text-blue-800'>Ride In Progress</p>

              <p className='text-sm text-blue-600 mt-1'>
                Your driver has verified the OTP and started the ride.
              </p>
            </div>
          </div>
        </div>
      )}

      {status === "completed" && (
        <div className='mt-6 rounded-2xl bg-gray-50 border border-gray-200 p-5'>
          <div className='flex items-start gap-4'>
            <div className='w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center shrink-0'>
              <CheckCircle2 size={22} className='text-green-600' />
            </div>

            <div>
              <p className='font-extrabold text-gray-800'>Ride Completed</p>

              <p className='text-sm text-gray-500 mt-1'>
                This ride has been completed by the driver.
              </p>
            </div>
          </div>
        </div>
      )}

      {status === "cancelled" && (
        <div className='mt-6 rounded-2xl bg-red-50 border border-red-200 p-5'>
          <div className='flex items-start gap-3'>
            <AlertCircle size={21} className='text-red-500 shrink-0 mt-0.5' />

            <div>
              <p className='font-bold text-red-700'>Ride Cancelled</p>

              <p className='text-sm text-red-600 mt-1'>
                This ride request has been cancelled.
              </p>
            </div>
          </div>
        </div>
      )}

      {status === "waiting" && (
        <div className='mt-6 rounded-2xl bg-yellow-50 border border-yellow-200 p-4'>
          <p className='font-semibold text-yellow-800'>
            ⏳ Waiting for a driver
          </p>

          <p className='text-sm text-yellow-600 mt-1'>
            Your ride request is waiting for a compatible group and driver.
          </p>
        </div>
      )}

      {status === "waiting" && (
        <div className='flex flex-wrap gap-3 mt-6'>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type='button'
            onClick={() => onEdit(request)}
            className='flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl transition'
          >
            <Edit size={18} />
            Edit
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type='button'
            onClick={() => onCancel(request._id)}
            className='flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-xl transition'
          >
            <Ban size={18} />
            Cancel
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type='button'
            onClick={() => onDelete(request._id)}
            className='flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl transition'
          >
            <Trash2 size={18} />
            Delete
          </motion.button>
        </div>
      )}

      {status === "grouped" && (
        <div className='flex flex-wrap gap-3 mt-6'>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type='button'
            onClick={() => onCancel(request._id)}
            className='flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-xl transition'
          >
            <Ban size={18} />
            Cancel
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}

export default RideRequestCard;
