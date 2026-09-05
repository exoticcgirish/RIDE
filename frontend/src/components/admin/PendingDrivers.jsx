import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  Clock,
  CheckCircle,
  XCircle,
  LayoutDashboard,
  UserCheck,
  UserX,
  GraduationCap,
  Car,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Phone,
  Mail,
  CreditCard,
  RefreshCw,
  Check,
  Ban,
} from "lucide-react";

import {
  getPendingDrivers,
  approveDriver,
  rejectDriver,
} from "../../services/adminApi";

function PendingDrivers({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  // ==================================================
  // STATE
  // ==================================================

  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ==================================================
  // SIDEBAR MENU
  // ==================================================

  const menu = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin/dashboard",
    },
    {
      title: "Pending Drivers",
      icon: Clock,
      path: "/admin/pending-drivers",
    },
    {
      title: "Approved Drivers",
      icon: UserCheck,
      path: "/admin/approved-drivers",
    },
    {
      title: "Rejected Drivers",
      icon: UserX,
      path: "/admin/rejected-drivers",
    },
    {
      title: "Riders",
      icon: GraduationCap,
      path: "/admin/riders",
    },
    {
      title: "Trips",
      icon: Car,
      path: "/admin/trips",
    },
    {
      title: "Reports",
      icon: BarChart3,
      path: "/admin/reports",
    },
    {
      title: "Settings",
      icon: Settings,
      path: "/admin/settings",
    },
  ];

  // ==================================================
  // LOAD PENDING DRIVERS
  // ==================================================

  const loadPendingDrivers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getPendingDrivers();

      console.log("Pending drivers response:", response);

      const data = response?.data?.data || response?.data || [];

      setDrivers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Pending drivers error:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to load pending drivers.",
      );

      setDrivers([]);
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // INITIAL LOAD
  // ==================================================

  useEffect(() => {
    loadPendingDrivers();
  }, []);

  // ==================================================
  // NAVIGATION
  // ==================================================

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  // ==================================================
  // ACTIVE MENU
  // ==================================================

  const isActive = (path) => {
    return location.pathname === path;
  };

  // ==================================================
  // LOGOUT
  // ==================================================

  const handleLogout = () => {
    setMobileMenuOpen(false);

    if (onLogout) {
      onLogout();
    }
  };

  // ==================================================
  // DRIVER HELPERS
  // ==================================================

  const getDriverId = (driver) => {
    return driver?._id || driver?.id;
  };

  const getDriverName = (driver) => {
    return (
      driver?.full_name ||
      driver?.fullName ||
      driver?.name ||
      driver?.username ||
      driver?.user?.full_name ||
      driver?.user?.name ||
      "Unknown Driver"
    );
  };

  const getEmail = (driver) => {
    return driver?.email || driver?.user?.email || "Not provided";
  };

  const getPhone = (driver) => {
    return (
      driver?.phone || driver?.mobile || driver?.user?.phone || "Not provided"
    );
  };

  const getVehicleType = (driver) => {
    return (
      driver?.vehicleType ||
      driver?.vehicle_type ||
      driver?.vehicleName ||
      driver?.vehicle_name ||
      driver?.vehicle ||
      "Not provided"
    );
  };

  const getVehicleNumber = (driver) => {
    return (
      driver?.vehicleNumber ||
      driver?.vehicle_number ||
      driver?.registrationNumber ||
      driver?.registration_number ||
      "Not provided"
    );
  };

  const getLicenseNumber = (driver) => {
    return (
      driver?.licenseNumber ||
      driver?.license_number ||
      driver?.license ||
      "Not provided"
    );
  };

  // ==================================================
  // APPROVE DRIVER
  // ==================================================

  const handleApprove = async (driver) => {
    const id = getDriverId(driver);

    if (!id) {
      setError("Driver ID is missing.");
      return;
    }

    const name = getDriverName(driver);

    const confirmed = window.confirm(
      `Are you sure you want to approve ${name}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(id);
      setError("");

      await approveDriver(id);

      // Reload list after approval
      await loadPendingDrivers();
    } catch (err) {
      console.error("Approve driver error:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to approve driver.",
      );
    } finally {
      setActionLoading("");
    }
  };

  // ==================================================
  // REJECT DRIVER
  // ==================================================

  const handleReject = async (driver) => {
    const id = getDriverId(driver);

    if (!id) {
      setError("Driver ID is missing.");
      return;
    }

    const name = getDriverName(driver);

    const reason = window.prompt(`Enter rejection reason for ${name}:`);

    if (!reason || !reason.trim()) {
      return;
    }

    try {
      setActionLoading(id);
      setError("");

      await rejectDriver(id, reason.trim());

      // Reload list after rejection
      await loadPendingDrivers();
    } catch (err) {
      console.error("Reject driver error:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to reject driver.",
      );
    } finally {
      setActionLoading("");
    }
  };

  // ==================================================
  // UI
  // ==================================================

  return (
    <div className='min-h-screen bg-gray-100'>
      {/* ==================================================
          MOBILE HEADER
      ================================================== */}

      <div className='lg:hidden sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm'>
        <div className='flex items-center justify-between px-5 py-4'>
          <div>
            <h1 className='text-2xl font-extrabold text-gray-900'>
              Ride<span className='text-yellow-500'>Link</span>
            </h1>

            <p className='text-xs text-gray-500'>Admin Panel</p>
          </div>

          <button
            type='button'
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className='w-11 h-11 rounded-xl bg-yellow-400 flex items-center justify-center hover:bg-yellow-500 transition'
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* MOBILE SIDEBAR */}

        {mobileMenuOpen && (
          <div className='border-t border-gray-100 bg-white px-4 py-4'>
            <div className='space-y-2'>
              {menu.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.path}
                    type='button'
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition ${
                      isActive(item.path)
                        ? "bg-yellow-400 text-gray-900 font-semibold"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon size={19} />

                    <span>{item.title}</span>
                  </button>
                );
              })}

              <button
                type='button'
                onClick={handleLogout}
                className='w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-red-600 hover:bg-red-50 transition'
              >
                <LogOut size={19} />

                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ==================================================
          DESKTOP SIDEBAR
          DO NOT CHANGE
      ================================================== */}

      <aside className='hidden lg:flex fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-gray-200 flex-col z-40'>
        {/* LOGO */}

        <div className='px-7 py-7 border-b border-gray-100'>
          <h1 className='text-3xl font-extrabold text-gray-900'>
            Ride<span className='text-yellow-500'>Link</span>
          </h1>

          <p className='text-sm text-gray-500 mt-1'>Administration Panel</p>
        </div>

        {/* NAVIGATION */}

        <nav className='flex-1 p-5 space-y-2 overflow-y-auto'>
          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                type='button'
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition text-left ${
                  isActive(item.path)
                    ? "bg-yellow-400 text-gray-900 font-bold shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon size={20} />

                <span>{item.title}</span>
              </button>
            );
          })}
        </nav>

        {/* LOGOUT */}

        <div className='p-5 border-t border-gray-100'>
          <button
            type='button'
            onClick={handleLogout}
            className='w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-red-600 hover:bg-red-50 transition font-semibold'
          >
            <LogOut size={20} />

            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ==================================================
          MAIN CONTENT
      ================================================== */}

      <main className='lg:ml-72'>
        <div className='max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-6 sm:py-8'>
          {/* ==================================================
              HEADER
          ================================================== */}

          <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8'>
            <div>
              <p className='text-yellow-500 font-bold uppercase tracking-wider text-sm'>
                Administration
              </p>

              <h1 className='text-3xl sm:text-4xl font-extrabold text-gray-900 mt-1'>
                Pending Drivers
              </h1>

              <p className='text-gray-500 mt-2'>
                Manage pending driver approval requests.
              </p>
            </div>

            <div className='flex items-center gap-3'>
              {/* REFRESH */}

              <button
                type='button'
                onClick={loadPendingDrivers}
                disabled={loading}
                className='bg-white border border-gray-200 hover:bg-gray-50 px-5 py-3 rounded-xl font-semibold text-gray-700 flex items-center gap-2 transition shadow-sm disabled:opacity-50'
              >
                <RefreshCw
                  size={18}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>

              {/* ACCOUNT */}

              <div className='hidden sm:flex items-center gap-3 bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-3'>
                <div className='w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center'>
                  <ShieldCheck size={21} className='text-yellow-600' />
                </div>

                <div>
                  <p className='text-xs text-gray-500'>Account</p>

                  <p className='font-bold text-gray-900'>Administrator</p>
                </div>
              </div>
            </div>
          </div>

          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (
            <div className='mb-6 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-start gap-3'>
              <XCircle size={21} className='text-red-500 mt-0.5 shrink-0' />

              <div className='flex-1'>
                <p className='font-semibold text-red-700'>
                  Something went wrong
                </p>

                <p className='text-sm text-red-600 mt-1'>{error}</p>
              </div>

              <button
                type='button'
                onClick={() => setError("")}
                className='text-red-400 hover:text-red-600'
              >
                <X size={18} />
              </button>
            </div>
          )}

          {/* ==================================================
              PENDING DRIVER SECTION
          ================================================== */}

          <section className='bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden'>
            {/* SECTION HEADER */}

            <div className='p-5 sm:p-7 border-b border-gray-100'>
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                <div>
                  <div className='flex items-center gap-3'>
                    <h2 className='text-2xl font-bold text-gray-900'>
                      Pending Driver Requests
                    </h2>

                    <span className='bg-yellow-100 text-yellow-700 text-sm font-bold px-3 py-1 rounded-full'>
                      {drivers.length}
                    </span>
                  </div>

                  <p className='text-gray-500 mt-1'>
                    Review and approve new driver registrations.
                  </p>
                </div>
              </div>
            </div>

            {/* DRIVER CONTENT */}

            <div className='p-5 sm:p-7'>
              {loading ? (
                <LoadingState />
              ) : drivers.length === 0 ? (
                <EmptyState />
              ) : (
                <div className='grid grid-cols-1 xl:grid-cols-2 gap-5'>
                  {drivers.map((driver) => {
                    const driverId = getDriverId(driver);

                    return (
                      <DriverCard
                        key={driverId}
                        driver={driver}
                        driverName={getDriverName(driver)}
                        email={getEmail(driver)}
                        phone={getPhone(driver)}
                        vehicleType={getVehicleType(driver)}
                        vehicleNumber={getVehicleNumber(driver)}
                        licenseNumber={getLicenseNumber(driver)}
                        loading={actionLoading === driverId}
                        onApprove={handleApprove}
                        onReject={handleReject}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

// ======================================================
// DRIVER CARD
// ======================================================

function DriverCard({
  driver,
  driverName,
  email,
  phone,
  vehicleType,
  vehicleNumber,
  licenseNumber,
  loading,
  onApprove,
  onReject,
}) {
  return (
    <div className='border border-gray-200 rounded-2xl p-5 hover:shadow-md transition bg-gray-50/50'>
      {/* DRIVER HEADER */}

      <div className='flex items-start justify-between gap-4'>
        <div className='flex items-center gap-4 min-w-0'>
          <div className='w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center shrink-0'>
            <span className='text-lg font-extrabold text-gray-900'>
              {driverName.charAt(0).toUpperCase()}
            </span>
          </div>

          <div className='min-w-0'>
            <h3 className='text-lg font-bold text-gray-900 truncate'>
              {driverName}
            </h3>

            <div className='flex items-center gap-2 mt-1'>
              <Clock size={14} className='text-yellow-600' />

              <span className='text-sm text-yellow-700 font-semibold'>
                Pending Approval
              </span>
            </div>
          </div>
        </div>

        <span className='shrink-0 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold'>
          Pending
        </span>
      </div>

      {/* DETAILS */}

      <div className='mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3'>
        <DetailItem icon={<Mail size={17} />} label='Email' value={email} />

        <DetailItem icon={<Phone size={17} />} label='Phone' value={phone} />

        <DetailItem
          icon={<Car size={17} />}
          label='Vehicle'
          value={vehicleType}
        />

        <DetailItem
          icon={<CreditCard size={17} />}
          label='Vehicle Number'
          value={vehicleNumber}
        />

        <DetailItem
          icon={<CreditCard size={17} />}
          label='License Number'
          value={licenseNumber}
        />
      </div>

      {/* BUTTONS */}

      <div className='mt-5 pt-5 border-t border-gray-200 flex flex-col sm:flex-row gap-3'>
        <button
          type='button'
          disabled={loading}
          onClick={() => onApprove(driver)}
          className='flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {loading ? (
            <span className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
          ) : (
            <Check size={18} />
          )}

          {loading ? "Processing..." : "Approve Driver"}
        </button>

        <button
          type='button'
          disabled={loading}
          onClick={() => onReject(driver)}
          className='flex-1 bg-white border border-red-200 hover:bg-red-50 text-red-600 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed'
        >
          <Ban size={18} />
          Reject
        </button>
      </div>
    </div>
  );
}

// ======================================================
// DETAIL ITEM
// ======================================================

function DetailItem({ icon, label, value }) {
  return (
    <div className='bg-white rounded-xl p-3 border border-gray-100'>
      <div className='flex items-center gap-2 text-gray-400'>
        {icon}

        <span className='text-xs font-medium'>{label}</span>
      </div>

      <p className='text-sm font-semibold text-gray-800 mt-1 truncate'>
        {value}
      </p>
    </div>
  );
}

// ======================================================
// LOADING STATE
// ======================================================

function LoadingState() {
  return (
    <div className='py-16 flex flex-col items-center justify-center text-center'>
      <div className='w-12 h-12 rounded-full border-4 border-yellow-400 border-t-transparent animate-spin' />

      <h3 className='text-xl font-bold text-gray-900 mt-6'>
        Loading Pending Drivers...
      </h3>

      <p className='text-gray-500 mt-2'>Fetching driver approval requests.</p>
    </div>
  );
}

// ======================================================
// EMPTY STATE
// ======================================================

function EmptyState() {
  return (
    <div className='py-16 flex flex-col items-center justify-center text-center'>
      <div className='w-20 h-20 rounded-full bg-green-100 flex items-center justify-center'>
        <CheckCircle size={38} className='text-green-500' />
      </div>

      <h3 className='text-2xl font-bold text-gray-900 mt-6'>
        No Pending Drivers
      </h3>

      <p className='text-gray-500 mt-2 max-w-md'>
        All driver registration requests have been reviewed. There are currently
        no drivers waiting for approval.
      </p>
    </div>
  );
}

export default PendingDrivers;
