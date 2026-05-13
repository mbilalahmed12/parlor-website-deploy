import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiStar } from 'react-icons/fi';

const buildWhyUsPoints = (points) => (Array.isArray(points) ? points.filter(Boolean) : []);

export default function WhyUs({ settings }) {
  const points = buildWhyUsPoints(settings?.whyUsPoints);
  const title = settings?.whyUsTitle || 'Why Elegant Edge';
  const description = settings?.whyUsDescription || 'A luxury-first salon experience shaped around your features, pace, and preferences.';
  const mediaUrl = settings?.whyUsMediaUrl || settings?.heroImageUrl || '';
  const mediaType = settings?.whyUsMediaType === 'video' ? 'video' : 'image';
  const ctaLabel = settings?.customizeCtaText || 'Customize your need and book';
  const signatureDetail = settings?.whyUsSignatureDetail || 'Cinematic visuals, warm ambience, and a premium experience from the first scroll.';

  return (
    <section id="why-us" className="relative overflow-hidden bg-[#f4ede1] py-16 text-[#1a130e] sm:py-20 lg:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(214,176,125,0.22),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(47,34,23,0.08),transparent_26%)]" aria-hidden />
      <div className="relative mx-auto grid max-w-[1500px] gap-10 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          viewport={{ once: true, amount: 0.4 }}
          className="max-w-2xl"
        >
          <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-[#b99767]/30 bg-white/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#6b5137] shadow-sm backdrop-blur-sm">
            <FiStar />
            Tailored luxury
          </div>

          <h2 className="font-serif text-[clamp(2.4rem,5vw,4.8rem)] leading-[0.96] tracking-[-0.06em] text-[#17110c]" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
            {title}
          </h2>

          <p className="mt-5 max-w-xl text-base leading-8 text-[#4b3a2b] sm:text-lg">
            {description}
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {points.slice(0, 4).map((point, index) => (
              <motion.div
                key={`${point}-${index}`}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                viewport={{ once: true, amount: 0.35 }}
                className="flex items-start gap-3 rounded-2xl border border-[#1b130d]/10 bg-white/70 p-4 shadow-[0_16px_40px_rgba(36,24,16,0.08)] backdrop-blur-sm"
              >
                <FiCheckCircle className="mt-0.5 shrink-0 text-xl text-[#9b6d3e]" />
                <span className="text-sm leading-7 text-[#32261c] sm:text-[0.95rem]">{point}</span>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/booking"
              className="inline-flex items-center justify-center rounded-full bg-[#15100c] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white shadow-[0_16px_32px_rgba(21,16,12,0.18)] transition-transform hover:-translate-y-0.5"
            >
              {ctaLabel}
            </Link>
            <span className="text-sm text-[#66503e]">High-touch service, minimal friction, modern elegance.</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
          viewport={{ once: true, amount: 0.35 }}
          className="relative overflow-hidden rounded-[2rem] border border-[#1b130d]/10 bg-[#17110c] shadow-[0_30px_80px_rgba(31,21,13,0.22)]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(214,176,125,0.22),transparent_34%),linear-gradient(180deg,rgba(18,14,11,0.12)_0%,rgba(18,14,11,0.72)_100%)]" aria-hidden />

          {mediaUrl ? (
            mediaType === 'video' ? (
              <video
                src={mediaUrl}
                autoPlay
                muted
                loop
                playsInline
                className="h-full min-h-[22rem] w-full object-cover sm:min-h-[30rem]"
              />
            ) : (
              <img
                src={mediaUrl}
                alt={title}
                className="h-full min-h-[22rem] w-full object-cover sm:min-h-[30rem]"
              />
            )
          ) : (
            <div className="flex min-h-[22rem] items-end bg-[linear-gradient(180deg,#35271b_0%,#130e0a_100%)] p-8 sm:min-h-[30rem]">
              <div className="max-w-sm text-white/80">
                <p className="text-sm uppercase tracking-[0.22em] text-white/55">Admin media placeholder</p>
                <p className="mt-3 text-2xl leading-tight font-semibold">Add a portrait image or short video to complete the luxury story.</p>
              </div>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 z-10 p-5 sm:p-7">
            <div className="max-w-sm rounded-[1.5rem] border border-white/12 bg-black/30 p-4 text-white shadow-[0_16px_40px_rgba(0,0,0,0.2)] backdrop-blur-md sm:p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-white/60">Signature detail</p>
              <p className="mt-2 text-lg font-medium leading-7 text-white">{signatureDetail}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}