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
} from "lucide-react";

function RideRequestCard({
  request,
  onEdit,
  onCancel,
  onDelete,
}) {
  const statusColors = {
    waiting: "bg-yellow-100 text-yellow-700",
    grouped: "bg-indigo-100 text-indigo-700",
    accepted: "bg-green-100 text-green-700",
    completed: "bg-blue-100 text-blue-700",
    cancelled: "bg-red-100 text-red-700",
  };

  const statusLabels = {
    waiting: "Waiting",
    grouped: "Grouped",
    accepted: "Driver Accepted",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return (
    <motion.div
      whileHover={{
        y: -6,
        scale: 1.02,
      }}
      transition={{ duration: 0.25 }}
      className="rounded-3xl bg-white/90 backdrop-blur-xl shadow-xl border border-gray-100 p-6"
    >
      {/* Header */}
      <div className="flex justify-between items-start gap-4">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 break-words">
            <MapPin
              className="text-indigo-600 flex-shrink-0"
              size={22}
            />

            {request.pickupLocation || "Pickup location"}
          </h2>

          <div className="text-center text-gray-400 my-1 text-lg">
            ↓
          </div>

          <h2 className="text-xl font-bold text-gray-800 break-words">
            {request.destination || "Destination"}
          </h2>
        </div>

        <span
          className={`px-4 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${
            statusColors[request.status] ||
            "bg-gray-100 text-gray-700"
          }`}
        >
          {statusLabels[request.status] || request.status}
        </span>
      </div>

      {/* Divider */}
      <div className="border-t my-5"></div>

      {/* Ride Details */}
      <div className="grid md:grid-cols-2 gap-4 text-gray-700">
        {/* Date */}
        <div className="flex items-center gap-3">
          <Calendar
            className="text-indigo-600 flex-shrink-0"
            size={18}
          />

          <span>
            {request.departureDate
              ? new Date(
                  request.departureDate
                ).toLocaleDateString()
              : "Not specified"}
          </span>
        </div>

        {/* Time */}
        <div className="flex items-center gap-3">
          <Clock
            className="text-indigo-600 flex-shrink-0"
            size={18}
          />

          <span>
            {request.departureTime || "Not specified"}
          </span>
        </div>

        {/* Seats */}
        <div className="flex items-center gap-3">
          <Users
            className="text-indigo-600 flex-shrink-0"
            size={18}
          />

          <span>
            {request.seatsRequired || 1} Seat(s)
          </span>
        </div>

        {/* Notes */}
        <div className="flex items-start gap-3 md:col-span-2">
          <FileText
            className="text-indigo-600 mt-1 flex-shrink-0"
            size={18}
          />

          <p className="text-gray-600 break-words">
            {request.notes || "No additional notes."}
          </p>
        </div>
      </div>

      {/* ================================================= */}
      {/* DRIVER DETAILS */}
      {/* ================================================= */}

      {request.status === "accepted" &&
        request.assignedDriver && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Car
                className="text-green-600"
                size={22}
              />

              <h3 className="text-lg font-bold text-green-800">
                Driver Assigned
              </h3>
            </div>

            <div className="space-y-3 text-gray-700">
              {/* Driver */}
              <div className="flex items-center gap-3">
                <User
                  className="text-green-600 flex-shrink-0"
                  size={19}
                />

                <div>
                  <p className="text-xs text-gray-500">
                    Driver
                  </p>

                  <p className="font-semibold text-gray-800">
                    {request.assignedDriver.full_name ||
                      request.assignedDriver.name ||
                      "Driver"}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3">
                <Phone
                  className="text-green-600 flex-shrink-0"
                  size={19}
                />

                <div>
                  <p className="text-xs text-gray-500">
                    Phone
                  </p>

                  {request.assignedDriver.phone ? (
                    <a
                      href={`tel:${request.assignedDriver.phone}`}
                      className="font-semibold text-gray-800 hover:text-green-600"
                    >
                      {request.assignedDriver.phone}
                    </a>
                  ) : (
                    <p className="font-semibold text-gray-800">
                      Not available
                    </p>
                  )}
                </div>
              </div>

              {/* Vehicle Model */}
              <div className="flex items-center gap-3">
                <Car
                  className="text-green-600 flex-shrink-0"
                  size={19}
                />

                <div>
                  <p className="text-xs text-gray-500">
                    Vehicle
                  </p>

                  <p className="font-semibold text-gray-800">
                    {request.assignedDriver.vehicleModel ||
                      "Vehicle"}
                  </p>
                </div>
              </div>

              {/* Vehicle Number */}
              <div className="flex items-center gap-3">
                <Car
                  className="text-green-600 flex-shrink-0"
                  size={19}
                />

                <div>
                  <p className="text-xs text-gray-500">
                    Vehicle Number
                  </p>

                  <p className="font-bold text-gray-900">
                    {request.assignedDriver.vehicleNumber ||
                      "Not available"}
                  </p>
                </div>
              </div>

              {/* Vehicle Type */}
              <div className="flex items-center gap-3">
                <Car
                  className="text-green-600 flex-shrink-0"
                  size={19}
                />

                <div>
                  <p className="text-xs text-gray-500">
                    Vehicle Type
                  </p>

                  <p className="font-semibold text-gray-800">
                    {request.assignedDriver.vehicleType ||
                      "Not available"}
                  </p>
                </div>
              </div>

              {/* Vehicle Color */}
              <div className="flex items-center gap-3">
                <Car
                  className="text-green-600 flex-shrink-0"
                  size={19}
                />

                <div>
                  <p className="text-xs text-gray-500">
                    Color
                  </p>

                  <p className="font-semibold text-gray-800">
                    {request.assignedDriver.vehicleColor ||
                      "Not available"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* ================================================= */}
      {/* GROUPED MESSAGE */}
      {/* ================================================= */}

      {request.status === "grouped" && (
        <div className="mt-6 rounded-2xl bg-indigo-50 border border-indigo-200 p-4">
          <p className="font-semibold text-indigo-800">
            🚗 Ride group is ready
          </p>

          <p className="text-sm text-indigo-600 mt-1">
            Waiting for a driver to accept this group.
          </p>
        </div>
      )}

      {/* ================================================= */}
      {/* WAITING MESSAGE */}
      {/* ================================================= */}

      {request.status === "waiting" && (
        <div className="mt-6 rounded-2xl bg-yellow-50 border border-yellow-200 p-4">
          <p className="font-semibold text-yellow-800">
            ⏳ Waiting for a driver
          </p>

          <p className="text-sm text-yellow-600 mt-1">
            Your ride request is waiting for a driver.
          </p>
        </div>
      )}

      {/* ================================================= */}
      {/* BUTTONS */}
      {/* ================================================= */}

      {request.status === "waiting" && (
        <div className="flex flex-wrap gap-3 mt-6">
          {/* Edit */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(request)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl transition"
          >
            <Edit size={18} />
            Edit
          </motion.button>

          {/* Cancel */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onCancel(request._id)}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-xl transition"
          >
            <Ban size={18} />
            Cancel
          </motion.button>

          {/* Delete */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(request._id)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl transition"
          >
            <Trash2 size={18} />
            Delete
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}

export default RideRequestCard;