const express = require('express');
const Review = require('../models/Review');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Submit review (public)
router.post('/', [
  body('clientName').notEmpty(),
  body('clientEmail').isEmail(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').notEmpty().isLength({ min: 10, max: 1000 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { clientName, clientEmail, rating, comment, service, image } = req.body;

    const review = new Review({
      clientName,
      clientEmail,
      rating,
      comment,
      service,
      image,
      approved: false
    });

    await review.save();
    res.status(201).json({ message: 'Review submitted successfully! It will be visible after admin approval.', review });
  } catch (error) {
    res.status(400).json({ message: 'Error submitting review', error: error.message });
  }
});

// Get approved reviews (public)
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find({ approved: true }).populate('service').sort({ publishedAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all reviews including pending (admin only)
router.get('/admin/all', auth, async (req, res) => {
  try {
    const reviews = await Review.find().populate('service').sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Approve review (admin only)
router.put('/:id/approve', auth, authorize('owner', 'admin'), async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    review.approved = true;
    review.approvedAt = Date.now();
    review.publishedAt = Date.now();

    await review.save();
    res.json({ message: 'Review approved and published!', review });
  } catch (error) {
    res.status(400).json({ message: 'Error approving review', error: error.message });
  }
});

// Reject/Delete review (admin only)
router.delete('/:id', auth, authorize('owner', 'admin'), async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review', error: error.message });
  }
});

module.exports = router;
