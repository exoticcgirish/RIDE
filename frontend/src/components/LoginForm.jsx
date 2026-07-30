import { useState } from "react";

function LoginForm({ role, onMessage, onLogin }) {
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
    } catch (error) {
      onMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className='auth-form' onSubmit={handleSubmit}>
      <h2>{role.charAt(0).toUpperCase() + role.slice(1)} Login</h2>
      <input
        type='email'
        placeholder='Email'
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <input
        type='password'
        placeholder='Password'
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />
      <button type='submit' disabled={loading}>
        {loading ? "Signing in..." : "Login"}
      </button>
    </form>
  );
}

export default LoginForm;
