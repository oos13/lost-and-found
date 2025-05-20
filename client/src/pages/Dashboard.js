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
        const response = await axios.get('/api/claims/my', {
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
    <div className="container mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">My Claims</h2>
        <button className="btn btn-outline-light" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="card p-3 shadow-sm mt-3">
        {claims.length === 0 ? (
          <p>You haven’t submitted any claims yet.</p>
        ) : (
          <ul className="list-group">
            {claims.map((claim) => (
              <li key={claim._id} className="list-group-item">
                <strong>Item:</strong> {claim.item?.type} - {claim.item?.color}<br />
                <strong>Status:</strong> {claim.status}<br />
                <strong>Submitted:</strong> {new Date(claim.createdAt).toLocaleDateString()}<br />
                <strong>Description:</strong> {claim.description}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
