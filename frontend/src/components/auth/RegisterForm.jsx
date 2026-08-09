import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../ui/Loader";
import { register } from "../../services/authApi";
import { toast } from "react-toastify";

function RegisterForm({ role = "rider", onMessage }) {
  const navigate = useNavigate();
  const timerRef = useRef(null);

  const [full_name, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");

  const [loading, setLoading] = useState(false);

  const isDriver = role === "driver";

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPassword("");
    setPhone("");
    setVehicleType("");
    setVehicleNumber("");
    setLicenseNumber("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    if (typeof onMessage === "function") onMessage("");

    try {
      const payload = {
        full_name: full_name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      };

      if (isDriver) {
        payload.phone = phone.trim();
        payload.vehicleType = vehicleType.trim();
        payload.vehicleNumber = vehicleNumber.trim().toUpperCase();
        payload.licenseNumber = licenseNumber.trim().toUpperCase();
      }

      const { data } = await register(payload);

      toast.success(
        data?.message ||
          `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully.`
      );

      resetForm();

      timerRef.current = setTimeout(() => {
        navigate("/login", { replace: true });
      }, 700);
    } catch (error) {
      console.error("Registration error:", error);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 py-8 sm:py-12">
      <div className={`w-full ${isDriver ? "max-w-3xl" : "max-w-md"} mx-auto`}>
        <form
          onSubmit={handleSubmit}
          className="w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 md:p-10"
        >
          <div className="text-center mb-7">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              <span className="text-gray-900">Ride</span>
              <span className="text-yellow-500">Link</span>
            </h2>

            <p className="text-gray-500 text-sm sm:text-base mt-2">
              Create your account to start sharing rides.
            </p>
          </div>

          <div className="mb-7 rounded-2xl bg-gray-50 border border-gray-100 px-4 py-3 text-center">
            <p className="text-sm text-gray-600">
              Registering as{" "}
              <span className="font-bold text-gray-900 capitalize">{role}</span>
            </p>
          </div>

          <div
            className={`grid grid-cols-1 ${
              isDriver ? "md:grid-cols-2" : ""
            } gap-5`}
          >
            <div className={!isDriver ? "md:col-span-1" : ""}>
              <label
                htmlFor="register-name"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Full Name
              </label>

              <input
                id="register-name"
                type="text"
                value={full_name}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter full name"
                autoComplete="name"
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 outline-none transition focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200"
                required
              />
            </div>

            <div>
              <label
                htmlFor="register-email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Email
              </label>

              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                autoComplete="email"
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 outline-none transition focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200"
                required
              />
            </div>

            <div className={isDriver ? "md:col-span-2" : ""}>
              <label
                htmlFor="register-password"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Password
              </label>

              <input
                id="register-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create password"
                autoComplete="new-password"
                minLength={6}
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 outline-none transition focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200"
                required
              />
            </div>

            {/* Driver Fields */}
            {isDriver && (
              <>
                {/* Phone */}
                <div>
                  <label
                    htmlFor="register-phone"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Phone Number
                  </label>

                  <input
                    id="register-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter phone number"
                    autoComplete="tel"
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 outline-none transition focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="register-vehicle-type"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Vehicle Type
                  </label>

                  <select
                    id="register-vehicle-type"
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 outline-none transition focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200"
                    required
                  >
                    <option value="">Select vehicle type</option>
                    <option value="car">Car</option>
                    <option value="bike">Bike</option>
                    <option value="suv">SUV</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>

                {/* Vehicle Number */}
                <div>
                  <label
                    htmlFor="register-vehicle-number"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Vehicle Number
                  </label>

                  <input
                    id="register-vehicle-number"
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    placeholder="UP16AB1234"
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 uppercase outline-none transition focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200"
                    required
                  />
                </div>

                {/* License */}
                <div>
                  <label
                    htmlFor="register-license"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Driving License
                  </label>

                  <input
                    id="register-license"
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="DLXXXXXXXXXX"
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 uppercase outline-none transition focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200"
                    required
                  />
                </div>
              </>
            )}
          </div>

          {/* Terms */}
          <div className="mt-6 mb-6">
            <label className="flex items-start gap-3 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                required
                className="mt-0.5 w-4 h-4 accent-yellow-400"
              />

              <span>
                I agree to the{" "}
                <span className="font-semibold text-gray-800">
                  Terms & Conditions
                </span>
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 text-gray-900 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader size="sm" />
                <span>Creating Account...</span>
              </>
            ) : (
              "Create Account"
            )}
          </button>

          {/* Login */}
          <p className="text-center text-sm text-gray-500 mt-7">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-yellow-600 font-bold hover:text-yellow-700 hover:underline"
            >
              Login
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default RegisterForm;