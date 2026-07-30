import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "./ui/Loader";

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
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      onMessage(`Welcome back, ${data.user?.name || role}!`);
      setEmail("");
      setPassword("");
      onLogin(data.user);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      onMessage(error.message);
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

        <div className='grid grid-cols-2 gap-3 mb-6'>
          <button
            type='button'
            className={`py-3 rounded-xl font-semibold transition ${
              role === "rider"
                ? "bg-yellow-400 text-black shadow-lg"
                : "bg-gray-100"
            }`}
          >
            🚖 Rider
          </button>

          <button
            type='button'
            className={`py-3 rounded-xl font-semibold transition ${
              role === "driver"
                ? "bg-yellow-400 text-black shadow-lg"
                : "bg-gray-100"
            }`}
          >
            🚗 Driver
          </button>
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
