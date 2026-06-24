const express = require('express');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { body, validationResult } = require('express-validator');
const router = express.Router();

const { supabase, toApiReview, toApiService, handleSupabaseError } = require('../lib/supabase');

// Submit review (public)
router.post('/', [
  body('clientName').notEmpty(),
  body('clientEmail').isEmail(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').notEmpty().isLength({ min: 10, max: 1000 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { clientName, clientEmail, rating, comment, service, image } = req.body;

    const payload = {
      client_name: clientName,
      client_email: clientEmail,
      rating,
      comment,
      service_id: service || null,
      image: image || null,
      approved: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('reviews').insert(payload).select().single();
    if (error) {
      const err = handleSupabaseError(error, 'Error submitting review');
      return res.status(err.status).json({ message: err.message });
    }

    res.status(201).json({ message: 'Review submitted successfully! It will be visible after admin approval.', review: toApiReview(data) });
  } catch (error) {
    res.status(400).json({ message: 'Error submitting review', error: error.message });
  }
});

// Get approved reviews (public)
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('reviews').select().eq('approved', true).order('published_at', { ascending: false });
    if (error) throw error;

    const serviceIds = [...new Set(data.map((r) => r.service_id).filter(Boolean))];
    const servicesMap = {};
    if (serviceIds.length) {
      const sv = await supabase.from('services').select().in('id', serviceIds);
      if (!sv.error && sv.data) sv.data.forEach((s) => (servicesMap[s.id] = s));
    }

    const mapped = data.map((row) => toApiReview(row, servicesMap[row.service_id] || null));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all reviews including pending (admin only)
router.get('/admin/all', auth, authorize('owner', 'admin'), async (req, res) => {
  try {
    const { data, error } = await supabase.from('reviews').select().order('created_at', { ascending: false });
    if (error) throw error;

    const serviceIds = [...new Set(data.map((r) => r.service_id).filter(Boolean))];
    const servicesMap = {};
    if (serviceIds.length) {
      const sv = await supabase.from('services').select().in('id', serviceIds);
      if (!sv.error && sv.data) sv.data.forEach((s) => (servicesMap[s.id] = s));
    }

    const mapped = data.map((row) => toApiReview(row, servicesMap[row.service_id] || null));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Approve review (admin only)
router.put('/:id/approve', auth, authorize('owner', 'admin'), async (req, res) => {
  try {
    const updates = {
      approved: true,
      approved_at: new Date().toISOString(),
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('reviews').update(updates).eq('id', req.params.id).select().maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'Review not found' });

    res.json({ message: 'Review approved and published!', review: toApiReview(data) });
  } catch (error) {
    res.status(400).json({ message: 'Error approving review', error: error.message });
  }
});

// Reject/Delete review (admin only)
router.delete('/:id', auth, authorize('owner', 'admin'), async (req, res) => {
  try {
    const { data, error } = await supabase.from('reviews').delete().eq('id', req.params.id).select().maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'Review not found' });
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review', error: error.message });
  }
});

module.exports = router;
