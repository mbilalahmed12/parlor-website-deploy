import '@/styles/globals.css';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store';

export default function App({ Component, pageProps }) {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    // Initialize auth state
    hydrate();
  }, [hydrate]);

  return (
    <>
      <Component {...pageProps} />
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          success: {
            duration: 3000,
            theme: 'light',
            style: {
              background: '#10b981',
              color: '#fff',
            },
          },
          error: {
            duration: 3000,
            theme: 'light',
            style: {
              background: '#ef4444',
              color: '#fff',
            },
          },
        }}
      />
    </>
  );
}
