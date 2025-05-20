import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function SubmitClaim() {
  const navigate = useNavigate();

  const [type, setType] = useState('');
  const [color, setColor] = useState('');
  const [brand, setBrand] = useState('');
  const [size, setSize] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [locationLost, setLocationLost] = useState('');
  const [tags, setTags] = useState('');
  const [details, setDetails] = useState('');
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  // 🔒 Redirect if not logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const payload = {
      type,
      color,
      brand,
      size,
      serialNumber,
      locationLost,
      tags: tags.split(',').map((t) => t.trim().toLowerCase()),
      details,
    };

    try {
      await axios.post('/api/claims', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFeedback({ message: 'Claim submitted successfully!', type: 'success' });

      setType('');
      setColor('');
      setBrand('');
      setSize('');
      setSerialNumber('');
      setLocationLost('');
      setTags('');
      setDetails('');
    } catch (err) {
      console.error(err);
      setFeedback({ message: 'Failed to submit claim. Please try again.', type: 'danger' });
    }
  };

  return (
    <div className="container mt-4">
      <h2>Submit Lost Item Claim</h2>
      {feedback.message && (
        <div className={`alert alert-${feedback.type}`} role="alert">
          {feedback.message}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Type</label>
          <input type="text" className="form-control" value={type} onChange={(e) => setType(e.target.value)} />
        </div>
        <div className="mb-3">
          <label>Color</label>
          <input type="text" className="form-control" value={color} onChange={(e) => setColor(e.target.value)} />
        </div>
        <div className="mb-3">
          <label>Brand</label>
          <input type="text" className="form-control" value={brand} onChange={(e) => setBrand(e.target.value)} />
        </div>
        <div className="mb-3">
          <label>Size</label>
          <input type="text" className="form-control" value={size} onChange={(e) => setSize(e.target.value)} />
        </div>
        <div className="mb-3">
          <label>Serial Number</label>
          <input type="text" className="form-control" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} />
        </div>
        <div className="mb-3">
          <label>Location Lost</label>
          <input type="text" className="form-control" value={locationLost} onChange={(e) => setLocationLost(e.target.value)} />
        </div>
        <div className="mb-3">
          <label>Tags (comma-separated)</label>
          <input type="text" className="form-control" value={tags} onChange={(e) => setTags(e.target.value)} />
        </div>
        <div className="mb-3">
          <label>Details</label>
          <textarea className="form-control" value={details} onChange={(e) => setDetails(e.target.value)} />
        </div>
        <button type="submit" className="btn btn-primary">Submit Claim</button>
      </form>
    </div>
  );
}

export default SubmitClaim;

