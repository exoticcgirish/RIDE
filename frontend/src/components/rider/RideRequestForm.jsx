import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Users,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createRideRequest } from "../../services/rideApi";

function RideRequestForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    pickupLocation: "",
    destination: "",
    departureDate: "",
    departureTime: "",
    seatsRequired: 1,
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "seatsRequired" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await createRideRequest(formData);

      toast.success(res.data?.message || "Ride request created successfully.");

      setFormData({
        pickupLocation: "",
        destination: "",
        departureDate: "",
        departureTime: "",
        seatsRequired: 1,
        notes: "",
      });

      navigate("/my-ride-requests");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to create ride request.",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className='min-h-screen bg-gray-100'>
      <div className='max-w-5xl mx-auto px-6 py-10'></div>
      {/* Header */}

      <div className='flex items-center gap-5 mb-10'>
        <button
          onClick={() => navigate("/dashboard")}
          className='w-12 h-12 rounded-full bg-yellow-400 hover:bg-yellow-500 transition flex items-center justify-center'
        >
          <ArrowLeft size={22} />
        </button>

        <div>
          <p className='text-yellow-500 font-semibold uppercase tracking-wider'>
            Ride Request
          </p>

          <h1 className='text-4xl font-bold text-gray-900'>Create a Ride</h1>

          <p className='text-gray-500 mt-2'>
            Fill in your trip details and request a ride.
          </p>
        </div>
      </div>

      {/* Form Card */}

      <motion.div
        initial={{
          opacity: 0,
          y: 25,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.4,
        }}
        className='bg-white rounded-3xl shadow-xl p-8'
      >
        <form onSubmit={handleSubmit} className='space-y-8'>
          {/* First Row */}

          <div className='grid md:grid-cols-2 gap-6'>
            {/* Pickup */}

            <div>
              <label className='flex items-center gap-2 mb-3 font-semibold'>
                <MapPin size={18} className='text-green-600' />
                Pickup Location
              </label>

              <input
                type='text'
                name='pickupLocation'
                value={formData.pickupLocation}
                onChange={handleChange}
                placeholder='Enter pickup location'
                required
                className='w-full rounded-2xl border border-gray-300 px-5 py-4 focus:outline-none focus:ring-2 focus:ring-yellow-400'
              />
            </div>

            {/* Destination */}

            <div>
              <label className='flex items-center gap-2 mb-3 font-semibold'>
                <MapPin size={18} className='text-red-600' />
                Destination
              </label>

              <input
                type='text'
                name='destination'
                value={formData.destination}
                onChange={handleChange}
                placeholder='Enter destination'
                required
                className='w-full rounded-2xl border border-gray-300 px-5 py-4 focus:outline-none focus:ring-2 focus:ring-yellow-400'
              />
            </div>
          </div>

          {/* Second Row */}

          <div className='grid md:grid-cols-2 gap-6'>
            {/* Date */}

            <div>
              <label className='flex items-center gap-2 mb-3 font-semibold'>
                <Calendar size={18} className='text-yellow-500' />
                Departure Date
              </label>

              <input
                type='date'
                name='departureDate'
                value={formData.departureDate}
                onChange={handleChange}
                required
                className='w-full rounded-2xl border border-gray-300 px-5 py-4 focus:outline-none focus:ring-2 focus:ring-yellow-400'
              />
            </div>

            {/* Time */}

            <div>
              <label className='flex items-center gap-2 mb-3 font-semibold'>
                <Clock size={18} className='text-yellow-500' />
                Departure Time
              </label>

              <input
                type='time'
                name='departureTime'
                value={formData.departureTime}
                onChange={handleChange}
                required
                className='w-full rounded-2xl border border-gray-300 px-5 py-4 focus:outline-none focus:ring-2 focus:ring-yellow-400'
              />
            </div>
          </div>
          {/* Third Row */}

          <div className='grid md:grid-cols-2 gap-6'>
            {/* Seats */}

            <div>
              <label className='flex items-center gap-2 mb-3 font-semibold'>
                <Users size={18} className='text-yellow-500' />
                Seats Required
              </label>

              <select
                name='seatsRequired'
                value={formData.seatsRequired}
                onChange={handleChange}
                className='w-full rounded-2xl border border-gray-300 px-5 py-4 focus:outline-none focus:ring-2 focus:ring-yellow-400'
              >
                <option value={1}>1 Seat</option>
                <option value={2}>2 Seats</option>
                <option value={3}>3 Seats</option>
                <option value={4}>4 Seats</option>
              </select>
            </div>

            {/* Notes */}

            <div>
              <label className='flex items-center gap-2 mb-3 font-semibold'>
                <FileText size={18} className='text-yellow-500' />
                Additional Notes
              </label>

              <textarea
                rows={4}
                name='notes'
                value={formData.notes}
                onChange={handleChange}
                placeholder="Anything you'd like the driver to know?"
                className='w-full rounded-2xl border border-gray-300 px-5 py-4 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400'
              />
            </div>
          </div>

          {/* Submit Button */}

          <motion.button
            whileHover={{
              scale: 1.02,
            }}
            whileTap={{
              scale: 0.98,
            }}
            type='submit'
            disabled={loading}
            className='w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-lg py-4 rounded-2xl shadow-lg transition-all disabled:opacity-50'
          >
            {loading ? (
              <span className='flex items-center justify-center gap-2'>
                <svg
                  className='animate-spin h-5 w-5'
                  viewBox='0 0 24 24'
                  fill='none'
                >
                  <circle
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='3'
                    opacity='.3'
                  />
                  <path
                    d='M22 12a10 10 0 00-10-10'
                    stroke='currentColor'
                    strokeWidth='3'
                  />
                </svg>
                Creating Ride...
              </span>
            ) : (
              "Request Ride"
            )}
          </motion.button>
        </form>
      </motion.div>
      {/* Ride Tips */}

      <div className='mt-10 bg-yellow-50 border border-yellow-200 rounded-3xl p-6'>
        <h3 className='text-xl font-bold mb-4'>Ride Tips</h3>

        <ul className='space-y-3 text-gray-700'>
          <li>✅ Double-check your pickup location.</li>

          <li>✅ Be ready 5–10 minutes before departure.</li>

          <li>✅ Keep your phone available for driver communication.</li>

          <li>✅ Mention any luggage or special requirements in Notes.</li>
        </ul>
      </div>
    </div>

    // </div>
  );
}

export default RideRequestForm;
