import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Car,
  CheckCircle,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import {
  getAvailableGroups,
  acceptGroup,
} from "../../services/rideGroupApi";

function AvailableGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(null);
  const [error, setError] = useState("");

  const loadGroups = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      console.log("🚗 Fetching available groups...");

      const response = await getAvailableGroups();

      console.log("🚗 Available groups response:", response.data);

      const data =
        response.data?.data ||
        response.data?.groups ||
        response.data ||
        [];

      setGroups(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("❌ Available groups error:", error);

      setGroups([]);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to load available ride groups.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const handleAccept = async (groupId) => {
    if (!groupId) {
      alert("Group ID is missing.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to accept this ride group?",
    );

    if (!confirmed) return;

    try {
      setAccepting(groupId);

      console.log("🚗 Accepting group:", groupId);

      const response = await acceptGroup(groupId);

      console.log("✅ Group accepted:", response.data);

      alert("Ride group accepted successfully.");

      await loadGroups();
    } catch (error) {
      console.error("❌ Accept group failed:", error);

      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to accept ride group.",
      );
    } finally {
      setAccepting(null);
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

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div>
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
              Driver Dashboard
            </p>

            <h1 className="text-4xl font-bold text-gray-900 mt-2">
              Available Ride Groups
            </h1>

            <p className="text-gray-500 mt-2">
              Accept a complete group and drive all riders together.
            </p>
          </div>

          <button
            onClick={loadGroups}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-gray-900 text-white px-5 py-3 rounded-xl hover:bg-gray-800 transition disabled:opacity-50"
          >
            <RefreshCw
              size={18}
              className={loading ? "animate-spin" : ""}
            />

            Refresh
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-5 mb-8">

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="text-sm text-gray-400">
              Available Groups
            </p>

            <h2 className="text-4xl font-bold text-gray-900 mt-2">
              {groups.length}
            </h2>

            <p className="text-sm text-gray-400 mt-2">
              Groups waiting for drivers
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="text-sm text-gray-400">
              Total Riders
            </p>

            <h2 className="text-4xl font-bold text-gray-900 mt-2">
              {totalRiders}
            </h2>

            <p className="text-sm text-gray-400 mt-2">
              Across available groups
            </p>
          </div>

          <div className="bg-gray-900 rounded-2xl shadow-sm p-6 text-white">
            <p className="text-sm text-gray-300">
              Total Seats
            </p>

            <h2 className="text-4xl font-bold mt-2">
              {totalSeats}
            </h2>

            <p className="text-sm text-gray-300 mt-2">
              Across available groups
            </p>
          </div>

        </div>

        {loading && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-16 text-center">

            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-yellow-400 animate-spin" />
            </div>

            <h2 className="text-xl font-semibold text-gray-800 mt-6">
              Loading available ride groups...
            </h2>

            <p className="text-gray-400 mt-2">
              Please wait while we fetch available rides.
            </p>

          </div>
        )}

        {!loading && error && (
          <div className="bg-white rounded-3xl border border-red-100 shadow-sm p-10 text-center">

            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle
                  size={28}
                  className="text-red-500"
                />
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mt-5">
              Unable to load ride groups
            </h2>

            <p className="text-red-500 mt-2">
              {error}
            </p>

            <button
              onClick={loadGroups}
              className="mt-6 inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-3 rounded-xl"
            >
              <RefreshCw size={18} />
              Try Again
            </button>

          </div>
        )}

        {!loading &&
          !error &&
          groups.length === 0 && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-16 text-center">

              <div className="text-6xl">
                🚗
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mt-5">
                No Ride Groups Available
              </h2>

              <p className="text-gray-500 mt-2">
                There are currently no ready groups waiting for a driver.
              </p>

              <button
                onClick={loadGroups}
                className="mt-6 inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 px-6 py-3 rounded-xl font-semibold"
              >
                <RefreshCw size={18} />
                Refresh Groups
              </button>

            </div>
          )}

        {!loading &&
          !error &&
          groups.length > 0 && (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

              {groups.map((group) => (
                <motion.div
                  key={group._id}
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        Ride Group
                      </p>

                      <h2 className="text-xl font-bold text-gray-900 mt-1">
                        {group.pickupLocation}
                      </h2>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold capitalize">
                      {group.status}
                    </span>

                  </div>

                  <div className="text-center text-gray-300 text-xl my-2">
                    ↓
                  </div>

                  <h3 className="text-lg font-semibold text-gray-800">
                    {group.destination}
                  </h3>

                  <div className="border-t border-gray-100 my-5" />

                  <div className="space-y-4">

                    <div className="flex items-center gap-3">
                      <Calendar
                        size={18}
                        className="text-indigo-600"
                      />

                      <span className="text-gray-700">
                        {group.departureDate
                          ? new Date(
                              group.departureDate,
                            ).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock
                        size={18}
                        className="text-indigo-600"
                      />

                      <span className="text-gray-700">
                        {group.departureTime || "N/A"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Users
                        size={18}
                        className="text-indigo-600"
                      />

                      <span className="text-gray-700">
                        {group.members?.length || 0} Riders
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Car
                        size={18}
                        className="text-indigo-600"
                      />

                      <span className="text-gray-700">
                        {group.totalSeats || 0} /{" "}
                        {group.maxSeats || 4} Seats
                      </span>
                    </div>

                  </div>

                  {group.members?.length > 0 && (
                    <div className="mt-6">

                      <h3 className="font-semibold text-gray-900 mb-3">
                        Riders
                      </h3>

                      <div className="space-y-2">

                        {group.members.map((member) => (
                          <div
                            key={member._id}
                            className="bg-gray-50 rounded-xl px-4 py-3"
                          >
                            <p className="font-medium text-gray-800">
                              {member.rider?.full_name ||
                                member.rider?.name ||
                                "Rider"}
                            </p>

                            {member.rider?.phone && (
                              <p className="text-sm text-gray-500">
                                {member.rider.phone}
                              </p>
                            )}
                          </div>
                        ))}

                      </div>

                    </div>
                  )}

                  <button
                    onClick={() =>
                      handleAccept(group._id)
                    }
                    disabled={
                      accepting === group._id
                    }
                    className="w-full mt-6 flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white py-3 rounded-xl font-semibold transition"
                  >

                    {accepting === group._id ? (
                      <>
                        <RefreshCw
                          size={18}
                          className="animate-spin"
                        />

                        Accepting...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} />

                        Accept Ride Group
                      </>
                    )}

                  </button>

                </motion.div>
              ))}

            </div>
          )}

      </div>
    </div>
  );
}

export default AvailableGroups;