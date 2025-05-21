import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setFeedback('');

    try {
      const res = await axios.post('/api/auth/login', {
        email,
        password
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      if (res.data.user.role === 'admin') {
        navigate('/admin/Dashboard');
      } else {
        navigate('/dashboard');
}
    } catch (err) {
      console.error(err);
      setFeedback('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '500px' }}>
      <h2 className="mb-4 text-center">
        <img src="/lostandfoundblack.png" alt="Icon" width="400" height="175"/>
      </h2>

      {feedback && <div className="alert alert-danger">{feedback}</div>}

      <form onSubmit={handleLogin} className="card p-4 shadow-sm">
        <label>Email</label>
        <input className="form-control" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label className="mt-3">Password</label>
        <input className="form-control" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <button type="submit" className="btn btn-primary mt-3">Login</button>
      </form>

      <p className="mt-3 text-center">
        Don’t have an account? <Link to="/register">Register here</Link>.
      </p>
    </div>
  );
}

export default Login;
