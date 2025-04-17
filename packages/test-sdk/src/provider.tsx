import { ReactNode } from 'react';
import { darkTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { config } from './web3/wagmi';

function Providers({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient();

  const compoundTheme = darkTheme({
    accentColor: '#00D395',
    accentColorForeground: 'black',
    borderRadius: 'large',
    fontStack: 'system',
    overlayBlur: 'small',
  });

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={compoundTheme}
          modalSize='compact'
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export { Providers };
