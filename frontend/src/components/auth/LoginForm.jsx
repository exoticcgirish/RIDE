import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../ui/Loader";
import { login } from "../../services/authApi";

function LoginForm({ role, onMessage, onLogin, onRoleChange }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    onMessage("");

    try {
      const { data } = await login({ email, password, role });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      onMessage(`Welcome back, ${data.user?.name || role}!`);
      setEmail("");
      setPassword("");
      onLogin(data.user);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      onMessage(
        error.response?.data?.message || error.message || "Login failed",
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
          <h1 className='text-3xl font-bold'>
            Ride<span className='text-yellow-500'>Link</span>
          </h1>

          <p className='text-gray-500 mt-2'>
            Welcome back! Sign in to continue.
          </p>
        </div>

        <div className='mb-6'>
          <p className='text-sm text-gray-500'>
            Signing in as{" "}
            <span className='font-semibold text-gray-900'>{role}</span>.
          </p>
        </div>
        <div className='mb-4'>
          <label className='text-sm font-medium'>Email</label>

          <input
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='Enter your email'
            className='w-full mt-2 p-3 rounded-xl border focus:ring-2 focus:ring-yellow-400 outline-none'
            required
          />
        </div>

        <div className='mb-3'>
          <label className='text-sm font-medium'>Password</label>

          <input
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder='Enter your password'
            className='w-full mt-2 p-3 rounded-xl border focus:ring-2 focus:ring-yellow-400 outline-none'
            required
          />
        </div>

        <div className='text-right mb-6'>
          <button
            type='button'
            className='text-sm text-yellow-600 hover:underline'
          >
            Forgot Password?
          </button>
        </div>

        <button
          type='submit'
          disabled={loading}
          className='w-full bg-yellow-400 hover:bg-yellow-500 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-70'
        >
          {loading ? (
            <>
              <Loader size='sm' />
              <span>Login...</span>
            </>
          ) : (
            "Login"
          )}
        </button>

        <p className='text-center text-gray-500 mt-6'>
          Don't have an account?
          <button
            type='button'
            onClick={() => navigate("/register")}
            className='text-yellow-600 font-semibold ml-1'
          >
            Create Account
          </button>
        </p>
      </form>
    </div>
  );
}

export default LoginForm;
