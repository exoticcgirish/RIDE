import { useState } from "react";
import "./App.css";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import PassengerDashboard from "./components/PassengerDashboard";

const roles = ["driver", "passenger", "admin"];

function App() {
  const [activeRole, setActiveRole] = useState("passenger");
  const [mode, setMode] = useState("login");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (userData) => {
    if (userData.role === "passenger") {
      setUser(userData);
      setMessage("");
    } else {
      setMessage("Dashboard is available only for passengers.");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setMode("login");
    setActiveRole("passenger");
    setMessage("You have been logged out.");
  };

  return (
    <div className='app-shell'>
      {user ? (
        <PassengerDashboard user={user} onLogout={handleLogout} />
      ) : (
        <div className='auth-card'>
          <h1>Ride Auth</h1>
          <p className='subtitle'>
            Simple access for drivers, passengers, and admins.
          </p>

          <div className='role-tabs' aria-label='Choose role'>
            {roles.map((role) => (
              <button
                key={role}
                type='button'
                className={activeRole === role ? "role-tab active" : "role-tab"}
                onClick={() => {
                  setActiveRole(role);
                  setMessage("");
                }}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>

          <div className='mode-switch'>
            <button
              type='button'
              className={mode === "login" ? "mode-btn active" : "mode-btn"}
              onClick={() => {
                setMode("login");
                setMessage("");
              }}
            >
              Login
            </button>
            <button
              type='button'
              className={mode === "register" ? "mode-btn active" : "mode-btn"}
              onClick={() => {
                setMode("register");
                setMessage("");
              }}
            >
              Register
            </button>
          </div>

          {mode === "login" ? (
            <LoginForm
              role={activeRole}
              onMessage={setMessage}
              onLogin={handleLoginSuccess}
            />
          ) : (
            <RegisterForm role={activeRole} onMessage={setMessage} />
          )}

          {message ? <p className='status-message'>{message}</p> : null}
        </div>
      )}
    </div>
  );
}

export default App;
