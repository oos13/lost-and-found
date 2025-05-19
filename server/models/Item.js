const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  type: String,
  color: String,
  brand: String,
  size: String,
  locationFound: String,
  description: String,
  photoUrl: String,
  visibleToPublic: Boolean,
  tags: [String],
  dateFound: Date,
  claimed: { type: Boolean, default: false },
  claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  contested: { type: Boolean, default: false }
});

module.exports = mongoose.model('Item', itemSchema);
