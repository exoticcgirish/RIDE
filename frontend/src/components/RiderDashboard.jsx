function RiderDashboard({ user, onLogout }) {
  return (
    <div className='dashboard'>
      <header className='dashboard-header'>
        <h1>RideLink</h1>

        <div className='header-right'>
          <button>🔔</button>
          <button>👤</button>
        </div>
      </header>
      <section className='welcome-card'>
        <h2>Welcome, {user.name}</h2>
        <p>Book your next shared ride in seconds.</p>
      </section>

      <section className='ride-search'>
        <h3>Find Shared Ride</h3>

        <input type='text' placeholder='Pickup Location' />

        <input type='text' placeholder='Destination' />

        <input type='time' />

        <button>Find Ride</button>
      </section>
      <section className='active-ride'>
        <h3>Current Ride</h3>

        <p>No active ride</p>
      </section>
      <section className='quick-grid'>
        <button>Ride History</button>

        <button>Saved Places</button>

        <button>Notifications</button>

        <button>Profile</button>
      </section>
      <button className='logout-btn' onClick={onLogout}>
        Logout
      </button>
    </div>
  );
}

export default RiderDashboard;
