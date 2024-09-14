import { useEffect, useState } from 'react';
import { PrivyProvider } from '@privy-io/react-auth';
import { PrivyWeb3Provider } from '../contexts/PrivyWeb3Context';
import { DarkModeProvider } from '../contexts/DarkModeContext';
import { UserProvider } from '../contexts/UserContext';
import { EditModeProvider } from '../contexts/EditModeContext';
import { LoadingProvider } from '../contexts/LoadingContext';
import Layout from '../components/Layout';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import ErrorBoundary from '../components/ErrorBoundary';
import FullPageLoader from '../components/FullPageLoader';
import { useRouter } from 'next/router';

const fontHeading = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-heading',
});

const fontBody = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});

const MINIMUM_LOADING_TIME = 600; // 1 saniye minimum yükleme süresi

function MyApp({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const startTime = Date.now();

    const handleStart = () => setIsLoading(true);
    const handleComplete = () => {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, MINIMUM_LOADING_TIME - elapsedTime);
      
      setTimeout(() => {
        setIsLoading(false);
      }, remainingTime);
    };

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    // İlk yükleme için de minimum süreyi uygula
    handleComplete();

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  if (!mounted) return null;
  if (isLoading) return <FullPageLoader />;

  return (
    <ErrorBoundary>
      <PrivyProvider
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID}
        config={{
          appearance: {
            accentColor: "#0031FF",
            theme: "#FFFFFF",
            showWalletLoginFirst: true
          },
          loginMethods: ["wallet"],
          embeddedWallets: {
            createOnLogin: "none",
            noPromptOnSignature: true
          },
          mfa: {
            noPromptOnMfaRequired: false
          },
          defaultChain: {
            id: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID),
            rpcUrl: process.env.NEXT_PUBLIC_RPC_URL,
          },
        }}
      >
        <PrivyWeb3Provider>
          <DarkModeProvider>
            <UserProvider>
              <EditModeProvider>
                <LoadingProvider>
                  <Layout fontHeading={fontHeading} fontBody={fontBody}>
                    <Component {...pageProps} />
                  </Layout>
                </LoadingProvider>
              </EditModeProvider>
            </UserProvider>
          </DarkModeProvider>
        </PrivyWeb3Provider>
      </PrivyProvider>
    </ErrorBoundary>
  );
}

export default MyApp;