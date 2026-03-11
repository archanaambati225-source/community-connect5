const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const { auth, authorize } = require('../middleware/auth');

// @route   GET /api/requests
// @desc    Get all requests
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, status, urgency, ngo } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (urgency) filter.urgency = urgency;
    if (ngo) filter.ngo = ngo;

    const requests = await Request.find(filter)
      .populate('ngo', 'name email organization')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/requests
// @desc    Create a resource request
// @access  Private (NGO)
router.post('/', auth, authorize('ngo', 'admin'), async (req, res) => {
  try {
    const { title, category, description, quantityNeeded, urgency } = req.body;

    const request = await Request.create({
      ngo: req.user._id,
      title,
      category,
      description,
      quantityNeeded,
      urgency
    });

    const populated = await request.populate('ngo', 'name email organization');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/requests/:id/approve
// @desc    Approve a request
// @access  Private (Admin)
router.put('/:id/approve', auth, authorize('admin'), async (req, res) => {
  try {
    let request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request is not in pending status' });
    }

    request.status = 'approved';
    request.approvedBy = req.user._id;
    await request.save();

    request = await request.populate('ngo', 'name email organization');
    request = await request.populate('approvedBy', 'name email');

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/requests/:id/reject
// @desc    Reject a request
// @access  Private (Admin)
router.put('/:id/reject', auth, authorize('admin'), async (req, res) => {
  try {
    let request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.status = 'rejected';
    request.approvedBy = req.user._id;
    await request.save();

    request = await request.populate('ngo', 'name email organization');
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/requests/:id/fulfill
// @desc    Mark request as fulfilled
// @access  Private (Donor/Volunteer)
router.put('/:id/fulfill', auth, authorize('donor', 'volunteer', 'admin'), async (req, res) => {
  try {
    let request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'approved') {
      return res.status(400).json({ message: 'Request must be approved before fulfillment' });
    }

    request.status = 'fulfilled';
    await request.save();

    request = await request.populate('ngo', 'name email organization');
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
