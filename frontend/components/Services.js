import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { servicesAPI } from '@/lib/api';
import { FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';

export default function Services({ audience = 'her' }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await servicesAPI.getCategories({ audience });
      setCategories(response.data || []);
    } catch (error) {
      console.error('Failed to fetch service categories:', error);
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
    <section id="services" className="py-20 px-4 bg-light">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
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
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow"
              >
                <div className="relative h-48 bg-gradient-to-br from-primary/35 to-secondary/35 flex items-center justify-center">
                  {category.backgroundVideoUrl ? (
                    <video
                      src={category.backgroundVideoUrl}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-5xl text-primary">{category.label?.charAt(0) || 'S'}</div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-secondary">{category.label}</h3>
                  <p className="text-gray-600 mb-4 mt-2">
                    {category.serviceCount} service{category.serviceCount > 1 ? 's' : ''}
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
