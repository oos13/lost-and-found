import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    schoolId: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await axios.post('/api/auth/register', formData);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error(err);
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '600px' }}>
      <h2 className="mb-4 text-center">Register</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleRegister} className="card p-4 shadow-sm">
        <label>Full Name</label>
        <input className="form-control" type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />

        <label className="mt-3">Email</label>
        <input className="form-control" type="email" name="email" value={formData.email} onChange={handleChange} required />

        <label className="mt-3">School ID</label>
        <input className="form-control" type="text" name="schoolId" value={formData.schoolId} onChange={handleChange} required />

        <label className="mt-3">Password</label>
        <input className="form-control" type="password" name="password" value={formData.password} onChange={handleChange} required />

        <label className="mt-3">Confirm Password</label>
        <input className="form-control" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />

        <button type="submit" className="btn btn-primary mt-3">Register</button>
      </form>

      <p className="mt-3 text-center">
        Already have an account? <Link to="/login">Login here</Link>.
      </p>
    </div>
  );
}

export default Register;
