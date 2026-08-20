import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

import {
  createRideRequest,
  getMyRideRequests,
  getDriverLocation,
} from "../../services/rideApi";

import {
  Bell,
  UserCircle,
  Car,
  Clock3,
  CheckCircle,
  XCircle,
  MapPin,
  CalendarDays,
  Users,
  ArrowRight,
  RefreshCw,
  Phone,
  Mail,
} from "lucide-react";

function RiderDashboard({ user, onLogout }) {
  const navigate = useNavigate();

  const [rideData, setRideData] = useState({
    pickupLocation: "",
    destination: "",
    departureDate: "",
    departureTime: "",
    seatsRequired: 1,
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState("");

  const [driverLocation, setDriverLocation] = useState(null);
  const [driverLocationLoading, setDriverLocationLoading] = useState(false);
  const [driverLocationError, setDriverLocationError] = useState("");

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

      toast.success(
        res.data?.message || "Ride request created successfully."
      );

      setRideData({
        pickupLocation: "",
        destination: "",
        departureDate: "",
        departureTime: "",
        seatsRequired: 1,
        notes: "",
      });

      await loadRideRequests();

      navigate("/my-ride-requests");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to create ride request."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadRideRequests = async () => {
    try {
      setRequestsLoading(true);
      setRequestsError("");

      const res = await getMyRideRequests();

      const data =
        res.data?.data ||
        res.data?.rideRequests ||
        res.data?.requests ||
        res.data ||
        [];

      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load ride requests:", error);

      setRequestsError(
        error.response?.data?.message || "Failed to load ride requests."
      );

      setRequests([]);
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    loadRideRequests();
  }, []);

  const getRideDateTime = (ride) => {
    if (!ride?.departureDate) {
      return null;
    }

    try {
      const date = new Date(ride.departureDate);

      if (Number.isNaN(date.getTime())) {
        return null;
      }

      if (ride.departureTime) {
        const [hours, minutes] = String(ride.departureTime).split(":");

        date.setHours(
          Number(hours) || 0,
          Number(minutes) || 0,
          0,
          0
        );
      }

      return date;
    } catch {
      return null;
    }
  };

  const upcomingRides = requests
    .filter((ride) => {
      if (
        !ride ||
        ride.status === "cancelled" ||
        ride.status === "completed"
      ) {
        return false;
      }

      const rideDate = getRideDateTime(ride);

      if (!rideDate) {
        return false;
      }

      return rideDate >= new Date();
    })
    .sort((a, b) => {
      const dateA = getRideDateTime(a);
      const dateB = getRideDateTime(b);

      return dateA - dateB;
    });

  const upcomingRide = upcomingRides[0] || null;

  const driver =
    upcomingRide?.status === "accepted"
      ? upcomingRide?.assignedDriver
      : null;

  useEffect(() => {
    if (!upcomingRide?._id || upcomingRide.status !== "accepted") {
      setDriverLocation(null);
      setDriverLocationError("");
      return;
    }

    let mounted = true;

    const fetchDriverLocation = async () => {
      try {
        setDriverLocationLoading(true);

        const response = await getDriverLocation(upcomingRide._id);

        console.log("Driver location:", response.data);

        if (!mounted) {
          return;
        }

        if (response.data?.success && response.data?.driverLocation) {
          setDriverLocation(response.data.driverLocation);
          setDriverLocationError("");
        } else {
          setDriverLocationError(
            response.data?.message || "Driver location not available."
          );
        }
      } catch (error) {
        if (!mounted) {
          return;
        }

        console.error(
          "Failed to get driver location:",
          error.response?.data || error.message
        );

        setDriverLocationError(
          error.response?.data?.message ||
            "Unable to get driver location."
        );
      } finally {
        if (mounted) {
          setDriverLocationLoading(false);
        }
      }
    };

    fetchDriverLocation();

    const interval = setInterval(fetchDriverLocation, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [upcomingRide?._id, upcomingRide?.status]);

  const completedRides = requests
    .filter((ride) => ride?.status === "completed")
    .sort((a, b) => {
      const dateA = getRideDateTime(a);
      const dateB = getRideDateTime(b);

      return (dateB || 0) - (dateA || 0);
    });

  const previousRides = requests
    .filter((ride) => {
      if (!ride) return false;

      const rideDate = getRideDateTime(ride);

      return (
        rideDate &&
        rideDate < new Date() &&
        ride.status !== "cancelled"
      );
    })
    .sort((a, b) => {
      const dateA = getRideDateTime(a);
      const dateB = getRideDateTime(b);

      return dateB - dateA;
    });

  const lastRide = completedRides[0] || previousRides[0] || null;

  const totalRequests = requests.length;

  const pendingRequests = requests.filter(
    (ride) => ride.status === "waiting"
  ).length;

  const completedRequests = requests.filter(
    (ride) => ride.status === "completed"
  ).length;

  const cancelledRequests = requests.filter(
    (ride) => ride.status === "cancelled"
  ).length;

  const stats = [
    {
      title: "Total Requests",
      value: totalRequests,
      icon: <Car size={28} />,
      color: "bg-yellow-400",
    },
    {
      title: "Pending",
      value: pendingRequests,
      icon: <Clock3 size={28} />,
      color: "bg-orange-400",
    },
    {
      title: "Completed",
      value: completedRequests,
      icon: <CheckCircle size={28} />,
      color: "bg-green-500",
    },
    {
      title: "Cancelled",
      value: cancelledRequests,
      icon: <XCircle size={28} />,
      color: "bg-red-500",
    },
  ];

  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "N/A";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) return "N/A";

    const [hours, minutes] = String(time).split(":");

    const date = new Date();

    date.setHours(
      Number(hours) || 0,
      Number(minutes) || 0,
      0,
      0
    );

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-700";

      case "completed":
        return "bg-blue-100 text-blue-700";

      case "cancelled":
        return "bg-red-100 text-red-700";

      case "waiting":
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "accepted":
        return "Accepted";

      case "completed":
        return "Completed";

      case "cancelled":
        return "Cancelled";

      case "waiting":
      default:
        return "Waiting";
    }
  };

  const openDriverMap = () => {
    if (
      !driverLocation ||
      driverLocation.latitude === null ||
      driverLocation.longitude === null
    ) {
      return;
    }

    const url = `https://www.google.com/maps?q=${driverLocation.latitude},${driverLocation.longitude}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-8 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">
              Welcome,
              <span className="text-yellow-500">
                {" "}
                {user?.name || "Rider"}
              </span>
            </h1>

            <p className="text-gray-500 mt-2">
              Find or request your next ride.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button className="w-12 h-12 rounded-full bg-gray-100 hover:bg-yellow-400 transition">
              <Bell className="mx-auto" />
            </button>

            <button
              onClick={() => navigate("/profile")}
              className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center"
            >
              <UserCircle />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {stats.map((item) => (
            <motion.div
              key={item.title}
              whileHover={{
                y: -5,
                scale: 1.02,
              }}
              className="bg-white rounded-3xl shadow-lg p-6"
            >
              <div
                className={`w-14 h-14 rounded-2xl ${item.color} text-white flex items-center justify-center`}
              >
                {item.icon}
              </div>

              <h2 className="text-3xl font-bold mt-5">
                {requestsLoading ? "..." : item.value}
              </h2>

              <p className="text-gray-500">{item.title}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-lg p-8 mt-10"
        >
          <h2 className="text-2xl font-bold mb-6">
            Request a Ride
          </h2>

          <div className="grid md:grid-cols-2 gap-5">
            <input
              type="text"
              name="pickupLocation"
              placeholder="Pickup Location"
              value={rideData.pickupLocation}
              onChange={handleChange}
              className="border rounded-2xl px-5 py-4 focus:ring-2 focus:ring-yellow-400"
            />

            <input
              type="text"
              name="destination"
              placeholder="Destination"
              value={rideData.destination}
              onChange={handleChange}
              className="border rounded-2xl px-5 py-4 focus:ring-2 focus:ring-yellow-400"
            />

            <input
              type="date"
              name="departureDate"
              value={rideData.departureDate}
              onChange={handleChange}
              className="border rounded-2xl px-5 py-4 focus:ring-2 focus:ring-yellow-400"
            />

            <input
              type="time"
              name="departureTime"
              value={rideData.departureTime}
              onChange={handleChange}
              className="border rounded-2xl px-5 py-4 focus:ring-2 focus:ring-yellow-400"
            />

            <select
              name="seatsRequired"
              value={rideData.seatsRequired}
              onChange={handleChange}
              className="border rounded-2xl px-5 py-4 focus:ring-2 focus:ring-yellow-400"
            >
              <option value={1}>1 Seat</option>
              <option value={2}>2 Seats</option>
              <option value={3}>3 Seats</option>
              <option value={4}>4 Seats</option>
            </select>

            <textarea
              rows={4}
              name="notes"
              value={rideData.notes}
              onChange={handleChange}
              placeholder="Additional Notes"
              className="border rounded-2xl px-5 py-4 focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <button
            onClick={handleCreateRide}
            disabled={loading}
            className="mt-6 w-full bg-yellow-400 hover:bg-yellow-500 py-4 rounded-2xl text-lg font-semibold transition disabled:opacity-50"
          >
            {loading ? "Creating Ride..." : "Request Ride"}
          </button>
        </motion.div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-6">
            Quick Actions
          </h2>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
            <motion.div
              whileHover={{ y: -8, scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/create-ride")}
              className="cursor-pointer bg-white rounded-3xl shadow-lg p-8"
            >
              <div className="w-16 h-16 rounded-2xl bg-yellow-400 flex items-center justify-center text-3xl">
                🚗
              </div>

              <h3 className="font-bold text-2xl mt-5">
                Create Ride
              </h3>

              <p className="text-gray-500 mt-2">
                Request a new ride.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -8, scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/find-rides")}
              className="cursor-pointer bg-white rounded-3xl shadow-lg p-8"
            >
              <div className="w-16 h-16 rounded-2xl bg-green-500 flex items-center justify-center text-3xl text-white">
                🔍
              </div>

              <h3 className="font-bold text-2xl mt-5">
                Find Ride
              </h3>

              <p className="text-gray-500 mt-2">
                Browse available rides.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -8, scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/my-ride-requests")}
              className="cursor-pointer bg-white rounded-3xl shadow-lg p-8"
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center text-3xl text-white">
                📋
              </div>

              <h3 className="font-bold text-2xl mt-5">
                My Requests
              </h3>

              <p className="text-gray-500 mt-2">
                Manage your ride requests.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -8, scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/ride-history")}
              className="cursor-pointer bg-white rounded-3xl shadow-lg p-8"
            >
              <div className="w-16 h-16 rounded-2xl bg-purple-500 flex items-center justify-center text-3xl text-white">
                📜
              </div>

              <h3 className="font-bold text-2xl mt-5">
                Ride History
              </h3>

              <p className="text-gray-500 mt-2">
                View previous rides.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mt-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-white rounded-3xl shadow-lg p-8"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                Upcoming Ride
              </h2>

              {upcomingRide && (
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusStyle(
                    upcomingRide.status
                  )}`}
                >
                  {getStatusLabel(upcomingRide.status)}
                </span>
              )}
            </div>

            {requestsLoading ? (
              <div className="py-16 text-center">
                <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto" />

                <p className="text-gray-500 mt-4">
                  Loading upcoming ride...
                </p>
              </div>
            ) : requestsError ? (
              <div className="py-12 text-center">
                <p className="text-red-500">
                  {requestsError}
                </p>

                <button
                  onClick={loadRideRequests}
                  className="mt-5 bg-yellow-400 px-5 py-3 rounded-xl font-semibold inline-flex items-center gap-2"
                >
                  <RefreshCw size={18} />
                  Retry
                </button>
              </div>
            ) : !upcomingRide ? (
              <div className="py-14 text-center">
                <div className="text-6xl">🚗</div>

                <h3 className="text-xl font-bold mt-5">
                  No Upcoming Ride
                </h3>

                <p className="text-gray-500 mt-2">
                  You don't have any upcoming rides.
                </p>

                <button
                  onClick={() => navigate("/create-ride")}
                  className="mt-6 bg-yellow-400 hover:bg-yellow-500 px-6 py-3 rounded-xl font-semibold"
                >
                  Request a Ride
                </button>
              </div>
            ) : (
              <div className="mt-8">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                    <MapPin
                      className="text-green-600"
                      size={26}
                    />
                  </div>

                  <div>
                    <p className="text-gray-500">
                      Pickup
                    </p>

                    <h3 className="text-xl font-bold">
                      {upcomingRide.pickupLocation}
                    </h3>
                  </div>
                </div>

                <div className="ml-7 h-12 border-l-2 border-dashed border-gray-300" />

                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                    <MapPin
                      className="text-red-600"
                      size={26}
                    />
                  </div>

                  <div>
                    <p className="text-gray-500">
                      Destination
                    </p>

                    <h3 className="text-xl font-bold">
                      {upcomingRide.destination}
                    </h3>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-5 mt-8">
                  <div className="bg-gray-50 rounded-2xl p-5">
                    <div className="flex items-center gap-2 text-gray-500">
                      <CalendarDays size={18} />
                      <p>Date</p>
                    </div>

                    <h4 className="font-bold mt-2">
                      {formatDate(
                        upcomingRide.departureDate
                      )}
                    </h4>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-5">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Clock3 size={18} />
                      <p>Time</p>
                    </div>

                    <h4 className="font-bold mt-2">
                      {formatTime(
                        upcomingRide.departureTime
                      )}
                    </h4>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-5">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Users size={18} />
                      <p>Seats</p>
                    </div>

                    <h4 className="font-bold mt-2">
                      {upcomingRide.seatsRequired || 1} Seat
                      {upcomingRide.seatsRequired > 1
                        ? "s"
                        : ""}
                    </h4>
                  </div>
                </div>

                {driver && (
                  <div className="mt-8 bg-gray-50 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-5">
                      <div>
                        <h3 className="text-xl font-bold">
                          Driver Details
                        </h3>

                        <p className="text-gray-500 mt-1">
                          Your driver has accepted this ride.
                        </p>
                      </div>

                      <div className="bg-green-100 text-green-700 px-3 py-2 rounded-full text-sm font-semibold">
                        Driver Assigned
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-xl p-4">
                        <p className="text-sm text-gray-500">
                          Driver Name
                        </p>

                        <p className="font-bold mt-1">
                          {driver.full_name ||
                            driver.name ||
                            "N/A"}
                        </p>
                      </div>

                      <div className="bg-white rounded-xl p-4">
                        <div className="flex items-center gap-2 text-gray-500">
                          <Phone size={16} />
                          <p className="text-sm">
                            Mobile
                          </p>
                        </div>

                        <p className="font-bold mt-1">
                          {driver.phone || "N/A"}
                        </p>
                      </div>

                      <div className="bg-white rounded-xl p-4">
                        <div className="flex items-center gap-2 text-gray-500">
                          <Mail size={16} />
                          <p className="text-sm">
                            Email
                          </p>
                        </div>

                        <p className="font-bold mt-1 break-all">
                          {driver.email || "N/A"}
                        </p>
                      </div>

                      <div className="bg-white rounded-xl p-4">
                        <p className="text-sm text-gray-500">
                          Vehicle Type
                        </p>

                        <p className="font-bold mt-1">
                          {driver.vehicleType || "N/A"}
                        </p>
                      </div>

                      <div className="bg-white rounded-xl p-4">
                        <p className="text-sm text-gray-500">
                          Vehicle Number
                        </p>

                        <p className="font-bold mt-1">
                          {driver.vehicleNumber || "N/A"}
                        </p>
                      </div>

                      <div className="bg-white rounded-xl p-4">
                        <p className="text-sm text-gray-500">
                          Vehicle Model
                        </p>

                        <p className="font-bold mt-1">
                          {driver.vehicleModel || "N/A"}
                        </p>
                      </div>

                      <div className="bg-white rounded-xl p-4">
                        <p className="text-sm text-gray-500">
                          Vehicle Color
                        </p>

                        <p className="font-bold mt-1">
                          {driver.vehicleColor || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {driver && (
                  <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          Driver Live Location
                        </h3>

                        <p className="text-gray-500 mt-1">
                          Location automatically updates every
                          5 seconds.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-2 rounded-full text-sm font-semibold">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Live
                      </div>
                    </div>

                    {driverLocationLoading &&
                    !driverLocation ? (
                      <div className="bg-white rounded-xl p-8 text-center">
                        <div className="w-9 h-9 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />

                        <p className="text-gray-500 mt-4">
                          Getting driver location...
                        </p>
                      </div>
                    ) : driverLocation?.latitude !==
                        undefined &&
                      driverLocation?.longitude !==
                        undefined ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white rounded-xl p-5">
                            <div className="flex items-center gap-2 text-gray-500">
                              <MapPin size={18} />
                              <p className="text-sm">
                                Latitude
                              </p>
                            </div>

                            <p className="font-bold text-lg mt-2">
                              {Number(
                                driverLocation.latitude
                              ).toFixed(6)}
                            </p>
                          </div>

                          <div className="bg-white rounded-xl p-5">
                            <div className="flex items-center gap-2 text-gray-500">
                              <MapPin size={18} />
                              <p className="text-sm">
                                Longitude
                              </p>
                            </div>

                            <p className="font-bold text-lg mt-2">
                              {Number(
                                driverLocation.longitude
                              ).toFixed(6)}
                            </p>
                          </div>
                        </div>

                        <div className="bg-white rounded-xl p-5">
                          <div className="flex items-center gap-2 text-gray-500">
                            <Clock3 size={18} />
                            <span>
                              Last Updated
                            </span>
                          </div>

                          <p className="font-semibold mt-2">
                            {driverLocation.updatedAt
                              ? new Date(
                                  driverLocation.updatedAt
                                ).toLocaleString("en-IN")
                              : "N/A"}
                          </p>
                        </div>

                        <button
                          onClick={openDriverMap}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
                        >
                          <MapPin size={20} />
                          View Driver on Map
                        </button>

                        {driverLocationError && (
                          <p className="text-sm text-orange-600">
                            {driverLocationError}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="bg-white rounded-xl p-8 text-center">
                        <MapPin
                          size={42}
                          className="mx-auto text-gray-400"
                        />

                        <h4 className="font-bold text-lg mt-3">
                          Location Not Available
                        </h4>

                        <p className="text-gray-500 mt-1">
                          The driver has not shared a location
                          yet.
                        </p>

                        {driverLocationError && (
                          <p className="text-sm text-orange-600 mt-3">
                            {driverLocationError}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={() =>
                    navigate(
                      `/ride-requests/${upcomingRide._id}`
                    )
                  }
                  className="mt-8 bg-yellow-400 hover:bg-yellow-500 px-8 py-3 rounded-xl font-semibold transition inline-flex items-center gap-2"
                >
                  View Ride Details
                  <ArrowRight size={18} />
                </button>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl shadow-lg p-8"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                Last Ride
              </h2>

              {lastRide && (
                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusStyle(
                    lastRide.status
                  )}`}
                >
                  {getStatusLabel(lastRide.status)}
                </span>
              )}
            </div>

            {requestsLoading ? (
              <div className="py-12 text-center">
                <div className="w-9 h-9 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto" />

                <p className="text-gray-500 mt-4">
                  Loading...
                </p>
              </div>
            ) : !lastRide ? (
              <div className="py-12 text-center">
                <div className="text-5xl">📜</div>

                <h3 className="font-bold text-xl mt-5">
                  No Previous Ride
                </h3>

                <p className="text-gray-500 mt-2">
                  Your previous ride will appear here.
                </p>
              </div>
            ) : (
              <div className="mt-8">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center">
                    <MapPin
                      size={21}
                      className="text-green-600"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">
                      Pickup
                    </p>

                    <h3 className="font-bold text-lg truncate">
                      {lastRide.pickupLocation}
                    </h3>
                  </div>
                </div>

                <div className="ml-5 h-8 border-l-2 border-dashed border-gray-300" />

                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center">
                    <MapPin
                      size={21}
                      className="text-red-600"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">
                      Destination
                    </p>

                    <h3 className="font-bold text-lg truncate">
                      {lastRide.destination}
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-7">
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-xs text-gray-500">
                      Date
                    </p>

                    <p className="font-bold mt-1">
                      {formatDate(
                        lastRide.departureDate
                      )}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-xs text-gray-500">
                      Time
                    </p>

                    <p className="font-bold mt-1">
                      {formatTime(
                        lastRide.departureTime
                      )}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 mt-4">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Users size={18} />
                    <span>Seats</span>
                  </div>

                  <p className="font-bold mt-1">
                    {lastRide.seatsRequired || 1} Seat
                    {lastRide.seatsRequired > 1
                      ? "s"
                      : ""}
                  </p>
                </div>

                <button
                  onClick={() =>
                    navigate(
                      `/ride-requests/${lastRide._id}`
                    )
                  }
                  className="mt-6 w-full border border-gray-300 hover:bg-gray-100 px-5 py-3 rounded-xl font-semibold transition"
                >
                  View Ride
                </button>
              </div>
            )}
          </motion.div>
        </div>

        <div className="flex justify-end mt-10">
          <button
            onClick={onLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-xl font-semibold transition"
          >
            Logout
          </button>
        </div>
      </main>
    </div>
  );
}

export default RiderDashboard;