import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { settingsAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { FiArrowLeft } from 'react-icons/fi';
import Cropper from 'react-easy-crop';
import { fileToDataUrl, getCroppedImgDataUrl } from '@/lib/imageCrop';

const toDateTimeLocal = (dateValue) => {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '';

  const tzOffsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffsetMs).toISOString().slice(0, 16);
};

const setByPath = (object, path, value) => {
  const keys = path.split('.');
  const clone = { ...object };
  let cursor = clone;

  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      cursor[key] = value;
      return;
    }

    cursor[key] = cursor[key] ? { ...cursor[key] } : {};
    cursor = cursor[key];
  });

  return clone;
};

export default function Settings({ onBack }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const [whyUsText, setWhyUsText] = useState('');
  const [logoCropSrc, setLogoCropSrc] = useState('');
  const [logoCrop, setLogoCrop] = useState({ x: 0, y: 0 });
  const [logoZoom, setLogoZoom] = useState(1);
  const [logoCropPixels, setLogoCropPixels] = useState(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingHeroMedia, setUploadingHeroMedia] = useState(false);
  const [uploadingWhyUsMedia, setUploadingWhyUsMedia] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.get();
      const data = response.data || {};
      setFormData({
        ...data,
        offerBanner: {
          enabled: data.offerBanner?.enabled !== false,
          text: data.offerBanner?.text || 'Offer ending soon',
          endsAt: toDateTimeLocal(data.offerBanner?.endsAt),
        },
      });
      setWhyUsText((data.whyUsPoints || []).join('\n'));
    } catch (error) {
      toast.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    if (name.includes('.')) {
      setFormData((prev) => setByPath(prev, name, newValue));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...formData,
        whyUsPoints: whyUsText
          .split('\n')
          .map((point) => point.trim())
          .filter(Boolean),
        offerBanner: {
          ...formData.offerBanner,
          endsAt: formData.offerBanner?.endsAt ? new Date(formData.offerBanner.endsAt).toISOString() : null,
        },
      };

      await settingsAPI.update(payload);
      toast.success('Settings updated successfully!');
      fetchSettings();
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const days = useMemo(
    () => ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    []
  );

  const updateLogoFromFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      setLogoCropSrc(dataUrl);
      setLogoCrop({ x: 0, y: 0 });
      setLogoZoom(1);
      setLogoCropPixels(null);
    } catch (error) {
      toast.error('Failed to load image');
    }
  };

  const onLogoCropComplete = useCallback((_, croppedAreaPixels) => {
    setLogoCropPixels(croppedAreaPixels);
  }, []);

  const handleApplyLogoCrop = async () => {
    if (!logoCropSrc || !logoCropPixels) return;

    try {
      const croppedDataUrl = await getCroppedImgDataUrl(logoCropSrc, logoCropPixels, 'image/png');
      setFormData((prev) => ({ ...prev, parlorLogoUrl: croppedDataUrl }));
      setLogoCropSrc('');
      setLogoCropPixels(null);
      toast.success('Logo cropped. Click Save All Changes to publish.');
    } catch (error) {
      toast.error('Failed to crop image');
    }
  };

  const uploadMediaFile = async (file, targetField, fallbackType) => {
    if (!file) return;

    try {
      const fd = new FormData();
      fd.append('media', file);
      const response = await settingsAPI.uploadMedia(fd);
      const url = response.data?.url;
      const type = response.data?.type || fallbackType || (file.type.startsWith('video/') ? 'video' : 'image');

      setFormData((prev) => ({
        ...prev,
        [targetField]: url,
        ...(targetField === 'heroVideoUrl' || targetField === 'heroImageUrl' ? {} : { whyUsMediaType: type }),
      }));

      return { url, type };
    } catch (error) {
      throw error;
    }
  };

  const handleLogoPaste = async (e) => {
    const pastedFile = Array.from(e.clipboardData?.items || [])
      .map((item) => (item.kind === 'file' ? item.getAsFile() : null))
      .find(Boolean);

    if (pastedFile) {
      e.preventDefault();
      await updateLogoFromFile(pastedFile);
    }
  };

  if (loading) return <p className="text-gray-500">Loading settings...</p>;

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
        <motion.button
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => onBack && onBack()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        >
          <FiArrowLeft /> Back
        </motion.button>
      </div>

      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-4">Homepage</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Hero Title</label>
            <input
              type="text"
              name="heroTitle"
              value={formData.heroTitle || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Hero Subtitle</label>
            <input
              type="text"
              name="heroSubtitle"
              value={formData.heroSubtitle || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Hero Background Video URL</label>
            <input
              type="url"
              name="heroVideoUrl"
              value={formData.heroVideoUrl || ''}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
            />

            <div className="mt-3 rounded-lg border-2 border-dashed border-gray-300 p-4 text-sm text-gray-600">
              <p className="font-medium text-gray-700">Upload Video (MP4, WebM)</p>
              <p className="mt-1">Drag & drop a video here or click to select a file to replace the hero background video.</p>
              <input
                type="file"
                accept="video/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    setUploadingVideo(true);
                    const { url } = await uploadMediaFile(file, 'heroVideoUrl', 'video');
                    setFormData((prev) => ({ ...prev, heroVideoUrl: url }));
                    toast.success('Video uploaded and set for hero');
                  } catch (err) {
                    toast.error('Failed to upload video');
                    console.error(err);
                  } finally {
                    setUploadingVideo(false);
                  }
                }}
                className="mt-3 block w-full text-sm text-gray-700"
              />
              {uploadingVideo && <p className="mt-2 text-xs text-gray-500">Uploading...</p>}
            </div>

            {formData.heroVideoUrl && (
              <div className="mt-3">
                <label className="block text-sm font-semibold mb-2">Current Hero Video Preview</label>
                <video src={formData.heroVideoUrl} controls className="max-h-48 w-full object-cover rounded-md border" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Hero Image URL / Path</label>
            <input
              type="text"
              name="heroImageUrl"
              value={formData.heroImageUrl || ''}
              onChange={handleChange}
              placeholder="/portrait-cutout.png or https://..."
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
            />
            <p className="text-xs text-gray-500 mt-1">Place your image in <span className="font-mono">/public</span> and set the path like <span className="font-mono">/portrait-cutout.png</span>.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">CTA Button Text</label>
            <input
              type="text"
              name="heroCtaText"
              value={formData.heroCtaText || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2">Discount Text</label>
            <input
              type="text"
              name="discountText"
              value={formData.discountText || ''}
              onChange={handleChange}
              placeholder="Get a discount"
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Locations (comma or newline separated)</label>
            <textarea
              name="locationsText"
              value={formData.locationsText || ''}
              onChange={handleChange}
              rows={2}
              placeholder="BUSINESS BAY, DUBAI MARINA, INTERNET CITY"
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary resize-y"
            />
          </div>
        </div>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-lg p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-4">Offer Banner</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="offerBanner.enabled"
              checked={Boolean(formData.offerBanner?.enabled)}
              onChange={handleChange}
              className="w-5 h-5 text-primary rounded"
            />
            <span className="text-gray-700 font-medium">Enable offer banner</span>
          </label>

          <div>
            <label className="block text-sm font-semibold mb-2">Offer Text</label>
            <input
              type="text"
              name="offerBanner.text"
              value={formData.offerBanner?.text || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Offer End Time</label>
            <input
              type="datetime-local"
              name="offerBanner.endsAt"
              value={formData.offerBanner?.endsAt || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-lg p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-4">Why Us Section</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Why Us Title</label>
            <input
              type="text"
              name="whyUsTitle"
              value={formData.whyUsTitle || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Why Us Description</label>
            <textarea
              name="whyUsDescription"
              value={formData.whyUsDescription || ''}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary resize-y"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Why Us Points (one point per line)</label>
            <textarea
              value={whyUsText}
              onChange={(e) => setWhyUsText(e.target.value)}
              rows={6}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary resize-y"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
            <div>
              <label className="block text-sm font-semibold mb-2">Why Us Media URL</label>
              <input
                type="text"
                name="whyUsMediaUrl"
                value={formData.whyUsMediaUrl || ''}
                onChange={handleChange}
                placeholder="/why-us.mp4 or https://..."
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Media Type</label>
              <select
                name="whyUsMediaType"
                value={formData.whyUsMediaType || 'image'}
                onChange={handleChange}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary bg-white"
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </div>
            <div className="mt-3 rounded-lg border-2 border-dashed border-gray-300 p-4 text-sm text-gray-600">
              <p className="font-medium text-gray-700">Upload Hero Image</p>
              <p className="mt-1">Use a portrait image for the hero poster and fallback background.</p>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    setUploadingHeroMedia(true);
                    const { url } = await uploadMediaFile(file, 'heroImageUrl', 'image');
                    setFormData((prev) => ({ ...prev, heroImageUrl: url }));
                    toast.success('Hero image uploaded');
                  } catch (err) {
                    toast.error('Failed to upload hero image');
                    console.error(err);
                  } finally {
                    setUploadingHeroMedia(false);
                  }
                }}
                className="mt-3 block w-full text-sm text-gray-700"
              />
              {uploadingHeroMedia && <p className="mt-2 text-xs text-gray-500">Uploading...</p>}
            </div>
          </div>

          <div className="rounded-lg border-2 border-dashed border-gray-300 p-4 text-sm text-gray-600">
            <p className="font-medium text-gray-700">Upload Why Us Media</p>
            <p className="mt-1">Drop a video or image of the parlor to fill the signature media box.</p>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  setUploadingWhyUsMedia(true);
                  const { url, type } = await uploadMediaFile(file, 'whyUsMediaUrl');
                  setFormData((prev) => ({ ...prev, whyUsMediaUrl: url, whyUsMediaType: type }));
                  toast.success('Why Us media uploaded');
                } catch (err) {
                  toast.error('Failed to upload Why Us media');
                  console.error(err);
                } finally {
                  setUploadingWhyUsMedia(false);
                }
              }}
              className="mt-3 block w-full text-sm text-gray-700"
            />
            {uploadingWhyUsMedia && <p className="mt-2 text-xs text-gray-500">Uploading...</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Signature Detail</label>
            <input
              type="text"
              name="whyUsSignatureDetail"
              value={formData.whyUsSignatureDetail || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Customize CTA Text</label>
            <input
              type="text"
              name="customizeCtaText"
              value={formData.customizeCtaText || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-lg p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-4">Parlor Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Parlor Name</label>
            <input
              type="text"
              name="parlorName"
              value={formData.parlorName || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Description</label>
            <textarea
              name="parlorDescription"
              value={formData.parlorDescription || ''}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Parlor Logo URL</label>
            <input
              type="text"
              name="parlorLogoUrl"
              value={formData.parlorLogoUrl || ''}
              onChange={handleChange}
              placeholder="https://... or data:image/png;base64,..."
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
            />
            <div className="mt-3 rounded-lg border-2 border-dashed border-gray-300 p-4 text-sm text-gray-600" onPaste={handleLogoPaste}>
              <p className="font-medium text-gray-700">Upload or paste logo (PNG/JPG)</p>
              <p className="mt-1">You can paste a copied image directly here (Ctrl+V), or select a file:</p>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => updateLogoFromFile(e.target.files?.[0])}
                className="mt-3 block w-full text-sm text-gray-700"
              />
            </div>
            {formData.parlorLogoUrl && (
              <img
                src={formData.parlorLogoUrl}
                alt="Logo preview"
                className="mt-3 h-16 w-16 rounded-full border border-gray-200 object-cover"
              />
            )}
          </div>
        </div>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-lg p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-4">Contact & Social</h3>
        <div className="space-y-4">
          <input
            type="email"
            name="contactEmail"
            value={formData.contactEmail || ''}
            onChange={handleChange}
            placeholder="Contact email"
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
          />

          <input
            type="tel"
            name="contactPhone"
            value={formData.contactPhone || ''}
            onChange={handleChange}
            placeholder="Contact phone"
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
          />

          <textarea
            name="contactAddress"
            value={formData.contactAddress || ''}
            onChange={handleChange}
            rows={2}
            placeholder="Address"
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary resize-none"
          />

          <input
            type="url"
            name="socialLinks.instagram"
            value={formData.socialLinks?.instagram || ''}
            onChange={handleChange}
            placeholder="Instagram URL"
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
          />

          <input
            type="url"
            name="socialLinks.facebook"
            value={formData.socialLinks?.facebook || ''}
            onChange={handleChange}
            placeholder="Facebook URL"
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
          />

          <input
            type="tel"
            name="socialLinks.whatsapp"
            value={formData.socialLinks?.whatsapp || ''}
            onChange={handleChange}
            placeholder="WhatsApp number"
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
          />
        </div>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white rounded-lg p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-4">Working Hours</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {days.map((day) => (
            <div key={day} className="space-y-2">
              <label className="block text-sm font-semibold capitalize">{day}</label>
              <div className="flex gap-2">
                <input
                  type="time"
                  name={`workingHours.${day}.open`}
                  value={formData.workingHours?.[day]?.open || '09:00'}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                />
                <input
                  type="time"
                  name={`workingHours.${day}.close`}
                  value={formData.workingHours?.[day]?.close || '20:00'}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {logoCropSrc && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-5">
            <h4 className="mb-3 text-lg font-bold text-gray-800">Crop Logo</h4>
            <div className="relative h-[320px] w-full overflow-hidden rounded-lg bg-gray-100">
              <Cropper
                image={logoCropSrc}
                crop={logoCrop}
                zoom={logoZoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setLogoCrop}
                onZoomChange={setLogoZoom}
                onCropComplete={onLogoCropComplete}
              />
            </div>
            <div className="mt-4">
              <label className="mb-1 block text-sm font-semibold text-gray-700">Zoom</label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={logoZoom}
                onChange={(e) => setLogoZoom(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={handleApplyLogoCrop}
                className="flex-1 rounded-lg bg-primary px-4 py-2 font-semibold text-white"
              >
                Apply Crop
              </button>
              <button
                type="button"
                onClick={() => setLogoCropSrc('')}
                className="flex-1 rounded-lg bg-gray-200 px-4 py-2 font-semibold text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        type="submit"
        disabled={saving}
        className="w-full px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save All Changes'}
      </motion.button>
    </form>
  );
}
