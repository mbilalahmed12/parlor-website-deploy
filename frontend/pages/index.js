import Head from 'next/head';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/lib/store';

export default function Home() {
  const { hydrate } = useAuthStore();
  const [activeTab, setActiveTab] = useState('her');

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <>
      <Head>
        <title>Elegant Edge - Where beauty is personalized</title>
        <meta name="description" content="Elegant Edge beauty services with editable categories, offers, and custom booking flow." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-[#c3c9aa]">
        <Header />
        <Hero activeTab={activeTab} onTabChange={setActiveTab} />
        <Services audience={activeTab} />
        <Footer />
      </div>
    </>
  );
}
