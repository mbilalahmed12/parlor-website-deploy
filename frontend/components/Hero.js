import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { settingsAPI } from '@/lib/api';
import { FaWhatsapp } from 'react-icons/fa';

const formatTimeLeft = (targetDate) => {
  if (!targetDate) return '00 : 00 : 00 : 00';
  const ms = new Date(targetDate).getTime() - Date.now();
  if (ms <= 0) return '00 : 00 : 00 : 00';

  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const seconds = Math.floor((ms / 1000) % 60);

  return `${String(days).padStart(2, '0')} : ${String(hours).padStart(2, '0')} : ${String(minutes).padStart(2, '0')} : ${String(seconds).padStart(2, '0')}`;
};

const buildWhatsAppUrl = (phone, text) => {
  const digits = String(phone || '').replace(/[^\d]/g, '');
  if (!digits) return '/booking';
  return `https://wa.me/${digits}?text=${encodeURIComponent(text || 'Hi, I would like to book a service.')}`;
};

export default function Hero({ activeTab, onTabChange }) {
  const [settings, setSettings] = useState(null);
  const [timeLeft, setTimeLeft] = useState('00 : 00 : 00 : 00');

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

  useEffect(() => {
    setTimeLeft(formatTimeLeft(settings?.offerBanner?.endsAt));
    const timer = setInterval(() => {
      setTimeLeft(formatTimeLeft(settings?.offerBanner?.endsAt));
    }, 1000);

    return () => clearInterval(timer);
  }, [settings?.offerBanner?.endsAt]);

  const whatsappUrl = useMemo(
    () => buildWhatsAppUrl(settings?.socialLinks?.whatsapp || settings?.contactPhone, `Hi, I want to book at ${settings?.parlorName || 'Elegant Edge'}.`),
    [settings?.contactPhone, settings?.parlorName, settings?.socialLinks?.whatsapp]
  );

  const bookUrl = useMemo(() => {
    const phone = String(settings?.socialLinks?.whatsapp || settings?.contactPhone || '').replace(/[^\d]/g, '');
    return phone ? `https://wa.me/${phone}` : '/booking';
  }, [settings?.contactPhone, settings?.socialLinks?.whatsapp]);

  const headline = settings?.heroTitle || 'Welcome to Elegant Edge\nWhere beauty is personalized';
  const locationText = settings?.locationsText || 'BUSINESS BAY, DUBAI MARINA, INTERNET CITY, DIFC, ABU DHABI';

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#c3c9aa] pt-24 text-secondary">
      <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.45),transparent_26%),radial-gradient(circle_at_80%_25%,rgba(255,255,255,0.25),transparent_20%),radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.15),transparent_25%)]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-6rem)] max-w-[1500px] flex-col px-4 pb-10 lg:px-10">
        <div className="mb-8 flex items-center justify-between gap-4">
            <div className="text-[3rem] font-semibold leading-none tracking-[-0.08em] text-secondary md:text-[4.5rem]" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
              {settings?.parlorName || 'Elegant Edge'}
          </div>

          <div className="flex items-center gap-3">
            <a
              href={whatsappUrl}
              target={whatsappUrl.startsWith('http') ? '_blank' : undefined}
              rel={whatsappUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="grid h-12 w-12 place-items-center rounded-xl bg-secondary text-light shadow-sm transition-transform hover:-translate-y-0.5"
              aria-label="WhatsApp"
            >
              <FaWhatsapp size={22} />
            </a>
            <a
              href={settings?.socialLinks?.instagram || 'https://instagram.com'}
              target="_blank"
              rel="noopener noreferrer"
              className="grid h-12 w-12 place-items-center rounded-xl bg-secondary text-light shadow-sm transition-transform hover:-translate-y-0.5"
              aria-label="Instagram"
            >
              <span className="text-lg font-semibold">◎</span>
            </a>
            <a
              href={bookUrl}
              target={bookUrl.startsWith('http') ? '_blank' : undefined}
              rel={bookUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="rounded-full bg-black px-7 py-3 text-lg font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
            >
              {settings?.contactPhone || '+971 54 247 8604'}
            </a>
          </div>
        </div>

        <div className="mb-8 text-center text-[1rem] font-medium uppercase tracking-[0.16em] text-secondary lg:text-left">
          {locationText}
        </div>

        <div className="grid flex-1 items-center gap-10 lg:grid-cols-[1fr_1fr] lg:gap-10">
          <div className="max-w-[760px] pl-6 lg:pl-0">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="whitespace-pre-line text-[3.6rem] font-extrabold leading-[0.91] tracking-[-0.06em] text-black sm:text-[4.2rem] md:text-[5rem] lg:text-[6.8rem]"
              style={{ fontFamily: 'Oswald, Arial Narrow, Arial, sans-serif' }}
            >
              {headline}
            </motion.h1>
            <p className="mt-6 max-w-[540px] text-sm uppercase tracking-widest text-[#2d261f]">{locationText}</p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mx-auto w-full max-w-[420px] rounded-[36px] bg-[#e8e2c8] p-8 text-center shadow-[0_20px_50px_rgba(0,0,0,0.12)] lg:mx-0"
          >
            <p className="mb-3 text-[1.1rem] uppercase tracking-[0.14em] text-[#6a6252]">
              {settings?.discountText || settings?.offerBanner?.text || 'Offer ending soon'}
            </p>
            <div className="mb-4 text-[2.8rem] font-semibold tracking-[0.12em] text-[#8a8876]" style={{ fontFamily: 'Courier New, monospace' }}>
              {timeLeft}
            </div>
            <div className="mb-5 grid grid-cols-4 gap-2 text-[0.82rem] uppercase tracking-[0.25em] text-[#8b8574]">
              <span>days</span>
              <span>hours</span>
              <span>minutes</span>
              <span>seconds</span>
            </div>
            <a href={whatsappUrl} target={whatsappUrl.startsWith('http') ? '_blank' : undefined} rel={whatsappUrl.startsWith('http') ? 'noopener noreferrer' : undefined} className="mx-auto mb-6 inline-flex w-full max-w-[250px] items-center justify-center rounded-full bg-black px-8 py-4 text-xl font-medium text-white transition-transform hover:-translate-y-0.5">
              {settings?.heroCtaText || 'Open WhatsApp'}
            </a>
            <p className="text-[1rem] uppercase tracking-[0.14em] text-[#8a8876]">
              Available for new customers only
            </p>
          </motion.div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
          {activeTab && (
            <span className="rounded-full border border-black/30 bg-black/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.14em] text-black">{activeTab === 'her' ? 'For Her' : 'For Him (coming soon)'}</span>
          )}
          <button type="button" onClick={() => onTabChange?.('her')} className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white">For Her</button>
          <button type="button" onClick={() => onTabChange?.('him')} className="rounded-full border border-black/50 px-5 py-2 text-sm font-semibold text-black">For Him (coming soon)</button>
        </div>
      </div>
    </section>
  );
}
