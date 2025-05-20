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

  // Redirect if not logged in
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
      tags,
      description: details,
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
      console.error('Error submitting claim:', err);
      setFeedback({ message: 'Error submitting claim. Please try again.', type: 'danger' });
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Submit Lost Item Claim</h2>

      {feedback.message && (
        <div className={`alert alert-${feedback.type}`}>{feedback.message}</div>
      )}

      <form onSubmit={handleSubmit} className="card p-4 shadow-sm mb-4">
        <label>Type</label>
        <input className="form-control" value={type} onChange={(e) => setType(e.target.value)} />

        <label>Color</label>
        <input className="form-control" value={color} onChange={(e) => setColor(e.target.value)} />

        <label>Brand</label>
        <input className="form-control" value={brand} onChange={(e) => setBrand(e.target.value)} />

        <label>Size</label>
        <input className="form-control" value={size} onChange={(e) => setSize(e.target.value)} />

        <label>Serial Number</label>
        <input className="form-control" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} />

        <label>Location Lost</label>
        <input className="form-control" value={locationLost} onChange={(e) => setLocationLost(e.target.value)} />

        <label>Tags (comma-separated)</label>
        <input className="form-control" value={tags} onChange={(e) => setTags(e.target.value)} />

        <label>Details</label>
        <textarea className="form-control" rows="3" value={details} onChange={(e) => setDetails(e.target.value)} />

        <button type="submit" className="btn btn-primary mt-3">Submit Claim</button>
      </form>
    </div>
  );
}

export default SubmitClaim;
