const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const { auth, authorize } = require('../middleware/auth');

// @route   GET /api/activities
// @desc    Get all activities
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { type, status, volunteer } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (volunteer) filter.volunteer = volunteer;

    const activities = await Activity.find(filter)
      .populate('volunteer', 'name email')
      .populate('donation', 'title category')
      .populate('request', 'title category')
      .sort({ date: -1 });

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/activities
// @desc    Log a volunteer activity
// @access  Private (Volunteer)
router.post('/', auth, authorize('volunteer', 'admin'), async (req, res) => {
  try {
    const { title, type, description, location, date, donation, request, hoursLogged } = req.body;

    const activity = await Activity.create({
      volunteer: req.user._id,
      title,
      type,
      description,
      location,
      date,
      donation,
      request,
      hoursLogged
    });

    const populated = await activity.populate('volunteer', 'name email');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/activities/:id
// @desc    Update an activity
// @access  Private (Volunteer who created / Admin)
router.put('/:id', auth, async (req, res) => {
  try {
    let activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    if (activity.volunteer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    activity = await Activity.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('volunteer', 'name email');

    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
