const express = require('express');
const router = express.Router();
const NGO = require('../models/NGO');
const { auth, authorize } = require('../middleware/auth');

// @route   GET /api/ngos
// @desc    Get all NGOs (with search)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, verified, search } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (verified) filter.verified = verified === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { mission: { $regex: search, $options: 'i' } }
      ];
    }

    const ngos = await NGO.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json(ngos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/ngos
// @desc    Create NGO profile
// @access  Private (NGO)
router.post('/', auth, authorize('ngo', 'admin'), async (req, res) => {
  try {
    const { name, description, mission, category, address, website } = req.body;

    // Check if NGO already exists for this user
    const existing = await NGO.findOne({ user: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'NGO profile already exists for this user' });
    }

    const ngo = await NGO.create({
      user: req.user._id,
      name,
      description,
      mission,
      category,
      address,
      website
    });

    const populated = await ngo.populate('user', 'name email');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/ngos/:id
// @desc    Update NGO profile
// @access  Private (NGO owner / Admin)
router.put('/:id', auth, async (req, res) => {
  try {
    let ngo = await NGO.findById(req.params.id);
    if (!ngo) {
      return res.status(404).json({ message: 'NGO not found' });
    }

    if (ngo.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    ngo = await NGO.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('user', 'name email');

    res.json(ngo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/ngos/:id/verify
// @desc    Verify an NGO
// @access  Private (Admin only)
router.put('/:id/verify', auth, authorize('admin'), async (req, res) => {
  try {
    let ngo = await NGO.findById(req.params.id);
    if (!ngo) {
      return res.status(404).json({ message: 'NGO not found' });
    }

    ngo.verified = true;
    await ngo.save();

    ngo = await ngo.populate('user', 'name email');
    res.json(ngo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
