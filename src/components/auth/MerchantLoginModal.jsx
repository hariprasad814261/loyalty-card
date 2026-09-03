import React, { useState } from 'react';
import { useLoyalty, normalizePhone } from '../../context/LoyaltyContext';
import { 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  Store, 
  UserCheck, 
  AlertCircle, 
  X, 
  Sparkles, 
  KeyRound, 
  User, 
  Phone, 
  Dices, 
  CheckCircle2,
  PlusCircle
} from 'lucide-react';

export function MerchantLoginModal({ 
  prefilledPhone = '', 
  prefilledRestaurant = null, 
  onClose = null, 
  isStandalonePage = false,
  onContinueAsGuest = null
}) {
  const { 
    verifyMerchantPin, 
    verifyMerchantLogin, 
    restaurants, 
    onboardNewRestaurant,
    activeRestaurant
  } = useLoyalty();

  // Mode: 'login' (existing owner) vs 'register' (first-time shopkeeper)
  const [authMode, setAuthMode] = useState('login');

  // Login form state
  const [phone, setPhone] = useState(prefilledPhone);
  const [pin, setPin] = useState('');
  const [selectedRestId, setSelectedRestId] = useState(prefilledRestaurant?.id || activeRestaurant?.id || '');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // New Shopkeeper Registration state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState(prefilledPhone || '');
  const [regShopName, setRegShopName] = useState(activeRestaurant?.name || '');
  const [regPin, setRegPin] = useState('');
  const [regSuccessMessage, setRegSuccessMessage] = useState('');

  const activeRest = prefilledRestaurant || restaurants.find(r => r.id === selectedRestId) || activeRestaurant || null;

  // Auto-generate a clean 4-digit PIN
  const handleGeneratePin = () => {
    const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
    setRegPin(randomPin);
    setError('');
  };

  // Handle Existing PIN Login
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

  // Handle First-Time Shopkeeper Registration
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    const cleanP = normalizePhone(regPhone);
    if (!regName.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (cleanP.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!regShopName.trim()) {
      setError('Please enter your restaurant/shop name');
      return;
    }
    if (regPin.length !== 4) {
      setError('Please enter or generate a 4-digit PIN');
      return;
    }

    setIsLoading(true);
    setError('');

    setTimeout(() => {
      try {
        const newShop = onboardNewRestaurant({
          name: regShopName.trim(),
          tagline: 'Artisanal Culinary Craft & Dining',
          ownerName: regName.trim(),
          ownerPhone: cleanP,
          ownerPin: regPin.trim()
        });

        // Automatically verify and log in
        verifyMerchantPin(newShop.id, regPin.trim());
        setRegSuccessMessage(`Shop "${newShop.name}" registered! Your PIN is ${regPin.trim()}`);
        setIsLoading(false);

        setTimeout(() => {
          if (onClose) onClose();
        }, 800);
      } catch (err) {
        setIsLoading(false);
        setError('Registration failed. Please try again.');
      }
    }, 500);
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
          maxWidth: '440px',
          background: 'linear-gradient(180deg, #1C1714 0%, #110E0C 100%)',
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
        <div style={{ textAlign: 'center', marginBottom: '18px' }}>
          <div 
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(212, 175, 55, 0.12)',
              border: '2px solid rgba(212, 175, 55, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 10px auto',
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
              <ShieldCheck size={30} />
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
            Merchant & Staff Portal
          </span>

          <h2 style={{ fontSize: '19px', fontWeight: 800, color: '#FDFBF7', marginTop: '4px' }}>
            {activeRest ? activeRest.name : 'Store Partner Portal'}
          </h2>
        </div>

        {/* Segmented Auth Mode Switcher (Login vs First-Time Register) */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '6px',
            background: 'rgba(0,0,0,0.4)',
            padding: '4px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.08)',
            marginBottom: '20px'
          }}
        >
          <button
            type="button"
            onClick={() => { setAuthMode('login'); setError(''); }}
            className={`lf-btn ${authMode === 'login' ? 'lf-btn-gold' : 'lf-btn-ghost'}`}
            style={{ padding: '8px', fontSize: '12px', justifyContent: 'center', borderRadius: '8px', fontWeight: 700 }}
          >
            <KeyRound size={14} />
            <span>Existing Login</span>
          </button>

          <button
            type="button"
            onClick={() => { setAuthMode('register'); setError(''); }}
            className={`lf-btn ${authMode === 'register' ? 'lf-btn-gold' : 'lf-btn-ghost'}`}
            style={{ padding: '8px', fontSize: '12px', justifyContent: 'center', borderRadius: '8px', fontWeight: 700 }}
          >
            <Sparkles size={14} />
            <span>New Shopkeeper</span>
          </button>
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

        {/* Success Message */}
        {regSuccessMessage && (
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34D399',
              fontSize: '12px',
              marginBottom: '14px'
            }}
          >
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{regSuccessMessage}</span>
          </div>
        )}

        {/* MODE 1: EXISTING SHOPKEEPER PIN LOGIN */}
        {authMode === 'login' && (
          <form onSubmit={handlePinSubmit}>
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
                    placeholder="e.g. 9342705016"
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
                    height: '46px',
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
        )}

        {/* MODE 2: FIRST-TIME SHOPKEEPER REGISTRATION */}
        {authMode === 'register' && (
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Owner Full Name */}
            <div className="lf-form-group">
              <label className="lf-label" style={{ fontSize: '11.5px' }}>
                <User size={13} style={{ display: 'inline', marginRight: '4px' }} />
                Shopkeeper / Owner Name
              </label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="lf-input"
                style={{ padding: '10px 14px', fontSize: '14px' }}
                autoFocus
              />
            </div>

            {/* Mobile Number */}
            <div className="lf-form-group">
              <label className="lf-label" style={{ fontSize: '11.5px' }}>
                <Phone size={13} style={{ display: 'inline', marginRight: '4px' }} />
                Mobile Number (for POS Stamping)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ padding: '9px 12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#D4CDC3', fontSize: '13px', fontWeight: 700 }}>
                  +91
                </span>
                <input
                  type="tel"
                  required
                  maxLength="10"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 9342705016"
                  className="lf-input lf-input-mono"
                  style={{ flex: 1, padding: '10px 14px', fontSize: '14px' }}
                />
              </div>
            </div>

            {/* Shop / Restaurant Name */}
            <div className="lf-form-group">
              <label className="lf-label" style={{ fontSize: '11.5px' }}>
                <Store size={13} style={{ display: 'inline', marginRight: '4px' }} />
                Shop / Restaurant Name
              </label>
              <input
                type="text"
                required
                value={regShopName}
                onChange={(e) => setRegShopName(e.target.value)}
                placeholder="e.g. Burmix Street Food"
                className="lf-input"
                style={{ padding: '10px 14px', fontSize: '14px' }}
              />
            </div>

            {/* 4-Digit PIN with Auto-Generate Button */}
            <div className="lf-form-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label className="lf-label" style={{ fontSize: '11.5px', margin: 0 }}>
                  <KeyRound size={13} style={{ display: 'inline', marginRight: '4px' }} />
                  Create 4-Digit Security PIN
                </label>
                <button
                  type="button"
                  onClick={handleGeneratePin}
                  className="lf-btn-ghost"
                  style={{ fontSize: '11.5px', color: '#D4AF37', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: '2px 6px' }}
                >
                  <Dices size={13} />
                  <span>Generate PIN</span>
                </button>
              </div>
              <input
                type="text"
                required
                maxLength="4"
                value={regPin}
                onChange={(e) => setRegPin(e.target.value.replace(/\D/g, ''))}
                placeholder="4-digit PIN (e.g. 1234)"
                className="lf-input lf-input-mono"
                style={{ padding: '10px 14px', fontSize: '16px', letterSpacing: '0.2em', textAlign: 'center', fontWeight: 800, color: '#F3E5AB' }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !regName || regPhone.length < 10 || !regShopName || regPin.length !== 4}
              className="lf-btn lf-btn-gold"
              style={{ width: '100%', padding: '13px', fontSize: '14px', justifyContent: 'center', marginTop: '6px' }}
            >
              {isLoading ? (
                <span>Creating Shop & PIN...</span>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Register & Launch Cashier POS</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Alternate Action: View as Customer */}
        {onContinueAsGuest && (
          <div style={{ marginTop: '16px', textAlign: 'center', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button
              type="button"
              onClick={onContinueAsGuest}
              className="lf-btn-ghost"
              style={{ fontSize: '12px', color: '#D4AF37', textDecoration: 'underline', cursor: 'pointer' }}
            >
              Continue as Customer (View Loyalty Pass)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MerchantLoginModal;
