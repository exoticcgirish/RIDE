import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
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

    if (typeof onMessage === "function") {
      onMessage("");
    }

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
          `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully.`,
      );

      resetForm();

      timerRef.current = setTimeout(() => {
        navigate("/login", { replace: true });
      }, 700);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='w-full px-4 sm:px-6 py-8 sm:py-12'>
      <div className={`w-full ${isDriver ? "max-w-3xl" : "max-w-md"} mx-auto`}>
        <form
          onSubmit={handleSubmit}
          className='w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-5 sm:p-7 md:p-8'
        >
          <button
            type='button'
            onClick={() => navigate("/")}
            className='inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 font-semibold text-sm sm:text-base transition-colors duration-200 group mb-6'
          >
            <span className='w-9 h-9 rounded-full bg-gray-100 group-hover:bg-yellow-100 flex items-center justify-center transition-colors duration-200'>
              <ArrowLeft
                size={18}
                className='group-hover:-translate-x-0.5 transition-transform duration-200'
              />
            </span>
            Back to Home
          </button>

          <div className='text-center mb-7'>
            <h2 className='text-3xl sm:text-4xl font-extrabold tracking-tight'>
              <span className='text-gray-900'>Ride</span>
              <span className='text-yellow-500'>Link</span>
            </h2>

            <p className='text-gray-500 text-sm sm:text-base mt-2'>
              Create your account to start sharing rides.
            </p>
          </div>

          <div className='mb-7 rounded-2xl bg-gray-50 border border-gray-100 px-4 py-3 text-center'>
            <p className='text-sm text-gray-600'>
              Registering as{" "}
              <span className='font-bold text-gray-900 capitalize'>{role}</span>
            </p>
          </div>

          <div
            className={`grid grid-cols-1 ${
              isDriver ? "md:grid-cols-2" : ""
            } gap-5`}
          >
            <div>
              <label
                htmlFor='register-name'
                className='block text-sm font-semibold text-gray-700 mb-2'
              >
                Full Name
              </label>

              <input
                id='register-name'
                type='text'
                value={full_name}
                onChange={(e) => setFullName(e.target.value)}
                placeholder='Enter full name'
                autoComplete='name'
                className='w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:bg-white focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100'
                required
              />
            </div>

            <div>
              <label
                htmlFor='register-email'
                className='block text-sm font-semibold text-gray-700 mb-2'
              >
                Email
              </label>

              <input
                id='register-email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='Enter your email'
                autoComplete='email'
                className='w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:bg-white focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100'
                required
              />
            </div>

            <div className={isDriver ? "md:col-span-2" : ""}>
              <label
                htmlFor='register-password'
                className='block text-sm font-semibold text-gray-700 mb-2'
              >
                Password
              </label>

              <input
                id='register-password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='Create password'
                autoComplete='new-password'
                minLength={6}
                className='w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:bg-white focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100'
                required
              />
            </div>

            {isDriver && (
              <>
                <div>
                  <label
                    htmlFor='register-phone'
                    className='block text-sm font-semibold text-gray-700 mb-2'
                  >
                    Phone Number
                  </label>

                  <input
                    id='register-phone'
                    type='tel'
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder='Enter phone number'
                    autoComplete='tel'
                    className='w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:bg-white focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100'
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor='register-vehicle-type'
                    className='block text-sm font-semibold text-gray-700 mb-2'
                  >
                    Vehicle Type
                  </label>

                  <select
                    id='register-vehicle-type'
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className='w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 outline-none transition-all duration-200 focus:bg-white focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100'
                    required
                  >
                    <option value=''>Select vehicle type</option>
                    <option value='car'>Car</option>
                    <option value='bike'>Bike</option>
                    <option value='suv'>SUV</option>
                    <option value='auto'>Auto</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor='register-vehicle-number'
                    className='block text-sm font-semibold text-gray-700 mb-2'
                  >
                    Vehicle Number
                  </label>

                  <input
                    id='register-vehicle-number'
                    type='text'
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    placeholder='UP16AB1234'
                    className='w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 uppercase outline-none transition-all duration-200 focus:bg-white focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100'
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor='register-license'
                    className='block text-sm font-semibold text-gray-700 mb-2'
                  >
                    Driving License
                  </label>

                  <input
                    id='register-license'
                    type='text'
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder='DLXXXXXXXXXX'
                    className='w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 uppercase outline-none transition-all duration-200 focus:bg-white focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100'
                    required
                  />
                </div>
              </>
            )}
          </div>

          <div className='mt-6 mb-6'>
            <label className='flex items-start gap-3 text-sm text-gray-600 cursor-pointer'>
              <input
                type='checkbox'
                required
                className='mt-0.5 w-4 h-4 accent-yellow-400'
              />

              <span>
                I agree to the{" "}
                <span className='font-semibold text-gray-800'>
                  Terms & Conditions
                </span>
              </span>
            </label>
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 text-gray-900 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed'
          >
            {loading ? (
              <>
                <Loader size='sm' />
                <span>Creating Account...</span>
              </>
            ) : (
              "Create Account"
            )}
          </button>

          <div className='flex items-center gap-3 my-6'>
            <div className='h-px flex-1 bg-gray-200' />

            <span className='text-xs text-gray-400 uppercase tracking-wider'>
              Already registered?
            </span>

            <div className='h-px flex-1 bg-gray-200' />
          </div>

          <button
            type='button'
            onClick={() => navigate("/login")}
            className='w-full border border-gray-200 bg-gray-50 hover:bg-yellow-50 hover:border-yellow-300 text-gray-700 hover:text-gray-900 py-3.5 rounded-xl font-bold transition-all duration-200'
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegisterForm;
