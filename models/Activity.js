const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  volunteer: {
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
  type: {
    type: String,
    enum: ['collection', 'distribution', 'event'],
    required: true
  },
  description: {
    type: String,
    maxlength: 1000
  },
  location: {
    type: String,
    required: [true, 'Please provide a location']
  },
  date: {
    type: Date,
    required: [true, 'Please provide a date']
  },
  status: {
    type: String,
    enum: ['planned', 'in-progress', 'completed'],
    default: 'planned'
  },
  donation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation'
  },
  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request'
  },
  hoursLogged: {
    type: Number,
    default: 0,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Activity', activitySchema);
