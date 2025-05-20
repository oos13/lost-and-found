import React, { useEffect, useState } from 'react';
import axios from 'axios';

function UserClaims() {
  const [claims, setClaims] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClaims = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to view your claims.');
        return;
      }

      try {
        const res = await axios.get('/api/claims/my', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setClaims(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load claims. Please try again.');
      }
    };

    fetchClaims();
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Your Submitted Claims</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card p-3 shadow-sm mt-3">
        {claims.length === 0 && !error ? (
          <p>You haven't submitted any claims yet.</p>
        ) : (
          <ul className="list-group">
            {claims.map((claim) => (
              <li key={claim._id} className="list-group-item">
                <strong>Item:</strong> {claim.item?.type} - {claim.item?.color}<br />
                <strong>Status:</strong> {claim.status}<br />
                <strong>Submitted:</strong> {new Date(claim.createdAt).toLocaleDateString()}<br />
                <strong>Details:</strong> {claim.description}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default UserClaims;
