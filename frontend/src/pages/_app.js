import * as React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider } from '@emotion/react';
import theme from '../styles/theme';
import createEmotionCache from '../styles/createEmotionCache';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';
import ModuleGuard from '../components/ModuleGuard';

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

export default function MyApp(props) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  const router = useRouter();
  
  // Layout'u kullanmayacak sayfalar
  const noLayoutPages = ['/login', '/register', '/forgot-password', '/reset-password'];
  const shouldUseLayout = !noLayoutPages.includes(router.pathname);

  // Her sayfada ModuleGuard kontrolü otomatik eklemiyoruz
  // Her sayfa kendi ModuleGuard'ını kullanmalı çünkü farklı modüller farklı sayfalara karşılık geliyor
  
  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <title>Flax-ERP Sistemi</title>
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {shouldUseLayout ? (
          <Layout>
            <Component {...pageProps} />
          </Layout>
        ) : (
          <Component {...pageProps} />
        )}
      </ThemeProvider>
    </CacheProvider>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  emotionCache: PropTypes.object,
  pageProps: PropTypes.object.isRequired,
};
