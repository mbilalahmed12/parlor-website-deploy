import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { settingsAPI } from '@/lib/api';
import { FiInstagram, FiFacebook, FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import Link from 'next/link';

export default function Footer() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await settingsAPI.get();
        setSettings(response.data);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };
    fetchSettings();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <footer id="contact" className="bg-dark text-white py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8"
        >
          {/* Brand */}
          <motion.div variants={itemVariants}>
            {settings?.parlorLogoUrl && (
              <img
                src={settings.parlorLogoUrl}
                alt="Parlor logo"
                className="w-14 h-14 rounded-full object-cover border border-white/20 mb-3"
              />
            )}
            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-3">
              {settings?.parlorName || 'Elegant Edge'}
            </h3>
            <p className="text-gray-400 mb-4">
              {settings?.parlorDescription || 'Your premium beauty and wellness destination'}
            </p>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={itemVariants}>
            <h4 className="text-lg font-bold mb-4">Contact</h4>
            <div className="space-y-3 text-gray-400">
              <div className="flex items-center gap-3 hover:text-primary transition-colors">
                <FiPhone />
                <a href={`tel:${settings?.contactPhone}`}>{settings?.contactPhone}</a>
              </div>
              <div className="flex items-center gap-3 hover:text-primary transition-colors">
                <FiMail />
                <a href={`mailto:${settings?.contactEmail}`}>{settings?.contactEmail}</a>
              </div>
              <div className="flex items-center gap-3 hover:text-primary transition-colors">
                <FiMapPin />
                <span>{settings?.contactAddress}</span>
              </div>
            </div>
          </motion.div>

          {/* Working Hours */}
          <motion.div variants={itemVariants}>
            <h4 className="text-lg font-bold mb-4">Working Hours</h4>
            <div className="space-y-2 text-sm text-gray-400">
              {settings?.workingHours && (
                <>
                  <p>Monday - Friday: {settings.workingHours.monday.open} - {settings.workingHours.monday.close}</p>
                  <p>Saturday: {settings.workingHours.saturday.open} - {settings.workingHours.saturday.close}</p>
                  <p>Sunday: {settings.workingHours.sunday.open} - {settings.workingHours.sunday.close}</p>
                </>
              )}
            </div>
          </motion.div>

          {/* Social Links */}
          <motion.div variants={itemVariants}>
            <h4 className="text-lg font-bold mb-4">Follow Us</h4>
            <div className="flex gap-4">
              {settings?.socialLinks?.instagram && (
                <motion.a
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  whileTap={{ scale: 0.9 }}
                  href={settings.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xl hover:text-primary transition-colors"
                >
                  <FiInstagram />
                </motion.a>
              )}
              {settings?.socialLinks?.facebook && (
                <motion.a
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  whileTap={{ scale: 0.9 }}
                  href={settings.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xl hover:text-primary transition-colors"
                >
                  <FiFacebook />
                </motion.a>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="h-px bg-gradient-to-r from-transparent via-primary to-transparent mb-8"
        />

        {/* Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm"
        >
          <p>&copy; 2024 {settings?.parlorName || 'Elegant Edge'}. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/#services" className="hover:text-primary transition-colors">
              Services
            </Link>
            <Link href="/#testimonials" className="hover:text-primary transition-colors">
              Reviews
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
