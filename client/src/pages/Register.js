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
    setError('');
    setSuccess('');
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { fullName, email, schoolId, password, confirmPassword } = formData;

    if (!fullName || !email || !schoolId || !password || !confirmPassword) {
      return setError('Please fill in all fields.');
    }

    if (!validateEmail(email)) {
      return setError('Invalid email address.');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    try {
      await axios.post('http://localhost:5000/api/auth/register', {
        fullName,
        email,
        schoolId,
        password
      });

      setSuccess('Registration successful. Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '500px' }}>
      <h2>Register</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Full Name</label>
          <input
            type="text"
            name="fullName"
            className="form-control"
            value={formData.fullName}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label>Email</label>
          <input
            type="email"
            name="email"
            className="form-control"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label>School ID</label>
          <input
            type="text"
            name="schoolId"
            className="form-control"
            value={formData.schoolId}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label>Password</label>
          <input
            type="password"
            name="password"
            className="form-control"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            className="form-control"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="btn btn-primary w-100">Register</button>
      </form>

      <div className="text-center mt-3">
        <p>Already registered?</p>
        <Link to="/login" className="btn btn-outline-secondary">
          Login
        </Link>
      </div>
    </div>
  );
}

export default Register;


