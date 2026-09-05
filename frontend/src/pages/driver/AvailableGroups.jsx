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
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  getAvailableRideGroups,
  acceptRideGroup,
} from "../../services/driverApi";

function AvailableGroups() {
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [acceptingId, setAcceptingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 1,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const getStoredDriver = () => {
    try {
      const keys = ["user", "currentUser", "driver", "authUser"];

      for (const key of keys) {
        const value = localStorage.getItem(key);

        if (!value) continue;

        const parsed = JSON.parse(value);

        if (parsed) {
          return parsed;
        }
      }
    } catch (storageError) {
      console.warn("Unable to read stored driver:", storageError);
    }

    return null;
  };

  const driver = useMemo(() => getStoredDriver(), []);

  const getDriverName = () => {
    return (
      driver?.firstName ||
      driver?.first_name ||
      driver?.givenName ||
      driver?.full_name ||
      driver?.fullName ||
      driver?.name ||
      driver?.username ||
      driver?.email ||
      "Driver"
    );
  };

  const driverInitial = getDriverName().trim().charAt(0).toUpperCase() || "D";

  const normalizeStatus = (status) => {
    const value = String(status || "")
      .trim()
      .toLowerCase();

    if (value === "ready" || value === "available" || value === "open") {
      return "available";
    }

    if (value === "accepted" || value === "assigned") {
      return "accepted";
    }

    if (
      value === "in_progress" ||
      value === "in-progress" ||
      value === "started"
    ) {
      return "in_progress";
    }

    if (value === "completed") {
      return "completed";
    }

    if (value === "cancelled") {
      return "cancelled";
    }

    return value || "available";
  };

  const getStatusLabel = (status) => {
    const normalized = normalizeStatus(status);

    if (normalized === "available") {
      return "Available";
    }

    if (normalized === "accepted") {
      return "Accepted";
    }

    if (normalized === "in_progress") {
      return "Ride In Progress";
    }

    if (normalized === "completed") {
      return "Completed";
    }

    if (normalized === "cancelled") {
      return "Cancelled";
    }

    return "Available";
  };

  const fetchGroups = async (requestedPage = page, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await getAvailableRideGroups(requestedPage, limit);

      console.log("Available groups response:", response.data);

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

      const availableGroups = data.filter((group) => {
        if (!group) {
          return false;
        }

        return normalizeStatus(group.status) === "available";
      });

      setGroups(availableGroups);

      if (responseData?.pagination) {
        setPagination(responseData.pagination);

        setPage(responseData.pagination.page || requestedPage);
      } else {
        setPagination({
          page: requestedPage,
          limit,
          total: availableGroups.length,
          totalPages: availableGroups.length > 0 ? 1 : 0,
          hasNextPage: false,
          hasPreviousPage: requestedPage > 1,
        });

        setPage(requestedPage);
      }
    } catch (error) {
      console.error("Available groups error:", error);

      setGroups([]);

      setError(
        error.response?.data?.message ||
          "Failed to load available ride groups.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGroups(1, false);
  }, []);

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || loading || refreshing) {
      return;
    }

    if (pagination.totalPages > 0 && nextPage > pagination.totalPages) {
      return;
    }

    fetchGroups(nextPage, false);
  };

  const handleAccept = async (groupId) => {
    if (!groupId || acceptingId !== null) {
      return;
    }

    try {
      setAcceptingId(groupId);
      setError("");
      setSuccess("");

      const response = await acceptRideGroup(groupId);

      console.log("Accepted group response:", response.data);

      setGroups((previous) =>
        previous.filter((group) => group._id !== groupId),
      );

      setSuccess("Ride group accepted successfully.");

      setTimeout(() => {
        navigate("/driver/accepted-groups");
      }, 700);
    } catch (error) {
      console.error("Accept ride group error:", error);

      setError(
        error.response?.data?.message || "Unable to accept this ride group.",
      );
    } finally {
      setAcceptingId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "N/A";
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className='min-h-screen bg-[#f6f7f9] text-[#172033]'>
      <header className='sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-100'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='h-20 flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-black tracking-tight leading-none'>
                <span className='text-[#172033]'>Ride</span>
                <span className='text-[#fdbd00]'>Link</span>
              </h1>

              <p className='text-xs text-gray-400 mt-1'>Driver Dashboard</p>
            </div>

            <div className='flex items-center gap-3'>
              <div className='hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-100'>
                <span className='w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse' />

                <span className='text-sm font-bold text-green-700'>Online</span>
              </div>

              <button
                type='button'
                onClick={() => fetchGroups(page, true)}
                disabled={loading || refreshing}
                title='Refresh ride groups'
                className='w-11 h-11 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 active:scale-95 flex items-center justify-center transition-all disabled:opacity-50'
              >
                <RefreshCw
                  size={20}
                  className={refreshing ? "animate-spin" : ""}
                />
              </button>

              <button
                type='button'
                onClick={() => navigate("/driver/profile")}
                title={getDriverName()}
                className='w-11 h-11 rounded-full bg-[#172033] text-white flex items-center justify-center font-bold text-lg hover:bg-[#25314a] active:scale-95 transition-all shadow-sm'
              >
                {driverInitial}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8'>
          <div>
            <div className='inline-flex items-center gap-2 bg-[#fff5d6] text-[#9a7000] px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide'>
              <Car size={14} />
              Driver Dashboard
            </div>

            <h2 className='text-3xl sm:text-4xl font-black mt-3 tracking-tight'>
              Available Ride Groups
            </h2>

            <p className='text-gray-500 mt-2 max-w-2xl'>
              Find a compatible ride group, review the trip details, and accept
              the ride.
            </p>
          </div>

          <button
            type='button'
            onClick={() => navigate("/driver/accepted-groups")}
            className='group w-full sm:w-fit inline-flex items-center justify-center gap-2 bg-[#172033] hover:bg-[#25314a] text-white px-5 py-3 rounded-xl font-bold transition-all shadow-sm hover:shadow-md'
          >
            My Accepted Groups
            <ArrowRight
              size={18}
              className='group-hover:translate-x-1 transition-transform'
            />
          </button>
        </div>

        {success && (
          <div className='mb-6 bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm'>
            <div className='w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center shrink-0'>
              <CheckCircle2 size={20} className='text-green-600' />
            </div>

            <div>
              <p className='font-bold text-green-800'>Success</p>

              <p className='text-sm text-green-700'>{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className='mb-6 bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3 shadow-sm'>
            <div className='w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0'>
              <AlertCircle size={20} className='text-red-500' />
            </div>

            <div className='flex-1'>
              <p className='font-bold text-red-800'>
                Unable to load ride groups
              </p>

              <p className='text-sm text-red-600 mt-1'>{error}</p>
            </div>

            <button
              type='button'
              onClick={() => setError("")}
              className='text-red-400 hover:text-red-600'
            >
              ×
            </button>
          </div>
        )}

        {loading && (
          <div className='space-y-5'>
            {[1, 2].map((item) => (
              <div
                key={item}
                className='bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 animate-pulse shadow-sm'
              >
                <div className='flex justify-between'>
                  <div className='h-12 bg-gray-200 rounded-xl w-48' />

                  <div className='h-8 bg-gray-200 rounded-full w-24' />
                </div>

                <div className='h-5 bg-gray-200 rounded w-2/3 mt-8' />

                <div className='h-5 bg-gray-200 rounded w-1/2 mt-4' />

                <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 mt-8'>
                  {[1, 2, 3, 4].map((box) => (
                    <div key={box} className='h-24 bg-gray-100 rounded-2xl' />
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

            <h3 className='text-2xl font-black mt-6'>No Available Groups</h3>

            <p className='text-gray-400 mt-2 max-w-md mx-auto'>
              There are currently no ride groups waiting for a driver.
            </p>

            <button
              type='button'
              onClick={() => fetchGroups(page, true)}
              disabled={refreshing}
              className='mt-7 inline-flex items-center gap-2 bg-[#fdbd00] hover:bg-[#efb000] disabled:bg-gray-200 disabled:text-gray-400 text-[#172033] px-6 py-3 rounded-xl font-bold transition-all'
            >
              <RefreshCw
                size={18}
                className={refreshing ? "animate-spin" : ""}
              />
              Check Again
            </button>
          </div>
        )}

        {!loading && !error && groups.length > 0 && (
          <div className='space-y-6'>
            {groups.map((group) => {
              const status = normalizeStatus(group.status);

              const isAvailable = status === "available";

              return (
                <div
                  key={group._id}
                  className='bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-xl transition-all overflow-hidden'
                >
                  <div className='px-5 sm:px-7 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                    <div className='flex items-center gap-4 min-w-0'>
                      <div className='w-12 h-12 rounded-xl bg-[#fff5d6] flex items-center justify-center shrink-0'>
                        <Users size={23} className='text-[#b98200]' />
                      </div>

                      <div className='min-w-0'>
                        <p className='text-xs text-gray-400 uppercase tracking-wide font-bold'>
                          Ride Group
                        </p>

                        <h3 className='text-lg font-black'>
                          Group #{group._id?.slice(-6) || "------"}
                        </h3>
                      </div>
                    </div>

                    <span className='w-fit inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700 border border-green-100 text-xs font-bold'>
                      <span className='w-2 h-2 rounded-full bg-green-500' />

                      {getStatusLabel(group.status)}
                    </span>
                  </div>

                  <div className='p-5 sm:p-7'>
                    <div>
                      <div className='flex items-center gap-2 mb-5'>
                        <MapPin size={17} className='text-[#fdbd00]' />

                        <p className='text-xs text-gray-400 font-black uppercase tracking-wide'>
                          Route
                        </p>
                      </div>

                      <div className='flex gap-4'>
                        <div className='flex flex-col items-center pt-1 shrink-0'>
                          <div className='w-3 h-3 rounded-full bg-green-500 ring-4 ring-green-50' />

                          <div className='w-px h-16 bg-gradient-to-b from-green-200 to-red-200' />

                          <div className='w-3 h-3 rounded-full bg-red-500 ring-4 ring-red-50' />
                        </div>

                        <div className='flex-1 min-w-0'>
                          <div>
                            <p className='text-xs text-gray-400 font-bold'>
                              PICKUP
                            </p>

                            <p
                              title={group.pickupLocation || "N/A"}
                              className='font-bold mt-1 text-base sm:text-lg leading-6 truncate'
                            >
                              {group.pickupLocation || "N/A"}
                            </p>
                          </div>

                          <div className='mt-7'>
                            <p className='text-xs text-gray-400 font-bold'>
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

                    <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 mt-8'>
                      <div className='bg-gray-50 hover:bg-gray-100 rounded-2xl p-4 transition'>
                        <div className='flex items-center gap-2'>
                          <CalendarDays size={17} className='text-[#d49b00]' />

                          <p className='text-xs text-gray-400 font-bold'>
                            DATE
                          </p>
                        </div>

                        <p className='font-black mt-3'>
                          {formatDate(group.departureDate)}
                        </p>
                      </div>

                      <div className='bg-gray-50 hover:bg-gray-100 rounded-2xl p-4 transition'>
                        <div className='flex items-center gap-2'>
                          <Clock3 size={17} className='text-[#d49b00]' />

                          <p className='text-xs text-gray-400 font-bold'>
                            TIME
                          </p>
                        </div>

                        <p className='font-black mt-3'>
                          {group.departureTime || "N/A"}
                        </p>
                      </div>

                      <div className='bg-gray-50 hover:bg-gray-100 rounded-2xl p-4 transition'>
                        <div className='flex items-center gap-2'>
                          <Users size={17} className='text-[#d49b00]' />

                          <p className='text-xs text-gray-400 font-bold'>
                            MEMBERS
                          </p>
                        </div>

                        <p className='font-black mt-3'>
                          {Array.isArray(group.members)
                            ? group.members.length
                            : 0}
                        </p>
                      </div>

                      <div className='bg-gray-50 hover:bg-gray-100 rounded-2xl p-4 transition'>
                        <div className='flex items-center gap-2'>
                          <Car size={17} className='text-[#d49b00]' />

                          <p className='text-xs text-gray-400 font-bold'>
                            SEATS
                          </p>
                        </div>

                        <p className='font-black mt-3'>
                          {group.totalSeats || 0} / {group.maxSeats || 4}
                        </p>
                      </div>
                    </div>

                    <div className='mt-7 pt-6 border-t border-gray-100'>
                      <div className='rounded-2xl bg-[#fffaf0] border border-[#f8e5a8] p-5 flex flex-col sm:flex-row sm:items-center gap-4'>
                        <div className='w-11 h-11 rounded-xl bg-[#fff0bd] flex items-center justify-center shrink-0'>
                          <Sparkles size={21} className='text-[#b98200]' />
                        </div>

                        <div className='flex-1'>
                          <p className='font-black'>Ride group is available</p>

                          <p className='text-sm text-gray-500 mt-1'>
                            Accept this group to add it to your accepted rides.
                          </p>
                        </div>

                        <button
                          type='button'
                          disabled={!isAvailable || acceptingId !== null}
                          onClick={() => handleAccept(group._id)}
                          className='w-full sm:w-auto min-w-44 bg-[#fdbd00] hover:bg-[#efb000] disabled:bg-gray-200 disabled:text-gray-400 text-[#172033] px-6 py-3 rounded-xl font-black transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md'
                        >
                          {acceptingId === group._id ? (
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
                </div>
              );
            })}

            <div className='bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm'>
              <div className='text-sm text-gray-500 font-medium'>
                Page{" "}
                <span className='font-black text-[#172033]'>
                  {pagination.page}
                </span>{" "}
                of{" "}
                <span className='font-black text-[#172033]'>
                  {pagination.totalPages}
                </span>
                <span className='hidden sm:inline'>
                  {" "}
                  · {pagination.total} available groups
                </span>
              </div>

              <div className='flex items-center gap-2'>
                <button
                  type='button'
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={
                    !pagination.hasPreviousPage || loading || refreshing
                  }
                  className='inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-sm transition'
                >
                  <ChevronLeft size={17} />
                  Previous
                </button>

                <button
                  type='button'
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNextPage || loading || refreshing}
                  className='inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#172033] hover:bg-[#25314a] text-white disabled:opacity-40 disabled:cursor-not-allowed font-bold text-sm transition'
                >
                  Next
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AvailableGroups;
