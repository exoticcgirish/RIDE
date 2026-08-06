import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";
import RiderDashboard from "./components/rider/RiderDashboard";
import DriverDashboard from "./components/driver/DriverDashboard";
import AdminDashboard from "./components/admin/AdminDashboard";
import RiderProfile from "./pages/rider/RiderProfile";
import EditProfile from "./pages/rider/EditProfile";
import Landing from "./pages/Landing";
import RideHistory from "./pages/rider/RideHistory";
import SavedPlaces from "./pages/rider/SavedPlaces";
import Payments from "./pages/rider/Payments";
import Help from "./pages/rider/Help";
import CreateRideRequest from "./pages/rider/CreateRideRequest";
import MyRideRequests from "./pages/rider/MyRideRequests";

const roles = ["driver", "rider", "admin"];

function App() {
  const [activeRole, setActiveRole] = useState("rider");
  const [message, setMessage] = useState("");
  // const [user, setUser] = useState(null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

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
    localStorage.removeItem("token");
    localStorage.removeItem("user");
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
                  onRoleChange={setActiveRole}
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

                <RegisterForm
                  role={activeRole}
                  onMessage={setMessage}
                  onRoleChange={setActiveRole}
                />
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

          <Route
            path='/profile'
            element={
              user ? (
                user.role === "rider" ? (
                  <RiderProfile user={user} />
                ) : (
                  <Navigate to='/' replace />
                )
              ) : (
                <Navigate to='/login' replace />
              )
            }
          />

          <Route
            path='/edit-profile'
            element={
              user ? (
                user.role === "rider" ? (
                  <EditProfile
                    user={user}
                    onUpdateProfile={(updatedUser) => {
                      setUser(updatedUser);
                    }}
                  />
                ) : (
                  <Navigate to='/' replace />
                )
              ) : (
                <Navigate to='/login' replace />
              )
            }
          />

          <Route
            path='/ride-history'
            element={
              user ? (
                user.role === "rider" ? (
                  <RideHistory />
                ) : (
                  <Navigate to='/' replace />
                )
              ) : (
                <Navigate to='/login' replace />
              )
            }
          />

          <Route
            path='/saved-places'
            element={
              user ? (
                user.role === "rider" ? (
                  <SavedPlaces />
                ) : (
                  <Navigate to='/' replace />
                )
              ) : (
                <Navigate to='/login' replace />
              )
            }
          />

          <Route
            path='/payments'
            element={
              user ? (
                user.role === "rider" ? (
                  <Payments />
                ) : (
                  <Navigate to='/' replace />
                )
              ) : (
                <Navigate to='/login' replace />
              )
            }
          />

          <Route
            path='/help'
            element={
              user ? (
                user.role === "rider" ? (
                  <Help />
                ) : (
                  <Navigate to='/' replace />
                )
              ) : (
                <Navigate to='/login' replace />
              )
            }
          />

          <Route
            path='/create-ride'
            element={
              user ? (
                user.role === "rider" ? (
                  <CreateRideRequest />
                ) : (
                  <Navigate to='/' replace />
                )
              ) : (
                <Navigate to='/login' replace />
              )
            }
          />

          <Route
            path='/my-ride-requests'
            element={
              user ? (
                user.role === "rider" ? (
                  <MyRideRequests />
                ) : (
                  <Navigate to='/' replace />
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
