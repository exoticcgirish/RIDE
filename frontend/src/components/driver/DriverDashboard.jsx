import { useEffect, useState } from "react";

import {
  getAvailableRideGroups,
  acceptRideGroup,
} from "../../services/driverApi";

function DriverDashboard() {
  const [groups, setGroups] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [acceptingId, setAcceptingId] = useState(null);

  // ==========================================
  // FETCH AVAILABLE GROUPS
  // ==========================================

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAvailableRideGroups();

      console.log(
        "Available ride groups:",
        response.data
      );

      setGroups(response.data.data || []);
    } catch (error) {
      console.error(
        "Fetch ride groups error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load ride groups."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD GROUPS WHEN PAGE OPENS
  // ==========================================

  useEffect(() => {
    fetchGroups();
  }, []);

  // ==========================================
  // ACCEPT GROUP
  // ==========================================

  const handleAcceptGroup = async (groupId) => {
    try {
      setAcceptingId(groupId);

      const response =
        await acceptRideGroup(groupId);

      console.log(
        "Accepted group:",
        response.data
      );

      // Remove accepted group
      setGroups((previousGroups) =>
        previousGroups.filter(
          (group) => group._id !== groupId
        )
      );

      alert(
        "Ride group accepted successfully."
      );
    } catch (error) {
      console.error(
        "Accept group error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to accept ride group."
      );
    } finally {
      setAcceptingId(null);
    }
  };

  // ==========================================
  // SUMMARY
  // ==========================================

  const totalRiders = groups.reduce(
    (total, group) =>
      total + (group.members?.length || 0),
    0
  );

  const totalSeats = groups.reduce(
    (total, group) =>
      total + Number(group.totalSeats || 0),
    0
  );

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#172033]">

      {/* ========================================
          HEADER
      ======================================== */}

      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="h-20 flex items-center justify-between">

            {/* LOGO */}

            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">

                <span className="text-[#172033]">
                  Ride
                </span>

                <span className="text-[#fdbd00]">
                  Link
                </span>

              </h1>

              <p className="text-xs text-gray-400">
                Driver Dashboard
              </p>
            </div>

            {/* RIGHT */}

            <div className="flex items-center gap-3">

              {/* ONLINE */}

              <div className="hidden sm:flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-full text-sm font-semibold">

                <span className="w-2 h-2 rounded-full bg-green-500"></span>

                Online

              </div>

              {/* REFRESH */}

              <button
                onClick={fetchGroups}
                disabled={loading}
                className="w-10 h-10 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition flex items-center justify-center text-xl disabled:opacity-50"
                title="Refresh"
              >
                ↻
              </button>

              {/* DRIVER */}

              <div className="w-10 h-10 rounded-full bg-[#172033] text-white flex items-center justify-center font-bold">
                D
              </div>

            </div>

          </div>

        </div>

      </header>


      {/* ========================================
          MAIN
      ======================================== */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* PAGE TITLE */}

        <div className="mb-8">

          <p className="text-sm text-gray-400">
            Driver Dashboard
          </p>

          <h2 className="text-2xl sm:text-3xl font-extrabold mt-1">
            Available Ride Groups
          </h2>

          <p className="text-gray-500 mt-2">
            View grouped ride requests and accept
            an available group.
          </p>

        </div>


        {/* ========================================
            SUMMARY CARDS
        ======================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">

          {/* AVAILABLE GROUPS */}

          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-gray-400">
                  Available Groups
                </p>

                <h3 className="text-3xl font-extrabold mt-2">
                  {groups.length}
                </h3>

              </div>

              <div className="w-12 h-12 rounded-xl bg-[#fff5d6] flex items-center justify-center text-xl">
                👥
              </div>

            </div>

            <p className="text-xs text-gray-400 mt-3">
              Groups waiting for drivers
            </p>

          </div>


          {/* RIDERS */}

          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-gray-400">
                  Total Riders
                </p>

                <h3 className="text-3xl font-extrabold mt-2">
                  {totalRiders}
                </h3>

              </div>

              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-xl">
                🧑
              </div>

            </div>

            <p className="text-xs text-gray-400 mt-3">
              Across available groups
            </p>

          </div>


          {/* SEATS */}

          <div className="bg-[#172033] rounded-2xl p-5 shadow-sm text-white">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-gray-300">
                  Available Seats
                </p>

                <h3 className="text-3xl font-extrabold mt-2">
                  {totalSeats}
                </h3>

              </div>

              <div className="w-12 h-12 rounded-xl bg-[#fdbd00] text-[#172033] flex items-center justify-center text-xl">
                🚗
              </div>

            </div>

            <p className="text-xs text-gray-300 mt-3">
              Across available groups
            </p>

          </div>

        </div>


        {/* ========================================
            ERROR
        ======================================== */}

        {error && (

          <div className="mb-6 bg-red-50 border border-red-100 rounded-xl p-4">

            <p className="text-red-600 font-semibold">
              {error}
            </p>

            <button
              onClick={fetchGroups}
              className="text-red-600 text-sm underline mt-2"
            >
              Try again
            </button>

          </div>

        )}


        {/* ========================================
            LOADING
        ======================================== */}

        {loading && (

          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">

            <div className="w-10 h-10 mx-auto border-4 border-gray-200 border-t-[#fdbd00] rounded-full animate-spin"></div>

            <p className="text-gray-400 mt-4">
              Loading available ride groups...
            </p>

          </div>

        )}


        {/* ========================================
            EMPTY
        ======================================== */}

        {!loading &&
          !error &&
          groups.length === 0 && (

            <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">

              <div className="w-20 h-20 mx-auto bg-[#fff5d6] rounded-2xl flex items-center justify-center text-3xl">
                🚗
              </div>

              <h3 className="text-xl font-extrabold mt-5">
                No ride groups available
              </h3>

              <p className="text-gray-400 mt-2">
                New groups will appear here when
                they are ready for a driver.
              </p>

              <button
                onClick={fetchGroups}
                className="mt-6 bg-[#fdbd00] hover:bg-[#efb000] text-[#172033] px-6 py-3 rounded-xl font-bold transition"
              >
                Refresh Groups
              </button>

            </div>

          )}


        {/* ========================================
            GROUP LIST
        ======================================== */}

        {!loading &&
          groups.length > 0 && (

            <div className="space-y-6">

              {groups.map((group) => (

                <div
                  key={group._id}
                  className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
                >

                  {/* ==================================
                      GROUP HEADER
                  =================================== */}

                  <div className="px-5 sm:px-7 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                    <div className="flex items-center gap-4">

                      <div className="w-12 h-12 rounded-xl bg-[#fff5d6] flex items-center justify-center text-xl">
                        👥
                      </div>

                      <div>

                        <p className="text-xs text-gray-400 uppercase tracking-wide">
                          Ride Group
                        </p>

                        <h3 className="text-lg font-extrabold">
                          Group #
                          {group._id?.slice(-6)}
                        </h3>

                      </div>

                    </div>

                    <span className="w-fit px-4 py-1.5 rounded-full bg-green-50 text-green-600 text-xs font-bold capitalize">
                      {group.status || "ready"}
                    </span>

                  </div>


                  {/* ==================================
                      GROUP CONTENT
                  =================================== */}

                  <div className="p-5 sm:p-7">

                    {/* ==================================
                        ROUTE
                    =================================== */}

                    <div>

                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wide mb-4">
                        Route
                      </p>

                      <div className="flex gap-4">

                        {/* ROUTE LINE */}

                        <div className="flex flex-col items-center pt-1">

                          <div className="w-3 h-3 rounded-full bg-green-500"></div>

                          <div className="w-px h-14 bg-gray-200"></div>

                          <div className="w-3 h-3 rounded-full bg-red-500"></div>

                        </div>


                        {/* LOCATIONS */}

                        <div className="flex-1">

                          <div>

                            <p className="text-xs text-gray-400">
                              PICKUP
                            </p>

                            <p className="font-bold mt-1">
                              {group.pickupLocation ||
                                "Pickup location unavailable"}
                            </p>

                          </div>


                          <div className="mt-7">

                            <p className="text-xs text-gray-400">
                              DESTINATION
                            </p>

                            <p className="font-bold mt-1">
                              {group.destination ||
                                "Destination unavailable"}
                            </p>

                          </div>

                        </div>

                      </div>

                    </div>


                    {/* ==================================
                        GROUP DETAILS
                    =================================== */}

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-7">

                      {/* DATE */}

                      <div className="bg-gray-50 rounded-xl p-4">

                        <p className="text-xs text-gray-400">
                          DEPARTURE DATE
                        </p>

                        <p className="font-bold mt-2">
                          {formatDate(
                            group.departureDate
                          )}
                        </p>

                      </div>


                      {/* TIME */}

                      <div className="bg-gray-50 rounded-xl p-4">

                        <p className="text-xs text-gray-400">
                          DEPARTURE TIME
                        </p>

                        <p className="font-bold mt-2">
                          {group.departureTime ||
                            "N/A"}
                        </p>

                      </div>


                      {/* MEMBERS */}

                      <div className="bg-gray-50 rounded-xl p-4">

                        <p className="text-xs text-gray-400">
                          MEMBERS
                        </p>

                        <p className="font-bold mt-2">
                          {group.members?.length || 0}
                        </p>

                      </div>


                      {/* SEATS */}

                      <div className="bg-gray-50 rounded-xl p-4">

                        <p className="text-xs text-gray-400">
                          TOTAL SEATS
                        </p>

                        <p className="font-bold mt-2">
                          {group.totalSeats || 0}
                        </p>

                      </div>

                    </div>


                    {/* ==================================
                        MEMBERS
                    =================================== */}

                    <div className="mt-7 pt-6 border-t border-gray-100">

                      <div className="flex items-center justify-between mb-4">

                        <div>

                          <h4 className="font-extrabold">
                            Group Members
                          </h4>

                          <p className="text-xs text-gray-400 mt-1">
                            Riders included in this
                            group
                          </p>

                        </div>

                        <span className="text-sm font-bold">
                          {group.members?.length || 0}
                        </span>

                      </div>


                      {group.members?.length > 0 ? (

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                          {group.members.map(
                            (member, index) => {

                              const name =
                                member.name ||
                                member.full_name ||
                                `Rider ${index + 1}`;

                              return (

                                <div
                                  key={
                                    member._id ||
                                    index
                                  }
                                  className="bg-gray-50 rounded-xl p-4"
                                >

                                  <div className="flex items-center gap-3">

                                    {/* AVATAR */}

                                    <div className="w-10 h-10 flex-shrink-0 rounded-full bg-[#172033] text-white flex items-center justify-center font-bold">
                                      {name
                                        .charAt(0)
                                        .toUpperCase()}
                                    </div>


                                    {/* MEMBER INFO */}

                                    <div className="min-w-0">

                                      <p className="font-bold text-sm truncate">
                                        {name}
                                      </p>

                                      {member.email && (

                                        <p className="text-xs text-gray-400 mt-1 truncate">
                                          {member.email}
                                        </p>

                                      )}

                                      {member.phone && (

                                        <p className="text-xs text-gray-400">
                                          {member.phone}
                                        </p>

                                      )}

                                      {member.college && (

                                        <p className="text-xs text-gray-400 truncate">
                                          {member.college}
                                        </p>

                                      )}

                                    </div>

                                  </div>

                                </div>

                              );
                            }
                          )}

                        </div>

                      ) : (

                        <p className="text-sm text-gray-400">
                          No member information available.
                        </p>

                      )}

                    </div>


                    {/* ==================================
                        NOTES
                    =================================== */}

                    {group.notes && (

                      <div className="mt-6 bg-[#fff9e8] border border-[#fbe8a8] rounded-xl p-4">

                        <p className="text-xs font-bold text-gray-500 uppercase">
                          Notes
                        </p>

                        <p className="text-sm text-gray-700 mt-2">
                          {group.notes}
                        </p>

                      </div>

                    )}


                    {/* ==================================
                        ACCEPT GROUP
                    =================================== */}

                    <div className="mt-7 pt-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                      <div>

                        <p className="text-xs text-gray-400 uppercase">
                          Group Status
                        </p>

                        <p className="font-bold text-sm mt-1 capitalize">
                          {group.status || "ready"}
                        </p>

                      </div>


                      <button
                        disabled={
                          acceptingId === group._id
                        }
                        onClick={() =>
                          handleAcceptGroup(
                            group._id
                          )
                        }
                        className="w-full sm:w-auto bg-[#fdbd00] hover:bg-[#efb000] disabled:bg-gray-200 disabled:text-gray-400 text-[#172033] px-8 py-3 rounded-xl font-extrabold transition shadow-sm"
                      >

                        {acceptingId ===
                        group._id
                          ? "Accepting..."
                          : "Accept Group →"}

                      </button>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

      </main>

    </div>
  );
}

export default DriverDashboard;