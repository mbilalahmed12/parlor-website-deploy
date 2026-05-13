const express = require('express');
const Settings = require('../models/Settings');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'videos');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '';
    const name = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
    cb(null, name + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB limit
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('video/')) {
      return cb(new Error('Only video files are allowed'));
    }
    cb(null, true);
  }
});

const mediaUploadDir = path.join(__dirname, '..', 'public', 'uploads', 'media');
fs.mkdirSync(mediaUploadDir, { recursive: true });

const mediaStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, mediaUploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '';
    const name = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
    cb(null, name + ext);
  }
});

const uploadMedia = multer({
  storage: mediaStorage,
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/') && !file.mimetype.startsWith('video/')) {
      return cb(new Error('Only image or video files are allowed'));
    }
    cb(null, true);
  }
});

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
      heroImageUrl,
      discountText,
      locationsText,
      offerBanner,
      whyUsTitle,
      whyUsDescription,
      whyUsPoints,
      whyUsMediaUrl,
      whyUsMediaType,
      whyUsSignatureDetail,
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
    if (heroImageUrl !== undefined) settings.heroImageUrl = heroImageUrl;
    if (discountText !== undefined) settings.discountText = discountText;
    if (locationsText !== undefined) settings.locationsText = locationsText;
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
    if (whyUsDescription !== undefined) settings.whyUsDescription = whyUsDescription;
    if (whyUsPoints !== undefined) settings.whyUsPoints = whyUsPoints;
    if (whyUsMediaUrl !== undefined) settings.whyUsMediaUrl = whyUsMediaUrl;
    if (whyUsMediaType !== undefined) settings.whyUsMediaType = whyUsMediaType;
    if (whyUsSignatureDetail !== undefined) settings.whyUsSignatureDetail = whyUsSignatureDetail;
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

// Upload hero video (admin only)
router.post('/upload-video', auth, authorize('owner'), upload.single('video'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const url = `${req.protocol}://${req.get('host')}/uploads/videos/${req.file.filename}`;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }
    settings.heroVideoUrl = url;
    settings.updatedAt = Date.now();
    await settings.save();

    res.json({ message: 'Video uploaded', url, settings });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

router.post('/upload-media', auth, authorize('owner'), uploadMedia.single('media'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const url = `${req.protocol}://${req.get('host')}/uploads/media/${req.file.filename}`;

    res.json({ message: 'Media uploaded', url, type: req.file.mimetype.startsWith('video/') ? 'video' : 'image' });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});
