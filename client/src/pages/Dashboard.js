import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [claims, setClaims] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClaims = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const response = await axios.get('http://localhost:5000/api/claims/my', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClaims(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchClaims();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Claims</h2>
        <button className="btn btn-outline-danger" onClick={handleLogout}>Logout</button>
      </div>
      {claims.length === 0 ? (
        <p>You haven't submitted any claims yet.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead className="thead-light">
              <tr>
                <th>Item Type</th>
                <th>Color</th>
                <th>Brand</th>
                <th>Status</th>
                <th>Match Score</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => (
                <tr key={claim._id}>
                  <td>{claim.type}</td>
                  <td>{claim.color}</td>
                  <td>{claim.brand}</td>
                  <td>{claim.status}</td>
                  <td>{claim.matchScore || 'N/A'}</td>
                  <td>{new Date(claim.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Dashboard;


  