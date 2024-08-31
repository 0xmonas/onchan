import { useEffect, useState } from 'react';
import { PrivyProvider } from '@privy-io/react-auth';
import { PrivyWeb3Provider } from '../contexts/PrivyWeb3Context';
import { DarkModeProvider } from '../contexts/DarkModeContext';
import { UserProvider } from '../contexts/UserContext';
import { EditModeProvider } from '../contexts/EditModeContext';
import Layout from '../components/Layout';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import ErrorBoundary from '../components/ErrorBoundary';

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

function MyApp({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <ErrorBoundary>
      <PrivyProvider
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID}
        config={{
          appearance: {
            accentColor: "#6A6FF5",
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
                <Layout fontHeading={fontHeading} fontBody={fontBody}>
                  <Component {...pageProps} />
                </Layout>
              </EditModeProvider>
            </UserProvider>
          </DarkModeProvider>
        </PrivyWeb3Provider>
      </PrivyProvider>
    </ErrorBoundary>
  );
}

export default MyApp;