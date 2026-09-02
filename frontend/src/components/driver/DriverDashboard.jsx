import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getAvailableRideGroups,
  acceptRideGroup,
} from "../../services/driverApi";

import {
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  Users,
  MapPin,
  CalendarDays,
  Clock3,
  ArrowRight,
  CarFront,
  ShieldCheck,
} from "lucide-react";

function DriverDashboard() {
  const navigate = useNavigate();

  const getStoredUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch (error) {
      console.error("Failed to read user:", error);
      return null;
    }
  };

  const user = getStoredUser();

  const getFirstName = () => {
    const firstName = user?.firstName || user?.first_name || user?.firstname;

    if (firstName) {
      return String(firstName).trim();
    }

    const fullName =
      user?.name || user?.fullName || user?.full_name || user?.username;

    if (fullName) {
      return String(fullName).trim().split(/\s+/)[0];
    }

    return "Driver";
  };

  const firstName = getFirstName();
  const profileInitial = firstName.charAt(0).toUpperCase() || "D";

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acceptingId, setAcceptingId] = useState(null);
  const [acceptedGroupId, setAcceptedGroupId] = useState(null);

  const [modal, setModal] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
  });

  const showSuccessModal = (title, message) => {
    setModal({
      open: true,
      type: "success",
      title,
      message,
    });
  };

  const showErrorModal = (title, message) => {
    setModal({
      open: true,
      type: "error",
      title,
      message,
    });
  };

  const closeModal = () => {
    setModal((previous) => ({
      ...previous,
      open: false,
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAvailableRideGroups();

      const responseData = response?.data;

      let availableGroups = [];

      if (Array.isArray(responseData?.data)) {
        availableGroups = responseData.data;
      } else if (Array.isArray(responseData)) {
        availableGroups = responseData;
      } else if (Array.isArray(responseData?.groups)) {
        availableGroups = responseData.groups;
      }

      console.log("Available groups from API:", availableGroups);

      setGroups(availableGroups);
    } catch (error) {
      console.error("Fetch groups error:", error);

      const message =
        error?.response?.data?.message ||
        "Failed to load available ride groups.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const updateCurrentLocation = async (rideRequestId) => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        try {
          const token = localStorage.getItem("token");

          const response = await fetch(
            "http://localhost:7001/api/drivers/location",
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                rideRequestId,
                latitude,
                longitude,
              }),
            },
          );

          const data = await response.json();

          if (!response.ok) {
            console.error("Location update failed:", data);
            return;
          }

          console.log("Current driver location:", {
            latitude,
            longitude,
          });
        } catch (error) {
          console.error("Location update error:", error);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      },
    );
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleAcceptGroup = async (groupId) => {
    if (!groupId || acceptingId !== null) {
      return;
    }

    try {
      setAcceptingId(groupId);

      console.log("Accepting group:", groupId);

      const response = await acceptRideGroup(groupId);

      console.log("Accept response:", response?.data);

      setAcceptedGroupId(groupId);

      setGroups((previousGroups) =>
        previousGroups.map((group) =>
          group._id === groupId
            ? {
                ...group,
                status: "assigned",
                assignedDriver: user?._id || user?.id,
              }
            : group,
        ),
      );

      showSuccessModal(
        "Ride Group Accepted",
        "The ride group has been accepted successfully. You can now manage this group from your accepted groups.",
      );
    } catch (error) {
      console.error("ACCEPT GROUP ERROR:", error);
      console.error("Status:", error?.response?.status);
      console.error("Response:", error?.response?.data);

      showErrorModal(
        "Unable to Accept Group",
        error?.response?.data?.message ||
          `Failed to accept ride group. Status: ${
            error?.response?.status || "unknown"
          }`,
      );
    } finally {
      setAcceptingId(null);
    }
  };

  const getGroupStatus = (group) => {
    const rawStatus = String(group?.status || "ready").toLowerCase();

    if (group?._id === acceptedGroupId) {
      return "accepted";
    }

    if (
      rawStatus === "available" ||
      rawStatus === "ready" ||
      rawStatus === "pending"
    ) {
      return "ready";
    }

    if (rawStatus === "unavailable" || rawStatus === "not_available") {
      return "unavailable";
    }

    if (rawStatus === "completed" || rawStatus === "complete") {
      return "completed";
    }

    if (rawStatus === "cancelled" || rawStatus === "canceled") {
      return "cancelled";
    }

    if (rawStatus === "accepted" || rawStatus === "assigned") {
      return "accepted";
    }

    return rawStatus;
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "accepted":
        return "Accepted";
      case "unavailable":
        return "Unavailable";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      case "ready":
        return "Ready";
      default:
        return status || "Ready";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "accepted":
        return "bg-green-50 text-green-600 border border-green-100";

      case "unavailable":
        return "bg-gray-100 text-gray-500 border border-gray-200";

      case "completed":
        return "bg-purple-50 text-purple-600 border border-purple-100";

      case "cancelled":
        return "bg-red-50 text-red-600 border border-red-100";

      default:
        return "bg-blue-50 text-blue-600 border border-blue-100";
    }
  };

  const totalRiders = groups.reduce(
    (total, group) => total + (group.members?.length || 0),
    0,
  );

  const totalSeats = groups.reduce(
    (total, group) => total + Number(group.totalSeats || 0),
    0,
  );

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

  const getShortLocation = (location, maxLength = 90) => {
    if (!location) {
      return "Location not available";
    }

    const text = String(location);

    if (text.length <= maxLength) {
      return text;
    }

    return `${text.slice(0, maxLength).trim()}...`;
  };

  const handleModalAction = () => {
    if (modal.type === "success") {
      closeModal();
      navigate("/driver/accepted-groups");
      return;
    }

    closeModal();
  };

  return (
    <div className='min-h-screen bg-[#f7f8fa] text-[#172033]'>
      <header className='sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='h-[76px] flex items-center justify-between'>
            <div>
              <h1 className='text-2xl sm:text-3xl font-extrabold tracking-tight leading-none'>
                <span className='text-[#172033]'>Ride</span>
                <span className='text-[#fdbd00]'>Link</span>
              </h1>

              <p className='text-[11px] sm:text-xs text-gray-400 mt-1'>
                Driver Dashboard
              </p>
            </div>

            <div className='flex items-center gap-2 sm:gap-3'>
              <div className='hidden sm:flex items-center gap-2 bg-green-50 border border-green-100 text-green-600 px-4 py-2.5 rounded-full text-sm font-bold'>
                <span className='relative flex h-2.5 w-2.5'>
                  <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-50' />
                  <span className='relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500' />
                </span>
                Online
              </div>

              <button
                type='button'
                onClick={fetchGroups}
                disabled={loading}
                title='Refresh ride groups'
                className='w-11 h-11 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm'
              >
                <RefreshCw
                  size={20}
                  className={
                    loading ? "animate-spin text-[#172033]" : "text-[#172033]"
                  }
                />
              </button>

              <button
                type='button'
                onClick={() => navigate("/driver/profile")}
                title={`Profile - ${firstName}`}
                className='group w-11 h-11 rounded-full bg-[#172033] text-white flex items-center justify-center font-extrabold text-base shadow-md hover:scale-105 hover:shadow-lg transition-all duration-200'
              >
                {profileInitial}
              </button>

              <button
                type='button'
                onClick={handleLogout}
                className='hidden sm:block px-5 py-2.5 rounded-xl bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 hover:border-red-200 font-bold transition-all duration-200'
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-9'>
        <div className='flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8'>
          <div>
            <div className='flex items-center gap-2 mb-2'>
              <span className='w-2 h-2 rounded-full bg-[#fdbd00]' />

              <p className='text-sm font-bold text-gray-400 uppercase tracking-wider'>
                Driver Dashboard
              </p>
            </div>

            <h2 className='text-3xl sm:text-4xl font-extrabold tracking-tight'>
              Available Ride Groups
            </h2>

            <p className='text-gray-500 mt-2 max-w-2xl'>
              Accept a complete ride group and drive all riders together.
            </p>
          </div>

          <button
            type='button'
            onClick={() => navigate("/driver/accepted-groups")}
            className='w-full lg:w-auto inline-flex items-center justify-center gap-2 bg-[#172033] hover:bg-[#222d43] text-white px-5 py-3.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-200'
          >
            <CarFront size={19} />
            My Accepted Groups
            <ArrowRight size={17} />
          </button>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-8'>
          <div className='group bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200'>
            <div className='flex items-start justify-between'>
              <div>
                <p className='text-sm font-semibold text-gray-400'>
                  Available Groups
                </p>

                <h3 className='text-3xl font-extrabold mt-2'>
                  {groups.length}
                </h3>
              </div>

              <div className='w-11 h-11 rounded-xl bg-[#fff5d6] flex items-center justify-center'>
                <Users size={21} className='text-[#d99f00]' />
              </div>
            </div>

            <p className='text-xs text-gray-400 mt-4'>
              Groups waiting for drivers
            </p>
          </div>

          <div className='group bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200'>
            <div className='flex items-start justify-between'>
              <div>
                <p className='text-sm font-semibold text-gray-400'>
                  Total Riders
                </p>

                <h3 className='text-3xl font-extrabold mt-2'>{totalRiders}</h3>
              </div>

              <div className='w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center'>
                <Users size={21} className='text-blue-600' />
              </div>
            </div>

            <p className='text-xs text-gray-400 mt-4'>
              Across available groups
            </p>
          </div>

          <div className='bg-[#172033] rounded-2xl p-5 sm:p-6 shadow-md text-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200'>
            <div className='flex items-start justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-300'>Total Seats</p>

                <h3 className='text-3xl font-extrabold mt-2'>{totalSeats}</h3>
              </div>

              <div className='w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center'>
                <CarFront size={21} className='text-[#fdbd00]' />
              </div>
            </div>

            <p className='text-xs text-gray-300 mt-4'>
              Across available groups
            </p>
          </div>
        </div>

        {error && (
          <div className='mb-6 rounded-2xl bg-red-50 border border-red-100 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
            <div className='flex items-start gap-3'>
              <div className='w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0'>
                <AlertCircle size={20} className='text-red-600' />
              </div>

              <div>
                <p className='font-bold text-red-700'>Something went wrong</p>

                <p className='text-sm text-red-600 mt-1'>{error}</p>
              </div>
            </div>

            <button
              type='button'
              onClick={fetchGroups}
              className='w-full sm:w-auto px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition'
            >
              Try Again
            </button>
          </div>
        )}

        {loading && (
          <div className='bg-white border border-gray-100 rounded-3xl p-12 sm:p-16 text-center shadow-sm'>
            <div className='w-14 h-14 mx-auto rounded-2xl bg-[#fff5d6] flex items-center justify-center'>
              <RefreshCw size={27} className='text-[#d99f00] animate-spin' />
            </div>

            <h3 className='text-xl font-extrabold mt-5'>Loading ride groups</h3>

            <p className='text-gray-400 mt-2'>
              Finding available groups for you...
            </p>
          </div>
        )}

        {!loading && !error && groups.length === 0 && (
          <div className='bg-white border border-gray-100 rounded-3xl p-10 sm:p-16 text-center shadow-sm'>
            <div className='w-20 h-20 mx-auto bg-[#fff5d6] rounded-2xl flex items-center justify-center'>
              <CarFront size={34} className='text-[#d99f00]' />
            </div>

            <h3 className='text-2xl font-extrabold mt-6'>
              No ride groups available
            </h3>

            <p className='text-gray-400 mt-2 max-w-md mx-auto'>
              New ride groups will appear here when they are ready for a driver.
            </p>

            <button
              type='button'
              onClick={fetchGroups}
              className='mt-7 inline-flex items-center gap-2 bg-[#fdbd00] hover:bg-[#efb000] text-[#172033] px-6 py-3 rounded-xl font-extrabold transition-all shadow-sm'
            >
              <RefreshCw size={18} />
              Refresh Groups
            </button>
          </div>
        )}

        {!loading && !error && groups.length > 0 && (
          <div className='space-y-6'>
            {groups.map((group) => {
              const status = getGroupStatus(group);
              const isAccepted = status === "accepted";
              const isAccepting = acceptingId === group._id;

              const isUnavailable = status === "unavailable";

              const isDisabledStatus =
                isUnavailable ||
                status === "completed" ||
                status === "cancelled";

              return (
                <div
                  key={group._id}
                  className={`bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden ${
                    isDisabledStatus ? "opacity-90" : ""
                  }`}
                >
                  <div className='px-5 sm:px-7 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                    <div className='flex items-center gap-4 min-w-0'>
                      <div className='w-12 h-12 rounded-2xl bg-[#fff5d6] flex items-center justify-center shrink-0'>
                        <Users size={23} className='text-[#d99f00]' />
                      </div>

                      <div className='min-w-0'>
                        <p className='text-[11px] text-gray-400 uppercase tracking-wider font-bold'>
                          Ride Group
                        </p>

                        <h3 className='text-lg sm:text-xl font-extrabold mt-0.5'>
                          Group #{group._id?.slice(-6)}
                        </h3>
                      </div>
                    </div>

                    <span
                      className={`w-fit px-4 py-2 rounded-full text-xs font-extrabold capitalize ${getStatusClass(
                        status,
                      )}`}
                    >
                      {getStatusLabel(status)}
                    </span>
                  </div>

                  <div className='p-5 sm:p-7'>
                    <div className='mb-7'>
                      <div className='flex items-center justify-between mb-5'>
                        <p className='text-xs text-gray-400 font-extrabold uppercase tracking-wider'>
                          Route
                        </p>

                        <MapPin size={17} className='text-gray-300' />
                      </div>

                      <div className='flex gap-4'>
                        <div className='flex flex-col items-center pt-1 shrink-0'>
                          <div className='w-3.5 h-3.5 rounded-full bg-green-500 ring-4 ring-green-50' />

                          <div className='w-px h-16 bg-gradient-to-b from-green-300 to-red-300' />

                          <div className='w-3.5 h-3.5 rounded-full bg-red-500 ring-4 ring-red-50' />
                        </div>

                        <div className='flex-1 min-w-0'>
                          <div className='min-w-0'>
                            <p className='text-[11px] text-gray-400 font-bold tracking-wide'>
                              PICKUP
                            </p>

                            <p
                              title={group.pickupLocation}
                              className='font-bold text-base sm:text-lg mt-1 leading-6 break-words line-clamp-2'
                            >
                              {getShortLocation(group.pickupLocation)}
                            </p>
                          </div>

                          <div className='mt-7 min-w-0'>
                            <p className='text-[11px] text-gray-400 font-bold tracking-wide'>
                              DESTINATION
                            </p>

                            <p
                              title={group.destination}
                              className='font-bold text-base sm:text-lg mt-1 leading-6 break-words line-clamp-2'
                            >
                              {getShortLocation(group.destination)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
                      <div className='bg-gray-50 hover:bg-gray-100 rounded-2xl p-4 transition'>
                        <div className='flex items-center gap-2'>
                          <CalendarDays size={17} className='text-[#d99f00]' />

                          <p className='text-[11px] text-gray-400 font-bold'>
                            DEPARTURE
                          </p>
                        </div>

                        <p className='font-extrabold mt-2 text-sm sm:text-base'>
                          {formatDate(group.departureDate)}
                        </p>
                      </div>

                      <div className='bg-gray-50 hover:bg-gray-100 rounded-2xl p-4 transition'>
                        <div className='flex items-center gap-2'>
                          <Clock3 size={17} className='text-[#d99f00]' />

                          <p className='text-[11px] text-gray-400 font-bold'>
                            TIME
                          </p>
                        </div>

                        <p className='font-extrabold mt-2 text-sm sm:text-base'>
                          {group.departureTime || "N/A"}
                        </p>
                      </div>

                      <div className='bg-gray-50 hover:bg-gray-100 rounded-2xl p-4 transition'>
                        <div className='flex items-center gap-2'>
                          <Users size={17} className='text-[#d99f00]' />

                          <p className='text-[11px] text-gray-400 font-bold'>
                            MEMBERS
                          </p>
                        </div>

                        <p className='font-extrabold mt-2 text-sm sm:text-base'>
                          {group.members?.length || 0}
                        </p>
                      </div>

                      <div className='bg-gray-50 hover:bg-gray-100 rounded-2xl p-4 transition'>
                        <div className='flex items-center gap-2'>
                          <CarFront size={17} className='text-[#d99f00]' />

                          <p className='text-[11px] text-gray-400 font-bold'>
                            SEATS
                          </p>
                        </div>

                        <p className='font-extrabold mt-2 text-sm sm:text-base'>
                          {group.totalSeats || 0}
                        </p>
                      </div>
                    </div>

                    <div className='mt-7 pt-7 border-t border-gray-100'>
                      <div className='flex items-center justify-between mb-4'>
                        <div>
                          <h4 className='font-extrabold text-lg'>
                            Group Members
                          </h4>

                          <p className='text-xs text-gray-400 mt-1'>
                            Riders included in this group
                          </p>
                        </div>

                        <div className='w-9 h-9 rounded-full bg-[#172033] text-white flex items-center justify-center text-sm font-extrabold'>
                          {group.members?.length || 0}
                        </div>
                      </div>

                      <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                        {group.members?.map((member, index) => {
                          const name =
                            member.name ||
                            member.full_name ||
                            member.fullName ||
                            `Rider ${index + 1}`;

                          const memberInitial = String(name)
                            .charAt(0)
                            .toUpperCase();

                          return (
                            <div
                              key={member._id || index}
                              className='bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-200 rounded-2xl p-4 transition-all duration-200'
                            >
                              <div className='flex items-center gap-3 min-w-0'>
                                <div className='w-11 h-11 rounded-full bg-[#172033] text-white flex items-center justify-center font-extrabold shrink-0 shadow-sm'>
                                  {memberInitial}
                                </div>

                                <div className='min-w-0'>
                                  <p
                                    title={name}
                                    className='font-extrabold text-sm truncate'
                                  >
                                    {name}
                                  </p>

                                  {member.phone && (
                                    <p className='text-xs text-gray-400 mt-1 truncate'>
                                      {member.phone}
                                    </p>
                                  )}

                                  {member.email && (
                                    <p className='text-xs text-gray-400 truncate'>
                                      {member.email}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className='mt-7 pt-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                      <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center'>
                          <ShieldCheck size={20} className='text-green-600' />
                        </div>

                        <div>
                          <p className='text-[11px] text-gray-400 uppercase tracking-wide font-bold'>
                            Group Status
                          </p>

                          <p className='font-extrabold text-sm mt-0.5 capitalize'>
                            {getStatusLabel(status)}
                          </p>
                        </div>
                      </div>

                      <button
                        type='button'
                        disabled={
                          acceptingId !== null || isDisabledStatus || isAccepted
                        }
                        onClick={() => handleAcceptGroup(group._id)}
                        className={`w-full sm:w-auto min-w-[190px] inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-extrabold transition-all duration-200 ${
                          isAccepted
                            ? "bg-green-100 text-green-700 cursor-default"
                            : isDisabledStatus
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : isAccepting
                                ? "bg-[#efb000] text-[#172033] cursor-wait"
                                : "bg-[#fdbd00] hover:bg-[#efb000] text-[#172033] hover:shadow-lg hover:-translate-y-0.5"
                        }`}
                      >
                        {isAccepted ? (
                          <>
                            <CheckCircle2 size={19} />
                            Accepted
                          </>
                        ) : isUnavailable ? (
                          "Unavailable"
                        ) : status === "completed" ? (
                          "Completed"
                        ) : status === "cancelled" ? (
                          "Cancelled"
                        ) : isAccepting ? (
                          <>
                            <RefreshCw size={18} className='animate-spin' />
                            Accepting...
                          </>
                        ) : (
                          <>
                            Accept Group
                            <ArrowRight size={18} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {modal.open && (
        <div
          className='fixed inset-0 z-[100] flex items-center justify-center p-4'
          role='dialog'
          aria-modal='true'
        >
          <div
            className='absolute inset-0 bg-[#172033]/55 backdrop-blur-sm'
            onClick={closeModal}
          />

          <div className='relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-white/60 overflow-hidden'>
            <div
              className={`h-1.5 w-full ${
                modal.type === "success" ? "bg-green-500" : "bg-red-500"
              }`}
            />

            <div className='p-6 sm:p-7'>
              <button
                type='button'
                onClick={closeModal}
                className='absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition'
                aria-label='Close'
              >
                <X size={18} />
              </button>

              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 ${
                  modal.type === "success" ? "bg-green-50" : "bg-red-50"
                }`}
              >
                {modal.type === "success" ? (
                  <CheckCircle2 size={34} className='text-green-600' />
                ) : (
                  <AlertCircle size={34} className='text-red-600' />
                )}
              </div>

              <h3 className='text-2xl font-extrabold text-[#172033] pr-8'>
                {modal.title}
              </h3>

              <p className='text-gray-500 mt-3 leading-6'>{modal.message}</p>

              <div className='flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-7'>
                {modal.type === "error" && (
                  <button
                    type='button'
                    onClick={closeModal}
                    className='w-full sm:w-auto px-5 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold transition'
                  >
                    Close
                  </button>
                )}

                <button
                  type='button'
                  onClick={handleModalAction}
                  className={`w-full sm:w-auto px-6 py-3 rounded-xl font-extrabold transition ${
                    modal.type === "success"
                      ? "bg-[#fdbd00] hover:bg-[#efb000] text-[#172033]"
                      : "bg-[#172033] hover:bg-[#222d43] text-white"
                  }`}
                >
                  {modal.type === "success" ? "Continue" : "Try Again"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DriverDashboard;
