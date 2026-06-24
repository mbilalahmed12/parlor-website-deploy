const express = require('express');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { body, validationResult } = require('express-validator');
const router = express.Router();

const { supabase, toApiBooking, toApiService, handleSupabaseError } = require('../lib/supabase');

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
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { clientName, clientEmail, clientPhone, service, bookingDate, bookingTime, notes } = req.body;

    const payload = {
      client_name: clientName,
      client_email: clientEmail,
      client_phone: clientPhone,
      service_id: service,
      booking_date: bookingDate,
      booking_time: bookingTime,
      notes,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('bookings').insert(payload).select().single();
    if (error) {
      const err = handleSupabaseError(error, 'Error creating booking');
      return res.status(err.status).json({ message: err.message });
    }

    // fetch service row
    let serviceRow = null;
    if (data.service_id) {
      const svc = await supabase.from('services').select().eq('id', data.service_id).maybeSingle();
      serviceRow = svc.data || null;
    }

    res.status(201).json(toApiBooking(data, serviceRow));
  } catch (error) {
    res.status(400).json({ message: 'Error creating booking', error: error.message });
  }
});

// Get all bookings (admin only)
router.get('/', auth, authorize('owner', 'admin'), async (req, res) => {
  try {
    const { data, error } = await supabase.from('bookings').select().order('booking_date', { ascending: true });
    if (error) throw error;

    // Fetch services map
    const serviceIds = [...new Set(data.map((b) => b.service_id).filter(Boolean))];
    const servicesMap = {};
    if (serviceIds.length) {
      const sv = await supabase.from('services').select().in('id', serviceIds);
      if (!sv.error && sv.data) sv.data.forEach((s) => (servicesMap[s.id] = s));
    }

    const mapped = data.map((row) => toApiBooking(row, servicesMap[row.service_id] || null));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get booking by ID
router.get('/:id', auth, authorize('owner', 'admin'), async (req, res) => {
  try {
    const { data, error } = await supabase.from('bookings').select().eq('id', req.params.id).maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'Booking not found' });

    const svc = await supabase.from('services').select().eq('id', data.service_id).maybeSingle();
    const serviceRow = svc.data || null;
    res.json(toApiBooking(data, serviceRow));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update booking status (admin only)
router.put('/:id', auth, authorize('owner', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const updates = { updated_at: new Date().toISOString() };
    if (status !== undefined) updates.status = status;

    const { data, error } = await supabase.from('bookings').update(updates).eq('id', req.params.id).select().maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'Booking not found' });

    const svc = await supabase.from('services').select().eq('id', data.service_id).maybeSingle();
    res.json(toApiBooking(data, svc.data || null));
  } catch (error) {
    res.status(400).json({ message: 'Error updating booking', error: error.message });
  }
});

// Delete booking (admin only)
router.delete('/:id', auth, authorize('owner', 'admin'), async (req, res) => {
  try {
    const { data, error } = await supabase.from('bookings').delete().eq('id', req.params.id).select().maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'Booking not found' });
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting booking', error: error.message });
  }
});

module.exports = router;
