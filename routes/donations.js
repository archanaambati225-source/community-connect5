const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const { auth, authorize } = require('../middleware/auth');

// @route   GET /api/donations
// @desc    Get all donations (with optional filters)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, status, donor } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (donor) filter.donor = donor;

    const donations = await Donation.find(filter)
      .populate('donor', 'name email')
      .populate('claimedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/donations
// @desc    Create a donation
// @access  Private (Donor)
router.post('/', auth, authorize('donor', 'admin'), async (req, res) => {
  try {
    const { title, category, description, quantity, unit, location } = req.body;

    const donation = await Donation.create({
      donor: req.user._id,
      title,
      category,
      description,
      quantity,
      unit,
      location
    });

    const populated = await donation.populate('donor', 'name email');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/donations/:id
// @desc    Update a donation
// @access  Private (Donor who created / Admin)
router.put('/:id', auth, async (req, res) => {
  try {
    let donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Only owner or admin can update
    if (donation.donor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this donation' });
    }

    donation = await Donation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('donor', 'name email').populate('claimedBy', 'name email');

    res.json(donation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/donations/:id/claim
// @desc    Claim a donation
// @access  Private (NGO/Volunteer)
router.put('/:id/claim', auth, authorize('ngo', 'volunteer', 'admin'), async (req, res) => {
  try {
    let donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (donation.status !== 'available') {
      return res.status(400).json({ message: 'Donation is no longer available' });
    }

    donation.status = 'claimed';
    donation.claimedBy = req.user._id;
    await donation.save();

    donation = await donation.populate('donor', 'name email');
    donation = await donation.populate('claimedBy', 'name email');

    res.json(donation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/donations/:id
// @desc    Delete a donation
// @access  Private (Donor who created / Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (donation.donor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this donation' });
    }

    await donation.deleteOne();
    res.json({ message: 'Donation removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
