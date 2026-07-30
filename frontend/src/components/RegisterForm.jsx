import { useState } from "react";

function RegisterForm({ role, onMessage }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    onMessage("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      onMessage(
        `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully.`,
      );
      setName("");
      setEmail("");
      setPassword("");
    } catch (error) {
      onMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className='auth-form' onSubmit={handleSubmit}>
      <h2>{role.charAt(0).toUpperCase() + role.slice(1)} Register</h2>
      <input
        type='text'
        placeholder='Full name'
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
      />
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
        {loading ? "Creating account..." : "Register"}
      </button>
    </form>
  );
}

export default RegisterForm;
