import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import {
  Users,
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
  MapPin,
  CalendarDays,
  Ban,
} from "lucide-react";

import { getRejectedDrivers } from "../../services/adminApi";

function RejectedDrivers({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const loadRejectedDrivers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getRejectedDrivers();

      console.log("Rejected drivers API response:", response);

      const data = response?.data?.data;

      if (Array.isArray(data)) {
        setDrivers(data);
      } else if (Array.isArray(response?.data)) {
        setDrivers(response.data);
      } else {
        setDrivers([]);
      }
    } catch (err) {
      console.error("Rejected drivers error:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to load rejected drivers. Please try again.",
      );

      setDrivers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRejectedDrivers();
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    setMobileMenuOpen(false);

    if (onLogout) {
      onLogout();
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getDriverName = (driver) => {
    return (
      driver?.full_name ||
      driver?.fullName ||
      driver?.name ||
      driver?.username ||
      driver?.user?.full_name ||
      driver?.user?.fullName ||
      driver?.user?.name ||
      driver?.user?.username ||
      "Unknown Driver"
    );
  };

  const getDriverEmail = (driver) => {
    return driver?.email || driver?.user?.email || "Not provided";
  };

  const getDriverPhone = (driver) => {
    return (
      driver?.phone ||
      driver?.mobile ||
      driver?.mobileNumber ||
      driver?.phoneNumber ||
      driver?.user?.phone ||
      driver?.user?.mobile ||
      "Not provided"
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

  const getRejectionReason = (driver) => {
    return (
      driver?.rejectionReason ||
      driver?.rejection_reason ||
      driver?.rejectReason ||
      driver?.reject_reason ||
      driver?.reason ||
      "No rejection reason provided"
    );
  };

  const getRejectedDate = (driver) => {
    const date =
      driver?.rejectedAt ||
      driver?.rejected_at ||
      driver?.updatedAt ||
      driver?.updated_at ||
      driver?.createdAt ||
      driver?.created_at;

    if (!date) {
      return "Not available";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className='min-h-screen bg-gray-100'>
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

      <aside className='hidden lg:flex fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-gray-200 flex-col z-40'>
        <div className='px-7 py-7 border-b border-gray-100'>
          <h1 className='text-3xl font-extrabold text-gray-900'>
            Ride<span className='text-yellow-500'>Link</span>
          </h1>

          <p className='text-sm text-gray-500 mt-1'>Administration Panel</p>
        </div>

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

      <main className='lg:ml-72'>
        <div className='max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-6 sm:py-8'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8'>
            <div>
              <p className='text-red-500 font-bold uppercase tracking-wider text-sm'>
                Administration
              </p>

              <h1 className='text-3xl sm:text-4xl font-extrabold text-gray-900 mt-1'>
                Rejected Drivers
              </h1>

              <p className='text-gray-500 mt-2'>
                View driver applications that were rejected.
              </p>
            </div>

            <div className='flex items-center gap-3'>
              <button
                type='button'
                onClick={loadRejectedDrivers}
                disabled={loading}
                className='bg-white border border-gray-200 hover:bg-gray-50 px-5 py-3 rounded-xl font-semibold text-gray-700 flex items-center gap-2 transition shadow-sm disabled:opacity-50'
              >
                <RefreshCw
                  size={18}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>

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

          <div className='bg-white rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-6 mb-8'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-500'>
                  Total Rejected Drivers
                </p>

                <h2 className='text-3xl font-extrabold text-gray-900 mt-2'>
                  {loading ? "..." : drivers.length}
                </h2>
              </div>

              <div className='w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center'>
                <XCircle size={28} />
              </div>
            </div>
          </div>

          <section className='bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden'>
            <div className='p-5 sm:p-7 border-b border-gray-100'>
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                <div>
                  <div className='flex items-center gap-3'>
                    <h2 className='text-2xl font-bold text-gray-900'>
                      Rejected Driver Applications
                    </h2>

                    <span className='bg-red-100 text-red-700 text-sm font-bold px-3 py-1 rounded-full'>
                      {drivers.length}
                    </span>
                  </div>

                  <p className='text-gray-500 mt-1'>
                    All driver applications currently marked as rejected.
                  </p>
                </div>
              </div>
            </div>

            <div className='p-5 sm:p-7'>
              {loading ? (
                <LoadingState />
              ) : drivers.length === 0 ? (
                <EmptyState />
              ) : (
                <div className='grid grid-cols-1 xl:grid-cols-2 gap-5'>
                  {drivers.map((driver) => (
                    <RejectedDriverCard
                      key={driver?._id || driver?.id}
                      driver={driver}
                      driverName={getDriverName(driver)}
                      email={getDriverEmail(driver)}
                      phone={getDriverPhone(driver)}
                      vehicleType={getVehicleType(driver)}
                      vehicleNumber={getVehicleNumber(driver)}
                      licenseNumber={getLicenseNumber(driver)}
                      rejectionReason={getRejectionReason(driver)}
                      rejectedDate={getRejectedDate(driver)}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function RejectedDriverCard({
  driver,
  driverName,
  email,
  phone,
  vehicleType,
  vehicleNumber,
  licenseNumber,
  rejectionReason,
  rejectedDate,
}) {
  return (
    <div className='border border-gray-200 rounded-2xl p-5 hover:shadow-md transition bg-gray-50/50'>
      <div className='flex items-start justify-between gap-4'>
        <div className='flex items-center gap-4 min-w-0'>
          <div className='w-12 h-12 rounded-full bg-red-500 flex items-center justify-center shrink-0'>
            <span className='text-lg font-extrabold text-white'>
              {driverName.charAt(0).toUpperCase()}
            </span>
          </div>

          <div className='min-w-0'>
            <h3 className='text-lg font-bold text-gray-900 truncate'>
              {driverName}
            </h3>

            <div className='flex items-center gap-2 mt-1'>
              <Ban size={14} className='text-red-600' />

              <span className='text-sm text-red-700 font-semibold'>
                Rejected Driver
              </span>
            </div>
          </div>
        </div>

        <span className='shrink-0 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold'>
          Rejected
        </span>
      </div>

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

        <DetailItem
          icon={<CalendarDays size={17} />}
          label='Rejected'
          value={rejectedDate}
        />

        {driver?.city && (
          <DetailItem
            icon={<MapPin size={17} />}
            label='City'
            value={driver.city}
          />
        )}
      </div>

      <div className='mt-5 pt-5 border-t border-gray-200'>
        <div className='bg-red-50 border border-red-100 rounded-xl p-4'>
          <div className='flex items-center gap-2'>
            <Ban size={17} className='text-red-600' />

            <span className='text-sm font-bold text-red-700'>
              Rejection Reason
            </span>
          </div>

          <p className='text-sm text-red-700 mt-2 break-words'>
            {rejectionReason}
          </p>
        </div>
      </div>
    </div>
  );
}

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

function LoadingState() {
  return (
    <div className='py-16 flex flex-col items-center justify-center text-center'>
      <div className='w-12 h-12 rounded-full border-4 border-yellow-400 border-t-transparent animate-spin' />

      <h3 className='text-xl font-bold text-gray-900 mt-6'>
        Loading Rejected Drivers...
      </h3>

      <p className='text-gray-500 mt-2'>Fetching rejected driver records.</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className='py-16 flex flex-col items-center justify-center text-center'>
      <div className='w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center'>
        <Users size={38} className='text-gray-400' />
      </div>

      <h3 className='text-2xl font-bold text-gray-900 mt-6'>
        No Rejected Drivers
      </h3>

      <p className='text-gray-500 mt-2 max-w-md'>
        There are currently no rejected driver applications in the system.
      </p>
    </div>
  );
}

export default RejectedDrivers;
