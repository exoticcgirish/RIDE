import { useEffect, useState } from "react";
import { Users, CheckCircle, Clock, XCircle } from "lucide-react";

import {
  getDashboardStats,
  getPendingDrivers,
  approveDriver,
  rejectDriver,
} from "../../services/adminApi";

function AdminDashboard({ onLogout }) {
  const menu = [
    {
      title: "Dashboard",
      icon: "📊",
      path: "/admin/dashboard",
    },
    {
      title: "Pending Drivers",
      icon: "⏳",
      path: "/admin/pending-drivers",
    },
    {
      title: "Approved Drivers",
      icon: "✅",
      path: "/admin/approved-drivers",
    },
    {
      title: "Rejected Drivers",
      icon: "❌",
      path: "/admin/rejected-drivers",
    },
    {
      title: "Riders",
      icon: "👨‍🎓",
      path: "/admin/riders",
    },
    {
      title: "Trips",
      icon: "🚕",
      path: "/admin/trips",
    },
    {
      title: "Reports",
      icon: "📈",
      path: "/admin/reports",
    },
    {
      title: "Settings",
      icon: "⚙️",
      path: "/admin/settings",
    },
  ];
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const statsRes = await getDashboardStats();
      const pendingRes = await getPendingDrivers();

      setStats(statsRes.data.data);
      setDrivers(pendingRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleApprove = async (id) => {
    try {
      await approveDriver(id);
      loadDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Reason for rejection");

    if (!reason) return;

    try {
      await rejectDriver(id, reason);
      loadDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className='min-h-screen bg-gray-100'>
      {/* Header */}

      <div className='bg-black text-white p-6 flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold'>Admin Dashboard</h1>

          <p className='text-gray-400'>Manage Driver Approvals</p>
        </div>

        <button onClick={onLogout} className='bg-red-500 px-5 py-2 rounded-lg'>
          Logout
        </button>
      </div>

      {/* Stats */}

      <div className='grid md:grid-cols-4 gap-5 p-6'>
        <StatCard
          title='Total Drivers'
          value={stats.total}
          icon={<Users size={28} />}
        />

        <StatCard
          title='Pending'
          value={stats.pending}
          icon={<Clock size={28} />}
        />

        <StatCard
          title='Approved'
          value={stats.approved}
          icon={<CheckCircle size={28} />}
        />

        <StatCard
          title='Rejected'
          value={stats.rejected}
          icon={<XCircle size={28} />}
        />
      </div>

      {/* Pending Drivers */}

      <div className='p-6'>
        <h2 className='text-2xl font-bold mb-5'>Pending Driver Requests</h2>

        {loading ? (
          <p>Loading...</p>
        ) : drivers.length === 0 ? (
          <div className='bg-white p-8 rounded-xl shadow'>
            No pending drivers.
          </div>
        ) : (
          <div className='space-y-5'>
            {drivers.map((driver) => (
              <div
                key={driver._id}
                className='bg-white rounded-xl shadow p-6 flex justify-between items-center'
              >
                <div>
                  <h3 className='text-xl font-bold'>{driver.full_name}</h3>

                  <p>{driver.email}</p>

                  <p>{driver.phone}</p>

                  <p>Vehicle : {driver.vehicleName}</p>

                  <p>Vehicle No : {driver.vehicleNumber}</p>
                </div>

                <div className='space-x-3'>
                  <button
                    onClick={() => handleApprove(driver._id)}
                    className='bg-green-500 text-white px-5 py-2 rounded-lg'
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => handleReject(driver._id)}
                    className='bg-red-500 text-white px-5 py-2 rounded-lg'
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className='bg-white rounded-xl shadow p-6'>
      <div className='flex justify-between'>
        <div>
          <p className='text-gray-500'>{title}</p>

          <h2 className='text-3xl font-bold mt-3'>{value}</h2>
        </div>

        {icon}
      </div>
    </div>
  );
}

export default AdminDashboard;
