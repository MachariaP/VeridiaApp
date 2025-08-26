import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './styles/Login.css';

function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProtectedData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('/api/protected', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(response.data);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to fetch protected data');
      }
    };
    fetchProtectedData();
  }, []);

  const user = JSON.parse(localStorage.getItem('user')) || {};

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M9 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V15M7 7H17M7 11H17M7 15H13"
              stroke="#4776E6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h1>Project Planner</h1>
        </div>
        <h2>Welcome, {user.name || 'User'}!</h2>
        {error && <p className="error">{error}</p>}
        {data && <p>{data.message}</p>}
        <button
          className="login-btn"
          onClick={() => {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
