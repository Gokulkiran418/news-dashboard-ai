// pages/_app.tsx
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Respect reduced motion preference
    if (typeof window !== 'undefined') {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.classList.add('motion-reduce');
      }
    }
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={true}>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
