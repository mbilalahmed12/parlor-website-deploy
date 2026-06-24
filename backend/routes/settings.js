const express = require('express');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const router = express.Router();
const multer = require('multer');

const { supabase, toApiSettings, fromApiSettings, uploadToBucket, handleSupabaseError } = require('../lib/supabase');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB
});

const bucketName = process.env.SUPABASE_STORAGE_BUCKET || process.env.SUPABASE_BUCKET || 'user-uploads';

// Get settings (public)
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('settings').select().eq('id', 1).maybeSingle();
    if (error) throw error;

    if (!data) {
      // create default empty settings row
      const defaults = fromApiSettings({});
      const ins = await supabase.from('settings').insert(defaults).select().maybeSingle();
      if (ins.error) throw ins.error;
      return res.json(toApiSettings(ins.data));
    }

    res.json(toApiSettings(data));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update settings (admin only)
router.put('/', auth, authorize('owner'), async (req, res) => {
  try {
    const payload = fromApiSettings(req.body || {});
    // ensure id is 1
    payload.id = 1;

    const { data, error } = await supabase.from('settings').upsert(payload, { onConflict: 'id' }).select().maybeSingle();
    if (error) {
      const err = handleSupabaseError(error, 'Error updating settings');
      return res.status(err.status).json({ message: err.message });
    }

    res.json({ message: 'Settings updated successfully', settings: toApiSettings(data) });
  } catch (error) {
    res.status(400).json({ message: 'Error updating settings', error: error.message });
  }
});

// Upload hero video (admin only)
router.post('/upload-video', auth, authorize('owner'), upload.single('video'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const filename = `${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
    const path = `videos/${filename}`;

    await uploadToBucket(bucketName, path, req.file.buffer, req.file.mimetype);

    const publicRes = await supabase.storage.from(bucketName).getPublicUrl(path);
    const publicUrl = publicRes?.data?.publicUrl || publicRes?.publicUrl || null;

    // persist URL in settings
    const updates = {
      id: 1,
      hero_video_url: publicUrl,
      updated_at: new Date().toISOString(),
    };
    await supabase.from('settings').upsert(updates, { onConflict: 'id' });

    res.json({ message: 'Video uploaded', url: publicUrl });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

router.post('/upload-media', auth, authorize('owner'), upload.single('media'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const filename = `${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
    const typeDir = req.file.mimetype.startsWith('video/') ? 'media/videos' : 'media/images';
    const path = `${typeDir}/${filename}`;

    await uploadToBucket(bucketName, path, req.file.buffer, req.file.mimetype);
    const publicRes = await supabase.storage.from(bucketName).getPublicUrl(path);
    const publicUrl = publicRes?.data?.publicUrl || publicRes?.publicUrl || null;

    res.json({ message: 'Media uploaded', url: publicUrl, type: req.file.mimetype.startsWith('video/') ? 'video' : 'image' });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

module.exports = router;
