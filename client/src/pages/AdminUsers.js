import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

function AdminUsers() {
  const token = localStorage.getItem('token');
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    role: '',
    email: '',
    schoolId: '',
    startDate: '',
    endDate: '',
  });


  const fetchUsers = useCallback(async () => {
    try {
      const query = Object.entries(filters)
        .filter(([_, value]) => value)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');

      const res = await axios.get(`/api/users?${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  }, [filters, token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateRole = async (id, newRole) => {
    try {
      await axios.put(`/api/users/${id}/role`, { newRole }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) {
      console.error('Failed to update role', err);
    }
  };

  const deleteUser = async (id) => {
    try {
      await axios.delete(`/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) {
      console.error('Failed to delete user', err);
    }
  };

  const handleInputChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Admin User Management</h2>

      <div className="row mb-3">
        <div className="col-md-3 mb-2">
          <input
            type="text"
            className="form-control"
            name="email"
            placeholder="email"
            value={filters.email}
            onChange={handleInputChange}
          />
        </div>
        <div className="col-md-2 mb-2">
          <input
            type="text"
            className="form-control"
            name="schoolId"
            placeholder="schoolId"
            value={filters.schoolId}
            onChange={handleInputChange}
          />
        </div>
        <div className="col-md-2 mb-2">
          <input
            type="date"
            className="form-control"
            name="startDate"
            value={filters.startDate}
            onChange={handleInputChange}
          />
        </div>
        <div className="col-md-2 mb-2">
          <input
            type="date"
            className="form-control"
            name="endDate"
            value={filters.endDate}
            onChange={handleInputChange}
          />
        </div>
        <div className="col-md-2 mb-2">
          <select
            className="form-select"
            name="role"
            value={filters.role}
            onChange={handleInputChange}
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="col-md-1 mb-2 d-grid">
          <button className="btn btn-primary" onClick={fetchUsers}>
            Apply Filters
          </button>
        </div>
      </div>

      

      <div className="card p-3 shadow-sm">
        <div className="table-responsive">
          <table className="table table-striped table-hover table-bordered">
            <thead className="table-light">
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>School ID</th>
                <th>Role</th>
                <th>Registered</th>
                <th>Claims</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.fullName}</td>
                  <td>{user.email}</td>
                  <td>{user.schoolId}</td>
                  <td>{user.role}</td>
                  <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                  <td>{user.claimCount || 0}</td>
                  <td>
                    {user.role === 'user' ? (
                      <button
                        className="btn btn-sm btn-primary me-2"
                        onClick={() => updateRole(user._id, 'admin')}
                      >
                        Promote
                      </button>
                    ) : (
                      <button
                        className="btn btn-sm btn-secondary me-2"
                        onClick={() => updateRole(user._id, 'user')}
                      >
                        Demote
                      </button>
                    )}
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => deleteUser(user._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminUsers;

