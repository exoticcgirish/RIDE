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

      toast.success(
        res.data?.message || "Ride request created successfully."
      );

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
        err.response?.data?.message || "Failed to create ride request."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        {/* Header */}
        <div className="flex items-start gap-4 mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex-shrink-0 w-11 h-11 rounded-full bg-yellow-400 hover:bg-yellow-500 transition-all duration-200 flex items-center justify-center shadow-sm"
          >
            <ArrowLeft size={21} />
          </button>

          <div>
            <p className="text-yellow-600 font-semibold text-sm uppercase tracking-wider">
              Ride Request
            </p>

            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-1">
              Create a Ride
            </h1>

            <p className="text-gray-500 mt-2 text-sm sm:text-base">
              Fill in your trip details and request a ride.
            </p>
          </div>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl shadow-lg border border-gray-100 p-5 sm:p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-7">

            {/* Pickup & Destination */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div>
                <label className="flex items-center gap-2 mb-2 font-semibold text-gray-800">
                  <MapPin size={18} className="text-green-600" />
                  Pickup Location
                </label>

                <input
                  type="text"
                  name="pickupLocation"
                  value={formData.pickupLocation}
                  onChange={handleChange}
                  placeholder="Enter pickup location"
                  required
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3.5 text-gray-800 outline-none transition focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 mb-2 font-semibold text-gray-800">
                  <MapPin size={18} className="text-red-500" />
                  Destination
                </label>

                <input
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  placeholder="Enter destination"
                  required
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3.5 text-gray-800 outline-none transition focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
                />
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div>
                <label className="flex items-center gap-2 mb-2 font-semibold text-gray-800">
                  <Calendar size={18} className="text-yellow-500" />
                  Departure Date
                </label>

                <input
                  type="date"
                  name="departureDate"
                  value={formData.departureDate}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3.5 outline-none transition focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 mb-2 font-semibold text-gray-800">
                  <Clock size={18} className="text-yellow-500" />
                  Departure Time
                </label>

                <input
                  type="time"
                  name="departureTime"
                  value={formData.departureTime}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3.5 outline-none transition focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
                />
              </div>
            </div>

            {/* Seats & Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div>
                <label className="flex items-center gap-2 mb-2 font-semibold text-gray-800">
                  <Users size={18} className="text-yellow-500" />
                  Seats Required
                </label>

                <select
                  name="seatsRequired"
                  value={formData.seatsRequired}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3.5 outline-none transition focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
                >
                  <option value={1}>1 Seat</option>
                  <option value={2}>2 Seats</option>
                  <option value={3}>3 Seats</option>
                  <option value={4}>4 Seats</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 mb-2 font-semibold text-gray-800">
                  <FileText size={18} className="text-yellow-500" />
                  Additional Notes
                </label>

                <textarea
                  rows={4}
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Anything you'd like the driver to know?"
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3.5 resize-none outline-none transition focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
                />
              </div>
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-base sm:text-lg py-4 rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      opacity=".3"
                    />
                    <path
                      d="M22 12a10 10 0 00-10-10"
                      stroke="currentColor"
                      strokeWidth="3"
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
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-2xl p-5 sm:p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Ride Tips
          </h3>

          <ul className="space-y-2.5 text-sm sm:text-base text-gray-700">
            <li>✅ Double-check your pickup location.</li>
            <li>✅ Be ready 5–10 minutes before departure.</li>
            <li>✅ Keep your phone available for driver communication.</li>
            <li>
              ✅ Mention any luggage or special requirements in Notes.
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
}

export default RideRequestForm;