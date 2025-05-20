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
  const [feedback, setFeedback] = useState('');

//

  const fetchUsers = useCallback(async () => {
  try {
    const query = Object.entries(filters)
      .filter(([_, value]) => value)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    const res = await axios.get(`http://localhost:5000/api/users?${query}`, {
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
      await axios.put(`http://localhost:5000/api/users/${id}/role`, { role: newRole }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeedback(`User role changed to ${newRole}`);
      fetchUsers();
    } catch (err) {
      console.error('Failed to update role', err);
      setFeedback('Error updating role');
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeedback('User deleted');
      fetchUsers();
    } catch (err) {
      console.error('Failed to delete user', err);
      setFeedback('Error deleting user');
    }
  };

  const handleInputChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="container mt-4">
      <h2>Admin User Management</h2>

      {feedback && <div className="alert alert-info">{feedback}</div>}

      <div className="row mb-4">
        {['email', 'schoolId', 'startDate', 'endDate'].map(field => (
          <div className="col-md-3 mb-2" key={field}>
            <input
              type={field.includes('Date') ? 'date' : 'text'}
              className="form-control"
              name={field}
              placeholder={field}
              value={filters[field]}
              onChange={handleInputChange}
            />
          </div>
        ))}
        <div className="col-md-3 mb-2">
          <select name="role" className="form-select" value={filters.role} onChange={handleInputChange}>
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="col-md-3 mb-2">
          <button className="btn btn-primary w-100" onClick={fetchUsers}>Apply Filters</button>
        </div>
      </div>

      <table className="table table-bordered">
        <thead>
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
          {users.map(user => (
            <tr key={user._id}>
              <td>{user.fullName}</td>
              <td>{user.email}</td>
              <td>{user.schoolId}</td>
              <td>{user.role}</td>
              <td>{new Date(user.createdAt).toLocaleDateString()}</td>
              <td>{user.claimCount ?? 0}</td>
              <td>
                <div className="btn-group">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => updateRole(user._id, user.role === 'admin' ? 'user' : 'admin')}
                  >
                    {user.role === 'admin' ? 'Demote' : 'Promote'}
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => deleteUser(user._id)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminUsers;
