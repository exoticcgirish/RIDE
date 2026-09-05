import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RefreshCw,
  MapPin,
  CalendarDays,
  Clock3,
  Users,
  Car,
  ArrowLeft,
  Play,
  CheckCircle2,
  ShieldCheck,
  X,
  AlertCircle,
} from "lucide-react";

import {
  getAcceptedRideGroups,
  updateDriverLocation,
  verifyRideOtp,
  completeRide,
} from "../../services/driverApi";

function AcceptedGroups() {
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [otpGroup, setOtpGroup] = useState(null);
  const [otp, setOtp] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [completingId, setCompletingId] = useState(null);

  const getDriverName = (driver) => {
    if (!driver) {
      return "Driver";
    }

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

  const currentDriver = useMemo(() => {
    for (const group of groups) {
      if (group?.assignedDriver) {
        return group.assignedDriver;
      }
    }

    try {
      const keys = ["user", "currentUser", "driver", "authUser"];

      for (const key of keys) {
        const stored = localStorage.getItem(key);

        if (!stored) {
          continue;
        }

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

      const responseData = response.data;

      let data = [];

      if (Array.isArray(responseData)) {
        data = responseData;
      } else if (Array.isArray(responseData?.data)) {
        data = responseData.data;
      } else if (Array.isArray(responseData?.groups)) {
        data = responseData.groups;
      } else if (Array.isArray(responseData?.data?.groups)) {
        data = responseData.data.groups;
      }

      setGroups(data);
    } catch (error) {
      console.error("Accepted groups error:", error);

      setGroups([]);

      setError(
        error.response?.data?.message || "Failed to load accepted groups.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAcceptedGroups(false);
  }, []);

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

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

    if (!rider) {
      return "Rider";
    }

    return (
      rider.full_name ||
      rider.fullName ||
      rider.name ||
      rider.username ||
      rider.email ||
      "Rider"
    );
  };

  const totalRiders = groups.reduce((total, group) => {
    return total + (Array.isArray(group.members) ? group.members.length : 0);
  }, 0);

  const totalSeats = groups.reduce((total, group) => {
    return total + Number(group.totalSeats || 0);
  }, 0);

  const activeRide = groups.find((group) => group?.status === "in_progress");

  const sendCurrentLocation = () => {
    if (!navigator.geolocation) {
      return;
    }

    const activeGroups = groups.filter(
      (group) => group?.status === "in_progress",
    );

    if (activeGroups.length === 0) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        try {
          for (const group of activeGroups) {
            const members = Array.isArray(group.members) ? group.members : [];

            for (const member of members) {
              const rideRequestId = member?._id;

              if (!rideRequestId) {
                continue;
              }

              await updateDriverLocation(rideRequestId, latitude, longitude);
            }
          }

          console.log("Driver location updated.");
        } catch (error) {
          console.error(
            "Driver location update failed:",
            error.response?.data || error.message,
          );
        }
      },
      (locationError) => {
        console.error("Location permission/error:", locationError.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      },
    );
  };

  useEffect(() => {
    if (!activeRide) {
      return undefined;
    }

    sendCurrentLocation();

    const interval = setInterval(() => {
      sendCurrentLocation();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [activeRide?._id, activeRide?.status]);

  const openOtpModal = (group) => {
    setOtpGroup(group);
    setOtp("");
    setError("");
    setSuccess("");
  };

  const closeOtpModal = () => {
    if (verifyingOtp) {
      return;
    }

    setOtpGroup(null);
    setOtp("");
  };

  const handleVerifyOtp = async () => {
    if (!otpGroup?._id) {
      return;
    }

    const cleanOtp = otp.trim();

    if (!/^\d{4}$/.test(cleanOtp)) {
      setError("Enter the 4-digit ride OTP.");
      return;
    }

    try {
      setVerifyingOtp(true);
      setError("");
      setSuccess("");

      const response = await verifyRideOtp(otpGroup._id, cleanOtp);

      console.log("Verify OTP response:", response.data);

      setOtpGroup(null);
      setOtp("");

      setSuccess("Ride started successfully.");

      await fetchAcceptedGroups(true);
    } catch (error) {
      console.error("Verify OTP error:", error);

      setError(error.response?.data?.message || "Unable to verify OTP.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleCompleteRide = async (groupId) => {
    if (!groupId || completingId) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to complete this ride?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setCompletingId(groupId);
      setError("");
      setSuccess("");

      const response = await completeRide(groupId);

      console.log("Complete ride response:", response.data);

      setGroups((previousGroups) =>
        previousGroups.filter((group) => group._id !== groupId),
      );

      setSuccess(
        "Ride completed successfully. Looking for the next available ride.",
      );

      setTimeout(() => {
        navigate("/dashboard", {
          replace: true,
        });
      }, 700);
    } catch (error) {
      console.error("Complete ride error:", error);

      setError(error.response?.data?.message || "Unable to complete the ride.");
    } finally {
      setCompletingId(null);
    }
  };

  const getStatusClasses = (status) => {
    if (status === "in_progress") {
      return "bg-blue-50 text-blue-700 border border-blue-100";
    }

    if (status === "completed") {
      return "bg-gray-100 text-gray-600 border border-gray-200";
    }

    return "bg-green-50 text-green-700 border border-green-100";
  };

  const getStatusLabel = (status) => {
    if (status === "in_progress") {
      return "Ride In Progress";
    }

    if (status === "completed") {
      return "Completed";
    }

    return "Accepted";
  };

  return (
    <div className='min-h-screen bg-[#f8f9fb] text-[#172033]'>
      <header className='sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='h-20 flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-extrabold tracking-tight'>
                <span className='text-[#172033]'>Ride</span>
                <span className='text-[#fdbd00]'>Link</span>
              </h1>

              <p className='text-xs text-gray-400'>Driver Dashboard</p>
            </div>

            <div className='flex items-center gap-3'>
              <button
                type='button'
                onClick={() => fetchAcceptedGroups(true)}
                disabled={loading || refreshing}
                title='Refresh accepted groups'
                className='w-11 h-11 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 active:scale-95 flex items-center justify-center transition disabled:opacity-50'
              >
                <RefreshCw
                  size={21}
                  className={refreshing ? "animate-spin" : ""}
                />
              </button>

              <button
                type='button'
                onClick={() => navigate("/driver/profile")}
                title={getDriverName(currentDriver)}
                className='w-11 h-11 rounded-full bg-[#172033] text-white flex items-center justify-center font-bold text-lg hover:bg-[#25314a] transition shadow-sm'
              >
                {driverInitial}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8'>
          <div>
            <div className='inline-flex items-center gap-2 bg-[#fff5d6] text-[#9a7000] px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide'>
              <Car size={14} />
              Driver Dashboard
            </div>

            <h2 className='text-3xl sm:text-4xl font-extrabold mt-3 tracking-tight'>
              My Accepted Groups
            </h2>

            <p className='text-gray-500 mt-2 max-w-2xl'>
              Manage your accepted rides, start them with OTP, and complete them
              after the trip.
            </p>
          </div>

          <button
            type='button'
            onClick={() => navigate("/dashboard")}
            className='group w-full sm:w-fit inline-flex items-center justify-center gap-2 bg-[#172033] hover:bg-[#25314a] text-white px-5 py-3 rounded-xl font-bold transition shadow-sm'
          >
            <ArrowLeft size={18} />
            Available Groups
          </button>
        </div>

        {success && (
          <div className='mb-6 bg-green-50 border border-green-100 rounded-2xl p-4 flex items-center gap-3'>
            <CheckCircle2 size={21} className='text-green-600 shrink-0' />

            <p className='text-green-700 font-semibold'>{success}</p>

            <button
              type='button'
              onClick={() => setSuccess("")}
              className='ml-auto text-green-500 hover:text-green-700'
            >
              <X size={18} />
            </button>
          </div>
        )}

        {error && (
          <div className='mb-6 bg-red-50 border border-red-100 rounded-2xl p-5 flex items-start gap-3'>
            <AlertCircle size={21} className='text-red-500 shrink-0 mt-0.5' />

            <div className='flex-1'>
              <p className='font-bold text-red-700'>Something went wrong</p>

              <p className='text-sm text-red-600 mt-1'>{error}</p>
            </div>

            <button
              type='button'
              onClick={() => setError("")}
              className='text-red-400 hover:text-red-600'
            >
              <X size={18} />
            </button>
          </div>
        )}

        <div className='grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8'>
          <div className='bg-white border border-gray-100 rounded-2xl p-5 shadow-sm'>
            <div className='flex items-start justify-between'>
              <div>
                <p className='text-sm text-gray-400 font-medium'>
                  Accepted Groups
                </p>

                <h3 className='text-3xl font-extrabold mt-2'>
                  {groups.length}
                </h3>

                <p className='text-xs text-gray-400 mt-3'>Assigned to you</p>
              </div>

              <div className='w-11 h-11 rounded-xl bg-[#fff5d6] flex items-center justify-center'>
                <Users size={21} className='text-[#c58f00]' />
              </div>
            </div>
          </div>

          <div className='bg-white border border-gray-100 rounded-2xl p-5 shadow-sm'>
            <div className='flex items-start justify-between'>
              <div>
                <p className='text-sm text-gray-400 font-medium'>
                  Total Riders
                </p>

                <h3 className='text-3xl font-extrabold mt-2'>{totalRiders}</h3>

                <p className='text-xs text-gray-400 mt-3'>Across your groups</p>
              </div>

              <div className='w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center'>
                <Users size={21} className='text-blue-600' />
              </div>
            </div>
          </div>

          <div className='bg-[#172033] rounded-2xl p-5 shadow-sm text-white'>
            <div className='flex items-start justify-between'>
              <div>
                <p className='text-sm text-gray-300 font-medium'>Total Seats</p>

                <h3 className='text-3xl font-extrabold mt-2'>{totalSeats}</h3>

                <p className='text-xs text-gray-300 mt-3'>Across your groups</p>
              </div>

              <div className='w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center'>
                <Car size={21} />
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div className='space-y-5'>
            {[1, 2].map((item) => (
              <div
                key={item}
                className='bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 animate-pulse'
              >
                <div className='h-6 bg-gray-200 rounded w-1/3' />

                <div className='h-4 bg-gray-200 rounded w-2/3 mt-5' />

                <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 mt-8'>
                  {[1, 2, 3, 4].map((box) => (
                    <div key={box} className='h-20 bg-gray-100 rounded-xl' />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && groups.length === 0 && (
          <div className='bg-white border border-gray-100 rounded-3xl p-12 sm:p-16 text-center shadow-sm'>
            <div className='w-20 h-20 mx-auto bg-[#fff5d6] rounded-2xl flex items-center justify-center'>
              <Car size={34} className='text-[#c58f00]' />
            </div>

            <h3 className='text-2xl font-extrabold mt-6'>No Accepted Groups</h3>

            <p className='text-gray-400 mt-2 max-w-md mx-auto'>
              You do not currently have an accepted ride group.
            </p>

            <button
              type='button'
              onClick={() => navigate("/dashboard")}
              className='mt-7 bg-[#fdbd00] hover:bg-[#efb000] text-[#172033] px-6 py-3 rounded-xl font-bold transition'
            >
              Find Ride Groups
            </button>
          </div>
        )}

        {!loading && !error && groups.length > 0 && (
          <div className='space-y-6'>
            {groups.map((group) => {
              const isAccepted = group.status === "accepted";

              const isInProgress = group.status === "in_progress";

              return (
                <div
                  key={group._id}
                  className='bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-lg transition overflow-hidden'
                >
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

                    <span
                      className={`w-fit px-4 py-1.5 rounded-full text-xs font-bold ${getStatusClasses(
                        group.status,
                      )}`}
                    >
                      {getStatusLabel(group.status)}
                    </span>
                  </div>

                  <div className='p-5 sm:p-7'>
                    {isInProgress && (
                      <div className='mb-7 rounded-2xl bg-blue-50 border border-blue-100 p-5 flex flex-col sm:flex-row sm:items-center gap-4'>
                        <div className='w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center shrink-0'>
                          <Play
                            size={20}
                            className='text-blue-600 fill-blue-600'
                          />
                        </div>

                        <div className='flex-1'>
                          <p className='font-extrabold text-blue-800'>
                            Ride is in progress
                          </p>

                          <p className='text-sm text-blue-600 mt-1'>
                            Driver location tracking is active.
                          </p>
                        </div>

                        <button
                          type='button'
                          disabled={completingId === group._id}
                          onClick={() => handleCompleteRide(group._id)}
                          className='w-full sm:w-auto bg-[#172033] hover:bg-[#25314a] disabled:bg-gray-300 text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition'
                        >
                          {completingId === group._id ? (
                            <>
                              <RefreshCw size={18} className='animate-spin' />
                              Completing...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={18} />
                              Complete Ride
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    <div>
                      <div className='flex items-center gap-2 mb-5'>
                        <MapPin size={17} className='text-[#fdbd00]' />

                        <p className='text-xs text-gray-400 font-bold uppercase tracking-wide'>
                          Route
                        </p>
                      </div>

                      <div className='flex gap-4'>
                        <div className='flex flex-col items-center pt-1 shrink-0'>
                          <div className='w-3 h-3 rounded-full bg-green-500 ring-4 ring-green-50' />

                          <div className='w-px h-16 bg-gray-200' />

                          <div className='w-3 h-3 rounded-full bg-red-500 ring-4 ring-red-50' />
                        </div>

                        <div className='flex-1 min-w-0'>
                          <div>
                            <p className='text-xs text-gray-400 font-semibold'>
                              PICKUP
                            </p>

                            <p
                              title={group.pickupLocation || "N/A"}
                              className='font-bold mt-1 text-base sm:text-lg leading-6 break-words'
                            >
                              {group.pickupLocation || "N/A"}
                            </p>
                          </div>

                          <div className='mt-7'>
                            <p className='text-xs text-gray-400 font-semibold'>
                              DESTINATION
                            </p>

                            <p
                              title={group.destination || "N/A"}
                              className='font-bold mt-1 text-base sm:text-lg leading-6 break-words'
                            >
                              {group.destination || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 mt-8'>
                      <div className='bg-gray-50 rounded-2xl p-4'>
                        <div className='flex items-center gap-2'>
                          <CalendarDays size={17} className='text-[#d49b00]' />

                          <p className='text-xs text-gray-400 font-semibold'>
                            DATE
                          </p>
                        </div>

                        <p className='font-bold mt-3'>
                          {formatDate(group.departureDate)}
                        </p>
                      </div>

                      <div className='bg-gray-50 rounded-2xl p-4'>
                        <div className='flex items-center gap-2'>
                          <Clock3 size={17} className='text-[#d49b00]' />

                          <p className='text-xs text-gray-400 font-semibold'>
                            TIME
                          </p>
                        </div>

                        <p className='font-bold mt-3'>
                          {group.departureTime || "N/A"}
                        </p>
                      </div>

                      <div className='bg-gray-50 rounded-2xl p-4'>
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

                      <div className='bg-gray-50 rounded-2xl p-4'>
                        <div className='flex items-center gap-2'>
                          <Car size={17} className='text-[#d49b00]' />

                          <p className='text-xs text-gray-400 font-semibold'>
                            SEATS
                          </p>
                        </div>

                        <p className='font-bold mt-3'>
                          {group.totalSeats || 0} / {group.maxSeats || 4}
                        </p>
                      </div>
                    </div>

                    {isAccepted && (
                      <div className='mt-7 pt-6 border-t border-gray-100'>
                        <div className='rounded-2xl bg-[#fffaf0] border border-[#f8e5a8] p-5 flex flex-col sm:flex-row sm:items-center gap-4'>
                          <div className='w-11 h-11 rounded-xl bg-[#fff0bd] flex items-center justify-center shrink-0'>
                            <ShieldCheck size={21} className='text-[#b98200]' />
                          </div>

                          <div className='flex-1'>
                            <p className='font-extrabold'>
                              Ready to start the ride?
                            </p>

                            <p className='text-sm text-gray-500 mt-1'>
                              Ask the rider for the 4-digit OTP before starting.
                            </p>
                          </div>

                          <button
                            type='button'
                            onClick={() => openOtpModal(group)}
                            className='w-full sm:w-auto bg-[#fdbd00] hover:bg-[#efb000] text-[#172033] px-6 py-3 rounded-xl font-extrabold flex items-center justify-center gap-2 transition'
                          >
                            <Play size={18} className='fill-current' />
                            Start Ride
                          </button>
                        </div>
                      </div>
                    )}

                    <div className='mt-8 border-t border-gray-100 pt-7'>
                      <div className='flex items-center justify-between mb-5'>
                        <div>
                          <h3 className='font-extrabold text-lg'>
                            Group Members
                          </h3>

                          <p className='text-sm text-gray-400 mt-1'>
                            Riders in this group
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
                              className='bg-gray-50 hover:bg-gray-100 rounded-2xl p-4 flex items-center gap-3 transition'
                            >
                              <div className='w-11 h-11 rounded-full bg-[#172033] text-white flex items-center justify-center font-bold text-lg shrink-0'>
                                {riderName.trim().charAt(0).toUpperCase() ||
                                  "R"}
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
              );
            })}
          </div>
        )}
      </main>

      {otpGroup && (
        <div className='fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4'>
          <div className='w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden'>
            <div className='px-6 py-5 border-b border-gray-100 flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='w-11 h-11 rounded-xl bg-[#fff5d6] flex items-center justify-center'>
                  <ShieldCheck size={22} className='text-[#b98200]' />
                </div>

                <div>
                  <h3 className='font-extrabold text-lg'>Start Ride</h3>

                  <p className='text-xs text-gray-400'>
                    Group #{otpGroup._id?.slice(-6)}
                  </p>
                </div>
              </div>

              <button
                type='button'
                onClick={closeOtpModal}
                disabled={verifyingOtp}
                className='w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-500 transition disabled:opacity-50'
              >
                <X size={19} />
              </button>
            </div>

            <div className='p-6'>
              <div className='text-center'>
                <div className='w-16 h-16 mx-auto rounded-2xl bg-[#172033] text-white flex items-center justify-center'>
                  <ShieldCheck size={30} />
                </div>

                <h4 className='text-xl font-extrabold mt-5'>Enter Ride OTP</h4>

                <p className='text-sm text-gray-500 mt-2'>
                  Ask any rider in this group for the 4-digit OTP.
                </p>
              </div>

              <input
                type='text'
                inputMode='numeric'
                autoComplete='one-time-code'
                maxLength={4}
                value={otp}
                autoFocus
                onChange={(event) => {
                  const value = event.target.value.replace(/\D/g, "");

                  setOtp(value.slice(0, 4));
                  setError("");
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleVerifyOtp();
                  }
                }}
                placeholder='••••'
                className='w-full mt-7 text-center text-3xl tracking-[0.7em] font-extrabold border-2 border-gray-200 focus:border-[#fdbd00] focus:ring-4 focus:ring-[#fdbd00]/20 rounded-2xl py-4 outline-none transition'
              />

              <p className='text-xs text-gray-400 text-center mt-3'>
                OTP must contain exactly 4 digits.
              </p>

              <button
                type='button'
                onClick={handleVerifyOtp}
                disabled={verifyingOtp || otp.length !== 4}
                className='w-full mt-6 bg-[#fdbd00] hover:bg-[#efb000] disabled:bg-gray-200 disabled:text-gray-400 text-[#172033] py-3.5 rounded-xl font-extrabold transition flex items-center justify-center gap-2'
              >
                {verifyingOtp ? (
                  <>
                    <RefreshCw size={19} className='animate-spin' />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Play size={19} className='fill-current' />
                    Verify & Start Ride
                  </>
                )}
              </button>

              <button
                type='button'
                onClick={closeOtpModal}
                disabled={verifyingOtp}
                className='w-full mt-3 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AcceptedGroups;
