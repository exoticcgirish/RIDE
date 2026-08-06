import { useEffect, useState } from "react";
import {
  Car,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  User,
  LogOut,
} from "lucide-react";

import { getDriverProfile } from "../../services/driverApi";

function DriverDashboard({ onLogout }) {
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDriver();
  }, []);

  const loadDriver = async () => {
    try {
      const res = await getDriverProfile();
      setDriver(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        Loading...
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-100'>
      {/* Header */}

      <div className='bg-black text-white p-6 flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold'>Driver Dashboard</h1>

          <p className='text-gray-400'>Welcome {driver.full_name}</p>
        </div>

        <button onClick={onLogout} className='bg-red-500 px-5 py-2 rounded-lg'>
          <LogOut size={18} />
        </button>
      </div>

      <div className='max-w-6xl mx-auto p-6'>
        {/* Profile */}

        <div className='bg-white rounded-xl shadow p-6 mb-6'>
          <div className='flex items-center gap-4'>
            <User size={40} />

            <div>
              <h2 className='text-2xl font-bold'>{driver.full_name}</h2>

              <p>{driver.email}</p>

              <p>{driver.phone}</p>
            </div>
          </div>
        </div>

        {/* Approval Status */}

        <div className='bg-white rounded-xl shadow p-6'>
          <h2 className='text-xl font-bold mb-5'>Account Status</h2>

          {driver.approvalStatus === "pending" && (
            <div className='bg-yellow-100 border border-yellow-400 rounded-lg p-5'>
              <div className='flex gap-3 items-center'>
                <Clock />

                <div>
                  <h3 className='font-bold'>Pending Approval</h3>

                  <p>Your account is waiting for admin approval.</p>
                </div>
              </div>
            </div>
          )}

          {driver.approvalStatus === "approved" && (
            <div className='bg-green-100 border border-green-400 rounded-lg p-5'>
              <div className='flex gap-3 items-center'>
                <CheckCircle />

                <div>
                  <h3 className='font-bold'>Approved</h3>

                  <p>Your account is verified.</p>
                </div>
              </div>
            </div>
          )}

          {driver.approvalStatus === "rejected" && (
            <div className='bg-red-100 border border-red-400 rounded-lg p-5'>
              <div className='flex gap-3 items-center'>
                <XCircle />

                <div>
                  <h3 className='font-bold'>Rejected</h3>

                  <p>{driver.rejectReason}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Driver Features */}

        <div className='grid md:grid-cols-3 gap-6 mt-8'>
          <button
            disabled={driver.approvalStatus !== "approved"}
            className={`rounded-xl p-8 shadow text-center ${
              driver.approvalStatus === "approved"
                ? "bg-yellow-400 hover:bg-yellow-500"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            <Search size={40} className='mx-auto mb-3' />

            <h2 className='text-xl font-bold'>Search Riders</h2>
          </button>

          <button
            disabled={driver.approvalStatus !== "approved"}
            className={`rounded-xl p-8 shadow text-center ${
              driver.approvalStatus === "approved" ? "bg-white" : "bg-gray-300"
            }`}
          >
            <Car size={40} className='mx-auto mb-3' />

            <h2 className='text-xl font-bold'>Current Trip</h2>
          </button>

          <button
            disabled={driver.approvalStatus !== "approved"}
            className={`rounded-xl p-8 shadow text-center ${
              driver.approvalStatus === "approved" ? "bg-white" : "bg-gray-300"
            }`}
          >
            <Clock size={40} className='mx-auto mb-3' />

            <h2 className='text-xl font-bold'>Trip History</h2>
          </button>
        </div>
      </div>
    </div>
  );
}

export default DriverDashboard;
