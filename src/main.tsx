import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { StoreProvider } from './store/StoreContext';
import { ToastProvider } from './hooks/useToast';
import { App } from './App';

// Import CSS
import './styles/index.css';
import './styles/components.css';
import './styles/auth.css';
import './styles/home.css';
import './styles/jobs.css';
import './styles/dashboard.css';
import './styles/profile.css';
import './styles/support.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StoreProvider>
      <ToastProvider>
        <HashRouter>
          <App />
        </HashRouter>
      </ToastProvider>
    </StoreProvider>
  </React.StrictMode>
);
