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
router.put('/', auth, authorize('owner'), async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    const {
      parlorName,
      parlorDescription,
      parlorLogoUrl,
      heroVideoUrl,
      heroTitle,
      heroSubtitle,
      heroCtaText,
      offerBanner,
      whyUsTitle,
      whyUsPoints,
      customizeCtaText,
      contactEmail,
      contactPhone,
      contactAddress,
      socialLinks,
      workingHours
    } = req.body;

    if (parlorName !== undefined) settings.parlorName = parlorName;
    if (parlorDescription !== undefined) settings.parlorDescription = parlorDescription;
    if (parlorLogoUrl !== undefined) settings.parlorLogoUrl = parlorLogoUrl;
    if (heroVideoUrl !== undefined) settings.heroVideoUrl = heroVideoUrl;
    if (heroTitle !== undefined) settings.heroTitle = heroTitle;
    if (heroSubtitle !== undefined) settings.heroSubtitle = heroSubtitle;
    if (heroCtaText !== undefined) settings.heroCtaText = heroCtaText;

    if (offerBanner !== undefined) {
      settings.offerBanner = {
        ...settings.offerBanner,
        ...offerBanner,
      };
    }

    if (whyUsTitle !== undefined) settings.whyUsTitle = whyUsTitle;
    if (whyUsPoints !== undefined) settings.whyUsPoints = whyUsPoints;
    if (customizeCtaText !== undefined) settings.customizeCtaText = customizeCtaText;

    if (contactEmail !== undefined) settings.contactEmail = contactEmail;
    if (contactPhone !== undefined) settings.contactPhone = contactPhone;
    if (contactAddress !== undefined) settings.contactAddress = contactAddress;
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
