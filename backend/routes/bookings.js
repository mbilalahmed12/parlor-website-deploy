const express = require('express');
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Create booking (public)
router.post('/', [
  body('clientName').notEmpty(),
  body('clientEmail').isEmail(),
  body('clientPhone').notEmpty(),
  body('service').notEmpty(),
  body('bookingDate').isISO8601(),
  body('bookingTime').matches(/^\d{2}:\d{2}$/)
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { clientName, clientEmail, clientPhone, service, bookingDate, bookingTime, notes } = req.body;

    const booking = new Booking({
      clientName,
      clientEmail,
      clientPhone,
      service,
      bookingDate,
      bookingTime,
      notes
    });

    await booking.save();
    await booking.populate('service');

    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ message: 'Error creating booking', error: error.message });
  }
});

// Get all bookings (admin only)
router.get('/', auth, async (req, res) => {
  try {
    const bookings = await Booking.find().populate('service').sort({ bookingDate: 1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get booking by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('service');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update booking status (admin only)
router.put('/:id', auth, authorize('owner', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;

    let booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.status = status || booking.status;
    booking.updatedAt = Date.now();

    await booking.save();
    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: 'Error updating booking', error: error.message });
  }
});

// Delete booking (admin only)
router.delete('/:id', auth, authorize('owner', 'admin'), async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting booking', error: error.message });
  }
});

module.exports = router;
