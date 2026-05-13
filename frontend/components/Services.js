import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { servicesAPI } from '@/lib/api';
import { FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';
import { defaultCategories } from '@/lib/defaultServices';

export default function Services({ audience = 'her', onAudienceChange }) {
  const [categories, setCategories] = useState(defaultCategories);
  const [loading, setLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    if (process.env.NEXT_PUBLIC_ENABLE_LIVE_API !== 'true') {
      setCategories(defaultCategories);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await servicesAPI.getCategories({ audience });
      setCategories(response.data || []);
    } catch (error) {
      console.error('Failed to fetch service categories:', error);
      setCategories(defaultCategories);
    } finally {
      setLoading(false);
    }
  }, [audience]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

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
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  return (
    <section id="services" className="py-20 px-4 bg-[radial-gradient(circle_at_top,#efe8d6_0%,#e9dfca_40%,#e4d7bf_100%)]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
            <motion.button
              type="button"
              onClick={() => onAudienceChange?.('her')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] transition-all ${audience === 'her' ? 'bg-[#21170f] text-white' : 'border border-[#21170f]/20 bg-white/70 text-[#21170f]'}`}
            >
              For Her
            </motion.button>
            <motion.button
              type="button"
              onClick={() => onAudienceChange?.('him')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] transition-all ${audience === 'him' ? 'bg-[#d6b07d] text-[#21170f]' : 'border border-[#21170f]/20 bg-white/70 text-[#21170f]'}`}
            >
              For Him (coming soon)
            </motion.button>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#21170f]" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
            {audience === 'him' ? 'For Him' : 'For Her'} Services
          </h2>
          <p className="text-[#4a3b2f] text-lg max-w-2xl mx-auto">
            {audience === 'him'
              ? 'The For Him lineup is coming soon. You can still reach out for custom requests.'
              : 'Browse service categories and open a dedicated page for each category.'}
          </p>
        </motion.div>

        {audience === 'him' ? (
          <div className="mx-auto max-w-3xl rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
            <p className="text-lg font-semibold text-amber-900">For Him (coming soon)</p>
            <p className="mt-2 text-[#4a3b2f]">We are preparing a curated men&apos;s menu. Contact us on WhatsApp for early bookings.</p>
          </div>
        ) : null}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-[#4a3b2f]">Loading categories...</p>
          </div>
        ) : audience === 'her' ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {categories.map((category) => (
              <motion.div
                key={category.key}
                variants={itemVariants}
                whileHover={{ y: -10 }}
                className="group overflow-hidden rounded-[28px] border border-black/10 bg-white/70 shadow-[0_12px_30px_rgba(0,0,0,0.14)] backdrop-blur-sm transition-shadow hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)]"
              >
                <div className="relative h-56 bg-gradient-to-br from-primary/35 to-secondary/35 flex items-center justify-center">
                  {category.backgroundVideoUrl ? (
                    <video
                      src={category.backgroundVideoUrl}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : category.backgroundImageUrl ? (
                    <img
                      src={category.backgroundImageUrl}
                      alt={category.label}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="text-5xl text-primary">{category.label?.charAt(0) || 'S'}</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
                  <div className="absolute left-4 bottom-4 rounded-full bg-white/85 px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-black">
                    {category.serviceCount} service{category.serviceCount > 1 ? 's' : ''}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-2xl font-bold text-[#2c2116]" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>{category.label}</h3>
                  <p className="text-[#4d3c2f] mb-4 mt-2">
                    Explore curated treatments tailored by our specialists.
                  </p>

                  <Link href={`/services/${encodeURIComponent(category.key)}?audience=${audience}`}>
                    <motion.button
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-secondary text-light rounded-lg font-bold hover:bg-[#242424] transition-all"
                    >
                      Open Category <FiArrowRight />
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : null}

        {!loading && audience === 'her' && categories.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
            <p className="text-[#4a3b2f]">No categories available yet. Add services from admin to populate this section.</p>
          </div>
        )}
      </div>
    </section>
  );
}
