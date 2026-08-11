import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React Error in Component Tree:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '70vh',
          padding: '32px 16px',
          textAlign: 'center',
          backgroundColor: '#F8FAFC'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            padding: '32px 24px',
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 10px 25px rgba(15, 23, 42, 0.08)',
            border: '1px solid #E2E8F0'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#FEF2F2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>
              Something went wrong
            </h3>
            <p style={{ fontSize: '14px', color: '#64748B', lineHeight: '1.5', marginBottom: '24px' }}>
              We ran into an unexpected error while loading this page. Please try refreshing or returning to the jobs search.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  background: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 18px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Reload Page
              </button>
              <a
                href="/jobs"
                style={{
                  background: '#F1F5F9',
                  color: '#334155',
                  borderRadius: '8px',
                  padding: '10px 18px',
                  fontSize: '14px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  display: 'inline-block'
                }}
              >
                Browse Jobs
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
