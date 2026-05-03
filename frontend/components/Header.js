import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiMenu, FiX, FiLogOut } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/router';
import { settingsAPI } from '@/lib/api';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const { user, token, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await settingsAPI.get();
        setSettings(response.data);
      } catch (error) {
        // Keep default branding if settings are unavailable.
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 70);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const menuItems = [{ label: 'Services', href: '/#services' }, { label: 'Contact', href: '/#contact' }];

  const whatsappDigits = String(settings?.socialLinks?.whatsapp || settings?.contactPhone || '').replace(/[^\d]/g, '');
  const whatsappHref = whatsappDigits ? `https://wa.me/${whatsappDigits}` : '/booking';

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md transition-all duration-300 ${scrolled ? 'bg-[#c3c9aa]/95 shadow-[0_8px_24px_rgba(0,0,0,0.12)]' : 'bg-[#c3c9aa]/80'}`}>
      <nav className={`mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 transition-all duration-300 lg:px-10 ${scrolled ? 'py-2.5' : 'py-4'}`}>
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/" className="flex items-center gap-3">
            {scrolled ? (
              <>
                {settings?.parlorLogoUrl ? (
                  <img
                    src={settings.parlorLogoUrl}
                    alt={`${settings?.parlorName || 'Elegant Edge'} logo`}
                    className="h-11 w-11 rounded-full object-cover border border-black/20 bg-white"
                  />
                ) : (
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-black text-xs font-bold tracking-[0.2em] text-white">
                    EE
                  </span>
                )}
                <span className="text-lg font-semibold leading-none tracking-[-0.02em] text-black" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
                  {settings?.parlorName || 'Elegant Edge'}
                </span>
              </>
            ) : (
              <span className="text-[2.2rem] font-semibold leading-none tracking-[-0.08em] text-black" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
                {settings?.parlorName || 'Elegant Edge'}
              </span>
            )}
          </Link>
        </motion.div>

        {/* Desktop Menu */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="hidden flex-1 items-center justify-center gap-8 lg:flex"
        >
          {menuItems.map((item, i) => (
            <motion.div
              key={item.label}
              whileHover={{ y: -2 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Link
                href={item.href}
                className="text-[0.92rem] uppercase tracking-[0.12em] text-[#2d261f] transition-colors hover:text-black"
              >
                {item.label}
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Right Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden items-center gap-3 lg:flex"
        >
          <a
            href={whatsappHref}
            target={whatsappHref.startsWith('http') ? '_blank' : undefined}
            rel={whatsappHref.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="grid h-12 w-12 place-items-center rounded-xl bg-black text-white transition-transform hover:-translate-y-0.5"
            aria-label="WhatsApp"
          >
            <FaWhatsapp size={20} />
          </a>
          <a
            href={settings?.socialLinks?.instagram || 'https://instagram.com'}
            target="_blank"
            rel="noopener noreferrer"
            className="grid h-12 w-12 place-items-center rounded-xl bg-black text-white transition-transform hover:-translate-y-0.5"
            aria-label="Instagram"
          >
            <span className="text-lg font-semibold">◎</span>
          </a>
          <a
            href={whatsappHref}
            target={whatsappHref.startsWith('http') ? '_blank' : undefined}
            rel={whatsappHref.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="rounded-full bg-black px-6 py-3 text-lg font-semibold text-white transition-transform hover:-translate-y-0.5"
          >
            {settings?.contactPhone || '+971 54 247 8604'}
          </a>
          {token ? (
            <>
              <Link href="/admin" className="text-sm font-semibold uppercase tracking-[0.12em] text-black underline decoration-black/40 underline-offset-4">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#232323]"
              >
                <FiLogOut /> Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5">
              Login
            </Link>
          )}
        </motion.div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-black text-2xl">
            {isOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="lg:hidden overflow-hidden border-t border-black/15"
      >
        <div className="space-y-3 bg-[#c3c9aa] px-4 py-4">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="block text-sm uppercase tracking-[0.12em] text-black"
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          {token ? (
            <>
              <Link href="/admin" className="block text-sm font-semibold uppercase tracking-[0.12em] text-black">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="w-full rounded-full bg-black px-4 py-2 text-left text-white"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="block rounded-full bg-black px-4 py-3 text-center text-white font-semibold">
                Login
              </Link>
              <a href={whatsappHref} className="block rounded-full bg-black px-4 py-3 text-center text-white">
                Book Now
              </a>
            </>
          )}
        </div>
      </motion.div>
    </header>
  );
}
