const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  ngo: {
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
  quantityNeeded: {
    type: Number,
    required: [true, 'Please specify quantity needed'],
    min: 1
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'fulfilled', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  fulfilledBy: [{
    donation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation'
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Request', requestSchema);
