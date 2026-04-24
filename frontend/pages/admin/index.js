import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/lib/store';
import { Toaster, toast } from 'react-hot-toast';
import { FiX, FiMenu, FiLogOut } from 'react-icons/fi';
import Services from '@/components/admin/Services';
import Bookings from '@/components/admin/Bookings';
import Reviews from '@/components/admin/Reviews';
import Settings from '@/components/admin/Settings';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'services', label: 'Services', icon: '💇' },
  { id: 'bookings', label: 'Bookings', icon: '📅' },
  { id: 'reviews', label: 'Reviews', icon: '⭐' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, token, logout } = useAuthStore();
  const router = useRouter();
  const canManageWebsite = user?.role === 'owner' || user?.role === 'admin';

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  useEffect(() => {
    if (token && user && !canManageWebsite) {
      toast.error('You do not have permission to access admin controls.');
      router.push('/');
    }
  }, [token, user, canManageWebsite, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
    toast.success('Logged out successfully');
  };

  if (!token || !user) return null;

  return (
    <>
      <Head>
        <title>Admin Dashboard - Elite Parlor</title>
      </Head>

      <div className="min-h-screen bg-light flex">
        <Toaster position="top-right" />

        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed md:relative w-64 bg-dark text-white p-6 h-screen overflow-y-auto z-40"
            >
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Elite Admin
                </h1>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="md:hidden text-xl"
                >
                  <FiX />
                </button>
              </div>

              <nav className="space-y-3 mb-8">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSidebarOpen(false);
                    }}
                    whileHover={{ x: 10 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-primary text-white font-bold'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <span className="text-xl mr-3">{tab.icon}</span>
                    {tab.label}
                  </motion.button>
                ))}
              </nav>

              <div className="border-t border-gray-700 pt-6">
                <p className="text-sm text-gray-400 mb-2">Logged in as:</p>
                <p className="font-semibold mb-4">{user?.name}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold transition-colors"
                >
                  <FiLogOut /> Logout
                </motion.button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-2xl text-primary"
            >
              <FiMenu />
            </motion.button>
            <h2 className="text-3xl font-bold text-gray-800">
              {tabs.find((t) => t.id === activeTab)?.label}
            </h2>
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary"></div>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'dashboard' && <DashboardView user={user} canManageWebsite={canManageWebsite} />}
              {activeTab === 'services' && <Services />}
              {activeTab === 'bookings' && <Bookings />}
              {activeTab === 'reviews' && <Reviews />}
              {activeTab === 'settings' && <Settings />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </>
  );
}

function DashboardView({ user, canManageWebsite }) {
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingReviews: 0,
    activeServices: 0,
  });

  useEffect(() => {
    // Fetch stats from API
    setStats({
      totalBookings: 0,
      pendingReviews: 0,
      activeServices: 0,
    });
  }, []);

  const statCards = [
    { title: 'Total Bookings', value: stats.totalBookings, icon: '📅', color: 'from-blue-500 to-cyan-500' },
    { title: 'Pending Reviews', value: stats.pendingReviews, icon: '⏳', color: 'from-yellow-500 to-orange-500' },
    { title: 'Active Services', value: stats.activeServices, icon: '✨', color: 'from-purple-500 to-pink-500' },
    {
      title: 'Owner Access',
      value: canManageWebsite ? `Enabled (${user?.role || 'unknown'})` : 'Disabled',
      icon: '🔐',
      color: canManageWebsite ? 'from-emerald-500 to-green-600' : 'from-gray-500 to-gray-700',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {statCards.map((card, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ y: -5 }}
          className={`bg-gradient-to-br ${card.color} rounded-xl p-6 text-white shadow-lg`}
        >
          <div className="text-4xl mb-4">{card.icon}</div>
          <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
          <p className="text-2xl md:text-3xl font-bold break-words">{card.value}</p>
        </motion.div>
      ))}
    </div>
  );
}
