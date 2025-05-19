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
      description,
      visibleToPublic,
      tags
    } = req.body;
  
    try {
      const newItem = new Item({
        type,
        color,
        brand,
        description,
        visibleToPublic,
        tags: JSON.parse(tags),
        photoUrl: req.file.path,
        dateFound: new Date()
      });
  
      await newItem.save();
      res.status(201).json({ message: 'Item with photo logged successfully', item: newItem });
    } catch (err) {
      res.status(500).json({ error: 'Failed to create item', details: err.message });
    }
  });

// Public route: browse visible lost items with optional tag filtering
router.get('/', async (req, res) => {
    try {
      const { tags } = req.query;
  
      let query = { visibleToPublic: true };
  
      if (tags) {
        const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
        query.tags = { $all: tagArray }; // matches ALL specified tags
      }
  
      const items = await Item.find(query).sort({ dateFound: -1 });
  
      res.json(items);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch items', details: err.message });
    }
  });
  
  

module.exports = router;
