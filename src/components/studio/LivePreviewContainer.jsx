import React, { useState } from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import AppleWalletPreview from './AppleWalletPreview';
import GoogleWalletPreview from './GoogleWalletPreview';
import { 
  Smartphone, 
  RotateCw, 
  Sparkles, 
  CheckCircle2,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function LivePreviewContainer() {
  const { activeRestaurant, activeCustomer, setActiveTab } = useLoyalty();
  const [walletType, setWalletType] = useState('apple'); // 'apple' | 'google'
  const [isFlipped, setIsFlipped] = useState(false);
  const [showPhoneFrame, setShowPhoneFrame] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handlePublish = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="lf-card animate-fade-in" style={{ padding: '24px' }}>
      
      {/* Top Preview Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#FDFBF7', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} style={{ color: '#D4AF37' }} />
            <span>Digital Wallet Simulator</span>
          </h3>
          <p style={{ fontSize: '11px', color: '#8E8478' }}>Interactive Real-Time Preview</p>
        </div>

        {/* Apple vs Google Toggle */}
        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.5)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            type="button"
            onClick={() => setWalletType('apple')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: walletType === 'apple' ? 'var(--gold-gradient)' : 'transparent',
              color: walletType === 'apple' ? '#171108' : '#8E8478',
              transition: 'all 0.2s ease'
            }}
          >
            <span></span> Apple Wallet
          </button>

          <button
            type="button"
            onClick={() => setWalletType('google')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: walletType === 'google' ? 'var(--gold-gradient)' : 'transparent',
              color: walletType === 'google' ? '#171108' : '#8E8478',
              transition: 'all 0.2s ease'
            }}
          >
            <span style={{ color: walletType === 'google' ? '#171108' : '#D4AF37', fontWeight: 900 }}>G</span> Google Wallet
          </button>
        </div>
      </div>

      {/* Center Phone / Card Simulator */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '520px' }}>
        {showPhoneFrame ? (
          <div className="lf-phone-mockup">
            <div className="lf-phone-notch" />
            <div style={{ padding: '0 10px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
              {walletType === 'apple' ? (
                <AppleWalletPreview
                  restaurant={activeRestaurant}
                  customer={activeCustomer}
                  isFlipped={isFlipped}
                  onFlipToggle={() => setIsFlipped(!isFlipped)}
                />
              ) : (
                <GoogleWalletPreview
                  restaurant={activeRestaurant}
                  customer={activeCustomer}
                  isFlipped={isFlipped}
                  onFlipToggle={() => setIsFlipped(!isFlipped)}
                />
              )}
            </div>
          </div>
        ) : (
          <div style={{ padding: '16px 0' }}>
            {walletType === 'apple' ? (
              <AppleWalletPreview
                restaurant={activeRestaurant}
                customer={activeCustomer}
                isFlipped={isFlipped}
                onFlipToggle={() => setIsFlipped(!isFlipped)}
              />
            ) : (
              <GoogleWalletPreview
                restaurant={activeRestaurant}
                customer={activeCustomer}
                isFlipped={isFlipped}
                onFlipToggle={() => setIsFlipped(!isFlipped)}
              />
            )}
          </div>
        )}
      </div>

      {/* Toolbar Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setIsFlipped(!isFlipped)}
            className="lf-btn lf-btn-secondary"
            style={{ padding: '7px 12px', fontSize: '12px' }}
          >
            <RotateCw size={13} style={{ color: '#D4AF37' }} />
            <span>{isFlipped ? 'Show Front' : '3D Flip'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPhoneFrame(!showPhoneFrame)}
            className="lf-btn lf-btn-secondary"
            style={{ padding: '7px 12px', fontSize: '12px' }}
          >
            <Smartphone size={13} style={{ color: '#D4AF37' }} />
            <span>{showPhoneFrame ? 'Card View' : 'Phone Shell'}</span>
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={handlePublish}
            className="lf-btn lf-btn-gold"
            style={{ padding: '7px 16px', fontSize: '12px' }}
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 size={14} />
                <span>Pass Saved!</span>
              </>
            ) : (
              <>
                <ShieldCheck size={14} />
                <span>Save Pass</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('standee')}
            className="lf-btn lf-btn-emerald"
            style={{ padding: '7px 14px', fontSize: '12px' }}
          >
            <span>Get Standee</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

    </div>
  );
}
