import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { createRideRequest } from "../../services/rideApi";
import {
  Bell,
  UserCircle,
  Car,
  Clock3,
  CheckCircle,
  XCircle,
} from "lucide-react";

function RiderDashboard({ user, onLogout }) {
  const [rideData, setRideData] = useState({
    pickupLocation: "",
    destination: "",
    departureDate: "",
    departureTime: "",
    seatsRequired: 1,
    notes: "",
  });
  const handleChange = (e) => {
    const { name, value } = e.target;

    setRideData((prev) => ({
      ...prev,
      [name]: name === "seatsRequired" ? Number(value) : value,
    }));
  };

  const handleCreateRide = async () => {
    try {
      setLoading(true);

      const res = await createRideRequest(rideData);

      alert(res.data.message);

      setRideData({
        pickupLocation: "",
        destination: "",
        departureDate: "",
        departureTime: "",
        seatsRequired: 1,
        notes: "",
      });

      navigate("/my-ride-requests");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create ride request.");
    } finally {
      setLoading(false);
    }
  };

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const stats = [
    {
      title: "Total Requests",
      value: 0,
      icon: <Car size={28} />,
      color: "bg-yellow-400",
    },
    {
      title: "Pending",
      value: 0,
      icon: <Clock3 size={28} />,
      color: "bg-orange-400",
    },
    {
      title: "Completed",
      value: 0,
      icon: <CheckCircle size={28} />,
      color: "bg-green-500",
    },
    {
      title: "Cancelled",
      value: 0,
      icon: <XCircle size={28} />,
      color: "bg-red-500",
    },
  ];

  return (
    <div className='min-h-screen bg-gray-100'>
      {/* Header */}

      <header className='bg-white shadow'>
        <div className='max-w-7xl mx-auto px-8 py-5 flex justify-between items-center'>
          <div>
            <h1 className='text-4xl font-bold'>
              Welcome,
              <span className='text-yellow-500'> {user?.name || "Rider"}</span>
            </h1>

            <p className='text-gray-500 mt-2'>
              Find or request your next ride.
            </p>
          </div>

          <div className='flex items-center gap-4'>
            <button className='w-12 h-12 rounded-full bg-gray-100 hover:bg-yellow-400 transition'>
              <Bell className='mx-auto' />
            </button>

            <button
              onClick={() => navigate("/profile")}
              className='w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center'
            >
              <UserCircle />
            </button>
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto p-8'>
        {/* Stats */}

        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6'>
          {stats.map((item) => (
            <motion.div
              key={item.title}
              whileHover={{
                y: -5,
                scale: 1.02,
              }}
              className='bg-white rounded-3xl shadow-lg p-6'
            >
              <div
                className={`w-14 h-14 rounded-2xl ${item.color} text-white flex items-center justify-center`}
              >
                {item.icon}
              </div>

              <h2 className='text-3xl font-bold mt-5'>{item.value}</h2>

              <p className='text-gray-500'>{item.title}</p>
            </motion.div>
          ))}
        </div>
        {/* Search Ride */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='bg-white rounded-3xl shadow-lg p-8 mt-10'
        >
          <h2 className='text-2xl font-bold mb-6'>Request a Ride</h2>

          <div className='grid md:grid-cols-2 gap-5'>
            <input
              type='text'
              name='pickupLocation'
              placeholder='Pickup Location'
              value={rideData.pickupLocation}
              onChange={handleChange}
              className='border rounded-2xl px-5 py-4 focus:ring-2 focus:ring-yellow-400'
            />

            <input
              type='text'
              name='destination'
              placeholder='Destination'
              value={rideData.destination}
              onChange={handleChange}
              className='border rounded-2xl px-5 py-4 focus:ring-2 focus:ring-yellow-400'
            />

            <input
              type='date'
              name='departureDate'
              value={rideData.departureDate}
              onChange={handleChange}
              className='border rounded-2xl px-5 py-4 focus:ring-2 focus:ring-yellow-400'
            />

            <input
              type='time'
              name='departureTime'
              value={rideData.departureTime}
              onChange={handleChange}
              className='border rounded-2xl px-5 py-4 focus:ring-2 focus:ring-yellow-400'
            />

            <select
              name='seatsRequired'
              value={rideData.seatsRequired}
              onChange={handleChange}
              className='border rounded-2xl px-5 py-4 focus:ring-2 focus:ring-yellow-400'
            >
              <option value={1}>1 Seat</option>
              <option value={2}>2 Seats</option>
              <option value={3}>3 Seats</option>
              <option value={4}>4 Seats</option>
            </select>

            <textarea
              rows={4}
              name='notes'
              value={rideData.notes}
              onChange={handleChange}
              placeholder='Additional Notes'
              className='border rounded-2xl px-5 py-4 focus:ring-2 focus:ring-yellow-400'
            />
          </div>

          <button
            onClick={handleCreateRide}
            disabled={loading}
            className='mt-6 w-full bg-yellow-400 hover:bg-yellow-500 py-4 rounded-2xl text-lg font-semibold transition'
          >
            {loading ? "Creating Ride..." : "🚗 Request Ride"}
          </button>
        </motion.div>

        {/* Quick Actions */}

        <div className='mt-10'>
          <h2 className='text-2xl font-bold mb-6'>Quick Actions</h2>

          <div className='grid md:grid-cols-2 xl:grid-cols-4 gap-6'>
            {/* Create Ride */}

            <motion.div
              whileHover={{
                y: -8,
                scale: 1.03,
              }}
              whileTap={{
                scale: 0.98,
              }}
              onClick={() => navigate("/create-ride")}
              className='cursor-pointer bg-white rounded-3xl shadow-lg p-8'
            >
              <div className='w-16 h-16 rounded-2xl bg-yellow-400 flex items-center justify-center text-3xl'>
                🚗
              </div>

              <h3 className='font-bold text-2xl mt-5'>Create Ride</h3>

              <p className='text-gray-500 mt-2'>Request a new ride.</p>
            </motion.div>

            {/* Find Rides */}

            <motion.div
              whileHover={{
                y: -8,
                scale: 1.03,
              }}
              whileTap={{
                scale: 0.98,
              }}
              onClick={() => navigate("/find-rides")}
              className='cursor-pointer bg-white rounded-3xl shadow-lg p-8'
            >
              <div className='w-16 h-16 rounded-2xl bg-green-500 flex items-center justify-center text-3xl text-white'>
                🔍
              </div>

              <h3 className='font-bold text-2xl mt-5'>Find Ride</h3>

              <p className='text-gray-500 mt-2'>Browse available rides.</p>
            </motion.div>

            {/* My Requests */}

            <motion.div
              whileHover={{
                y: -8,
                scale: 1.03,
              }}
              whileTap={{
                scale: 0.98,
              }}
              onClick={() => navigate("/my-ride-requests")}
              className='cursor-pointer bg-white rounded-3xl shadow-lg p-8'
            >
              <div className='w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center text-3xl text-white'>
                📋
              </div>

              <h3 className='font-bold text-2xl mt-5'>My Requests</h3>

              <p className='text-gray-500 mt-2'>Manage your ride requests.</p>
            </motion.div>

            {/* Ride History */}

            <motion.div
              whileHover={{
                y: -8,
                scale: 1.03,
              }}
              whileTap={{
                scale: 0.98,
              }}
              onClick={() => navigate("/ride-history")}
              className='cursor-pointer bg-white rounded-3xl shadow-lg p-8'
            >
              <div className='w-16 h-16 rounded-2xl bg-purple-500 flex items-center justify-center text-3xl text-white'>
                📜
              </div>

              <h3 className='font-bold text-2xl mt-5'>Ride History</h3>

              <p className='text-gray-500 mt-2'>View previous rides.</p>
            </motion.div>
          </div>
        </div>
        {/* Upcoming Ride */}

        <div className='grid lg:grid-cols-3 gap-8 mt-10'>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className='lg:col-span-2 bg-white rounded-3xl shadow-lg p-8'
          >
            <div className='flex justify-between items-center'>
              <h2 className='text-2xl font-bold'>Upcoming Ride</h2>

              <span className='bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-semibold'>
                Waiting
              </span>
            </div>

            <div className='mt-8'>
              <div className='flex items-start gap-4'>
                <div className='w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-2xl'>
                  📍
                </div>

                <div>
                  <p className='text-gray-500'>Pickup</p>

                  <h3 className='text-xl font-bold'>Greater Noida</h3>
                </div>
              </div>

              <div className='ml-7 h-12 border-l-2 border-dashed border-gray-300'></div>

              <div className='flex items-start gap-4'>
                <div className='w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-2xl'>
                  🎯
                </div>

                <div>
                  <p className='text-gray-500'>Destination</p>

                  <h3 className='text-xl font-bold'>Noida Sector 62</h3>
                </div>
              </div>

              <div className='grid md:grid-cols-3 gap-5 mt-8'>
                <div className='bg-gray-50 rounded-2xl p-5'>
                  <p className='text-gray-500'>Date</p>

                  <h4 className='font-bold mt-2'>10 Aug 2026</h4>
                </div>

                <div className='bg-gray-50 rounded-2xl p-5'>
                  <p className='text-gray-500'>Time</p>

                  <h4 className='font-bold mt-2'>05:30 PM</h4>
                </div>

                <div className='bg-gray-50 rounded-2xl p-5'>
                  <p className='text-gray-500'>Seats</p>

                  <h4 className='font-bold mt-2'>2 Seats</h4>
                </div>
              </div>

              <button className='mt-8 bg-yellow-400 hover:bg-yellow-500 px-8 py-3 rounded-xl font-semibold transition'>
                View Ride Details
              </button>
            </div>
          </motion.div>

          {/* Recent Activity */}

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className='bg-white rounded-3xl shadow-lg p-8'
          >
            <h2 className='text-2xl font-bold'>Recent Activity</h2>

            <div className='mt-10 text-center'>
              <div className='text-6xl'>🚗</div>

              <h3 className='text-xl font-bold mt-5'>No Recent Requests</h3>

              <p className='text-gray-500 mt-3'>
                Your latest ride requests will appear here.
              </p>

              <button
                onClick={() => navigate("/create-ride")}
                className='mt-8 bg-black hover:bg-gray-900 text-white px-8 py-3 rounded-xl'
              >
                Create Ride
              </button>
            </div>
          </motion.div>
        </div>

        {/* Logout */}

        <div className='flex justify-end mt-10'>
          <button
            onClick={onLogout}
            className='bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-xl font-semibold transition'
          >
            Logout
          </button>
        </div>
      </main>
    </div>
  );
}

export default RiderDashboard;
