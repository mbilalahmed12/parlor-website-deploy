import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { servicesAPI, settingsAPI } from '@/lib/api';

const titleCase = (value = '') =>
  value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const buildWhatsAppUrl = (phone, text) => {
  const digits = String(phone || '').replace(/[^\d]/g, '');
  if (!digits) return '/booking';
  return `https://wa.me/${digits}?text=${encodeURIComponent(text || 'Hi, I need a custom service package.')}`;
};

export default function ServiceCategoryPage() {
  const router = useRouter();
  const { category, audience = 'her' } = router.query;

  const [services, setServices] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [servicesResponse, settingsResponse] = await Promise.all([
          servicesAPI.getAll({ category, audience }),
          settingsAPI.get(),
        ]);
        setServices(servicesResponse.data || []);
        setSettings(settingsResponse.data);
      } catch (error) {
        console.error('Failed to fetch category data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [category, audience]);

  const backgroundVideo = useMemo(() => {
    const withCategoryVideo = services.find((service) => service.categoryVideoUrl);
    if (withCategoryVideo?.categoryVideoUrl) return withCategoryVideo.categoryVideoUrl;

    const withMediaVideo = services.find((service) => service.mediaType === 'video' && service.mediaUrl);
    return withMediaVideo?.mediaUrl || '';
  }, [services]);

  const categoryLabel = useMemo(() => {
    if (services[0]?.categoryLabel) return services[0].categoryLabel;
    return titleCase(String(category || 'Services'));
  }, [category, services]);

  const whatsappUrl = buildWhatsAppUrl(
    settings?.socialLinks?.whatsapp,
    `Hi, I want to customize my ${categoryLabel} booking.`
  );

  return (
    <>
      <Head>
        <title>{categoryLabel} Services - Elegant Edge</title>
      </Head>

      <div className="min-h-screen bg-white">
        <Header />

        <section className="relative pt-16">
          <div className="relative h-[58vh] w-full overflow-hidden bg-gray-900">
            {backgroundVideo ? (
              <video
                src={backgroundVideo}
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/55 to-black/75" />

            <div className="relative z-10 mx-auto flex h-full max-w-6xl items-end px-4 pb-10 md:px-6">
              <div>
                <p className="mb-2 text-sm uppercase tracking-[0.2em] text-gray-200">{audience === 'him' ? 'For Him' : 'For Her'}</p>
                <h1 className="text-4xl font-bold text-white md:text-6xl">{categoryLabel}</h1>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 md:px-6">
          <div className="mx-auto max-w-6xl">
            {loading ? (
              <p className="text-center text-gray-500">Loading services...</p>
            ) : services.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
                <p className="text-gray-700">No services found in this category yet.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {services.map((service, index) => (
                  <motion.div
                    key={service._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06 }}
                    className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
                  >
                    <h2 className="text-xl font-bold text-gray-900">{service.name}</h2>
                    <p className="mt-2 text-sm text-gray-600">{service.description}</p>
                    <div className="mt-5 flex items-end justify-between">
                      <p className="text-2xl font-bold text-primary">${service.price}</p>
                      <p className="text-sm text-gray-500">{service.duration} mins</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            <div className="mt-14 rounded-3xl bg-gradient-to-r from-primary to-secondary p-8 text-white">
              <h3 className="text-2xl font-bold">{settings?.customizeCtaText || 'Customize your need and book'}</h3>
              <p className="mt-2 max-w-2xl text-white/90">
                Need a tailored package? Share your requirements and we will personalize a session for you.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/booking" className="rounded-lg bg-white px-6 py-3 font-semibold text-gray-900">
                  Book Appointment
                </Link>
                <a
                  href={whatsappUrl}
                  target={whatsappUrl.startsWith('http') ? '_blank' : undefined}
                  rel={whatsappUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="rounded-lg border border-white/60 px-6 py-3 font-semibold text-white"
                >
                  Customize on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
