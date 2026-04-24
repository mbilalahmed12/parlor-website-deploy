const express = require('express');
const Service = require('../models/Service');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const router = express.Router();

// Get all active services
router.get('/', async (req, res) => {
  try {
    const services = await Service.find({ active: true }).sort({ featured: -1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get service by ID
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create service (admin only)
router.post('/', auth, authorize('owner', 'admin'), async (req, res) => {
  try {
    const { name, description, price, duration, category, image } = req.body;

    const service = new Service({
      name,
      description,
      price,
      duration,
      category,
      image
    });

    await service.save();
    res.status(201).json(service);
  } catch (error) {
    res.status(400).json({ message: 'Error creating service', error: error.message });
  }
});

// Update service (admin only)
router.put('/:id', auth, authorize('owner', 'admin'), async (req, res) => {
  try {
    const { name, description, price, duration, category, image, featured, active } = req.body;

    let service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    service.name = name || service.name;
    service.description = description || service.description;
    service.price = price !== undefined ? price : service.price;
    service.duration = duration || service.duration;
    service.category = category || service.category;
    service.image = image || service.image;
    service.featured = featured !== undefined ? featured : service.featured;
    service.active = active !== undefined ? active : service.active;
    service.updatedAt = Date.now();

    await service.save();
    res.json(service);
  } catch (error) {
    res.status(400).json({ message: 'Error updating service', error: error.message });
  }
});

// Delete service (admin only)
router.delete('/:id', auth, authorize('owner', 'admin'), async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting service', error: error.message });
  }
});

module.exports = router;
