import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getAvailableRideGroups,
  acceptRideGroup,
} from "../../services/driverApi";

function DriverDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acceptingId, setAcceptingId] = useState(null);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAvailableRideGroups();

      setGroups(response.data?.data || []);
    } catch (error) {
      console.error("Fetch groups error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load available ride groups."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleAcceptGroup = async (groupId) => {
    try {
      setAcceptingId(groupId);

      const response = await acceptRideGroup(groupId);

      console.log("Accepted group:", response.data);

      alert("Ride group accepted successfully.");

      navigate(`/driver/groups/${groupId}`);
    } catch (error) {
      console.error("Accept group error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to accept ride group."
      );
    } finally {
      setAcceptingId(null);
    }
  };

  const totalRiders = groups.reduce(
    (total, group) => total + (group.members?.length || 0),
    0
  );

  const totalSeats = groups.reduce(
    (total, group) => total + Number(group.totalSeats || 0),
    0
  );

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#172033]">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-20 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                <span className="text-[#172033]">Ride</span>
                <span className="text-[#fdbd00]">Link</span>
              </h1>

              <p className="text-xs text-gray-400">
                Driver Dashboard
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-full text-sm font-semibold">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Online
              </div>

              <button
                onClick={fetchGroups}
                disabled={loading}
                className="w-10 h-10 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-xl disabled:opacity-50"
              >
                ↻
              </button>

              <button
                onClick={() => navigate("/driver/profile")}
                className="w-10 h-10 rounded-full bg-[#172033] text-white flex items-center justify-center font-bold"
              >
                D
              </button>

              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-bold"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <p className="text-sm text-gray-400">
              Driver Dashboard
            </p>

            <h2 className="text-2xl sm:text-3xl font-extrabold mt-1">
              Available Ride Groups
            </h2>

            <p className="text-gray-500 mt-2">
              Accept a complete group and drive all riders together.
            </p>
          </div>

          <button
            onClick={() => navigate("/driver/accepted-groups")}
            className="bg-[#172033] text-white px-5 py-3 rounded-xl font-bold"
          >
            My Accepted Groups
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-gray-400">
              Available Groups
            </p>

            <h3 className="text-3xl font-extrabold mt-2">
              {groups.length}
            </h3>

            <p className="text-xs text-gray-400 mt-3">
              Groups waiting for drivers
            </p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-gray-400">
              Total Riders
            </p>

            <h3 className="text-3xl font-extrabold mt-2">
              {totalRiders}
            </h3>

            <p className="text-xs text-gray-400 mt-3">
              Across available groups
            </p>
          </div>

          <div className="bg-[#172033] rounded-2xl p-5 shadow-sm text-white">
            <p className="text-sm text-gray-300">
              Total Seats
            </p>

            <h3 className="text-3xl font-extrabold mt-2">
              {totalSeats}
            </h3>

            <p className="text-xs text-gray-300 mt-3">
              Across available groups
            </p>
          </div>
        </div>

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

        {loading && (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
            <div className="w-10 h-10 mx-auto border-4 border-gray-200 border-t-[#fdbd00] rounded-full animate-spin" />

            <p className="text-gray-400 mt-4">
              Loading available ride groups...
            </p>
          </div>
        )}

        {!loading && !error && groups.length === 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
            <div className="w-20 h-20 mx-auto bg-[#fff5d6] rounded-2xl flex items-center justify-center text-3xl">
              🚗
            </div>

            <h3 className="text-xl font-extrabold mt-5">
              No ride groups available
            </h3>

            <p className="text-gray-400 mt-2">
              New groups will appear here when they are ready.
            </p>

            <button
              onClick={fetchGroups}
              className="mt-6 bg-[#fdbd00] hover:bg-[#efb000] text-[#172033] px-6 py-3 rounded-xl font-bold"
            >
              Refresh Groups
            </button>
          </div>
        )}

        {!loading && groups.length > 0 && (
          <div className="space-y-6">
            {groups.map((group) => (
              <div
                key={group._id}
                className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
              >
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
                        Group #{group._id?.slice(-6)}
                      </h3>
                    </div>
                  </div>

                  <span className="w-fit px-4 py-1.5 rounded-full bg-green-50 text-green-600 text-xs font-bold capitalize">
                    {group.status || "ready"}
                  </span>
                </div>

                <div className="p-5 sm:p-7">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wide mb-4">
                    Route
                  </p>

                  <div className="flex gap-4">
                    <div className="flex flex-col items-center pt-1">
                      <div className="w-3 h-3 rounded-full bg-green-500" />

                      <div className="w-px h-14 bg-gray-200" />

                      <div className="w-3 h-3 rounded-full bg-red-500" />
                    </div>

                    <div className="flex-1">
                      <div>
                        <p className="text-xs text-gray-400">
                          PICKUP
                        </p>

                        <p className="font-bold mt-1">
                          {group.pickupLocation}
                        </p>
                      </div>

                      <div className="mt-7">
                        <p className="text-xs text-gray-400">
                          DESTINATION
                        </p>

                        <p className="font-bold mt-1">
                          {group.destination}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-7">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-400">
                        DEPARTURE DATE
                      </p>

                      <p className="font-bold mt-2">
                        {formatDate(group.departureDate)}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-400">
                        DEPARTURE TIME
                      </p>

                      <p className="font-bold mt-2">
                        {group.departureTime || "N/A"}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-400">
                        MEMBERS
                      </p>

                      <p className="font-bold mt-2">
                        {group.members?.length || 0}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-400">
                        TOTAL SEATS
                      </p>

                      <p className="font-bold mt-2">
                        {group.totalSeats || 0}
                      </p>
                    </div>
                  </div>

                  <div className="mt-7 pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-extrabold">
                          Group Members
                        </h4>

                        <p className="text-xs text-gray-400 mt-1">
                          Riders included in this group
                        </p>
                      </div>

                      <span className="text-sm font-bold">
                        {group.members?.length || 0}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {group.members?.map((member, index) => {
                        const name =
                          member.name ||
                          member.full_name ||
                          `Rider ${index + 1}`;

                        return (
                          <div
                            key={member._id || index}
                            className="bg-gray-50 rounded-xl p-4"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#172033] text-white flex items-center justify-center font-bold">
                                {name.charAt(0).toUpperCase()}
                              </div>

                              <div className="min-w-0">
                                <p className="font-bold text-sm">
                                  {name}
                                </p>

                                {member.phone && (
                                  <p className="text-xs text-gray-400 mt-1">
                                    {member.phone}
                                  </p>
                                )}

                                {member.email && (
                                  <p className="text-xs text-gray-400">
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
                      disabled={acceptingId === group._id}
                      onClick={() =>
                        handleAcceptGroup(group._id)
                      }
                      className="w-full sm:w-auto bg-[#fdbd00] hover:bg-[#efb000] disabled:bg-gray-200 disabled:text-gray-400 text-[#172033] px-8 py-3 rounded-xl font-extrabold transition"
                    >
                      {acceptingId === group._id
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