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
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createRideRequest } from "../../services/rideApi";
import RideMap from "../map/RideMap";

function RideRequestForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    pickupLocation: "",
    pickupELoc: null,

    destination: "",
    destinationELoc: null,

    departureDate: "",
    departureTime: "",

    seatsRequired: 1,

    notes: "",
  });

  const [loading, setLoading] = useState(false);

  /*
   * Handle normal input changes.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: name === "seatsRequired" ? Number(value) : value,
      };

      /*
       * If pickup text is manually changed,
       * previously selected Mappls location is invalid.
       */
      if (name === "pickupLocation") {
        updated.pickupELoc = null;
      }

      /*
       * If destination text is manually changed,
       * previously selected Mappls location is invalid.
       */
      if (name === "destination") {
        updated.destinationELoc = null;
      }

      return updated;
    });
  };

  /*
   * Mappls selection callback.
   */
  const handleLocationSelect = (selectedPlace, locationType) => {
    if (!selectedPlace) {
      return;
    }

    const { location, eLoc } = selectedPlace;

    if (!location || !eLoc) {
      toast.error("Invalid Mappls location. Please select another suggestion.");

      return;
    }

    if (locationType === "pickup") {
      setFormData((prev) => ({
        ...prev,
        pickupLocation: location,
        pickupELoc: eLoc,
      }));

      console.log("Selected pickup:", {
        location,
        eLoc,
      });

      return;
    }

    if (locationType === "destination") {
      setFormData((prev) => ({
        ...prev,
        destination: location,
        destinationELoc: eLoc,
      }));

      console.log("Selected destination:", {
        location,
        eLoc,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    /*
     * Pickup must be selected from Mappls.
     */
    if (!formData.pickupELoc) {
      toast.error(
        "Please select your pickup location from the Mappls suggestions.",
      );

      return;
    }

    /*
     * Destination must be selected from Mappls.
     */
    if (!formData.destinationELoc) {
      toast.error(
        "Please select your destination from the Mappls suggestions.",
      );

      return;
    }

    if (!formData.pickupLocation.trim()) {
      toast.error("Please enter pickup location.");
      return;
    }

    if (!formData.destination.trim()) {
      toast.error("Please enter destination.");
      return;
    }

    try {
      setLoading(true);

      /*
       * Do not send fake coordinates.
       * Backend resolves coordinates.
       */
      const payload = {
        pickupLocation: formData.pickupLocation,
        pickupELoc: formData.pickupELoc,

        destination: formData.destination,
        destinationELoc: formData.destinationELoc,

        departureDate: formData.departureDate,
        departureTime: formData.departureTime,

        seatsRequired: formData.seatsRequired,

        notes: formData.notes,
      };

      console.log("Creating ride request:", payload);

      const response = await createRideRequest(payload);

      toast.success(
        response.data?.message || "Ride request created successfully.",
      );

      setFormData({
        pickupLocation: "",
        pickupELoc: null,

        destination: "",
        destinationELoc: null,

        departureDate: "",
        departureTime: "",

        seatsRequired: 1,

        notes: "",
      });

      navigate("/my-ride-requests");
    } catch (error) {
      console.error("Create ride error:", error);

      toast.error(
        error.response?.data?.message || "Failed to create ride request.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10'>
        {/* HEADER */}

        <div className='flex items-start gap-4 mb-8'>
          <button
            type='button'
            onClick={() => navigate("/dashboard")}
            className='flex-shrink-0 w-11 h-11 rounded-full bg-yellow-400 hover:bg-yellow-500 transition-all duration-200 flex items-center justify-center shadow-sm'
          >
            <ArrowLeft size={21} />
          </button>

          <div>
            <p className='text-yellow-600 font-semibold text-sm uppercase tracking-wider'>
              Ride Request
            </p>

            <h1 className='text-3xl sm:text-4xl font-bold text-gray-900 mt-1'>
              Create a Ride
            </h1>

            <p className='text-gray-500 mt-2 text-sm sm:text-base'>
              Fill in your trip details and request a ride.
            </p>
          </div>
        </div>

        {/* FORM CARD */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.4,
          }}
          className='bg-white rounded-3xl shadow-lg border border-gray-100 p-5 sm:p-8'
        >
          <form onSubmit={handleSubmit} className='space-y-7'>
            {/* LOCATIONS */}

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* PICKUP */}

              <div className='min-w-0'>
                <label className='flex items-center gap-2 mb-2 font-semibold text-gray-800'>
                  <MapPin size={18} className='text-green-600 flex-shrink-0' />
                  Pickup Location
                </label>

                <input
                  id='pickup-location-input'
                  type='text'
                  name='pickupLocation'
                  value={formData.pickupLocation}
                  onChange={handleChange}
                  placeholder='Search pickup location'
                  required
                  autoComplete='off'
                  title={formData.pickupLocation}
                  className={`w-full min-w-0 rounded-xl border px-4 py-3.5 text-gray-800 outline-none transition ${
                    formData.pickupELoc
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300 bg-gray-50"
                  }`}
                />

                {formData.pickupELoc ? (
                  <p className='text-green-600 text-sm mt-2'>
                    ✓ Pickup selected
                  </p>
                ) : (
                  formData.pickupLocation && (
                    <p className='text-orange-600 text-xs mt-2'>
                      Select a Mappls suggestion.
                    </p>
                  )
                )}
              </div>

              {/* DESTINATION */}

              <div className='min-w-0'>
                <label className='flex items-center gap-2 mb-2 font-semibold text-gray-800'>
                  <MapPin size={18} className='text-red-500 flex-shrink-0' />
                  Destination
                </label>

                <input
                  id='destination-location-input'
                  type='text'
                  name='destination'
                  value={formData.destination}
                  onChange={handleChange}
                  placeholder='Search destination'
                  required
                  autoComplete='off'
                  title={formData.destination}
                  className={`w-full min-w-0 rounded-xl border px-4 py-3.5 text-gray-800 outline-none transition ${
                    formData.destinationELoc
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-gray-50"
                  }`}
                />

                {formData.destinationELoc ? (
                  <p className='text-green-600 text-sm mt-2'>
                    ✓ Destination selected
                  </p>
                ) : (
                  formData.destination && (
                    <p className='text-orange-600 text-xs mt-2'>
                      Select a Mappls suggestion.
                    </p>
                  )
                )}
              </div>
            </div>

            {/* MAP */}

            <div>
              <h3 className='flex items-center gap-2 mb-3 font-semibold text-gray-800'>
                <MapPin size={19} className='text-yellow-500' />
                Selected Locations
              </h3>

              <RideMap
                pickupInputId='pickup-location-input'
                destinationInputId='destination-location-input'
                onLocationSelect={handleLocationSelect}
              />
            </div>

            {/* DATE / TIME */}

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* DATE */}

              <div>
                <label className='flex items-center gap-2 mb-2 font-semibold text-gray-800'>
                  <Calendar
                    size={18}
                    className='text-yellow-500 flex-shrink-0'
                  />
                  Departure Date
                </label>

                <input
                  type='date'
                  name='departureDate'
                  value={formData.departureDate}
                  onChange={handleChange}
                  required
                  className='w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3.5 outline-none transition focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100'
                />
              </div>

              {/* TIME */}

              <div>
                <label className='flex items-center gap-2 mb-2 font-semibold text-gray-800'>
                  <Clock size={18} className='text-yellow-500 flex-shrink-0' />
                  Departure Time
                </label>

                <input
                  type='time'
                  name='departureTime'
                  value={formData.departureTime}
                  onChange={handleChange}
                  required
                  className='w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3.5 outline-none transition focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100'
                />
              </div>
            </div>

            {/* SEATS / NOTES */}

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* SEATS */}

              <div>
                <label className='flex items-center gap-2 mb-2 font-semibold text-gray-800'>
                  <Users size={18} className='text-yellow-500 flex-shrink-0' />
                  Seats Required
                </label>

                {/* CUSTOM SELECT WRAPPER */}

                <div className='relative'>
                  <select
                    name='seatsRequired'
                    value={formData.seatsRequired}
                    onChange={handleChange}
                    className='appearance-none w-full h-[58px] rounded-xl border border-gray-300 bg-gray-50 px-4 pr-12 text-gray-800 font-medium outline-none cursor-pointer transition focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100'
                  >
                    <option value={1}>1 Seat</option>
                    <option value={2}>2 Seats</option>
                    <option value={3}>3 Seats</option>
                    <option value={4}>4 Seats</option>
                  </select>

                  {/* CUSTOM ARROW */}

                  <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4'>
                    <ChevronDown size={20} className='text-gray-600' />
                  </div>
                </div>
              </div>

              {/* NOTES */}

              <div>
                <label className='flex items-center gap-2 mb-2 font-semibold text-gray-800'>
                  <FileText
                    size={18}
                    className='text-yellow-500 flex-shrink-0'
                  />
                  Additional Notes
                </label>

                <textarea
                  rows={4}
                  name='notes'
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Anything you'd like the driver to know?"
                  className='w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3.5 resize-none outline-none transition focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100'
                />
              </div>
            </div>

            {/* SUBMIT */}

            <motion.button
              whileHover={{
                scale: 1.01,
              }}
              whileTap={{
                scale: 0.98,
              }}
              type='submit'
              disabled={loading}
              className='w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-base sm:text-lg py-4 rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed'
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

        {/* TIPS */}

        <div className='mt-8 bg-yellow-50 border border-yellow-200 rounded-2xl p-5 sm:p-6'>
          <h3 className='text-lg font-bold text-gray-900 mb-4'>Ride Tips</h3>

          <ul className='space-y-2.5 text-sm sm:text-base text-gray-700'>
            <li>Select the exact pickup location from Mappls.</li>

            <li>Select the exact destination from Mappls.</li>

            <li>Your coordinates are resolved automatically by the server.</li>

            <li>Riders within 100 meters can be grouped together.</li>

            <li>Mention luggage or special requirements in Notes.</li>
          </ul>
        </div>

        <p className='text-xs text-gray-400 mt-4 text-center'>
          Location fallback geocoding uses OpenStreetMap data when the selected
          Mappls result does not provide coordinates.
        </p>
      </div>
    </div>
  );
}

export default RideRequestForm;
