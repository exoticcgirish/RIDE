import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../ui/Loader";
import { register } from "../../services/authApi";

function RegisterForm({ role, onMessage }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    onMessage("");

    try {
      const { data } = await register({ name, email, password, role });

      onMessage(
        `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully.`,
      );
      setName("");
      setEmail("");
      setPassword("");
      navigate("/login", { replace: true });
    } catch (error) {
      onMessage(
        error.response?.data?.message || error.message || "Registration failed",
      );
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
            Ride<span className='text-yellow-500'>Link</span>
          </h1>

          <p className='text-gray-500 mt-2'>
            Create your account to start sharing rides.
          </p>
        </div>

        <div className='mb-6'>
          <p className='text-sm text-gray-500'>
            Registering a new{" "}
            <span className='font-semibold text-gray-900'>{role}</span> account.
          </p>
        </div>

        <div className='mb-4'>
          <label className='font-medium'>Full Name</label>

          <input
            type='text'
            placeholder='Enter full name'
            value={name}
            onChange={(e) => setName(e.target.value)}
            className='w-full mt-2 p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none'
            required
          />
        </div>

        <div className='mb-4'>
          <label className='font-medium'>Email</label>

          <input
            type='email'
            placeholder='Enter email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='w-full mt-2 p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none'
            required
          />
        </div>

        <div className='mb-4'>
          <label className='font-medium'>Password</label>

          <input
            type='password'
            placeholder='Create password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='w-full mt-2 p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none'
            required
          />
        </div>

        <label className='flex items-center gap-2 text-sm text-gray-600 mb-6'>
          <input type='checkbox' required />I agree to the Terms & Conditions
        </label>

        <button
          type='submit'
          disabled={loading}
          className='w-full bg-yellow-400 hover:bg-yellow-500 transition py-3 rounded-xl font-semibold shadow-lg'
        >
          {loading ? (
            <Loader size='sm' ariaLabel='Creating account' />
          ) : (
            "Create Account"
          )}
        </button>

        <p className='text-center text-gray-500 mt-6'>
          Already have an account?
          <button
            type='button'
            onClick={() => navigate("/login")}
            className='text-yellow-600 font-semibold ml-1'
          >
            Login
          </button>
        </p>
      </form>
    </div>
  );
}
export default RegisterForm;
