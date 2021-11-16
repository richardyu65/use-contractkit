import '@celo-tools/use-contractkit/lib/styles.css';
import '../styles/global.css';

import { Alfajores, ContractKitProvider } from '@celo-tools/use-contractkit';
import { AppProps } from 'next/app';
import { Toaster } from 'react-hot-toast';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function MyApp({ Component, pageProps, router }: AppProps) {
  if (router.route === '/wallet') {
    return <Component {...pageProps} />;
  }

  return (
    <ContractKitProvider
      dapp={{
        name: 'use-contractkit demo',
        description: 'A demo DApp to showcase functionality',
        url: 'https://use-contractkit.vercel.app',
        icon: 'https://use-contractkit.vercel.app/favicon.ico',
      }}
      network={Alfajores}
    >
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'w-72 md:w-96',
          style: {
            padding: '0px',
          },
        }}
      />
      <div suppressHydrationWarning>
        {typeof window === 'undefined' ? null : <Component {...pageProps} />}
      </div>
    </ContractKitProvider>
  );
}

export default MyApp;
