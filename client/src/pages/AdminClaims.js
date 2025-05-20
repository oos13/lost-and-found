import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

function AdminClaims() {
  const [claims, setClaims] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedClaimId, setExpandedClaimId] = useState(null);
  const token = localStorage.getItem('token');

  const fetchClaims = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/claims${statusFilter ? `?status=${statusFilter}` : ''}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setClaims(res.data);
    } catch (err) {
      console.error('Failed to fetch claims:', err);
    }
  }, [statusFilter, token]);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const handleExpand = (id) => {
    setExpandedClaimId((prevId) => (prevId === id ? null : id));
  };

  const updateStatus = async (id, decision) => {
    try {
      await axios.put(`http://localhost:5000/api/claims/${id}/decision`, { decision }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchClaims();
    } catch (err) {
      console.error(`Failed to update claim:`, err);
    }
  };

  const confirmPickup = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/claims/${id}/pickup`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchClaims();
    } catch (err) {
      console.error('Failed to confirm pickup:', err);
    }
  };

  return (
    <div className="container mt-4">
      <h2>All Claims (Admin View)</h2>

      <div className="btn-group mb-3" role="group">
        {['', 'pending', 'approved', 'rejected', 'contested'].map((status) => (
          <button
            key={status}
            className={`btn btn-outline-primary ${statusFilter === status ? 'active' : ''}`}
            onClick={() => setStatusFilter(status)}
          >
            {status === '' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>User</th>
            <th>Item Type</th>
            <th>Color</th>
            <th>Brand</th>
            <th>Status</th>
            <th>Match Score</th>
            <th>Submitted</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {claims.map((claim) => (
            <React.Fragment key={claim._id}>
              <tr>
                <td>{claim.user?.fullName || 'Unknown'}</td>
                <td>{claim.type}</td>
                <td>{claim.color}</td>
                <td>{claim.brand}</td>
                <td>{claim.status}</td>
                <td>{claim.matchScore ?? 'N/A'}</td>
                <td>{new Date(claim.createdAt).toLocaleString()}</td>
                <td>
                  <button className="btn btn-sm btn-link" onClick={() => handleExpand(claim._id)}>
                    {expandedClaimId === claim._id ? 'Hide' : 'Details'}
                  </button>
                </td>
              </tr>
              {expandedClaimId === claim._id && (
                <tr>
                  <td colSpan="8">
                    <div className="p-3 bg-light rounded">
                      <p><strong>Size:</strong> {claim.size}</p>
                      <p><strong>Serial Number:</strong> {claim.serialNumber || '—'}</p>
                      <p><strong>Location Lost:</strong> {claim.locationLost}</p>
                      <p><strong>Tags:</strong> {claim.tags?.join(', ') || '—'}</p>
                      <p><strong>Details:</strong> {claim.details}</p>
                      {claim.item && (
                        <>
                          <hr />
                          <p><strong>Matched Item:</strong></p>
                          <p><strong>Found at:</strong> {claim.item.locationFound}</p>
                          <p><strong>Found on:</strong> {new Date(claim.item.dateFound).toLocaleDateString()}</p>
                        </>
                      )}

                      {/* Pending status: show decision buttons */}
                      {claim.status === 'pending' && (
                        <div className="mt-3">
                          <button className="btn btn-success btn-sm me-2" onClick={() => updateStatus(claim._id, 'approved')}>Approve</button>
                          <button className="btn btn-danger btn-sm me-2" onClick={() => updateStatus(claim._id, 'rejected')}>Reject</button>
                          <button className="btn btn-warning btn-sm" onClick={() => updateStatus(claim._id, 'contested')}>Contest</button>
                        </div>
                      )}

                      {/* Approved but not picked up: show pickup button */}
                      {claim.status === 'approved' && !claim.pickedUp && (
                        <div className="mt-3">
                          <button className="btn btn-outline-success btn-sm" onClick={() => confirmPickup(claim._id)}>
                            Confirm Pickup
                          </button>
                        </div>
                      )}

                      {/* Already picked up */}
                      {claim.pickedUp && (
                        <p className="text-success mt-3">
                          ✅ Item picked up on {new Date(claim.pickedUpAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminClaims;








