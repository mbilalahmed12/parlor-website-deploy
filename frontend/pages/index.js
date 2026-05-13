import Head from 'next/head';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import WhyUs from '@/components/WhyUs';
import Services from '@/components/Services';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/lib/store';
import { settingsAPI } from '@/lib/api';
import defaultSiteSettings from '@/lib/defaultSiteSettings';
import { defaultCategories } from '@/lib/defaultServices';

export default function Home() {
  const { hydrate } = useAuthStore();
  const [settings, setSettings] = useState(defaultSiteSettings);
  const [activeTab, setActiveTab] = useState('her');

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENABLE_LIVE_API !== 'true') return;

    const fetchSettings = async () => {
      try {
        const response = await settingsAPI.get();
        setSettings((prev) => ({ ...prev, ...response.data }));
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };

    fetchSettings();
  }, []);

  return (
    <>
      <Head>
        <title>Elegant Edge - Where beauty is personalized</title>
        <meta name="description" content="Elegant Edge beauty services with editable categories, offers, and custom booking flow." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-[#f5efe5] text-[#16110d]">
        <Header />
        <Hero settings={settings} activeTab={activeTab} onTabChange={setActiveTab} />
        <WhyUs settings={settings} />
        <Services audience={activeTab} onAudienceChange={setActiveTab} />
        <Footer />
      </div>
    </>
  );
}

export async function getStaticProps() {
  return {
    props: {
      initialSettings: defaultSiteSettings,
      initialCategories: defaultCategories,
    },
  };
}
