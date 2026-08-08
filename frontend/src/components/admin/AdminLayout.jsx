import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Clock,
  UserCheck,
  UserX,
  GraduationCap,
  Car,
  BarChart3,
  Settings,
  LogOut,
  ShieldCheck,
} from "lucide-react";

function AdminLayout({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    if (onLogout) {
      onLogout();
    }

    navigate("/login", { replace: true });
  };

  return (
    <div className='min-h-screen bg-gray-100'>
      {/* Sidebar */}

      <aside className='fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-gray-200 flex flex-col'>
        {/* Logo */}

        <div className='px-7 py-7 border-b border-gray-100'>
          <h1 className='text-3xl font-extrabold'>
            Ride<span className='text-yellow-500'>Link</span>
          </h1>

          <p className='text-sm text-gray-500 mt-1'>Administration Panel</p>
        </div>

        {/* Menu */}

        <nav className='flex-1 p-5 space-y-2 overflow-y-auto'>
          {menu.map((item) => {
            const Icon = item.icon;

            const active = location.pathname === item.path;

            return (
              <button
                key={item.path}
                type='button'
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition text-left ${
                  active
                    ? "bg-yellow-400 text-gray-900 font-bold"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon size={22} />

                <span>{item.title}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}

        <div className='p-5 border-t border-gray-100'>
          <button
            type='button'
            onClick={handleLogout}
            className='w-full flex items-center gap-4 px-5 py-4 rounded-xl text-red-600 hover:bg-red-50 font-semibold transition'
          >
            <LogOut size={22} />
            Logout
          </button>
        </div>
      </aside>

      {/* Page */}

      <main className='ml-72 min-h-screen'>
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
