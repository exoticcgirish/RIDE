import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAcceptedRideGroups } from "../../services/driverApi";

function AcceptedGroups() {
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAcceptedGroups = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAcceptedRideGroups();

      console.log("Accepted groups response:", response.data);

      const data =
        response.data?.data ||
        response.data?.groups ||
        [];

      setGroups(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(
        "Accepted groups error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load accepted groups."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcceptedGroups();
  }, []);

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getRiderName = (member) => {
    const rider = member?.rider;

    if (!rider) return "Rider";

    return (
      rider.full_name ||
      rider.name ||
      rider.email ||
      "Rider"
    );
  };

  const getDriverName = (driver) => {
    if (!driver) return "Driver";

    return (
      driver.full_name ||
      driver.name ||
      driver.email ||
      "Driver"
    );
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#172033]">

      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-20 flex items-center justify-between">

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

            <div className="flex items-center gap-3">

              <button
                onClick={fetchAcceptedGroups}
                disabled={loading}
                className="w-10 h-10 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-xl disabled:opacity-50"
              >
                ↻
              </button>

              <button
                onClick={() =>
                  navigate("/driver/profile")
                }
                className="w-10 h-10 rounded-full bg-[#172033] text-white flex items-center justify-center font-bold"
              >
                D
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
              My Accepted Groups
            </h2>

            <p className="text-gray-500 mt-2">
              Manage the ride groups you have accepted.
            </p>
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="bg-[#172033] text-white px-5 py-3 rounded-xl font-bold"
          >
            Available Groups
          </button>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">

          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-gray-400">
              Accepted Groups
            </p>

            <h3 className="text-3xl font-extrabold mt-2">
              {groups.length}
            </h3>

            <p className="text-xs text-gray-400 mt-3">
              Groups assigned to you
            </p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-gray-400">
              Total Riders
            </p>

            <h3 className="text-3xl font-extrabold mt-2">
              {groups.reduce(
                (total, group) =>
                  total +
                  (group.members?.length || 0),
                0
              )}
            </h3>

            <p className="text-xs text-gray-400 mt-3">
              Across accepted groups
            </p>
          </div>

          <div className="bg-[#172033] rounded-2xl p-5 shadow-sm text-white">
            <p className="text-sm text-gray-300">
              Total Seats
            </p>

            <h3 className="text-3xl font-extrabold mt-2">
              {groups.reduce(
                (total, group) =>
                  total +
                  Number(group.totalSeats || 0),
                0
              )}
            </h3>

            <p className="text-xs text-gray-300 mt-3">
              Across accepted groups
            </p>
          </div>

        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-100 rounded-xl p-4">
            <p className="text-red-600 font-semibold">
              {error}
            </p>

            <button
              onClick={fetchAcceptedGroups}
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
              Loading accepted ride groups...
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          groups.length === 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">

              <div className="w-20 h-20 mx-auto bg-[#fff5d6] rounded-2xl flex items-center justify-center text-3xl">
                🚗
              </div>

              <h3 className="text-xl font-extrabold mt-5">
                No Accepted Groups
              </h3>

              <p className="text-gray-400 mt-2">
                You have not accepted any ride groups yet.
              </p>

              <button
                onClick={() => navigate("/dashboard")}
                className="mt-6 bg-[#fdbd00] hover:bg-[#efb000] text-[#172033] px-6 py-3 rounded-xl font-bold"
              >
                Find Ride Groups
              </button>

            </div>
          )}

        {!loading &&
          !error &&
          groups.length > 0 && (
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
                          Accepted Ride Group
                        </p>

                        <h3 className="text-lg font-extrabold">
                          Group #
                          {group._id?.slice(-6)}
                        </h3>

                      </div>

                    </div>

                    <span className="w-fit px-4 py-1.5 rounded-full bg-green-50 text-green-600 text-xs font-bold capitalize">
                      {group.status || "accepted"}
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
                            {group.pickupLocation || "N/A"}
                          </p>
                        </div>

                        <div className="mt-7">
                          <p className="text-xs text-gray-400">
                            DESTINATION
                          </p>

                          <p className="font-bold mt-1">
                            {group.destination || "N/A"}
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
                          {formatDate(
                            group.departureDate
                          )}
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
                          RIDERS
                        </p>

                        <p className="font-bold mt-2">
                          {group.members?.length || 0}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-400">
                          SEATS
                        </p>

                        <p className="font-bold mt-2">
                          {group.totalSeats || 0}
                        </p>
                      </div>

                    </div>

                    <div className="mt-7 border-t border-gray-100 pt-6">

                      <div className="flex items-center justify-between mb-4">

                        <div>
                          <h3 className="font-extrabold">
                            Group Members
                          </h3>

                          <p className="text-sm text-gray-400">
                            Riders in this accepted group
                          </p>
                        </div>

                        <span className="font-bold">
                          {group.members?.length || 0}
                        </span>

                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                        {group.members?.map(
                          (member, index) => (

                            <div
                              key={
                                member._id ||
                                index
                              }
                              className="bg-gray-50 rounded-xl p-4 flex items-center gap-3"
                            >

                              <div className="w-10 h-10 rounded-full bg-[#172033] text-white flex items-center justify-center font-bold">
                                {getRiderName(
                                  member
                                )
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div>

                                <p className="font-bold">
                                  {getRiderName(
                                    member
                                  )}
                                </p>

                                {member.rider?.phone && (
                                  <p className="text-sm text-gray-500">
                                    {member.rider.phone}
                                  </p>
                                )}

                              </div>

                            </div>

                          )
                        )}

                      </div>

                    </div>

                    {group.assignedDriver && (
                      <div className="mt-7 border-t border-gray-100 pt-6">

                        <p className="text-xs text-gray-400 uppercase tracking-wide">
                          Driver
                        </p>

                        <p className="font-bold mt-2">
                          {getDriverName(
                            group.assignedDriver
                          )}
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">

                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-xs text-gray-400">
                              PHONE
                            </p>

                            <p className="font-bold mt-1">
                              {group.assignedDriver.phone ||
                                "N/A"}
                            </p>
                          </div>

                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-xs text-gray-400">
                              VEHICLE
                            </p>

                            <p className="font-bold mt-1">
                              {group.assignedDriver.vehicleType ||
                                "N/A"}
                            </p>
                          </div>

                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-xs text-gray-400">
                              NUMBER
                            </p>

                            <p className="font-bold mt-1">
                              {group.assignedDriver.vehicleNumber ||
                                "N/A"}
                            </p>
                          </div>

                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-xs text-gray-400">
                              MODEL
                            </p>

                            <p className="font-bold mt-1">
                              {group.assignedDriver.vehicleModel ||
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
    </div>
  );
}

export default AcceptedGroups;