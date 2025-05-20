import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

function AdminItems() {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    type: '',
    color: '',
    brand: '',
    size: '',
    serialNumber: '',
    locationFound: '',
    description: '',
    tags: '',
    photo: null
  });
  const [feedback, setFeedback] = useState('');
  const token = localStorage.getItem('token');

  const fetchItems = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/items', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, photo: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    for (let key in formData) {
      if (key === 'tags') {
        form.append('tags', JSON.stringify(formData.tags.split(',').map(t => t.trim().toLowerCase())));
      } else {
        form.append(key, formData[key]);
      }
    }

    try {
      await axios.post('http://localhost:5000/api/items', form, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setFeedback('Item logged successfully!');
      setFormData({
        type: '',
        color: '',
        brand: '',
        size: '',
        serialNumber: '',
        locationFound: '',
        description: '',
        tags: '',
        photo: null
      });
      fetchItems();
    } catch (err) {
      console.error(err);
      setFeedback('Failed to log item.');
    }
  };

  const toggleClaimed = async (id, claimed) => {
    try {
      await axios.put(`http://localhost:5000/api/items/${id}`, { claimed: !claimed }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteItem = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/items/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Admin Item Management</h2>
      {feedback && <div className="alert alert-info">{feedback}</div>}

      <form onSubmit={handleSubmit} className="mb-5">
        <div className="row">
          {['type', 'color', 'brand', 'size', 'serialNumber', 'locationFound', 'description', 'tags'].map((field) => (
            <div className="col-md-6 mb-3" key={field}>
              <label className="form-label">{field}</label>
              <input
                type="text"
                name={field}
                className="form-control"
                value={formData[field]}
                onChange={handleInputChange}
              />
            </div>
          ))}
          <div className="col-md-6 mb-3">
            <label className="form-label">Photo</label>
            <input type="file" className="form-control" onChange={handleFileChange} />
          </div>
        </div>
        <button type="submit" className="btn btn-primary">Log Item</button>
      </form>

      <h4>All Logged Items</h4>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Photo</th>
            <th>Type</th>
            <th>Color</th>
            <th>Brand</th>
            <th>Claimed</th>
            <th>Found</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item._id}>
              <td><img src={item.photoUrl} alt="item" style={{ width: '80px' }} /></td>
              <td>{item.type}</td>
              <td>{item.color}</td>
              <td>{item.brand}</td>
              <td>{item.claimed ? 'Yes' : 'No'}</td>
              <td>{new Date(item.dateFound).toLocaleString()}</td>
              <td>
                <button
                  className="btn btn-sm btn-outline-success me-2"
                  onClick={() => toggleClaimed(item._id, item.claimed)}
                >
                  {item.claimed ? 'Unmark' : 'Mark Claimed'}
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => deleteItem(item._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminItems;
