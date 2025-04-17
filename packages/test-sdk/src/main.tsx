import App from './App';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Providers } from './provider';
import '@rainbow-me/rainbowkit/styles.css';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>
);
