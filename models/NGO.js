const mongoose = require('mongoose');

const ngoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide NGO name'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: 2000
  },
  mission: {
    type: String,
    maxlength: 500
  },
  category: {
    type: String,
    enum: ['education', 'health', 'environment', 'poverty', 'hunger', 'equality', 'other'],
    default: 'other'
  },
  address: {
    type: String,
    required: [true, 'Please provide an address']
  },
  website: {
    type: String,
    trim: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  impactStats: {
    peopleHelped: { type: Number, default: 0 },
    donationsReceived: { type: Number, default: 0 },
    projectsCompleted: { type: Number, default: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('NGO', ngoSchema);
