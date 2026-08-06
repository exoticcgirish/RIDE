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
} from "lucide-react";

function RideRequestCard({ request, onEdit, onCancel, onDelete }) {
  const statusColors = {
    waiting: "bg-yellow-100 text-yellow-700",
    accepted: "bg-green-100 text-green-700",
    completed: "bg-blue-100 text-blue-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <motion.div
      whileHover={{
        y: -6,
        scale: 1.02,
      }}
      transition={{ duration: 0.25 }}
      className='rounded-3xl bg-white/90 backdrop-blur-xl shadow-xl border border-gray-100 p-6'
    >
      {/* Header */}
      <div className='flex justify-between items-start gap-4'>
        <div>
          <h2 className='text-xl font-bold text-gray-800 flex items-center gap-2'>
            <MapPin className='text-indigo-600' size={22} />
            {request.pickupLocation}
          </h2>

          <div className='text-center text-gray-400 my-1 text-lg'>↓</div>

          <h2 className='text-xl font-bold text-gray-800'>
            {request.destination}
          </h2>
        </div>

        <span
          className={`px-4 py-1 rounded-full text-sm font-semibold capitalize ${
            statusColors[request.status] || "bg-gray-100 text-gray-700"
          }`}
        >
          {request.status}
        </span>
      </div>

      {/* Divider */}
      <div className='border-t my-5'></div>

      {/* Details */}
      <div className='grid md:grid-cols-2 gap-4 text-gray-700'>
        <div className='flex items-center gap-3'>
          <Calendar className='text-indigo-600' size={18} />

          <span>{new Date(request.departureDate).toLocaleDateString()}</span>
        </div>

        <div className='flex items-center gap-3'>
          <Clock className='text-indigo-600' size={18} />

          <span>{request.departureTime}</span>
        </div>

        <div className='flex items-center gap-3'>
          <Users className='text-indigo-600' size={18} />

          <span>{request.seatsRequired} Seat(s)</span>
        </div>

        <div className='flex items-start gap-3 md:col-span-2'>
          <FileText className='text-indigo-600 mt-1' size={18} />

          <p className='text-gray-600'>
            {request.notes || "No additional notes."}
          </p>
        </div>
      </div>

      {/* Buttons */}
      {request.status === "waiting" && (
        <div className='flex flex-wrap gap-3 mt-6'>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(request)}
            className='flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl transition'
          >
            <Edit size={18} />
            Edit
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onCancel(request._id)}
            className='flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-xl transition'
          >
            <Ban size={18} />
            Cancel
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(request._id)}
            className='flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl transition'
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
