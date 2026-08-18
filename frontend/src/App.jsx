import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";
import RiderDashboard from "./components/rider/RiderDashboard";
import DriverDashboard from "./components/driver/DriverDashboard";
import AdminDashboard from "./components/admin/AdminDashboard";
import RiderProfile from "./pages/rider/RiderProfile";
import EditProfile from "./pages/rider/EditProfile";
import RideHistory from "./pages/rider/RideHistory";
import SavedPlaces from "./pages/rider/SavedPlaces";
import Payments from "./pages/rider/Payments";
import Help from "./pages/rider/Help";
import CreateRideRequest from "./pages/rider/CreateRideRequest";
import MyRideRequests from "./pages/rider/MyRideRequests";
import Landing from "./pages/Landing";
const roles = ["driver", "rider", "admin"];

function AdminPlaceholder({ title, description }) {
  return (
    <div className='min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8'>
      <div className='max-w-7xl mx-auto'>
        <div className='bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8'>
          <p className='text-yellow-500 font-semibold uppercase tracking-wider text-sm'>
            Administration
          </p>

          <h1 className='text-3xl sm:text-4xl font-bold text-gray-900 mt-2'>
            {title}
          </h1>

          <p className='text-gray-500 mt-3'>{description}</p>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [activeRole, setActiveRole] = useState("rider");
  const [message, setMessage] = useState("");

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");

    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
        setUser(null);
      }
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    if (
      userData?.role === "rider" ||
      userData?.role === "driver" ||
      userData?.role === "admin"
    ) {
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      setMessage("");
      return;
    }

    setMessage("Invalid user role.");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setActiveRole("rider");
    setMessage("");
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  return (
    <BrowserRouter>
      <ToastContainer position='top-right' autoClose={2000} theme='light' />

      <Routes>
        <Route path='/' element={<Landing />} />
        <Route
          path='/login'
          element={
            <div className='min-h-screen w-full bg-gradient-to-br from-yellow-50 via-white to-orange-50'>
              <div className='w-full px-4 sm:px-6 pt-6'>
                <div className='max-w-6xl mx-auto'>
                  <div className='flex flex-col items-center'>
                    <div className='text-center mb-5'>
                      <h1 className='text-4xl sm:text-5xl font-extrabold tracking-tight'>
                        <span className='text-gray-900'>Ride</span>
                        <span className='text-yellow-500'>Link</span>
                      </h1>

                      <p className='text-gray-500 mt-2 text-sm sm:text-base'>
                        Simple access for drivers, riders, and admins.
                      </p>
                    </div>

                    <div
                      className='flex items-center gap-1 sm:gap-2 bg-white p-1.5 rounded-full shadow-sm border border-gray-200'
                      aria-label='Choose role'
                    >
                      {roles.map((role) => (
                        <button
                          key={role}
                          type='button'
                          onClick={() => {
                            setActiveRole(role);
                            setMessage("");
                          }}
                          className={`px-4 sm:px-6 py-2.5 rounded-full text-sm sm:text-base font-semibold capitalize transition-all ${
                            activeRole === role
                              ? "bg-yellow-400 text-gray-900 shadow-sm"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <LoginForm
                role={activeRole}
                onMessage={setMessage}
                onLogin={handleLoginSuccess}
                onRoleChange={setActiveRole}
              />

              {message && (
                <div className='fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md'>
                  <div className='bg-white border border-gray-200 shadow-xl rounded-2xl px-5 py-4 text-sm text-gray-700 text-center'>
                    {message}
                  </div>
                </div>
              )}
            </div>
          }
        />

        <Route
          path='/register'
          element={
            <div className='min-h-screen w-full bg-gradient-to-br from-yellow-50 via-white to-orange-50'>
              {/* Header */}
              <div className='w-full px-4 sm:px-6 pt-6'>
                <div className='max-w-6xl mx-auto'>
                  <div className='flex flex-col items-center'>
                    <div className='text-center mb-5'>
                      <h1 className='text-4xl sm:text-5xl font-extrabold tracking-tight'>
                        <span className='text-gray-900'>Ride</span>
                        <span className='text-yellow-500'>Link</span>
                      </h1>

                      <p className='text-gray-500 mt-2 text-sm sm:text-base'>
                        Create your account to start sharing rides.
                      </p>
                    </div>

                    {/* Role tabs */}
                    <div
                      className='flex items-center gap-1 sm:gap-2 bg-white p-1.5 rounded-full shadow-sm border border-gray-200'
                      aria-label='Choose role'
                    >
                      {roles.map((role) => (
                        <button
                          key={role}
                          type='button'
                          onClick={() => {
                            setActiveRole(role);
                            setMessage("");
                          }}
                          className={`px-4 sm:px-6 py-2.5 rounded-full text-sm sm:text-base font-semibold capitalize transition-all ${
                            activeRole === role
                              ? "bg-yellow-400 text-gray-900 shadow-sm"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <RegisterForm
                role={activeRole}
                onMessage={setMessage}
                onRoleChange={setActiveRole}
              />
              {message && (
                <div className='fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-xl'>
                  <div className='bg-white border border-gray-200 shadow-xl rounded-2xl px-5 py-4 text-sm text-gray-700 text-center'>
                    {message}
                  </div>
                </div>
              )}
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
              ) : user.role === "admin" ? (
                <AdminDashboard user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to='/login' replace />
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
                <RiderProfile user={user} onUpdateProfile={handleUserUpdate} />
              ) : (
                <Navigate to='/dashboard' replace />
              )
            ) : (
              <Navigate to='/login' replace />
            )
          }
        />

        {/* ============================================================
            EDIT PROFILE
        ============================================================ */}

        <Route
          path='/edit-profile'
          element={
            user ? (
              user.role === "rider" ? (
                <EditProfile user={user} onUpdateProfile={handleUserUpdate} />
              ) : (
                <Navigate to='/dashboard' replace />
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
                <Navigate to='/dashboard' replace />
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
                <Navigate to='/dashboard' replace />
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
                <Navigate to='/dashboard' replace />
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
                <Navigate to='/dashboard' replace />
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
                <Navigate to='/dashboard' replace />
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
                <Navigate to='/dashboard' replace />
              )
            ) : (
              <Navigate to='/login' replace />
            )
          }
        />

        <Route
          path='/admin/dashboard'
          element={
            user?.role === "admin" ? (
              <AdminDashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to='/login' replace />
            )
          }
        />

        <Route
          path='/admin/pending-drivers'
          element={
            user?.role === "admin" ? (
              <AdminPlaceholder
                title='Pending Drivers'
                description='Review and approve driver registration requests.'
              />
            ) : (
              <Navigate to='/login' replace />
            )
          }
        />

        <Route
          path='/admin/approved-drivers'
          element={
            user?.role === "admin" ? (
              <AdminPlaceholder
                title='Approved Drivers'
                description='View and manage all approved drivers.'
              />
            ) : (
              <Navigate to='/login' replace />
            )
          }
        />

        <Route
          path='/admin/rejected-drivers'
          element={
            user?.role === "admin" ? (
              <AdminPlaceholder
                title='Rejected Drivers'
                description='View driver applications that were rejected.'
              />
            ) : (
              <Navigate to='/login' replace />
            )
          }
        />

        <Route
          path='/admin/riders'
          element={
            user?.role === "admin" ? (
              <AdminPlaceholder
                title='Riders'
                description='View and manage registered riders.'
              />
            ) : (
              <Navigate to='/login' replace />
            )
          }
        />

        <Route
          path='/admin/trips'
          element={
            user?.role === "admin" ? (
              <AdminPlaceholder
                title='Trips'
                description='View and manage all RideLink trips.'
              />
            ) : (
              <Navigate to='/login' replace />
            )
          }
        />

        <Route
          path='/admin/reports'
          element={
            user?.role === "admin" ? (
              <AdminPlaceholder
                title='Reports'
                description='View RideLink platform reports and analytics.'
              />
            ) : (
              <Navigate to='/login' replace />
            )
          }
        />

        <Route
          path='/admin/settings'
          element={
            user?.role === "admin" ? (
              <AdminPlaceholder
                title='Admin Settings'
                description='Manage administration and platform settings.'
              />
            ) : (
              <Navigate to='/login' replace />
            )
          }
        />

        {/* ============================================================
            FALLBACK
        ============================================================ */}

        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
