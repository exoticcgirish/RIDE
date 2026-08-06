function DriverDashboard({ user, onLogout }) {
  return (
    <div className='dashboard'>
      {/* Header */}
      <header className='dashboard-header'>
        <h1>🚖 Driver Dashboard</h1>

        <div className='header-right'>
          <button>🔔 Notifications</button>
          <button>👤 {user.name}</button>
        </div>
      </header>

      {/* Welcome */}
      <section className='welcome-card'>
        <h2>Welcome, {user.name}</h2>
        <p>Drive safely and earn more today.</p>
      </section>

      {/* Quick Actions */}
      <section className='quick-actions'>
        <h3>Quick Actions</h3>

        <button>🚗 Add Vehicle</button>
        <button>🛣 Create Ride</button>
        <button>📍 Go Online</button>
      </section>

      {/* Active Ride */}
      <section className='active-ride'>
        <h3>Current Ride</h3>

        <p>No Active Ride</p>

        <button>▶ Start Ride</button>
        <button>✔ Complete Ride</button>
      </section>

      {/* Ride Requests */}
      <section className='ride-requests'>
        <h3>Ride Requests</h3>

        <p>No Pending Requests</p>

        {/* Example */}
        {/* <div>
          Rahul - College
          <button>Accept</button>
          <button>Reject</button>
        </div> */}
      </section>

      {/* Passengers */}
      <section className='passengers'>
        <h3>Passengers</h3>

        <p>No Passengers</p>
      </section>

      {/* Earnings */}
      <section className='earnings'>
        <h3>Earnings</h3>

        <p>Today : ₹0</p>
        <p>This Week : ₹0</p>
        <p>Total : ₹0</p>
      </section>

      {/* Statistics */}
      <section className='stats'>
        <h3>Statistics</h3>

        <p>Total Trips : 0</p>
        <p>Completed Trips : 0</p>
        <p>Rating : ⭐ 5.0</p>
      </section>

      {/* Driver Menu */}
      <section className='driver-menu'>
        <h3>Driver Options</h3>

        <button>👤 My Profile</button>
        <button>🚗 My Vehicle</button>
        <button>📜 Ride History</button>
        <button>💰 Wallet</button>
        <button>⚙ Settings</button>
        <button>❓ Help</button>
      </section>

      {/* Logout */}
      <button className='logout-btn' onClick={onLogout}>
        Logout
      </button>
    </div>
  );
}

export default DriverDashboard;
