import { useState } from "react";
import { motion } from "framer-motion";
import { createRideRequest } from "../../services/rideApi";

function RideRequestForm() {
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

    setFormData({
      ...formData,
      [name]: name === "seatsRequired" ? Number(value) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await createRideRequest(formData);

      alert(res.data.message);

      setFormData({
        pickupLocation: "",
        destination: "",
        departureDate: "",
        departureTime: "",
        seatsRequired: 1,
        notes: "",
      });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create ride request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-indigo-100 via-white to-cyan-100 flex items-center justify-center px-4 py-10'>
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className='w-full max-w-3xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white'
      >
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='text-4xl font-bold text-center text-gray-800'
        >
          🚗 Request a Ride
        </motion.h2>

        <p className='text-center text-gray-500 mt-2 mb-8'>
          Fill in your trip details below
        </p>

        <form
          onSubmit={handleSubmit}
          className='grid grid-cols-1 md:grid-cols-2 gap-6'
        >
          {/* Pickup */}
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              Pickup Location
            </label>

            <input
              type='text'
              name='pickupLocation'
              value={formData.pickupLocation}
              onChange={handleChange}
              placeholder='Enter pickup location'
              required
              className='w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 transition'
            />
          </div>

          {/* Destination */}
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              Destination
            </label>

            <input
              type='text'
              name='destination'
              value={formData.destination}
              onChange={handleChange}
              placeholder='Enter destination'
              required
              className='w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 transition'
            />
          </div>

          {/* Date */}
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              Departure Date
            </label>

            <input
              type='date'
              name='departureDate'
              value={formData.departureDate}
              onChange={handleChange}
              required
              className='w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 transition'
            />
          </div>

          {/* Time */}
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              Departure Time
            </label>

            <input
              type='time'
              name='departureTime'
              value={formData.departureTime}
              onChange={handleChange}
              required
              className='w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 transition'
            />
          </div>

          {/* Seats */}
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              Seats Required
            </label>

            <select
              name='seatsRequired'
              value={formData.seatsRequired}
              onChange={handleChange}
              className='w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 transition'
            >
              <option value='1'>1 Seat</option>
              <option value='2'>2 Seats</option>
              <option value='3'>3 Seats</option>
            </select>
          </div>

          {/* Notes */}
          <div className='md:col-span-2'>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              Notes
            </label>

            <textarea
              name='notes'
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Anything you'd like the driver to know?"
              className='w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 transition resize-none'
            />
          </div>

          {/* Button */}
          <div className='md:col-span-2'>
            <motion.button
              whileHover={{
                scale: 1.03,
              }}
              whileTap={{
                scale: 0.96,
              }}
              type='submit'
              disabled={loading}
              className='w-full rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 py-4 text-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-60'
            >
              {loading ? "Submitting..." : "🚘 Request Ride"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default RideRequestForm;
