const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

const multer = require('multer');
const { storage } = require('../utils/cloudinary');
const upload = multer({ storage });

// Admin-only route to upload a lost item
router.post('/', verifyToken, isAdmin, upload.single('photo'), async (req, res) => {
  const {
    type,
    color,
    brand,
    size,
    serialNumber,
    locationFound,
    description,
    tags
  } = req.body;

  try {
    const newItem = new Item({
      type,
      color,
      brand,
      size,
      serialNumber,
      locationFound,
      description,
      tags: tags ? JSON.parse(tags) : [],
      photoUrl: req.file?.path,
      dateFound: new Date(),
      visibleToPublic: true
    });

    await newItem.save();
    res.status(201).json({ message: 'Item with photo logged successfully', item: newItem });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create item', details: err.message });
  }
});

// Public route: browse visible lost items with optional tag filtering
router.get('/public', async (req, res) => {
  try {
    const { tags } = req.query;

    let query = { visibleToPublic: true };

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
      query.tags = { $all: tagArray };
    }

    const items = await Item.find(query).sort({ dateFound: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch public items', details: err.message });
  }
});

// Admin-only route: get all items
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const items = await Item.find().sort({ dateFound: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch items', details: err.message });
  }
});

// Admin-only route: update claimed status
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    if ('claimed' in req.body) {
      item.claimed = req.body.claimed;
    }

    await item.save();
    res.json({ message: 'Item updated', item });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update item', details: err.message });
  }
});

// Admin-only route: delete item
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete item', details: err.message });
  }
});

module.exports = router;
