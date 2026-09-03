import React, { useState } from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import { ShieldCheck, Lock, ArrowRight, Store, UserCheck, AlertCircle, X } from 'lucide-react';

export function MerchantLoginModal({ 
  prefilledPhone = '', 
  prefilledRestaurant = null, 
  onClose = null, 
  isStandalonePage = false,
  onContinueAsGuest = null
}) {
  const { verifyMerchantPin, verifyMerchantLogin, restaurants, setActiveRestaurantId } = useLoyalty();

  const [phone, setPhone] = useState(prefilledPhone);
  const [pin, setPin] = useState('');
  const [selectedRestId, setSelectedRestId] = useState(prefilledRestaurant?.id || '');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const activeRest = prefilledRestaurant || restaurants.find(r => r.id === selectedRestId) || null;

  const handlePinSubmit = (e) => {
    e?.preventDefault();
    if (pin.length !== 4) {
      setError('Please enter a valid 4-digit PIN');
      return;
    }

    setIsLoading(true);
    setError('');

    setTimeout(() => {
      let res;
      if (activeRest?.id) {
        res = verifyMerchantPin(activeRest.id, pin);
      } else {
        res = verifyMerchantLogin(phone, pin);
      }

      setIsLoading(false);

      if (res.success) {
        if (onClose) onClose();
      } else {
        setError(res.error || 'Incorrect PIN. Access Denied.');
      }
    }, 400);
  };

  const handleKeypadPress = (val) => {
    if (val === 'back') {
      setPin(prev => prev.slice(0, -1));
    } else if (pin.length < 4) {
      const nextPin = pin + val;
      setPin(nextPin);
      if (nextPin.length === 4) {
        setTimeout(() => {
          let res;
          if (activeRest?.id) {
            res = verifyMerchantPin(activeRest.id, nextPin);
          } else {
            res = verifyMerchantLogin(phone, nextPin);
          }
          if (res.success) {
            if (onClose) onClose();
          } else {
            setError(res.error || 'Incorrect PIN. Access Denied.');
          }
        }, 150);
      }
    }
  };

  return (
    <div 
      className={isStandalonePage ? "lf-login-page-container" : "lf-modal-backdrop"}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        minHeight: isStandalonePage ? '85vh' : 'auto'
      }}
    >
      <div 
        className="lf-card animate-fade-in" 
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'linear-gradient(180deg, #1A1512 0%, #110E0C 100%)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
          borderRadius: '24px',
          padding: '28px 24px',
          position: 'relative'
        }}
      >
        {onClose && !isStandalonePage && (
          <button
            type="button"
            onClick={onClose}
            className="lf-icon-pill"
            style={{ position: 'absolute', top: '18px', right: '18px', padding: '6px' }}
            title="Close"
          >
            <X size={16} />
          </button>
        )}

        {/* Brand & Store Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div 
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(212, 175, 55, 0.12)',
              border: '2px solid rgba(212, 175, 55, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto',
              color: '#D4AF37'
            }}
          >
            {activeRest?.logoUrl ? (
              <img 
                src={activeRest.logoUrl} 
                alt="logo" 
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
              />
            ) : (
              <ShieldCheck size={32} />
            )}
          </div>

          <span 
            style={{
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: '#D4AF37',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Lock size={12} />
            Merchant & Cashier Portal
          </span>

          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#FDFBF7', marginTop: '4px' }}>
            {activeRest ? activeRest.name : 'Store Partner Login'}
          </h2>

          <p style={{ fontSize: '12px', color: '#8E8478', marginTop: '4px' }}>
            {activeRest?.owner?.name 
              ? `Welcome ${activeRest.owner.name}! Enter 4-digit PIN to access Cashier & Analytics.`
              : 'Enter registered mobile number and 4-digit PIN'}
          </p>
        </div>

        {/* Form Fields */}
        <form onSubmit={handlePinSubmit}>
          {/* Mobile Number (if not prefilled) */}
          {!prefilledPhone && (
            <div className="lf-form-group" style={{ marginBottom: '16px' }}>
              <label className="lf-label" style={{ fontSize: '11px' }}>Shopkeeper Mobile Number</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ padding: '9px 12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#D4CDC3', fontSize: '13px', fontWeight: 700 }}>
                  +91
                </span>
                <input
                  type="tel"
                  required
                  maxLength="10"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/\D/g, ''));
                    setError('');
                  }}
                  className="lf-input lf-input-mono"
                  style={{ flex: 1, padding: '10px 14px', fontSize: '15px' }}
                  placeholder="e.g. 9840123456"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Masked PIN Slot Display */}
          <div style={{ textAlign: 'center', marginBottom: '18px' }}>
            <label className="lf-label" style={{ fontSize: '11px', marginBottom: '8px', display: 'block' }}>
              Enter 4-Digit Security PIN
            </label>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              {[0, 1, 2, 3].map((idx) => {
                const filled = pin.length > idx;
                return (
                  <div
                    key={idx}
                    style={{
                      width: '46px',
                      height: '52px',
                      borderRadius: '12px',
                      background: filled ? 'rgba(212, 175, 55, 0.15)' : 'rgba(0,0,0,0.4)',
                      border: filled ? '2px solid #D4AF37' : '1px solid rgba(255,255,255,0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '22px',
                      fontWeight: 900,
                      color: '#F3E5AB',
                      boxShadow: filled ? '0 0 12px rgba(212, 175, 55, 0.3)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {filled ? '•' : ''}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#F87171',
                fontSize: '12px',
                marginBottom: '14px'
              }}
            >
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Numeric Touch Keypad for Fast Cashier Entry */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '10px',
              maxWidth: '300px',
              margin: '0 auto 16px auto'
            }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '⌫'].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  if (k === 'C') setPin('');
                  else if (k === '⌫') handleKeypadPress('back');
                  else handleKeypadPress(String(k));
                }}
                className="lf-btn lf-btn-secondary"
                style={{
                  height: '48px',
                  padding: 0,
                  fontSize: '18px',
                  fontWeight: 700,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255,255,255,0.04)',
                  borderColor: 'rgba(255,255,255,0.08)'
                }}
              >
                {k}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading || pin.length !== 4}
            className="lf-btn lf-btn-gold"
            style={{ width: '100%', padding: '13px', fontSize: '14px', justifyContent: 'center' }}
          >
            {isLoading ? (
              <span>Verifying PIN...</span>
            ) : (
              <>
                <ShieldCheck size={18} />
                <span>Unlock Store Terminal</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Alternate Action: View as Guest */}
        {onContinueAsGuest && (
          <div style={{ marginTop: '16px', textAlign: 'center', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button
              type="button"
              onClick={onContinueAsGuest}
              className="lf-btn-ghost"
              style={{ fontSize: '12px', color: '#D4AF37', textDecoration: 'underline', cursor: 'pointer' }}
            >
              Continue as Guest Customer (View Loyalty Pass)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
export default MerchantLoginModal;
