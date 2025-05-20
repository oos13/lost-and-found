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

  const filteredClaims = claimsPerDay.filter(({ date }) => {
    if (!dateRange.start && !dateRange.end) return true;
    const d = new Date(date);
    const afterStart = dateRange.start ? d >= new Date(dateRange.start) : true;
    const beforeEnd = dateRange.end ? d <= new Date(dateRange.end) : true;
    return afterStart && beforeEnd;
  });

  const chartData = {
    labels: filteredClaims.map(c => new Date(c.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Claims Per Day',
        data: filteredClaims.map(c => c.count),
        backgroundColor: '#0d6efd',
      }
    ]
  };

  return (
    <div className="container mt-4">
      <h2>Admin Dashboard</h2>

      <div className="row my-4">
        {[
          { label: 'Total Claims', value: totalClaims },
          { label: 'Approved Claims', value: totalApproved },
          { label: 'Rejected Claims', value: totalRejected },
          { label: 'Contested Claims', value: totalContested }
        ].map(({ label, value }, idx) => (
          <div className="col-md-3" key={idx}>
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title">{label}</h5>
                <p className="card-text fs-4">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-3">
        <h4>Claims Over Time</h4>
        <div className="row g-3 align-items-center mb-3">
          <div className="col-auto">
            <label className="col-form-label">From</label>
          </div>
          <div className="col-auto">
            <input
              type="date"
              className="form-control"
              value={dateRange.start}
              onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
            />
          </div>
          <div className="col-auto">
            <label className="col-form-label">To</label>
          </div>
          <div className="col-auto">
            <input
              type="date"
              className="form-control"
              value={dateRange.end}
              onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
            />
          </div>
        </div>
        <Bar data={chartData} />
      </div>
    </div>
  );
}

export default AdminDashboard;
