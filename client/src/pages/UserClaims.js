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
        const res = await axios.get('http://localhost:5000/api/claims/my', {
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
      <h2>Your Submitted Claims</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {claims.length === 0 && !error ? (
        <p>You haven't submitted any claims yet.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover mt-3">
            <thead className="table-light">
              <tr>
                <th>Status</th>
                <th>Item Type</th>
                <th>Color</th>
                <th>Brand</th>
                <th>Submitted On</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => (
                <tr key={claim._id}>
                  <td>{claim.status}</td>
                  <td>{claim.type}</td>
                  <td>{claim.color}</td>
                  <td>{claim.brand}</td>
                  <td>{new Date(claim.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default UserClaims;
