import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('LoyaltyForge UI Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = window.location.origin;
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: '#0D0A08',
          color: '#FDFBF7',
          fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}>
          <div style={{
            maxWidth: '460px',
            width: '100%',
            padding: '32px',
            borderRadius: '20px',
            background: '#14100E',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#EF4444'
            }}>
              <AlertCircle size={28} />
            </div>

            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#FDFBF7', marginBottom: '6px' }}>
                Something went wrong
              </h2>
              <p style={{ fontSize: '12.5px', color: '#8E8478', lineHeight: 1.5 }}>
                {this.state.error?.message || 'An unexpected error occurred while rendering the page.'}
              </p>
            </div>

            <button
              type="button"
              onClick={this.handleReset}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #ECC86A 0%, #D4AF37 50%, #A47D1C 100%)',
                color: '#1A1409',
                border: 'none',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)'
              }}
            >
              <RotateCcw size={15} />
              <span>Reload Loyalty Pass</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
