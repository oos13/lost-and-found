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
  const token = localStorage.getItem('token');

  const fetchItems = useCallback(async () => {
    try {
      const res = await axios.get('/api/items', {
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
    const data = new FormData();
    Object.entries(formData).forEach(([key, val]) =>
      data.append(key, val)
    );
    try {
      await axios.post('/api/items', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      fetchItems();
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
    } catch (err) {
      console.error(err);
    }
  };

  const markClaimed = async (id, claimed) => {
    try {
      await axios.put(`/api/items/${id}`, { claimed }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteItem = async (id) => {
    try {
      await axios.delete(`/api/items/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Admin Item Management</h2>

      <form onSubmit={handleSubmit} className="row g-3 mb-4">
        <div className="col-md-6 mb-2">
          <label>Type</label>
          <input type="text" className="form-control" name="type" value={formData.type} onChange={handleInputChange} />
        </div>
        <div className="col-md-6 mb-2">
          <label>Color</label>
          <input type="text" className="form-control" name="color" value={formData.color} onChange={handleInputChange} />
        </div>
        <div className="col-md-6 mb-2">
          <label>Brand</label>
          <input type="text" className="form-control" name="brand" value={formData.brand} onChange={handleInputChange} />
        </div>
        <div className="col-md-6 mb-2">
          <label>Size</label>
          <input type="text" className="form-control" name="size" value={formData.size} onChange={handleInputChange} />
        </div>
        <div className="col-md-6 mb-2">
          <label>Serial Number</label>
          <input type="text" className="form-control" name="serialNumber" value={formData.serialNumber} onChange={handleInputChange} />
        </div>
        <div className="col-md-6 mb-2">
          <label>Location Found</label>
          <input type="text" className="form-control" name="locationFound" value={formData.locationFound} onChange={handleInputChange} />
        </div>
        <div className="col-md-6 mb-2">
          <label>Description</label>
          <input type="text" className="form-control" name="description" value={formData.description} onChange={handleInputChange} />
        </div>
        <div className="col-md-6 mb-2">
          <label>Tags</label>
          <input type="text" className="form-control" name="tags" value={formData.tags} onChange={handleInputChange} />
        </div>
        <div className="col-md-12 mb-2">
          <label>Photo</label>
          <input type="file" className="form-control" name="photo" onChange={handleFileChange} />
        </div>
        <div className="col-12 d-grid">
          <button type="submit" className="btn btn-primary">
            Log Item
          </button>
        </div>
      </form>

      <h4 className="mb-3">All Logged Items</h4>

      <div className="card p-3 shadow-sm mt-2">
        <div className="table-responsive">
          <table className="table table-striped table-hover table-bordered">
            <thead className="table-light">
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
              {items.map((item) => (
                <tr key={item._id}>
                  <td>
                    {item.photoUrl ? (
                      <img src={item.photoUrl} alt="item" width="50" />
                    ) : (
                      'No Photo'
                    )}
                  </td>
                  <td>{item.type}</td>
                  <td>{item.color}</td>
                  <td>{item.brand}</td>
                  <td>{item.claimed ? 'Yes' : 'No'}</td>
                  <td>{new Date(item.createdAt).toLocaleString()}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-success me-2"
                      onClick={() => markClaimed(item._id, !item.claimed)}
                    >
                      {item.claimed ? 'Unmark' : 'Mark Claimed'}
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
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
      </div>
    </div>
  );
}

export default AdminItems;
