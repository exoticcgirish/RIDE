function AdminDashboard({ user, onLogout }) {
  return (
    <div className='dashboard'>
      <header className='dashboard-header'>
        <h1>Admin Dashboard</h1>
        <div className='header-right'>
          <button>🔔</button>
          <button>👤</button>
        </div>
      </header>
      <section className='welcome-card'>
        <h2>Welcome, {user.name}</h2>
        <p>Admin controls and system overview.</p>
      </section>
      <section className='admin-panel'>
        <button>Users</button>
        <button>Reports</button>
        <button>Settings</button>
      </section>
      <button className='logout-btn' onClick={onLogout}>
        Logout
      </button>
    </div>
  );
}

export default AdminDashboard;
