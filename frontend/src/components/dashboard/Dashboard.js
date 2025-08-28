import React from 'react';
import '../../styles/Dashboard.css';

function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Project Planner Dashboard</h1>
          <div className="user-menu">
            <div className="user-info">
              <div className="user-avatar">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span>{user?.name || 'User'}</span>
            </div>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>
      <main className="dashboard-content">
        <section className="welcome-section">
          <h2>Welcome back, {user?.name || 'User'}!</h2>
          <p>Here's what's happening with your projects today.</p>
        </section>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Projects</h3>
            <div className="stat-value">12</div>
          </div>
          <div className="stat-card">
            <h3>Completed</h3>
            <div className="stat-value">8</div>
          </div>
          <div className="stat-card">
            <h3>In Progress</h3>
            <div className="stat-value">3</div>
          </div>
          <div className="stat-card">
            <h3>Pending</h3>
            <div className="stat-value">1</div>
          </div>
        </div>
        <section className="recent-activities">
          <h2>Recent Activities</h2>
          <ul className="activity-list">
            <li className="activity-item">
              <div className="activity-icon">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                </svg>
              </div>
              <div className="activity-content">
                <p>You created a new project "Website Redesign"</p>
                <div className="activity-time">2 hours ago</div>
              </div>
            </li>
            <li className="activity-item">
              <div className="activity-icon">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                </svg>
              </div>
              <div className="activity-content">
                <p>You completed the "Research" task</p>
                <div className="activity-time">5 hours ago</div>
              </div>
            </li>
            <li className="activity-item">
              <div className="activity-icon">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  <path d="M7.5 6.5A.5.5 0 0 1 8 6h4a.5.5 0 0 1 0 1H8a.5.5 0 0 1-.5-.5zm0 3A.5.5 0 0 1 8 9h4a.5.5 0 0 1 0 1H8a.5.5 0 0 1-.5-.5z"/>
                </svg>
              </div>
              <div className="activity-content">
                <p>You commented on "Mobile App Development" project</p>
                <div className="activity-time">Yesterday</div>
              </div>
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;