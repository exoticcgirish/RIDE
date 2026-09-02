import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Phone,
  Car,
  ShieldCheck,
  MapPin,
  CalendarDays,
  Clock3,
} from "lucide-react";

function DriverDetails() {
  const navigate = useNavigate();
  const location = useLocation();

  const request = location.state?.request;

  const group =
    request?.groupId && typeof request.groupId === "object"
      ? request.groupId
      : null;

  const driver =
    request?.assignedDriver &&
    typeof request.assignedDriver === "object"
      ? request.assignedDriver
      : group?.assignedDriver &&
          typeof group.assignedDriver === "object"
        ? group.assignedDriver
        : null;

  if (!request || !driver) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 flex items-center justify-center">
            <User
              size={30}
              className="text-red-500"
            />
          </div>

          <h1 className="text-2xl font-extrabold text-[#172033] mt-5">
            Driver details unavailable
          </h1>

          <p className="text-gray-500 mt-2">
            We could not find the driver information for
            this ride.
          </p>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-6 inline-flex items-center justify-center gap-2 bg-[#172033] hover:bg-[#222d43] text-white px-6 py-3 rounded-xl font-bold transition"
          >
            <ArrowLeft size={18} />
            Back
          </button>
        </div>
      </div>
    );
  }

  const driverName =
    driver.full_name ||
    driver.fullName ||
    driver.name ||
    driver.username ||
    driver.email ||
    "Driver";

  const vehicle =
    driver.vehicleModel ||
    driver.vehicleType ||
    "Vehicle";

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#172033]">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-[76px] flex items-center">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-[#172033] font-bold transition"
            >
              <ArrowLeft size={20} />
              Back
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-7">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-extrabold">
            RideLink
          </p>

          <h1 className="text-3xl sm:text-4xl font-extrabold mt-2">
            Driver Details
          </h1>

          <p className="text-gray-500 mt-2">
            Complete information about your assigned driver
            and vehicle.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-green-50 border-b border-green-100 p-6 sm:p-7">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#172033] text-white flex items-center justify-center text-2xl font-extrabold">
                {driverName.charAt(0).toUpperCase()}
              </div>

              <div>
                <p className="text-xs text-green-600 uppercase tracking-wider font-extrabold">
                  Assigned Driver
                </p>

                <h2 className="text-2xl font-extrabold text-[#172033] mt-1">
                  {driverName}
                </h2>

                <div className="flex items-center gap-2 mt-2 text-green-700">
                  <ShieldCheck size={17} />
                  <span className="text-sm font-bold">
                    Driver Accepted
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-7">
            <h3 className="text-xl font-extrabold mb-5">
              Driver Information
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
                    <User
                      size={20}
                      className="text-green-600"
                    />
                  </div>

                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase">
                      Driver
                    </p>

                    <p className="font-extrabold mt-1">
                      {driverName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
                    <Phone
                      size={20}
                      className="text-green-600"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-gray-400 font-bold uppercase">
                      Phone
                    </p>

                    {driver.phone ? (
                      <a
                        href={`tel:${driver.phone}`}
                        className="font-extrabold mt-1 block hover:text-green-600 truncate"
                      >
                        {driver.phone}
                      </a>
                    ) : (
                      <p className="font-extrabold mt-1">
                        Not available
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
                    <Car
                      size={20}
                      className="text-green-600"
                    />
                  </div>

                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase">
                      Vehicle
                    </p>

                    <p className="font-extrabold mt-1">
                      {vehicle}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
                    <Car
                      size={20}
                      className="text-green-600"
                    />
                  </div>

                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase">
                      Vehicle Number
                    </p>

                    <p className="font-extrabold mt-1">
                      {driver.vehicleNumber ||
                        "Not available"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
                    <Car
                      size={20}
                      className="text-green-600"
                    />
                  </div>

                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase">
                      Vehicle Type
                    </p>

                    <p className="font-extrabold mt-1">
                      {driver.vehicleType ||
                        "Not available"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
                    <Car
                      size={20}
                      className="text-green-600"
                    />
                  </div>

                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase">
                      Color
                    </p>

                    <p className="font-extrabold mt-1 capitalize">
                      {driver.vehicleColor ||
                        "Not available"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-7 pt-7 border-t border-gray-100">
              <h3 className="text-xl font-extrabold mb-5">
                Ride Information
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-4">
                  <MapPin
                    size={19}
                    className="text-indigo-600 shrink-0"
                  />

                  <div className="min-w-0">
                    <p className="text-xs text-gray-400 font-bold">
                      Pickup
                    </p>

                    <p className="font-bold truncate">
                      {request.pickupLocation ||
                        "Not available"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-4">
                  <MapPin
                    size={19}
                    className="text-red-500 shrink-0"
                  />

                  <div className="min-w-0">
                    <p className="text-xs text-gray-400 font-bold">
                      Destination
                    </p>

                    <p className="font-bold truncate">
                      {request.destination ||
                        "Not available"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-4">
                  <CalendarDays
                    size={19}
                    className="text-indigo-600 shrink-0"
                  />

                  <div>
                    <p className="text-xs text-gray-400 font-bold">
                      Departure
                    </p>

                    <p className="font-bold">
                      {request.departureDate
                        ? new Date(
                            request.departureDate,
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "Not available"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-4">
                  <Clock3
                    size={19}
                    className="text-indigo-600 shrink-0"
                  />

                  <div>
                    <p className="text-xs text-gray-400 font-bold">
                      Time
                    </p>

                    <p className="font-bold">
                      {request.departureTime ||
                        "Not available"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {group?.rideOtp && (
              <div className="mt-7 rounded-2xl bg-[#fffaf0] border-2 border-[#fdbd00] p-5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#fff0bd] flex items-center justify-center">
                    <ShieldCheck
                      size={21}
                      className="text-[#b98200]"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-[#9a7000]">
                      Ride OTP
                    </p>

                    <p className="text-sm text-gray-600 mt-1">
                      Share this OTP with the driver before
                      starting the ride.
                    </p>
                  </div>

                  <div className="ml-auto bg-white border border-[#f3df9a] rounded-xl px-5 py-3">
                    <p className="text-2xl font-extrabold tracking-[0.3em] pl-[0.3em]">
                      {group.rideOtp}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mt-7 w-full inline-flex items-center justify-center gap-2 bg-[#172033] hover:bg-[#222d43] text-white px-6 py-3.5 rounded-xl font-extrabold transition"
            >
              <ArrowLeft size={18} />
              Back to My Ride Requests
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DriverDetails;