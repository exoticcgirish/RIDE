import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RefreshCw,
  MapPin,
  CalendarDays,
  Clock3,
  Users,
  Car,
  ArrowRight,
} from "lucide-react";

import {
  getAcceptedRideGroups,
  updateDriverLocation,
} from "../../services/driverApi";

function AcceptedGroups() {
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  /*
   * Get driver's name from available accepted-group data.
   * Falls back to localStorage if available.
   */
  const getDriverName = (driver) => {
    if (!driver) return "Driver";

    return (
      driver.full_name ||
      driver.fullName ||
      driver.name ||
      driver.username ||
      driver.email ||
      "Driver"
    );
  };

  const getDriverInitial = (driver) => {
    const name = getDriverName(driver);

    return name.trim().charAt(0).toUpperCase() || "D";
  };

  /*
   * Try to find the currently assigned driver.
   */
  const currentDriver = useMemo(() => {
    for (const group of groups) {
      if (group?.assignedDriver) {
        return group.assignedDriver;
      }
    }

    /*
     * Fallback:
     * Try common user objects stored by the authentication system.
     */
    try {
      const possibleKeys = ["user", "currentUser", "driver", "authUser"];

      for (const key of possibleKeys) {
        const stored = localStorage.getItem(key);

        if (!stored) continue;

        const parsed = JSON.parse(stored);

        if (parsed) {
          return parsed;
        }
      }
    } catch (storageError) {
      console.warn("Could not read driver information:", storageError);
    }

    return null;
  }, [groups]);

  const driverInitial = getDriverInitial(currentDriver);

  const fetchAcceptedGroups = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await getAcceptedRideGroups();

      console.log("Accepted groups response:", response.data);

      const data = response.data?.data || response.data?.groups || [];

      setGroups(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Accepted groups error:", error);

      setError(
        error.response?.data?.message || "Failed to load accepted groups.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /*
   * Send current driver location to every ride request
   * belonging to accepted groups.
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

              await updateDriverLocation(rideRequestId, latitude, longitude);
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
        console.error("Location permission/error:", error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      },
    );
  };

  /*
   * Load accepted groups on page load.
   */
  useEffect(() => {
    fetchAcceptedGroups(false);
  }, []);

  /*
   * Send driver's location every 5 seconds
   * when accepted groups exist.
   */
  useEffect(() => {
    if (groups.length === 0) return;

    sendCurrentLocation();

    const interval = setInterval(() => {
      sendCurrentLocation();
    }, 5000);

    return () => clearInterval(interval);
  }, [groups]);

  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "N/A";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getRiderName = (member) => {
    const rider = member?.rider;

    if (!rider) return "Rider";

    return (
      rider.full_name ||
      rider.fullName ||
      rider.name ||
      rider.username ||
      rider.email ||
      "Rider"
    );
  };

  const totalRiders = groups.reduce(
    (total, group) => total + (group.members?.length || 0),
    0,
  );

  const totalSeats = groups.reduce(
    (total, group) => total + Number(group.totalSeats || 0),
    0,
  );

  return (
    <div className='min-h-screen bg-[#f8f9fb] text-[#172033]'>
      {/* ================= HEADER ================= */}

      <header className='sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='h-20 flex items-center justify-between'>
            {/* LOGO */}

            <div>
              <h1 className='text-3xl font-extrabold tracking-tight'>
                <span className='text-[#172033]'>Ride</span>

                <span className='text-[#fdbd00]'>Link</span>
              </h1>

              <p className='text-xs text-gray-400'>Driver Dashboard</p>
            </div>

            {/* HEADER ACTIONS */}

            <div className='flex items-center gap-3'>
              <button
                type='button'
                onClick={() => fetchAcceptedGroups(true)}
                disabled={loading || refreshing}
                title='Refresh accepted groups'
                className='w-11 h-11 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 active:scale-95 flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <RefreshCw
                  size={21}
                  className={refreshing ? "animate-spin" : ""}
                />
              </button>

              {/* DRIVER INITIAL */}

              <button
                type='button'
                onClick={() => navigate("/driver/profile")}
                title={getDriverName(currentDriver)}
                className='w-11 h-11 rounded-full bg-[#172033] text-white flex items-center justify-center font-bold text-lg hover:bg-[#25314a] hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm'
              >
                {driverInitial}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ================= MAIN ================= */}

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* PAGE HEADER */}

        <div className='flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8'>
          <div>
            <div className='inline-flex items-center gap-2 bg-[#fff5d6] text-[#9a7000] px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide'>
              <Car size={14} />
              Driver Dashboard
            </div>

            <h2 className='text-3xl sm:text-4xl font-extrabold mt-3 tracking-tight'>
              My Accepted Groups
            </h2>

            <p className='text-gray-500 mt-2'>
              Manage the ride groups you have accepted.
            </p>
          </div>

          <button
            type='button'
            onClick={() => navigate("/dashboard")}
            className='group w-full sm:w-fit inline-flex items-center justify-center gap-2 bg-[#172033] hover:bg-[#25314a] text-white px-5 py-3 rounded-xl font-bold transition-all duration-200 shadow-sm hover:shadow-md'
          >
            Available Groups
            <ArrowRight
              size={18}
              className='group-hover:translate-x-1 transition-transform'
            />
          </button>
        </div>

        {/* ================= STAT CARDS ================= */}

        <div className='grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8'>
          {/* GROUPS */}

          <div className='bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow'>
            <div className='flex items-start justify-between'>
              <div>
                <p className='text-sm text-gray-400 font-medium'>
                  Accepted Groups
                </p>

                <h3 className='text-3xl font-extrabold mt-2'>
                  {groups.length}
                </h3>

                <p className='text-xs text-gray-400 mt-3'>
                  Groups assigned to you
                </p>
              </div>

              <div className='w-11 h-11 rounded-xl bg-[#fff5d6] flex items-center justify-center'>
                <Users size={21} className='text-[#c58f00]' />
              </div>
            </div>
          </div>

          {/* RIDERS */}

          <div className='bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow'>
            <div className='flex items-start justify-between'>
              <div>
                <p className='text-sm text-gray-400 font-medium'>
                  Total Riders
                </p>

                <h3 className='text-3xl font-extrabold mt-2'>{totalRiders}</h3>

                <p className='text-xs text-gray-400 mt-3'>
                  Across accepted groups
                </p>
              </div>

              <div className='w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center'>
                <Users size={21} className='text-blue-600' />
              </div>
            </div>
          </div>

          {/* SEATS */}

          <div className='bg-[#172033] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow text-white'>
            <div className='flex items-start justify-between'>
              <div>
                <p className='text-sm text-gray-300 font-medium'>Total Seats</p>

                <h3 className='text-3xl font-extrabold mt-2'>{totalSeats}</h3>

                <p className='text-xs text-gray-300 mt-3'>
                  Across accepted groups
                </p>
              </div>

              <div className='w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center'>
                <Car size={21} />
              </div>
            </div>
          </div>
        </div>

        {/* ================= ERROR ================= */}

        {error && (
          <div className='mb-6 bg-red-50 border border-red-100 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
            <div>
              <p className='text-red-700 font-bold'>
                Unable to load accepted groups
              </p>

              <p className='text-red-600 text-sm mt-1'>{error}</p>
            </div>

            <button
              type='button'
              onClick={() => fetchAcceptedGroups(true)}
              className='w-fit bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition'
            >
              Try Again
            </button>
          </div>
        )}

        {/* ================= LOADING ================= */}

        {loading && (
          <div className='space-y-5'>
            {[1, 2].map((item) => (
              <div
                key={item}
                className='bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 animate-pulse'
              >
                <div className='flex justify-between'>
                  <div className='flex gap-4'>
                    <div className='w-12 h-12 bg-gray-200 rounded-xl' />

                    <div>
                      <div className='h-3 bg-gray-200 rounded w-28' />

                      <div className='h-5 bg-gray-200 rounded w-36 mt-2' />
                    </div>
                  </div>

                  <div className='h-7 bg-gray-200 rounded-full w-20' />
                </div>

                <div className='mt-8 space-y-5'>
                  <div className='h-4 bg-gray-200 rounded w-3/4' />
                  <div className='h-4 bg-gray-200 rounded w-2/3' />
                </div>

                <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 mt-8'>
                  {[1, 2, 3, 4].map((box) => (
                    <div key={box} className='h-20 bg-gray-100 rounded-xl' />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= EMPTY ================= */}

        {!loading && !error && groups.length === 0 && (
          <div className='bg-white border border-gray-100 rounded-3xl p-12 sm:p-16 text-center shadow-sm'>
            <div className='w-20 h-20 mx-auto bg-[#fff5d6] rounded-2xl flex items-center justify-center'>
              <Car size={34} className='text-[#c58f00]' />
            </div>

            <h3 className='text-2xl font-extrabold mt-6'>No Accepted Groups</h3>

            <p className='text-gray-400 mt-2 max-w-md mx-auto'>
              You have not accepted any ride groups yet. Available ride groups
              will appear here after you accept one.
            </p>

            <button
              type='button'
              onClick={() => navigate("/dashboard")}
              className='mt-7 bg-[#fdbd00] hover:bg-[#efb000] text-[#172033] px-6 py-3 rounded-xl font-bold transition-all hover:shadow-md'
            >
              Find Ride Groups
            </button>
          </div>
        )}

        {/* ================= GROUPS ================= */}

        {!loading && !error && groups.length > 0 && (
          <div className='space-y-6'>
            {groups.map((group) => (
              <div
                key={group._id}
                className='bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden'
              >
                {/* GROUP HEADER */}

                <div className='px-5 sm:px-7 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                  <div className='flex items-center gap-4 min-w-0'>
                    <div className='w-12 h-12 rounded-xl bg-[#fff5d6] flex items-center justify-center shrink-0'>
                      <Users size={23} className='text-[#b98200]' />
                    </div>

                    <div className='min-w-0'>
                      <p className='text-xs text-gray-400 uppercase tracking-wide font-semibold'>
                        Accepted Ride Group
                      </p>

                      <h3 className='text-lg font-extrabold truncate'>
                        Group #{group._id?.slice(-6) || "------"}
                      </h3>
                    </div>
                  </div>

                  <span className='w-fit px-4 py-1.5 rounded-full bg-green-50 text-green-600 text-xs font-bold capitalize'>
                    {group.status || "accepted"}
                  </span>
                </div>

                {/* GROUP BODY */}

                <div className='p-5 sm:p-7'>
                  {/* ROUTE */}

                  <div>
                    <div className='flex items-center gap-2 mb-5'>
                      <MapPin size={17} className='text-[#fdbd00]' />

                      <p className='text-xs text-gray-400 font-bold uppercase tracking-wide'>
                        Route
                      </p>
                    </div>

                    <div className='flex gap-4'>
                      {/* ROUTE LINE */}

                      <div className='flex flex-col items-center pt-1 shrink-0'>
                        <div className='w-3 h-3 rounded-full bg-green-500 ring-4 ring-green-50' />

                        <div className='w-px h-16 bg-gray-200' />

                        <div className='w-3 h-3 rounded-full bg-red-500 ring-4 ring-red-50' />
                      </div>

                      {/* LOCATIONS */}

                      <div className='flex-1 min-w-0'>
                        {/* PICKUP */}

                        <div className='min-w-0'>
                          <p className='text-xs text-gray-400 font-semibold'>
                            PICKUP
                          </p>

                          <p
                            title={group.pickupLocation || "N/A"}
                            className='font-bold mt-1 text-base sm:text-lg leading-6 truncate'
                          >
                            {group.pickupLocation || "N/A"}
                          </p>
                        </div>

                        {/* DESTINATION */}

                        <div className='mt-7 min-w-0'>
                          <p className='text-xs text-gray-400 font-semibold'>
                            DESTINATION
                          </p>

                          <p
                            title={group.destination || "N/A"}
                            className='font-bold mt-1 text-base sm:text-lg leading-6 truncate'
                          >
                            {group.destination || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* INFORMATION */}

                  <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 mt-8'>
                    <div className='bg-gray-50 hover:bg-gray-100 rounded-2xl p-4 transition'>
                      <div className='flex items-center gap-2'>
                        <CalendarDays size={17} className='text-[#d49b00]' />

                        <p className='text-xs text-gray-400 font-semibold'>
                          DEPARTURE DATE
                        </p>
                      </div>

                      <p className='font-bold mt-3'>
                        {formatDate(group.departureDate)}
                      </p>
                    </div>

                    <div className='bg-gray-50 hover:bg-gray-100 rounded-2xl p-4 transition'>
                      <div className='flex items-center gap-2'>
                        <Clock3 size={17} className='text-[#d49b00]' />

                        <p className='text-xs text-gray-400 font-semibold'>
                          DEPARTURE TIME
                        </p>
                      </div>

                      <p className='font-bold mt-3'>
                        {group.departureTime || "N/A"}
                      </p>
                    </div>

                    <div className='bg-gray-50 hover:bg-gray-100 rounded-2xl p-4 transition'>
                      <div className='flex items-center gap-2'>
                        <Users size={17} className='text-[#d49b00]' />

                        <p className='text-xs text-gray-400 font-semibold'>
                          RIDERS
                        </p>
                      </div>

                      <p className='font-bold mt-3'>
                        {group.members?.length || 0}
                      </p>
                    </div>

                    <div className='bg-gray-50 hover:bg-gray-100 rounded-2xl p-4 transition'>
                      <div className='flex items-center gap-2'>
                        <Car size={17} className='text-[#d49b00]' />

                        <p className='text-xs text-gray-400 font-semibold'>
                          SEATS
                        </p>
                      </div>

                      <p className='font-bold mt-3'>{group.totalSeats || 0}</p>
                    </div>
                  </div>

                  {/* ================= MEMBERS ================= */}

                  <div className='mt-8 border-t border-gray-100 pt-7'>
                    <div className='flex items-center justify-between mb-5'>
                      <div>
                        <h3 className='font-extrabold text-lg'>
                          Group Members
                        </h3>

                        <p className='text-sm text-gray-400 mt-1'>
                          Riders in this accepted group
                        </p>
                      </div>

                      <span className='min-w-8 h-8 px-2 rounded-full bg-gray-100 flex items-center justify-center font-bold text-sm'>
                        {group.members?.length || 0}
                      </span>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                      {group.members?.map((member, index) => {
                        const riderName = getRiderName(member);

                        return (
                          <div
                            key={member._id || index}
                            className='bg-gray-50 hover:bg-gray-100 rounded-2xl p-4 flex items-center gap-3 transition-colors'
                          >
                            {/* RIDER INITIAL */}

                            <div className='w-11 h-11 rounded-full bg-[#172033] text-white flex items-center justify-center font-bold text-lg shrink-0'>
                              {riderName.trim().charAt(0).toUpperCase() || "R"}
                            </div>

                            <div className='min-w-0 flex-1'>
                              <p
                                title={riderName}
                                className='font-bold truncate'
                              >
                                {riderName}
                              </p>

                              {member.rider?.phone && (
                                <p className='text-sm text-gray-500 truncate mt-0.5'>
                                  {member.rider.phone}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ================= DRIVER ================= */}

                  {group.assignedDriver && (
                    <div className='mt-8 border-t border-gray-100 pt-7'>
                      <div className='flex items-center gap-3 mb-5'>
                        <div className='w-10 h-10 rounded-full bg-[#172033] text-white flex items-center justify-center font-bold'>
                          {getDriverInitial(group.assignedDriver)}
                        </div>

                        <div className='min-w-0'>
                          <p className='text-xs text-gray-400 uppercase tracking-wide font-semibold'>
                            Driver
                          </p>

                          <p
                            title={getDriverName(group.assignedDriver)}
                            className='font-bold truncate'
                          >
                            {getDriverName(group.assignedDriver)}
                          </p>
                        </div>
                      </div>

                      <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
                        <div className='bg-gray-50 rounded-2xl p-4'>
                          <p className='text-xs text-gray-400 font-semibold'>
                            PHONE
                          </p>

                          <p className='font-bold mt-2 truncate'>
                            {group.assignedDriver.phone || "N/A"}
                          </p>
                        </div>

                        <div className='bg-gray-50 rounded-2xl p-4'>
                          <p className='text-xs text-gray-400 font-semibold'>
                            VEHICLE
                          </p>

                          <p className='font-bold mt-2 truncate'>
                            {group.assignedDriver.vehicleType || "N/A"}
                          </p>
                        </div>

                        <div className='bg-gray-50 rounded-2xl p-4'>
                          <p className='text-xs text-gray-400 font-semibold'>
                            NUMBER
                          </p>

                          <p className='font-bold mt-2 truncate'>
                            {group.assignedDriver.vehicleNumber || "N/A"}
                          </p>
                        </div>

                        <div className='bg-gray-50 rounded-2xl p-4'>
                          <p className='text-xs text-gray-400 font-semibold'>
                            MODEL
                          </p>

                          <p className='font-bold mt-2 truncate'>
                            {group.assignedDriver.vehicleModel || "N/A"}
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
    </div>
  );
}

export default AcceptedGroups;
