const express = require('express');
const Service = require('../models/Service');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const router = express.Router();

const normalizeCategory = (value = '') => value.trim().toLowerCase();
const titleCase = (value = '') =>
  value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

// Get all active services
router.get('/', async (req, res) => {
  try {
    const filters = { active: true };

    if (req.query.audience) {
      filters.audience = String(req.query.audience).toLowerCase();
    }

    if (req.query.category) {
      filters.category = normalizeCategory(String(req.query.category));
    }

    const services = await Service.find(filters).sort({ featured: -1, category: 1, createdAt: -1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/categories/list', async (req, res) => {
  try {
    const filters = { active: true };
    if (req.query.audience) {
      filters.audience = String(req.query.audience).toLowerCase();
    }

    const services = await Service.find(filters).sort({ category: 1, featured: -1, createdAt: -1 });
    const grouped = new Map();

    services.forEach((service) => {
      const key = normalizeCategory(service.category || 'other');
      if (!grouped.has(key)) {
        grouped.set(key, {
          key,
          label: service.categoryLabel || titleCase(key),
          backgroundVideoUrl: service.categoryVideoUrl || (service.mediaType === 'video' ? service.mediaUrl : ''),
          serviceCount: 0,
        });
      }

      const current = grouped.get(key);
      current.serviceCount += 1;

      if (!current.backgroundVideoUrl && service.mediaType === 'video' && service.mediaUrl) {
        current.backgroundVideoUrl = service.mediaUrl;
      }
    });

    res.json(Array.from(grouped.values()));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/admin/all', auth, authorize('owner', 'admin'), async (req, res) => {
  try {
    const services = await Service.find().sort({ active: -1, featured: -1, createdAt: -1 });
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
    const {
      name,
      description,
      price,
      duration,
      category,
      categoryLabel,
      audience,
      categoryVideoUrl,
      image,
      mediaType,
      mediaUrl,
      featured,
      active,
    } = req.body;

    const service = new Service({
      name,
      description,
      price,
      duration,
      category: normalizeCategory(category || 'other'),
      categoryLabel,
      audience: audience || 'her',
      categoryVideoUrl,
      image,
      mediaType,
      mediaUrl,
      featured,
      active,
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
    const {
      name,
      description,
      price,
      duration,
      category,
      categoryLabel,
      audience,
      categoryVideoUrl,
      image,
      mediaType,
      mediaUrl,
      featured,
      active,
    } = req.body;

    let service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    service.name = name !== undefined ? name : service.name;
    service.description = description !== undefined ? description : service.description;
    service.price = price !== undefined ? price : service.price;
    service.duration = duration !== undefined ? duration : service.duration;
    service.category = category !== undefined ? normalizeCategory(category) : service.category;
    service.categoryLabel = categoryLabel !== undefined ? categoryLabel : service.categoryLabel;
    service.audience = audience !== undefined ? audience : service.audience;
    service.categoryVideoUrl = categoryVideoUrl !== undefined ? categoryVideoUrl : service.categoryVideoUrl;
    service.image = image !== undefined ? image : service.image;
    service.mediaType = mediaType !== undefined ? mediaType : service.mediaType;
    service.mediaUrl = mediaUrl !== undefined ? mediaUrl : service.mediaUrl;
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
