import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

function AdminClaims() {
  const [claims, setClaims] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedClaimId, setExpandedClaimId] = useState(null);
  const token = localStorage.getItem('token');

  const fetchClaims = useCallback(async () => {
    try {
      const res = await axios.get(`/api/claims${statusFilter ? `?status=${statusFilter}` : ''}`, {
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
      await axios.put(`/api/claims/${id}/decision`, { decision }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchClaims();
    } catch (err) {
      console.error(`Failed to ${decision} claim:`, err);
    }
  };

  const confirmPickup = async (id) => {
    try {
      await axios.put(`/api/claims/${id}/pickup`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchClaims();
    } catch (err) {
      console.error('Failed to confirm pickup:', err);
    }
  };

  const deleteClaim = async (id) => {
    if (!window.confirm('Are you sure you want to delete this claim?')) return;
    try {
      await axios.delete(`/api/claims/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchClaims();
    } catch (err) {
      console.error('Failed to delete claim:', err);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">All Claims</h2>

      <div className="row mb-3">
        <div className="col-md-4">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="contested">Contested</option>
          </select>
        </div>
        <div className="col-md-2">
          <button className="btn btn-primary w-100" onClick={fetchClaims}>
            Apply Filter
          </button>
        </div>
      </div>

      <div className="card p-3 shadow-sm">
        <div className="table-responsive">
          <table className="table table-striped table-hover table-bordered">
            <thead className="table-light">
              <tr>
                <th>Claimant</th>
                <th>Item</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => (
                <React.Fragment key={claim._id}>
                  <tr>
                    <td>{claim.user?.fullName}</td>
                    <td>
                      {claim.item?.type} - {claim.item?.color}
                      {claim.likelyMatch && (
                        <span className="badge bg-warning text-dark ms-2">
                          Match Score: {claim.matchScore}
                        </span>
                      )}
                    </td>
                    <td>{claim.status}</td>
                    <td>{new Date(claim.createdAt).toLocaleDateString()}</td>
                    <td className="d-flex flex-wrap gap-1">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => updateStatus(claim._id, 'approved')}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => updateStatus(claim._id, 'rejected')}
                      >
                        Reject
                      </button>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => updateStatus(claim._id, 'contested')}
                      >
                        Contest
                      </button>
                      <button
                        className="btn btn-sm btn-outline-dark"
                        onClick={() => handleExpand(claim._id)}
                      >
                        {expandedClaimId === claim._id ? 'Hide' : 'Details'}
                      </button>
                      {claim.status === 'approved' && !claim.pickedUp && (
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => confirmPickup(claim._id)}
                        >
                          Confirm Pickup
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => deleteClaim(claim._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  {expandedClaimId === claim._id && (
                    <tr>
                      <td colSpan="5">
                        <strong>Description:</strong> {claim.description}<br />
                        <strong>Tags:</strong> {claim.tags?.join(', ')}<br />
                        <strong>Serial #:</strong> {claim.serialNumber || 'N/A'}<br />
                        <strong>Claimed Location:</strong> {claim.locationLost}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminClaims;

