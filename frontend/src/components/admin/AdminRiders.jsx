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
  CalendarDays,
  MapPin,
  RefreshCw,
} from "lucide-react";

import { getRiders } from "../../services/adminApi";

function AdminRiders({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [riders, setRiders] = useState([]);
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

  const loadRiders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getRiders();

      console.log("Riders API response:", response);

      const data =
        response?.data?.data ||
        response?.data?.riders ||
        response?.data ||
        [];

      setRiders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Riders error:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to load riders. Please try again.",
      );

      setRiders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRiders();
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

  const getRiderName = (rider) => {
    return (
      rider?.full_name ||
      rider?.fullName ||
      rider?.name ||
      rider?.username ||
      rider?.user?.full_name ||
      rider?.user?.fullName ||
      rider?.user?.name ||
      rider?.user?.username ||
      "Unknown Rider"
    );
  };

  const getRiderEmail = (rider) => {
    return (
      rider?.email ||
      rider?.user?.email ||
      "Not provided"
    );
  };

  const getRiderPhone = (rider) => {
    return (
      rider?.phone ||
      rider?.mobile ||
      rider?.phoneNumber ||
      rider?.mobileNumber ||
      rider?.user?.phone ||
      rider?.user?.mobile ||
      "Not provided"
    );
  };

  const getJoinedDate = (rider) => {
    const date =
      rider?.createdAt ||
      rider?.created_at ||
      rider?.registeredAt ||
      rider?.registered_at ||
      rider?.user?.createdAt;

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

  const getCity = (rider) => {
    return (
      rider?.city ||
      rider?.location?.city ||
      rider?.address?.city ||
      "Not provided"
    );
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

          <p className='text-sm text-gray-500 mt-1'>
            Administration Panel
          </p>
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
              <p className='text-yellow-500 font-bold uppercase tracking-wider text-sm'>
                Administration
              </p>

              <h1 className='text-3xl sm:text-4xl font-extrabold text-gray-900 mt-1'>
                Riders
              </h1>

              <p className='text-gray-500 mt-2'>
                View and manage all registered RideLink riders.
              </p>
            </div>

            <div className='flex items-center gap-3'>
              <button
                type='button'
                onClick={loadRiders}
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
                  <ShieldCheck
                    size={21}
                    className='text-yellow-600'
                  />
                </div>

                <div>
                  <p className='text-xs text-gray-500'>Account</p>

                  <p className='font-bold text-gray-900'>
                    Administrator
                  </p>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className='mb-6 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-start gap-3'>
              <XCircle
                size={21}
                className='text-red-500 mt-0.5 shrink-0'
              />

              <div className='flex-1'>
                <p className='font-semibold text-red-700'>
                  Something went wrong
                </p>

                <p className='text-sm text-red-600 mt-1'>
                  {error}
                </p>
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
                  Total Registered Riders
                </p>

                <h2 className='text-3xl font-extrabold text-gray-900 mt-2'>
                  {loading ? "..." : riders.length}
                </h2>
              </div>

              <div className='w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center'>
                <Users size={28} />
              </div>
            </div>
          </div>

          <section className='bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden'>
            <div className='p-5 sm:p-7 border-b border-gray-100'>
              <div className='flex items-center gap-3'>
                <h2 className='text-2xl font-bold text-gray-900'>
                  All Riders
                </h2>

                <span className='bg-blue-100 text-blue-700 text-sm font-bold px-3 py-1 rounded-full'>
                  {riders.length}
                </span>
              </div>

              <p className='text-gray-500 mt-1'>
                All riders currently registered on RideLink.
              </p>
            </div>

            <div className='p-5 sm:p-7'>
              {loading ? (
                <LoadingState />
              ) : riders.length === 0 ? (
                <EmptyState />
              ) : (
                <div className='grid grid-cols-1 xl:grid-cols-2 gap-5'>
                  {riders.map((rider) => (
                    <RiderCard
                      key={rider?._id || rider?.id}
                      rider={rider}
                      riderName={getRiderName(rider)}
                      email={getRiderEmail(rider)}
                      phone={getRiderPhone(rider)}
                      joinedDate={getJoinedDate(rider)}
                      city={getCity(rider)}
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

function RiderCard({
  rider,
  riderName,
  email,
  phone,
  joinedDate,
  city,
}) {
  return (
    <div className='border border-gray-200 rounded-2xl p-5 hover:shadow-md transition bg-gray-50/50'>
      <div className='flex items-start justify-between gap-4'>
        <div className='flex items-center gap-4 min-w-0'>
          <div className='w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center shrink-0'>
            <span className='text-lg font-extrabold text-white'>
              {riderName.charAt(0).toUpperCase()}
            </span>
          </div>

          <div className='min-w-0'>
            <h3 className='text-lg font-bold text-gray-900 truncate'>
              {riderName}
            </h3>

            <div className='flex items-center gap-2 mt-1'>
              <CheckCircle
                size={14}
                className='text-blue-600'
              />

              <span className='text-sm text-blue-700 font-semibold'>
                Registered Rider
              </span>
            </div>
          </div>
        </div>

        <span className='shrink-0 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold'>
          Rider
        </span>
      </div>

      <div className='mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3'>
        <DetailItem
          icon={<Mail size={17} />}
          label='Email'
          value={email}
        />

        <DetailItem
          icon={<Phone size={17} />}
          label='Phone'
          value={phone}
        />

        <DetailItem
          icon={<CalendarDays size={17} />}
          label='Registered'
          value={joinedDate}
        />

        <DetailItem
          icon={<MapPin size={17} />}
          label='City'
          value={city}
        />
      </div>

      <div className='mt-5 pt-5 border-t border-gray-200'>
        <div className='flex items-center justify-center gap-2 bg-blue-50 border border-blue-100 rounded-xl py-3'>
          <CheckCircle
            size={18}
            className='text-blue-600'
          />

          <span className='text-sm font-bold text-blue-700'>
            Rider account is active
          </span>
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

        <span className='text-xs font-medium'>
          {label}
        </span>
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
        Loading Riders...
      </h3>

      <p className='text-gray-500 mt-2'>
        Fetching registered rider records.
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className='py-16 flex flex-col items-center justify-center text-center'>
      <div className='w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center'>
        <Users size={38} className='text-blue-500' />
      </div>

      <h3 className='text-2xl font-bold text-gray-900 mt-6'>
        No Riders Found
      </h3>

      <p className='text-gray-500 mt-2 max-w-md'>
        There are currently no registered riders in the system.
      </p>
    </div>
  );
}

export default AdminRiders;