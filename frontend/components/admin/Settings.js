import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { settingsAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { FiArrowLeft } from 'react-icons/fi';

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
            <label className="block text-sm font-semibold mb-2">Why Us Points (one point per line)</label>
            <textarea
              value={whyUsText}
              onChange={(e) => setWhyUsText(e.target.value)}
              rows={6}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary resize-y"
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
              type="url"
              name="parlorLogoUrl"
              value={formData.parlorLogoUrl || ''}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
            />
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
