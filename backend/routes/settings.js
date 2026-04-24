const express = require('express');
const Settings = require('../models/Settings');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const router = express.Router();

// Get settings (public)
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update settings (admin only)
router.put('/', auth, authorize('owner', 'admin'), async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    const {
      parlorName,
      parlorDescription,
      heroVideoUrl,
      heroTitle,
      heroSubtitle,
      contactEmail,
      contactPhone,
      contactAddress,
      socialLinks,
      workingHours
    } = req.body;

    if (parlorName) settings.parlorName = parlorName;
    if (parlorDescription) settings.parlorDescription = parlorDescription;
    if (heroVideoUrl) settings.heroVideoUrl = heroVideoUrl;
    if (heroTitle) settings.heroTitle = heroTitle;
    if (heroSubtitle) settings.heroSubtitle = heroSubtitle;
    if (contactEmail) settings.contactEmail = contactEmail;
    if (contactPhone) settings.contactPhone = contactPhone;
    if (contactAddress) settings.contactAddress = contactAddress;
    if (socialLinks) settings.socialLinks = { ...settings.socialLinks, ...socialLinks };
    if (workingHours) settings.workingHours = workingHours;

    settings.updatedAt = Date.now();

    await settings.save();
    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    res.status(400).json({ message: 'Error updating settings', error: error.message });
  }
});

module.exports = router;
