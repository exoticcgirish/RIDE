function DriverDashboard({ user, onLogout }) {
  return (
    <div className='dashboard'>
      <header className='dashboard-header'>
        <h1>Driver Dashboard</h1>
        <div className='header-right'>
          <button>🔔</button>
          <button>👤</button>
        </div>
      </header>
      <section className='welcome-card'>
        <h2>Welcome, {user.name}</h2>
        <p>View assigned rides and accept requests.</p>
      </section>
      <section className='active-ride'>
        <h3>Assigned Rides</h3>
        <p>No assigned rides</p>
      </section>
      <button className='logout-btn' onClick={onLogout}>
        Logout
      </button>
    </div>
  );
}

export default DriverDashboard;
