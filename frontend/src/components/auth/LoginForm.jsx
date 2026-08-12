import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../ui/Loader";
import { login } from "../../services/authApi";
import { toast } from "react-toastify";

function LoginForm({ role, onMessage, onLogin }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    onMessage("");

    try {
      const { data } = await login({
        email: email.trim(),
        password,
        role,
      });

      if (!data?.token || !data?.user) {
        throw new Error("Invalid login response from server.");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setEmail("");
      setPassword("");

      onLogin(data.user);

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      // console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Login failed. Please check your credentials.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='w-full px-4 sm:px-6 py-8 sm:py-12'>
      <div className='w-full max-w-md mx-auto'>
        <form
          onSubmit={handleSubmit}
          className='w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 md:p-10'
        >
          {/* Logo */}
          <div className='text-center mb-7'>
            <h2 className='text-3xl sm:text-4xl font-extrabold tracking-tight'>
              <span className='text-gray-900'>Ride</span>
              <span className='text-yellow-500'>Link</span>
            </h2>

            <p className='text-gray-500 text-sm sm:text-base mt-2'>
              Welcome back! Sign in to continue.
            </p>
          </div>

          {/* Role */}
          <div className='mb-6 rounded-2xl bg-gray-50 border border-gray-100 px-4 py-3 text-center'>
            <p className='text-sm text-gray-600'>
              Signing in as{" "}
              <span className='font-bold text-gray-900 capitalize'>{role}</span>
            </p>
          </div>

          {/* Email */}
          <div className='mb-5'>
            <label
              htmlFor='login-email'
              className='block text-sm font-semibold text-gray-700 mb-2'
            >
              Email
            </label>

            <input
              id='login-email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='Enter your email'
              autoComplete='email'
              className='w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 outline-none transition focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200'
              required
            />
          </div>

          {/* Password */}
          <div className='mb-3'>
            <label
              htmlFor='login-password'
              className='block text-sm font-semibold text-gray-700 mb-2'
            >
              Password
            </label>

            <input
              id='login-password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='Enter your password'
              autoComplete='current-password'
              className='w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 outline-none transition focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200'
              required
            />
          </div>

          {/* Forgot Password */}
          <div className='flex justify-end mb-6'>
            <button
              type='button'
              onClick={() => toast.info("Password reset is not available yet.")}
              className='text-sm font-semibold text-yellow-600 hover:text-yellow-700 hover:underline'
            >
              Forgot Password?
            </button>
          </div>

          {/* Login */}
          <button
            type='submit'
            disabled={loading}
            className='w-full bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 text-gray-900 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed'
          >
            {loading ? (
              <>
                <Loader size='sm' />
                <span>Logging in...</span>
              </>
            ) : (
              "Login"
            )}
          </button>

          {/* Register */}
          <p className='text-center text-sm text-gray-500 mt-7'>
            Don't have an account?{" "}
            <button
              type='button'
              onClick={() => navigate("/register")}
              className='text-yellow-600 font-bold hover:text-yellow-700 hover:underline'
            >
              Create Account
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginForm;
