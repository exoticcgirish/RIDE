import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import RiderDashboard from "./components/RiderDashboard";
import DriverDashboard from "./components/DriverDashboard";
import AdminDashboard from "./components/AdminDashboard";
import Landing from "./components/Landing";

const roles = ["driver", "rider", "admin"];

function App() {
  const [activeRole, setActiveRole] = useState("rider");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (userData) => {
    if (userData.role === "rider") {
      setUser(userData);
      setMessage("");
      return;
    }

    if (userData.role === "driver" || userData.role === "admin") {
      setUser(userData);
      setMessage("");
      return;
    }

    setMessage("Dashboard is available only for riders, drivers, or admins.");
  };

  const handleLogout = () => {
    setUser(null);
    setActiveRole("rider");
    setMessage("You have been logged out.");
  };

  return (
    <BrowserRouter>
      <div className='app-shell'>
        <Routes>
          <Route path='/' element={<Landing />} />

          <Route
            path='/login'
            element={
              <div className='auth-card'>
                <button
                  type='button'
                  onClick={() => window.history.back()}
                  className='back-btn'
                >
                  ← Back
                </button>
                <h1>Ride Auth</h1>
                <p className='subtitle'>
                  Simple access for drivers, riders, and admins.
                </p>

                <div className='role-tabs' aria-label='Choose role'>
                  {roles.map((r) => (
                    <button
                      key={r}
                      type='button'
                      className={
                        activeRole === r ? "role-tab active" : "role-tab"
                      }
                      onClick={() => {
                        setActiveRole(r);
                        setMessage("");
                      }}
                    >
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  ))}
                </div>

                <LoginForm
                  role={activeRole}
                  onMessage={setMessage}
                  onLogin={handleLoginSuccess}
                />
                {message ? <p className='status-message'>{message}</p> : null}
              </div>
            }
          />

          <Route
            path='/register'
            element={
              <div className='auth-card'>
                <button
                  type='button'
                  onClick={() => window.history.back()}
                  className='back-btn'
                >
                  ← Back
                </button>
                <h1>Ride Auth</h1>
                <p className='subtitle'>
                  Simple access for drivers, riders, and admins.
                </p>

                <div className='role-tabs' aria-label='Choose role'>
                  {roles.map((r) => (
                    <button
                      key={r}
                      type='button'
                      className={
                        activeRole === r ? "role-tab active" : "role-tab"
                      }
                      onClick={() => {
                        setActiveRole(r);
                        setMessage("");
                      }}
                    >
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  ))}
                </div>

                <RegisterForm role={activeRole} onMessage={setMessage} />
                {message ? <p className='status-message'>{message}</p> : null}
              </div>
            }
          />

          <Route
            path='/dashboard'
            element={
              user ? (
                user.role === "rider" ? (
                  <RiderDashboard user={user} onLogout={handleLogout} />
                ) : user.role === "driver" ? (
                  <DriverDashboard user={user} onLogout={handleLogout} />
                ) : (
                  <AdminDashboard user={user} onLogout={handleLogout} />
                )
              ) : (
                <Navigate to='/login' replace />
              )
            }
          />

          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
