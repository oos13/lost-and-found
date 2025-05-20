import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function AdminDashboard() {
  const token = localStorage.getItem('token');
  const [stats, setStats] = useState({});
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/claims/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, );

  const {
    totalClaims = 0,
    totalApproved = 0,
    totalRejected = 0,
    totalContested = 0,
    claimsPerDay = []
  } = stats;

  const filteredClaims = claimsPerDay.filter(day => {
    if (!dateRange.start && !dateRange.end) return true;
    const date = new Date(day.date);
    const startDate = dateRange.start ? new Date(dateRange.start) : null;
    const endDate = dateRange.end ? new Date(dateRange.end) : null;
    return (!startDate || date >= startDate) && (!endDate || date <= endDate);
  });

  const chartData = {
    labels: filteredClaims.map(d => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Claims Per Day',
        data: filteredClaims.map(d => d.count),
        backgroundColor: '#6a1b9a',
      },
    ],
  };

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="container mt-4 mb-5">
      <h2 className="mb-4">Admin Dashboard</h2>

      <div className="row mb-4 text-center">
        <div className="col-md-3 mb-3">
          <div className="card p-3 shadow-sm">
            <h6>Total Claims</h6>
            <h3>{totalClaims}</h3>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card p-3 shadow-sm">
            <h6>Approved Claims</h6>
            <h3>{totalApproved}</h3>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card p-3 shadow-sm">
            <h6>Rejected Claims</h6>
            <h3>{totalRejected}</h3>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card p-3 shadow-sm">
            <h6>Contested Claims</h6>
            <h3>{totalContested}</h3>
          </div>
        </div>
      </div>

      <h4 className="mb-3">Claims Over Time</h4>

      <div className="row mb-3 align-items-end">
        <div className="col-md-3 mb-2">
          <label>From</label>
          <input
            type="date"
            className="form-control"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
          />
        </div>
        <div className="col-md-3 mb-2">
          <label>To</label>
          <input
            type="date"
            className="form-control"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
          />
        </div>
      </div>

      <div className="card p-3 shadow-sm">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}

export default AdminDashboard;
