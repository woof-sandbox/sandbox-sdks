import App from './App';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@rainbow-me/rainbowkit/styles.css';
import { Providers } from './provider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>
);
