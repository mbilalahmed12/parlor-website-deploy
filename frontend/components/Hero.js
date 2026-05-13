import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';
import { FiArrowRight } from 'react-icons/fi';

const DEFAULT_HERO_VIDEO = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

const buildWhatsAppUrl = (phone, text) => {
  const digits = String(phone || '').replace(/[^\d]/g, '');
  if (!digits) return '/booking';
  return `https://wa.me/${digits}?text=${encodeURIComponent(text || 'Hi, I would like to book a service.')}`;
};

export default function Hero({ settings, activeTab, onTabChange }) {
  const videoRef = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoSrc = settings?.heroVideoUrl || DEFAULT_HERO_VIDEO;

  const whatsappUrl = useMemo(
    () => buildWhatsAppUrl(settings?.socialLinks?.whatsapp || settings?.contactPhone, `Hi, I want to book at ${settings?.parlorName || 'Elegant Edge'}.`),
    [settings?.contactPhone, settings?.parlorName, settings?.socialLinks?.whatsapp]
  );

  const bookUrl = useMemo(() => {
    const phone = String(settings?.socialLinks?.whatsapp || settings?.contactPhone || '').replace(/[^\d]/g, '');
    return phone ? `https://wa.me/${phone}` : '/booking';
  }, [settings?.contactPhone, settings?.socialLinks?.whatsapp]);

  const heroTitle = settings?.heroTitle || 'Welcome to Elegant Edge';
  const heroSubtitle = settings?.heroSubtitle || 'Where Beauty Is Personalized';
  const supportCopy = settings?.parlorDescription || 'Premium consultations, refined artistry, and a calm luxury experience tailored to you.';
  const locationText = settings?.locationsText || 'BUSINESS BAY · DUBAI MARINA · INTERNET CITY · DIFC · ABU DHABI';
  const ctaLabel = settings?.heroCtaText || 'Book on WhatsApp';

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc) return;

    const tryPlay = async () => {
      try {
        video.muted = true;
        await video.play();
      } catch (error) {
        // Autoplay may be blocked until a user gesture.
      }
    };

    tryPlay();
  }, [videoSrc]);

  const handleCanPlay = () => {
    setVideoLoaded(true);
  };

  return (
    <section className="relative isolate min-h-screen overflow-hidden bg-[#120f0d] pt-24 text-white">
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#120f0d]">
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out"
          style={{
            backgroundImage: settings?.heroImageUrl ? `url(${settings?.heroImageUrl})` : undefined,
            opacity: videoLoaded ? 0 : 1,
            filter: videoLoaded ? 'blur(2px) brightness(0.6)' : 'none',
            transform: videoLoaded ? 'scale(1.05)' : 'scale(1)',
          }}
        />

        {videoSrc && (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={settings?.heroImageUrl || undefined}
            onCanPlay={handleCanPlay}
            onPlaying={handleCanPlay}
            className="absolute inset-0 h-full w-full object-cover object-center"
            style={{
              opacity: videoLoaded ? 1 : 0,
              transition: 'opacity 800ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            src={videoSrc}
          />
        )}

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,8,6,0.22)_0%,rgba(11,8,6,0.62)_48%,rgba(11,8,6,0.94)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(214,177,128,0.2),transparent_22%),radial-gradient(circle_at_82%_24%,rgba(255,255,255,0.08),transparent_16%),radial-gradient(circle_at_50%_100%,rgba(211,170,119,0.18),transparent_25%)]" />
        <div className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:72px_72px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-6rem)] max-w-[1500px] items-end px-4 pb-8 sm:px-6 lg:px-10 lg:pb-14">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
          className="max-w-3xl"
        >
          <div className="mb-5 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/70">
            <span>{settings?.parlorName || 'Elegant Edge'}</span>
            <span className="h-px w-10 bg-white/30" aria-hidden />
            <span>{locationText}</span>
          </div>

          <h1 className="max-w-3xl text-left text-[clamp(3.2rem,8vw,7.8rem)] leading-[0.88] tracking-[-0.08em] text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.4)]" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
            <span className="block">{heroTitle}</span>
            <span className="mt-2 block text-[0.46em] font-light tracking-[0.16em] text-white/80 sm:text-[0.44em]">
              {heroSubtitle}
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-7 text-white/80 sm:text-base">
            {supportCopy}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <motion.a
              href={whatsappUrl}
              target={whatsappUrl.startsWith('http') ? '_blank' : undefined}
              rel={whatsappUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center gap-3 rounded-full bg-[#d6b07d] px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#1a120b] shadow-[0_20px_50px_rgba(214,176,125,0.35)] transition-transform hover:bg-[#e4bf90]"
            >
              {ctaLabel}
              <FaWhatsapp size={18} />
            </motion.a>

            <motion.a
              href={bookUrl}
              target={bookUrl.startsWith('http') ? '_blank' : undefined}
              rel={bookUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
              whileHover={{ x: 4 }}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm transition-colors hover:border-white/35 hover:bg-white/15"
            >
              View Booking
              <FiArrowRight />
            </motion.a>

            <a
              href="#why-us"
              className="inline-flex items-center justify-center gap-2 rounded-full px-2 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white/80 transition-colors hover:text-white"
            >
              Discover Why Us
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <motion.button
              type="button"
              onClick={() => onTabChange?.('her')}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className={`rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] transition-all ${activeTab === 'her' ? 'bg-white text-[#16110d]' : 'border border-white/25 bg-white/8 text-white/85 hover:bg-white/12'}`}
            >
              For Her
            </motion.button>
            <motion.button
              type="button"
              onClick={() => onTabChange?.('him')}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className={`rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] transition-all ${activeTab === 'him' ? 'bg-[#d6b07d] text-[#17110c]' : 'border border-white/25 bg-white/8 text-white/85 hover:bg-white/12'}`}
            >
              For Him (coming soon)
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
