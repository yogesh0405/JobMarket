import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
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

// Global enforcement to prevent negative numbers site-wide across all number/tel inputs
if (typeof window !== 'undefined') {
  // Prevent typing minus sign (-) in any number or tel input
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
      const inputEl = target as HTMLInputElement;
      if (inputEl.type === 'number' || inputEl.type === 'tel' || inputEl.name?.toLowerCase().includes('experience') || inputEl.name?.toLowerCase().includes('salary')) {
        if (e.key === '-' || e.key === 'e' || e.key === 'E') {
          e.preventDefault();
        }
      }
    }
  }, true);

  // Sanitize paste or input value change if any negative value is entered
  window.addEventListener('input', (e: Event) => {
    const target = e.target as HTMLInputElement | null;
    if (target && target.tagName === 'INPUT' && (target.type === 'number' || target.type === 'tel')) {
      if (target.value && parseFloat(target.value) < 0) {
        target.value = Math.abs(parseFloat(target.value)).toString();
      }
      if (target.value && (target.value.includes('-') || target.value.includes('e') || target.value.includes('E'))) {
        target.value = target.value.replace(/[-eE]/g, '');
      }
    }
  }, true);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StoreProvider>
      <ToastProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ToastProvider>
    </StoreProvider>
  </React.StrictMode>
);
