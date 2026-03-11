const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const NGO = require('../models/NGO');
const Request = require('../models/Request');
const Activity = require('../models/Activity');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// @route   GET /api/dashboard/stats
// @desc    Get aggregate dashboard statistics
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const totalDonations = await Donation.countDocuments();
    const availableDonations = await Donation.countDocuments({ status: 'available' });
    const deliveredDonations = await Donation.countDocuments({ status: 'delivered' });
    const totalNGOs = await NGO.countDocuments();
    const verifiedNGOs = await NGO.countDocuments({ verified: true });
    const totalRequests = await Request.countDocuments();
    const pendingRequests = await Request.countDocuments({ status: 'pending' });
    const fulfilledRequests = await Request.countDocuments({ status: 'fulfilled' });
    const totalActivities = await Activity.countDocuments();
    const completedActivities = await Activity.countDocuments({ status: 'completed' });
    const totalVolunteers = await User.countDocuments({ role: 'volunteer' });
    const totalDonors = await User.countDocuments({ role: 'donor' });

    // Total volunteer hours
    const hoursResult = await Activity.aggregate([
      { $group: { _id: null, totalHours: { $sum: '$hoursLogged' } } }
    ]);
    const totalVolunteerHours = hoursResult.length > 0 ? hoursResult[0].totalHours : 0;

    // Category breakdown for donations
    const categoryBreakdown = await Donation.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      totalDonations,
      availableDonations,
      deliveredDonations,
      totalNGOs,
      verifiedNGOs,
      totalRequests,
      pendingRequests,
      fulfilledRequests,
      totalActivities,
      completedActivities,
      totalVolunteers,
      totalDonors,
      totalVolunteerHours,
      categoryBreakdown
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/dashboard/recent
// @desc    Get recent activity feed
// @access  Private
router.get('/recent', auth, async (req, res) => {
  try {
    const recentDonations = await Donation.find()
      .populate('donor', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentRequests = await Request.find()
      .populate('ngo', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentActivities = await Activity.find()
      .populate('volunteer', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      recentDonations,
      recentRequests,
      recentActivities
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
