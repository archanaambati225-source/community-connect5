const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: 200
  },
  category: {
    type: String,
    required: true,
    enum: ['food', 'clothes', 'education', 'medical', 'other']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: 1000
  },
  quantity: {
    type: Number,
    required: [true, 'Please provide quantity'],
    min: 1
  },
  unit: {
    type: String,
    default: 'items'
  },
  location: {
    type: String,
    required: [true, 'Please provide a location']
  },
  status: {
    type: String,
    enum: ['available', 'claimed', 'collected', 'delivered'],
    default: 'available'
  },
  claimedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Donation', donationSchema);
