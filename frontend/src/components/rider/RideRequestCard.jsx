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
      {/* HEADER */}
      <div className="flex justify-between items-start gap-4">
        <div className="min-w-0 flex-1">
          {/* PICKUP */}
          <div className="flex items-center gap-2 min-w-0">
            <MapPin
              className="text-indigo-600 flex-shrink-0"
              size={22}
            />

            <h2
              className="text-xl font-bold text-gray-800 truncate min-w-0"
              title={request.pickupLocation || "Pickup location"}
            >
              {request.pickupLocation || "Pickup location"}
            </h2>
          </div>

          {/* ARROW */}
          <div className="text-center text-gray-400 my-1 text-lg">
            ↓
          </div>

          {/* DESTINATION */}
          <h2
            className="text-xl font-bold text-gray-800 truncate min-w-0"
            title={request.destination || "Destination"}
          >
            {request.destination || "Destination"}
          </h2>
        </div>

        {/* STATUS */}
        <span
          className={`px-4 py-1 rounded-full text-sm font-semibold whitespace-nowrap flex-shrink-0 ${
            statusColors[request.status] ||
            "bg-gray-100 text-gray-700"
          }`}
        >
          {statusLabels[request.status] || request.status}
        </span>
      </div>

      {/* DIVIDER */}
      <div className="border-t my-5"></div>

      {/* RIDE DETAILS */}
      <div className="grid md:grid-cols-2 gap-4 text-gray-700">
        {/* DATE */}
        <div className="flex items-center gap-3 min-w-0">
          <Calendar
            className="text-indigo-600 flex-shrink-0"
            size={18}
          />

          <span className="truncate">
            {request.departureDate
              ? new Date(
                  request.departureDate
                ).toLocaleDateString()
              : "Not specified"}
          </span>
        </div>

        {/* TIME */}
        <div className="flex items-center gap-3 min-w-0">
          <Clock
            className="text-indigo-600 flex-shrink-0"
            size={18}
          />

          <span className="truncate">
            {request.departureTime || "Not specified"}
          </span>
        </div>

        {/* SEATS */}
        <div className="flex items-center gap-3 min-w-0">
          <Users
            className="text-indigo-600 flex-shrink-0"
            size={18}
          />

          <span className="truncate">
            {request.seatsRequired || 1} Seat(s)
          </span>
        </div>

        {/* NOTES */}
        <div className="flex items-start gap-3 md:col-span-2 min-w-0">
          <FileText
            className="text-indigo-600 mt-1 flex-shrink-0"
            size={18}
          />

          <p
            className="text-gray-600 truncate min-w-0"
            title={request.notes || "No additional notes."}
          >
            {request.notes || "No additional notes."}
          </p>
        </div>
      </div>

      {/* DRIVER DETAILS */}
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
              {/* DRIVER */}
              <div className="flex items-center gap-3 min-w-0">
                <User
                  className="text-green-600 flex-shrink-0"
                  size={19}
                />

                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500">
                    Driver
                  </p>

                  <p
                    className="font-semibold text-gray-800 truncate"
                    title={
                      request.assignedDriver.full_name ||
                      request.assignedDriver.name ||
                      "Driver"
                    }
                  >
                    {request.assignedDriver.full_name ||
                      request.assignedDriver.name ||
                      "Driver"}
                  </p>
                </div>
              </div>

              {/* PHONE */}
              <div className="flex items-center gap-3 min-w-0">
                <Phone
                  className="text-green-600 flex-shrink-0"
                  size={19}
                />

                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500">
                    Phone
                  </p>

                  {request.assignedDriver.phone ? (
                    <a
                      href={`tel:${request.assignedDriver.phone}`}
                      className="font-semibold text-gray-800 hover:text-green-600 truncate block"
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

              {/* VEHICLE MODEL */}
              <div className="flex items-center gap-3 min-w-0">
                <Car
                  className="text-green-600 flex-shrink-0"
                  size={19}
                />

                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500">
                    Vehicle
                  </p>

                  <p
                    className="font-semibold text-gray-800 truncate"
                    title={
                      request.assignedDriver.vehicleModel ||
                      "Vehicle"
                    }
                  >
                    {request.assignedDriver.vehicleModel ||
                      "Vehicle"}
                  </p>
                </div>
              </div>

              {/* VEHICLE NUMBER */}
              <div className="flex items-center gap-3 min-w-0">
                <Car
                  className="text-green-600 flex-shrink-0"
                  size={19}
                />

                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500">
                    Vehicle Number
                  </p>

                  <p
                    className="font-bold text-gray-900 truncate"
                    title={
                      request.assignedDriver.vehicleNumber ||
                      "Not available"
                    }
                  >
                    {request.assignedDriver.vehicleNumber ||
                      "Not available"}
                  </p>
                </div>
              </div>

              {/* VEHICLE TYPE */}
              <div className="flex items-center gap-3 min-w-0">
                <Car
                  className="text-green-600 flex-shrink-0"
                  size={19}
                />

                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500">
                    Vehicle Type
                  </p>

                  <p
                    className="font-semibold text-gray-800 truncate"
                    title={
                      request.assignedDriver.vehicleType ||
                      "Not available"
                    }
                  >
                    {request.assignedDriver.vehicleType ||
                      "Not available"}
                  </p>
                </div>
              </div>

              {/* VEHICLE COLOR */}
              <div className="flex items-center gap-3 min-w-0">
                <Car
                  className="text-green-600 flex-shrink-0"
                  size={19}
                />

                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500">
                    Color
                  </p>

                  <p
                    className="font-semibold text-gray-800 truncate"
                    title={
                      request.assignedDriver.vehicleColor ||
                      "Not available"
                    }
                  >
                    {request.assignedDriver.vehicleColor ||
                      "Not available"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* GROUPED MESSAGE */}
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

      {/* WAITING MESSAGE */}
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

      {/* BUTTONS */}
      {request.status === "waiting" && (
        <div className="flex flex-wrap gap-3 mt-6">
          {/* EDIT */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(request)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl transition"
          >
            <Edit size={18} />
            Edit
          </motion.button>

          {/* CANCEL */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onCancel(request._id)}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-xl transition"
          >
            <Ban size={18} />
            Cancel
          </motion.button>

          {/* DELETE */}
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