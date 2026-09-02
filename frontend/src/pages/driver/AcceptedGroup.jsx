import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAcceptedRideGroups,
  updateDriverLocation,
} from "../../services/driverApi";
import {
  RefreshCw,
  LogOut,
  User,
  Users,
  MapPin,
  CalendarDays,
  Clock3,
  Car,
  Phone,
  X,
  ArrowRight,
} from "lucide-react";

function AcceptedGroups() {
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  /*
   * Get logged-in user from localStorage.
   */
  const getCurrentUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch (error) {
      console.error("Failed to read user:", error);
      return null;
    }
  };

  const currentUser = getCurrentUser();

  /*
   * Get first name.
   *
   * Examples:
   * "Girish Yadav" -> "Girish"
   * "Rahul Kumar" -> "Rahul"
   */
  const getFirstName = () => {
    const user = getCurrentUser();

    if (!user) return "User";

    const fullName =
      user.full_name ||
      user.fullName ||
      user.name ||
      user.username ||
      "";

    if (!fullName) {
      return "User";
    }

    return String(fullName).trim().split(/\s+/)[0];
  };

  /*
   * First letter of first name.
   *
   * "Girish Yadav" -> G
   */
  const getUserInitial = () => {
    const firstName = getFirstName();

    return firstName.charAt(0).toUpperCase() || "U";
  };

  /*
   * Get current driver id.
   */
  const getCurrentDriverId = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");

      return user?._id || user?.id || user?.userId || "unknown-driver";
    } catch (error) {
      console.error("Failed to read driver:", error);
      return "unknown-driver";
    }
  };

  const driverId = getCurrentDriverId();

  /*
   * Same localStorage key used by DriverDashboard.
   */
  const ACCEPTED_GROUP_KEY = `acceptedRideGroup_${driverId}`;

  /*
   * Logout.
   */
  const handleLogout = () => {
    localStorage.removeItem(ACCEPTED_GROUP_KEY);

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setShowLogoutModal(false);

    navigate("/login");
  };

  /*
   * Fetch accepted groups.
   */
  const fetchAcceptedGroups = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAcceptedRideGroups();

      console.log("Accepted groups response:", response.data);

      const data =
        response.data?.data ||
        response.data?.groups ||
        response.data?.acceptedGroups ||
        [];

      setGroups(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Accepted groups error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load accepted groups.",
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Send driver's current location.
   */
  const sendCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        console.log("Current driver location:", {
          latitude,
          longitude,
        });

        try {
          for (const group of groups) {
            for (const member of group.members || []) {
              const rideRequestId = member?._id;

              if (!rideRequestId) continue;

              await updateDriverLocation(
                rideRequestId,
                latitude,
                longitude,
              );
            }
          }

          console.log("Driver location sent successfully");
        } catch (error) {
          console.error(
            "Failed to update driver location:",
            error.response?.data || error.message,
          );
        }
      },
      (error) => {
        console.error(
          "Location permission/error:",
          error.message,
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      },
    );
  };

  /*
   * Load groups.
   */
  useEffect(() => {
    fetchAcceptedGroups();
  }, []);

  /*
   * Send driver location every 5 seconds.
   */
  useEffect(() => {
    if (groups.length === 0) return;

    sendCurrentLocation();

    const interval = setInterval(() => {
      sendCurrentLocation();
    }, 5000);

    return () => clearInterval(interval);
  }, [groups]);

  /*
   * Format date.
   */
  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /*
   * Rider name.
   */
  const getRiderName = (member) => {
    const rider = member?.rider;

    if (!rider) {
      return member?.name || member?.full_name || "Rider";
    }

    return (
      rider.full_name ||
      rider.fullName ||
      rider.name ||
      rider.email ||
      "Rider"
    );
  };

  /*
   * Driver name.
   */
  const getDriverName = (driver) => {
    if (!driver) return "Driver";

    return (
      driver.full_name ||
      driver.fullName ||
      driver.name ||
      driver.email ||
      "Driver"
    );
  };

  /*
   * Safe location text.
   */
  const getLocationText = (location) => {
    if (!location) return "Location not available";

    return String(location);
  };

  /*
   * Statistics.
   */
  const totalRiders = groups.reduce(
    (total, group) =>
      total + (group.members?.length || 0),
    0,
  );

  const totalSeats = groups.reduce(
    (total, group) =>
      total + Number(group.totalSeats || 0),
    0,
  );

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-[#172033]">
      {/* =========================================================
          NAVBAR
      ========================================================= */}

      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="min-h-[76px] flex items-center justify-between gap-4">
            {/* LOGO */}

            <div className="shrink-0">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-none">
                <span className="text-[#172033]">
                  Ride
                </span>
                <span className="text-[#fdbd00]">
                  Link
                </span>
              </h1>

              <p className="text-[11px] sm:text-xs text-gray-400 mt-1">
                Driver Dashboard
              </p>
            </div>

            {/* NAV ACTIONS */}

            <div className="flex items-center gap-2 sm:gap-3">
              {/* ONLINE */}

              <div className="hidden md:flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2.5 rounded-full text-sm font-bold">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-50 animate-ping" />

                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
                </span>

                Online
              </div>

              {/* REFRESH */}

              <button
                type="button"
                onClick={fetchAcceptedGroups}
                disabled={loading}
                title="Refresh accepted groups"
                className="w-11 h-11 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw
                  size={20}
                  className={
                    loading
                      ? "animate-spin text-gray-400"
                      : "text-[#172033]"
                  }
                />
              </button>

              {/* PROFILE */}

              <button
                type="button"
                onClick={() =>
                  navigate("/driver/profile")
                }
                title={`${getFirstName()}'s profile`}
                className="group w-11 h-11 rounded-full bg-[#172033] text-white flex items-center justify-center font-extrabold text-base shadow-sm hover:bg-[#253047] hover:scale-105 transition-all duration-200"
              >
                {getUserInitial()}
              </button>

              {/* LOGOUT */}

              <button
                type="button"
                onClick={() =>
                  setShowLogoutModal(true)
                }
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 font-bold transition-all duration-200"
              >
                <LogOut size={18} />
                Logout
              </button>

              {/* MOBILE LOGOUT */}

              <button
                type="button"
                onClick={() =>
                  setShowLogoutModal(true)
                }
                title="Logout"
                className="sm:hidden w-11 h-11 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition"
              >
                <LogOut size={19} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================
          MAIN
      ========================================================= */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-9">
        {/* PAGE HEADER */}

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-[#fdbd00]" />

              <p className="text-xs sm:text-sm text-gray-400 font-bold uppercase tracking-wider">
                Driver Dashboard
              </p>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              My Accepted Groups
            </h2>

            <p className="text-gray-500 mt-2 text-sm sm:text-base">
              Manage the ride groups you have accepted.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/dashboard")
            }
            className="w-full sm:w-fit flex items-center justify-center gap-2 bg-[#172033] hover:bg-[#253047] text-white px-5 py-3 rounded-xl font-bold transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Available Groups
            <ArrowRight size={18} />
          </button>
        </div>

        {/* =========================================================
            STATISTICS
        ========================================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-8">
          {/* GROUPS */}

          <div className="group bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-400 font-medium">
                  Accepted Groups
                </p>

                <h3 className="text-3xl font-extrabold mt-2">
                  {groups.length}
                </h3>
              </div>

              <div className="w-11 h-11 rounded-xl bg-[#fff5d6] flex items-center justify-center">
                <Users
                  size={21}
                  className="text-[#d99d00]"
                />
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-4">
              Groups assigned to you
            </p>
          </div>

          {/* RIDERS */}

          <div className="group bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-400 font-medium">
                  Total Riders
                </p>

                <h3 className="text-3xl font-extrabold mt-2">
                  {totalRiders}
                </h3>
              </div>

              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                <User
                  size={21}
                  className="text-blue-500"
                />
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-4">
              Across accepted groups
            </p>
          </div>

          {/* SEATS */}

          <div className="bg-[#172033] rounded-2xl p-5 sm:p-6 shadow-sm text-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-300 font-medium">
                  Total Seats
                </p>

                <h3 className="text-3xl font-extrabold mt-2">
                  {totalSeats}
                </h3>
              </div>

              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
                <Car size={21} />
              </div>
            </div>

            <p className="text-xs text-gray-300 mt-4">
              Across accepted groups
            </p>
          </div>
        </div>

        {/* =========================================================
            ERROR
        ========================================================= */}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-100 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-red-700 font-bold">
                Unable to load accepted groups
              </p>

              <p className="text-red-500 text-sm mt-1">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={fetchAcceptedGroups}
              className="w-fit text-red-600 bg-white border border-red-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-50 transition"
            >
              Try again
            </button>
          </div>
        )}

        {/* =========================================================
            LOADING
        ========================================================= */}

        {loading && (
          <div className="bg-white border border-gray-100 rounded-2xl p-14 text-center shadow-sm">
            <div className="w-11 h-11 mx-auto border-4 border-gray-200 border-t-[#fdbd00] rounded-full animate-spin" />

            <p className="text-gray-500 mt-5 font-semibold">
              Loading accepted ride groups...
            </p>

            <p className="text-gray-400 text-sm mt-1">
              Please wait a moment.
            </p>
          </div>
        )}

        {/* =========================================================
            EMPTY
        ========================================================= */}

        {!loading &&
          !error &&
          groups.length === 0 && (
            <div className="bg-white border border-gray-100 rounded-3xl p-10 sm:p-16 text-center shadow-sm">
              <div className="w-20 h-20 mx-auto bg-[#fff5d6] rounded-2xl flex items-center justify-center">
                <Car
                  size={34}
                  className="text-[#d99d00]"
                />
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold mt-6">
                No Accepted Groups
              </h3>

              <p className="text-gray-400 mt-2 max-w-md mx-auto">
                You have not accepted any ride groups yet.
                Available groups will appear on the dashboard.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/dashboard")
                }
                className="mt-7 inline-flex items-center gap-2 bg-[#fdbd00] hover:bg-[#efb000] text-[#172033] px-6 py-3 rounded-xl font-bold transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Find Ride Groups
                <ArrowRight size={18} />
              </button>
            </div>
          )}

        {/* =========================================================
            ACCEPTED GROUPS
        ========================================================= */}

        {!loading &&
          !error &&
          groups.length > 0 && (
            <div className="space-y-6">
              {groups.map((group) => (
                <div
                  key={group._id}
                  className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                  {/* GROUP HEADER */}

                  <div className="px-5 sm:px-7 py-5 sm:py-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-xl bg-[#fff5d6] flex items-center justify-center shrink-0">
                        <Users
                          size={23}
                          className="text-[#d99d00]"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[11px] sm:text-xs text-gray-400 uppercase tracking-wider font-bold">
                          Accepted Ride Group
                        </p>

                        <h3 className="text-lg sm:text-xl font-extrabold mt-0.5">
                          Group #
                          {group._id?.slice(-6) ||
                            "------"}
                        </h3>
                      </div>
                    </div>

                    <span className="w-fit inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-600 text-xs font-bold capitalize">
                      <span className="w-2 h-2 rounded-full bg-green-500" />

                      {group.status || "accepted"}
                    </span>
                  </div>

                  {/* GROUP CONTENT */}

                  <div className="p-5 sm:p-7">
                    {/* ROUTE */}

                    <div className="flex items-center justify-between mb-5">
                      <p className="text-xs text-gray-400 font-extrabold uppercase tracking-wider">
                        Route
                      </p>

                      <MapPin
                        size={18}
                        className="text-gray-300"
                      />
                    </div>

                    <div className="flex gap-4">
                      {/* ROUTE LINE */}

                      <div className="flex flex-col items-center pt-1 shrink-0">
                        <div className="w-3.5 h-3.5 rounded-full bg-green-500 ring-4 ring-green-50" />

                        <div className="w-px h-16 bg-gray-200" />

                        <div className="w-3.5 h-3.5 rounded-full bg-red-500 ring-4 ring-red-50" />
                      </div>

                      {/* LOCATIONS */}

                      <div className="flex-1 min-w-0">
                        {/* PICKUP */}

                        <div className="min-w-0">
                          <p className="text-[11px] text-gray-400 font-bold tracking-wide">
                            PICKUP
                          </p>

                          <p
                            title={getLocationText(
                              group.pickupLocation,
                            )}
                            className="font-bold text-sm sm:text-base mt-1 leading-6 line-clamp-2 break-words"
                          >
                            {getLocationText(
                              group.pickupLocation,
                            )}
                          </p>
                        </div>

                        {/* DESTINATION */}

                        <div className="mt-7 min-w-0">
                          <p className="text-[11px] text-gray-400 font-bold tracking-wide">
                            DESTINATION
                          </p>

                          <p
                            title={getLocationText(
                              group.destination,
                            )}
                            className="font-bold text-sm sm:text-base mt-1 leading-6 line-clamp-2 break-words"
                          >
                            {getLocationText(
                              group.destination,
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* =================================================
                        GROUP DETAILS
                    ================================================= */}

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-7">
                      {/* DATE */}

                      <div className="bg-[#f8f9fb] border border-gray-100 rounded-xl p-4">
                        <div className="flex items-center gap-2">
                          <CalendarDays
                            size={17}
                            className="text-[#e5aa00]"
                          />

                          <p className="text-[11px] text-gray-400 font-bold">
                            DATE
                          </p>
                        </div>

                        <p className="font-bold text-sm mt-2">
                          {formatDate(
                            group.departureDate,
                          )}
                        </p>
                      </div>

                      {/* TIME */}

                      <div className="bg-[#f8f9fb] border border-gray-100 rounded-xl p-4">
                        <div className="flex items-center gap-2">
                          <Clock3
                            size={17}
                            className="text-[#e5aa00]"
                          />

                          <p className="text-[11px] text-gray-400 font-bold">
                            TIME
                          </p>
                        </div>

                        <p className="font-bold text-sm mt-2">
                          {group.departureTime ||
                            "N/A"}
                        </p>
                      </div>

                      {/* RIDERS */}

                      <div className="bg-[#f8f9fb] border border-gray-100 rounded-xl p-4">
                        <div className="flex items-center gap-2">
                          <Users
                            size={17}
                            className="text-[#e5aa00]"
                          />

                          <p className="text-[11px] text-gray-400 font-bold">
                            RIDERS
                          </p>
                        </div>

                        <p className="font-bold text-sm mt-2">
                          {group.members?.length ||
                            0}
                        </p>
                      </div>

                      {/* SEATS */}

                      <div className="bg-[#f8f9fb] border border-gray-100 rounded-xl p-4">
                        <div className="flex items-center gap-2">
                          <Car
                            size={17}
                            className="text-[#e5aa00]"
                          />

                          <p className="text-[11px] text-gray-400 font-bold">
                            SEATS
                          </p>
                        </div>

                        <p className="font-bold text-sm mt-2">
                          {group.totalSeats || 0}
                        </p>
                      </div>
                    </div>

                    {/* =================================================
                        GROUP MEMBERS
                    ================================================= */}

                    <div className="mt-8 pt-7 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <h4 className="font-extrabold text-lg">
                            Group Members
                          </h4>

                          <p className="text-sm text-gray-400 mt-1">
                            Riders included in this group
                          </p>
                        </div>

                        <span className="min-w-8 h-8 px-2 rounded-full bg-gray-100 flex items-center justify-center text-sm font-extrabold">
                          {group.members?.length ||
                            0}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {group.members?.map(
                          (member, index) => {
                            const name =
                              getRiderName(member);

                            return (
                              <div
                                key={
                                  member._id ||
                                  index
                                }
                                className="bg-[#f8f9fb] border border-gray-100 rounded-xl p-4 flex items-center gap-3 hover:bg-gray-100 transition"
                              >
                                {/* RIDER INITIAL */}

                                <div className="w-11 h-11 rounded-full bg-[#172033] text-white flex items-center justify-center font-extrabold shrink-0">
                                  {name
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>

                                <div className="min-w-0">
                                  <p className="font-bold text-sm truncate">
                                    {name}
                                  </p>

                                  {member.rider
                                    ?.phone && (
                                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                                      <Phone
                                        size={12}
                                      />

                                      <span>
                                        {
                                          member
                                            .rider
                                            .phone
                                        }
                                      </span>
                                    </div>
                                  )}

                                  {member.phone && (
                                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                                      <Phone
                                        size={12}
                                      />

                                      <span>
                                        {
                                          member.phone
                                        }
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          },
                        )}
                      </div>
                    </div>

                    {/* =================================================
                        ASSIGNED DRIVER
                    ================================================= */}

                    {group.assignedDriver && (
                      <div className="mt-8 pt-7 border-t border-gray-100">
                        <div className="flex items-center gap-3 mb-5">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                            <Car
                              size={20}
                              className="text-blue-500"
                            />
                          </div>

                          <div>
                            <p className="text-[11px] text-gray-400 uppercase tracking-wide font-bold">
                              Driver
                            </p>

                            <p className="font-extrabold">
                              {getDriverName(
                                group.assignedDriver,
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="bg-[#f8f9fb] border border-gray-100 rounded-xl p-4">
                            <p className="text-[11px] text-gray-400 font-bold">
                              PHONE
                            </p>

                            <p className="font-bold mt-2 text-sm truncate">
                              {group.assignedDriver
                                .phone || "N/A"}
                            </p>
                          </div>

                          <div className="bg-[#f8f9fb] border border-gray-100 rounded-xl p-4">
                            <p className="text-[11px] text-gray-400 font-bold">
                              VEHICLE
                            </p>

                            <p className="font-bold mt-2 text-sm truncate">
                              {group.assignedDriver
                                .vehicleType ||
                                "N/A"}
                            </p>
                          </div>

                          <div className="bg-[#f8f9fb] border border-gray-100 rounded-xl p-4">
                            <p className="text-[11px] text-gray-400 font-bold">
                              NUMBER
                            </p>

                            <p className="font-bold mt-2 text-sm truncate">
                              {group.assignedDriver
                                .vehicleNumber ||
                                "N/A"}
                            </p>
                          </div>

                          <div className="bg-[#f8f9fb] border border-gray-100 rounded-xl p-4">
                            <p className="text-[11px] text-gray-400 font-bold">
                              MODEL
                            </p>

                            <p className="font-bold mt-2 text-sm truncate">
                              {group.assignedDriver
                                .vehicleModel ||
                                "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
      </main>

      {/* =========================================================
          LOGOUT CONFIRMATION MODAL
      ========================================================= */}

      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* BACKDROP */}

          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() =>
              setShowLogoutModal(false)
            }
          />

          {/* MODAL */}

          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-7 animate-[fadeIn_0.2s_ease-out]">
            {/* CLOSE */}

            <button
              type="button"
              onClick={() =>
                setShowLogoutModal(false)
              }
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition"
            >
              <X size={18} />
            </button>

            {/* ICON */}

            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-5">
              <LogOut
                size={25}
                className="text-red-500"
              />
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-[#172033]">
              Logout from RideLink?
            </h3>

            <p className="text-gray-500 mt-2 leading-6">
              Are you sure you want to logout from
              your driver account?
            </p>

            {/* ACTIONS */}

            <div className="flex flex-col-reverse sm:flex-row gap-3 mt-7">
              <button
                type="button"
                onClick={() =>
                  setShowLogoutModal(false)
                }
                className="w-full sm:w-1/2 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#172033] font-bold transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full sm:w-1/2 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition shadow-sm"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AcceptedGroups;