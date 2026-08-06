import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../ui/Loader";
import { register } from "../../services/authApi";

function RegisterForm({ role, onMessage }) {
  const navigate = useNavigate();

  const [full_name, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Driver Fields
  const [phone, setPhone] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    onMessage("");

    try {
      const payload = {
        full_name,
        email,
        password,
        role,
      };

      if (role === "driver") {
        payload.phone = phone;
        payload.vehicleType = vehicleType;
        payload.vehicleNumber = vehicleNumber;
        payload.licenseNumber = licenseNumber;
      }

      await register(payload);

      onMessage("Account created successfully.");

      setFullName("");
      setEmail("");
      setPassword("");
      setPhone("");
      setVehicleType("");
      setVehicleNumber("");
      setLicenseNumber("");

      navigate("/login");
    } catch (err) {
      onMessage(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-orange-100 p-6'>
      <form
        onSubmit={handleSubmit}
        className='w-full max-w-md bg-white rounded-3xl shadow-2xl p-8'
      >
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-extrabold'>
            Ride
            <span className='text-yellow-500'>Link</span>
          </h1>

          <p className='text-gray-500 mt-2'>
            Create your account to start sharing rides.
          </p>
        </div>

        <p className='text-sm text-gray-500 mb-6'>
          Registering as
          <span className='font-semibold'> {role}</span>
        </p>

        {/* Full Name */}

        <div className='mb-4'>
          <label className='font-medium'>Full Name</label>

          <input
            type='text'
            value={full_name}
            onChange={(e) => setFullName(e.target.value)}
            className='w-full mt-2 p-3 rounded-xl border border-gray-300'
            placeholder='Enter full name'
            required
          />
        </div>

        {/* Email */}

        <div className='mb-4'>
          <label className='font-medium'>Email</label>

          <input
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='w-full mt-2 p-3 rounded-xl border border-gray-300'
            placeholder='Enter email'
            required
          />
        </div>

        {/* Password */}

        <div className='mb-4'>
          <label className='font-medium'>Password</label>

          <input
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='w-full mt-2 p-3 rounded-xl border border-gray-300'
            placeholder='Password'
            required
          />
        </div>

        {/* Driver Only */}

        {role === "driver" && (
          <>
            <div className='mb-4'>
              <label className='font-medium'>Phone Number</label>

              <input
                type='text'
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className='w-full mt-2 p-3 rounded-xl border border-gray-300'
                placeholder='Phone Number'
                required
              />
            </div>

            <div className='mb-4'>
              <label className='font-medium'>Vehicle Type</label>

              <input
                type='text'
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className='w-full mt-2 p-3 rounded-xl border border-gray-300'
                placeholder='Car / Bike / SUV'
                required
              />
            </div>

            <div className='mb-4'>
              <label className='font-medium'>Vehicle Number</label>

              <input
                type='text'
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                className='w-full mt-2 p-3 rounded-xl border border-gray-300'
                placeholder='UP16AB1234'
                required
              />
            </div>

            <div className='mb-4'>
              <label className='font-medium'>Driving License</label>

              <input
                type='text'
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                className='w-full mt-2 p-3 rounded-xl border border-gray-300'
                placeholder='DLXXXXXXXXXX'
                required
              />
            </div>
          </>
        )}

        <label className='flex items-center gap-2 text-sm text-gray-600 mb-6'>
          <input type='checkbox' required />I agree to the Terms & Conditions
        </label>

        <button
          type='submit'
          disabled={loading}
          className='w-full bg-yellow-400 hover:bg-yellow-500 transition py-3 rounded-xl font-semibold shadow-lg'
        >
          {loading ? <Loader /> : "Create Account"}
        </button>

        <p className='text-center mt-6 text-gray-500'>
          Already have an account?
          <button
            type='button'
            onClick={() => navigate("/login")}
            className='ml-1 text-yellow-500 font-semibold'
          >
            Login
          </button>
        </p>
      </form>
    </div>
  );
}

export default RegisterForm;
