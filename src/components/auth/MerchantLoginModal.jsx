import React, { useState, useRef, useEffect } from 'react';
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
  onContinueAsGuest = null,
  defaultAuthMode = 'login'
}) {
  const { 
    verifyMerchantPin, 
    verifyMerchantLogin, 
    restaurants, 
    onboardNewRestaurant,
    activeRestaurant
  } = useLoyalty();

  // Mode: 'login' (existing owner) vs 'register' (first-time shopkeeper)
  const [authMode, setAuthMode] = useState(defaultAuthMode || 'login');

  // Login form state
  const [phone, setPhone] = useState(prefilledPhone);
  const [pin, setPin] = useState('');
  const [selectedRestId, setSelectedRestId] = useState(prefilledRestaurant?.id || activeRestaurant?.id || '');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Hidden / Clickable PIN input ref
  const pinInputRef = useRef(null);
  const cardRef = useRef(null);

  // New Shopkeeper Registration state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState(prefilledPhone || '');
  const [regShopName, setRegShopName] = useState(activeRestaurant?.name || '');
  const [regPin, setRegPin] = useState('');
  const [regSuccessMessage, setRegSuccessMessage] = useState('');

  const activeRest = prefilledRestaurant || restaurants.find(r => r.id === selectedRestId) || activeRestaurant || null;

  // Always reset scroll to top on tab change so user sees headers and tabs immediately
  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.scrollTop = 0;
    }
  }, [authMode]);

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
      pinInputRef.current?.focus();
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
        setPin('');
        pinInputRef.current?.focus();
      }
    }, 350);
  };

  // Handle direct PIN input change (keyboard or typing)
  const handlePinChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPin(val);
    setError('');
    if (val.length === 4) {
      setTimeout(() => {
        let res;
        if (activeRest?.id) {
          res = verifyMerchantPin(activeRest.id, val);
        } else {
          res = verifyMerchantLogin(phone, val);
        }
        if (res.success) {
          if (onClose) onClose();
        } else {
          setError(res.error || 'Incorrect PIN. Access Denied.');
        }
      }, 150);
    }
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
    
    // Default PIN to last 4 digits of phone if not specified
    const finalPin = regPin.trim().length === 4 ? regPin.trim() : cleanP.slice(-4);

    setIsLoading(true);
    setError('');

    setTimeout(() => {
      try {
        const res = onboardNewRestaurant({
          name: regShopName.trim(),
          tagline: 'Artisanal Culinary Craft & Dining',
          ownerName: regName.trim(),
          ownerPhone: cleanP,
          ownerPin: finalPin
        });

        if (!res || !res.success || res.error) {
          setIsLoading(false);
          setError(res?.error || 'Registration failed. A duplicate account may already exist.');
          return;
        }

        const newShop = res.restaurant;
        // Automatically verify and log in
        verifyMerchantPin(newShop.id, finalPin);
        setRegSuccessMessage(`🎉 Shop "${newShop.name}" registered! Your master PIN is ${finalPin}`);
        setIsLoading(false);

        setTimeout(() => {
          if (onClose) onClose();
        }, 700);
      } catch (err) {
        setIsLoading(false);
        setError('Registration failed. Please try again.');
      }
    }, 450);
  };

  const handleKeypadPress = (val) => {
    if (val === 'back') {
      setPin(prev => prev.slice(0, -1));
      pinInputRef.current?.focus();
    } else if (pin.length < 4) {
      const nextPin = pin + val;
      setPin(nextPin);
      setError('');
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
    >
      <div 
        ref={cardRef}
        className="lf-card animate-fade-in" 
        style={{
          width: '100%',
          maxWidth: '420px',
          maxHeight: '94vh',
          overflowY: 'auto',
          background: 'linear-gradient(180deg, #1C1714 0%, #110E0C 100%)',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 30px rgba(212, 175, 55, 0.1)',
          borderRadius: '22px',
          padding: '20px 16px',
          position: 'relative',
          margin: '0 auto'
        }}
      >
        {onClose && !isStandalonePage && (
          <button
            type="button"
            onClick={onClose}
            className="lf-icon-pill"
            style={{ 
              position: 'absolute', 
              top: '16px', 
              right: '16px', 
              padding: '6px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
            title="Close"
          >
            <X size={16} />
          </button>
        )}

        {/* Brand & Store Header */}
        <div style={{ textAlign: 'center', marginBottom: '14px' }}>
          <div 
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(212, 175, 55, 0.12)',
              border: '2px solid rgba(212, 175, 55, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 6px auto',
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
              <ShieldCheck size={26} />
            )}
          </div>

          <span 
            style={{
              fontSize: '10px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: '#D4AF37',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Lock size={11} />
            Staff & Restaurant Owner Portal
          </span>

          <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#FDFBF7', marginTop: '2px' }}>
            {activeRest ? activeRest.name : 'Store Partner Portal'}
          </h2>
        </div>

        {/* Segmented Auth Mode Switcher (Login vs First-Time Register) */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            background: 'rgba(0,0,0,0.6)',
            padding: '5px',
            borderRadius: '14px',
            border: '1.5px solid rgba(212, 175, 55, 0.35)',
            marginBottom: '16px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.4)'
          }}
        >
          <button
            type="button"
            onClick={() => { setAuthMode('login'); setError(''); }}
            className={`lf-btn ${authMode === 'login' ? 'lf-btn-gold' : 'lf-btn-ghost'}`}
            style={{ padding: '9px 6px', fontSize: '12px', justifyContent: 'center', borderRadius: '10px', fontWeight: 800 }}
          >
            <KeyRound size={14} />
            <span>🔑 Owner Login</span>
          </button>

          <button
            type="button"
            onClick={() => { setAuthMode('register'); setError(''); }}
            className={`lf-btn ${authMode === 'register' ? 'lf-btn-gold' : 'lf-btn-ghost'}`}
            style={{ padding: '9px 6px', fontSize: '12px', justifyContent: 'center', borderRadius: '10px', fontWeight: 800 }}
          >
            <Sparkles size={14} />
            <span>✨ Create New Shop</span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div 
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              padding: '10px 12px',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#F87171',
              fontSize: '12px',
              marginBottom: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
            {authMode === 'register' && (error.toLowerCase().includes('already') || error.toLowerCase().includes('duplicate') || error.toLowerCase().includes('exists')) && (
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setPhone(regPhone);
                  setError('');
                }}
                className="lf-btn lf-btn-secondary"
                style={{
                  alignSelf: 'flex-start',
                  padding: '5px 10px',
                  fontSize: '11px',
                  marginTop: '4px',
                  color: '#F3E5AB',
                  borderColor: 'rgba(212,175,55,0.4)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <KeyRound size={12} />
                <span>👉 Switch to Owner Login</span>
              </button>
            )}
          </div>
        )}

        {/* Success Message */}
        {regSuccessMessage && (
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 12px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34D399',
              fontSize: '12px',
              marginBottom: '12px'
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
              <div className="lf-form-group" style={{ marginBottom: '14px' }}>
                <label className="lf-label" style={{ fontSize: '11px' }}>Shopkeeper Mobile Number</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ padding: '8px 10px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#D4CDC3', fontSize: '13px', fontWeight: 700 }}>
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
                    style={{ flex: 1, padding: '8px 12px', fontSize: '14px' }}
                    placeholder="e.g. 9342705016"
                  />
                </div>
              </div>
            )}

            {/* Clickable Masked PIN Slot Display (with hidden input) */}
            <div 
              style={{ textAlign: 'center', marginBottom: '16px', cursor: 'pointer' }}
              onClick={() => pinInputRef.current?.focus()}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '6px' }}>
                <Lock size={12} style={{ color: '#D4AF37' }} />
                <label className="lf-label" style={{ fontSize: '11px', margin: 0, cursor: 'pointer' }}>
                  Enter 4-Digit Security PIN
                </label>
                <span style={{ fontSize: '10px', color: '#8E8478' }}>(Click to type)</span>
              </div>

              {/* Hidden Focusable PIN input for direct keyboard typing */}
              <div style={{ position: 'relative', width: '220px', margin: '0 auto' }}>
                <input
                  ref={pinInputRef}
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength="4"
                  value={pin}
                  onChange={handlePinChange}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer',
                    zIndex: 2
                  }}
                />

                {/* Visible 4 Glowing PIN Slots */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                  {[0, 1, 2, 3].map((idx) => {
                    const filled = pin.length > idx;
                    const isActive = pin.length === idx;
                    return (
                      <div
                        key={idx}
                        style={{
                          width: '44px',
                          height: '48px',
                          borderRadius: '12px',
                          background: filled ? 'rgba(212, 175, 55, 0.18)' : (isActive ? 'rgba(212, 175, 55, 0.08)' : 'rgba(0,0,0,0.5)'),
                          border: filled 
                            ? '2px solid #D4AF37' 
                            : (isActive ? '2px solid rgba(212, 175, 55, 0.7)' : '1px solid rgba(255,255,255,0.12)'),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '22px',
                          fontWeight: 900,
                          color: '#F3E5AB',
                          boxShadow: filled 
                            ? '0 0 14px rgba(212, 175, 55, 0.35)' 
                            : (isActive ? '0 0 8px rgba(212, 175, 55, 0.2)' : 'none'),
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {filled ? '•' : (isActive ? <span className="animate-pulse" style={{ color: '#D4AF37', fontSize: '18px' }}>|</span> : '')}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Numeric Touch Keypad for Fast Cashier Entry */}
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '6px',
                maxWidth: '260px',
                margin: '0 auto 10px auto'
              }}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '⌫'].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    if (k === 'C') {
                      setPin('');
                    } else if (k === '⌫') {
                      handleKeypadPress('back');
                    } else {
                      handleKeypadPress(String(k));
                    }
                  }}
                  className="lf-btn lf-btn-secondary"
                  style={{
                    height: '38px',
                    padding: 0,
                    fontSize: '16px',
                    fontWeight: 700,
                    borderRadius: '8px',
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
              style={{ width: '100%', padding: '12px', fontSize: '13.5px', justifyContent: 'center' }}
            >
              {isLoading ? (
                <span>Verifying PIN...</span>
              ) : (
                <>
                  <ShieldCheck size={17} />
                  <span>Unlock Store Terminal</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        )}

        {/* MODE 2: FIRST-TIME SHOPKEEPER REGISTRATION */}
        {authMode === 'register' && (
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Owner Full Name */}
            <div className="lf-form-group">
              <label className="lf-label" style={{ fontSize: '11px' }}>
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
                style={{ padding: '9px 12px', fontSize: '13.5px' }}
              />
            </div>

            {/* Mobile Number */}
            <div className="lf-form-group">
              <label className="lf-label" style={{ fontSize: '11px' }}>
                <Phone size={13} style={{ display: 'inline', marginRight: '4px' }} />
                Mobile Number (for POS Stamping)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ padding: '8px 10px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#D4CDC3', fontSize: '13px', fontWeight: 700 }}>
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
                  style={{ flex: 1, padding: '9px 12px', fontSize: '13.5px' }}
                />
              </div>
            </div>

            {/* Shop / Restaurant Name */}
            <div className="lf-form-group">
              <label className="lf-label" style={{ fontSize: '11px' }}>
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
                style={{ padding: '9px 12px', fontSize: '13.5px' }}
              />
            </div>

            {/* 4-Digit Password / PIN with Auto-Generate Button & Security Callout */}
            <div className="lf-form-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label className="lf-label" style={{ fontSize: '11px', margin: 0 }}>
                  <KeyRound size={13} style={{ display: 'inline', marginRight: '4px' }} />
                  4-Digit Security Password / PIN
                </label>
                <button
                  type="button"
                  onClick={handleGeneratePin}
                  className="lf-btn-ghost"
                  style={{ fontSize: '11px', color: '#D4AF37', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: '2px 6px' }}
                >
                  <Dices size={12} />
                  <span>🎲 Generate PIN</span>
                </button>
              </div>
              <input
                type="text"
                maxLength="4"
                value={regPin}
                onChange={(e) => setRegPin(e.target.value.replace(/\D/g, ''))}
                placeholder={regPhone.length >= 4 ? `e.g. ${regPhone.slice(-4)} (or click Generate PIN)` : 'e.g. 1234 or click Generate PIN'}
                className="lf-input lf-input-mono"
                style={{ padding: '9px 12px', fontSize: '14px', letterSpacing: '0.15em', textAlign: 'center', fontWeight: 700, color: '#F3E5AB' }}
              />

              {/* Security & Options Callout */}
              <div 
                style={{
                  marginTop: '8px',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  background: 'rgba(212, 175, 55, 0.08)',
                  border: '1px solid rgba(212, 175, 55, 0.22)',
                  fontSize: '11px',
                  lineHeight: '1.45',
                  color: '#D4CDC3'
                }}
              >
                <div style={{ fontWeight: 700, color: '#F3E5AB', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
                  <Lock size={11} style={{ color: '#D4AF37' }} />
                  <span>Essential Dashboard Security:</span>
                </div>
                <div style={{ color: '#A89F91', fontSize: '10.5px', marginBottom: '4px' }}>
                  This password prevents customers from accessing your cashier dashboard and stamping controls.
                </div>
                <div style={{ color: '#D4AF37', fontSize: '10.5px' }}>
                  💡 <strong>3 Ways to Set:</strong> Type 4 digits, click <strong>Generate PIN</strong>, or leave blank to automatically use your phone's last 4 digits (<span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{regPhone.length >= 4 ? regPhone.slice(-4) : '••••'}</span>).
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !regName || regPhone.length < 10 || !regShopName}
              className="lf-btn lf-btn-gold"
              style={{ width: '100%', padding: '12px', fontSize: '13.5px', justifyContent: 'center', marginTop: '4px' }}
            >
              {isLoading ? (
                <span>Creating Shop...</span>
              ) : (
                <>
                  <Sparkles size={17} />
                  <span>Register & Launch Cashier POS</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Alternate Action: View as Customer */}
        {onContinueAsGuest && (
          <div style={{ marginTop: '14px', textAlign: 'center', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button
              type="button"
              onClick={onContinueAsGuest}
              className="lf-btn-ghost"
              style={{ fontSize: '11.5px', color: '#D4AF37', textDecoration: 'underline', cursor: 'pointer' }}
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
