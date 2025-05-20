const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    default: null
  },
  type: String,
  color: String,
  brand: String,
  serialNumber: String,
  size: String,
  locationLost: String,
  tags: [String],
  details: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'contested'],
    default: 'pending'
  },
  holdUntil: Date,
  matchScore: {
    type: Number,
    default: 0
  },
  likelyMatch: {
    type: Boolean,
    default: false
  },
  pickedUp: {
    type: Boolean,
    default: false
  },
  pickedUpAt: Date,
  decisionAt: Date,
  adminNotes: String
}, {
  timestamps: true
});




module.exports = mongoose.model('Claim', claimSchema);
