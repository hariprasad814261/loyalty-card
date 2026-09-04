import React, { useState, useEffect } from 'react';
import { useLoyalty, normalizePhone } from '../../context/LoyaltyContext';
import { getStampIconComponent } from '../../utils/stampIconHelper';
import { getGoogleReviewUrl, getInstagramUrl, getInstagramDisplayHandle } from '../../utils/socialLinkHelper';
import confetti from 'canvas-confetti';
import { 
  Check, 
  Sparkles, 
  Gift as RewardIcon, 
  Camera, 
  MapPin, 
  Phone, 
  QrCode, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  Crown,
  Lock,
  Star
} from 'lucide-react';
import { MerchantLoginModal } from '../auth/MerchantLoginModal';

export default function CustomerMobilePass() {
  const { 
    activeRestaurant, 
    customers = [],
    activeCustomer: studioCustomer, 
    activeCustomerPhone, 
    setActiveCustomerPhone,
    registerOrGetCustomer, 
    isGuestMode,
    lastStampAnimationTimestamp,
    checkIsOwnerPhone
  } = useLoyalty();

  // In guest mode, strictly read ONLY from this guest's session; never expose shared studio customer profile
  const guestPhone = isGuestMode 
    ? (typeof window !== 'undefined' ? localStorage.getItem('guest_loyalty_phone') || '' : '')
    : activeCustomerPhone;

  const cleanGuestPhone = normalizePhone(guestPhone);

  const currentCustomer = isGuestMode
    ? ((cleanGuestPhone && cleanGuestPhone.length === 10)
        ? (customers.find(c => normalizePhone(c.phone) === cleanGuestPhone && c.restaurantId === activeRestaurant?.id) || {
            id: `cust_${activeRestaurant?.id || 'rest'}_${cleanGuestPhone.slice(-4)}`,
            phone: cleanGuestPhone,
            name: `Guest ${cleanGuestPhone.slice(-4)}`,
            restaurantId: activeRestaurant?.id,
            visits: 0,
            totalSpend: 0,
            loyaltyPoints: 0,
            vouchers: []
          })
        : null)
    : studioCustomer;

  const [inputPhone, setInputPhone] = useState(cleanGuestPhone || '');
  const [showWalletExportSuccess, setShowWalletExportSuccess] = useState(null);
  const [showMerchantAuthModal, setShowMerchantAuthModal] = useState(false);

  const { theme = {}, program = {}, links = {} } = activeRestaurant || {};
  const totalStamps = program.totalStamps || 5;
  const visits = currentCustomer?.visits || 0;
  const stampsInCycle = visits % totalStamps;
  const isRewardReady = visits > 0 && stampsInCycle === 0;

  useEffect(() => {
    if (lastStampAnimationTimestamp) {
      confetti({
        particleCount: isRewardReady ? 100 : 35,
        spread: isRewardReady ? 75 : 45,
        origin: { y: 0.6 }
      });
    }
  }, [lastStampAnimationTimestamp, isRewardReady]);

  const handlePhoneSubmit = (e) => {
    e?.preventDefault();
    const clean = normalizePhone(inputPhone);
    if (clean.length === 10) {
      localStorage.setItem('guest_loyalty_phone', clean);
      registerOrGetCustomer(clean);
      setActiveCustomerPhone(clean);
    }
  };

  const handleLogoutGuest = () => {
    localStorage.removeItem('guest_loyalty_phone');
    setActiveCustomerPhone('');
    setInputPhone('');
  };

  const handleWalletSave = (walletName) => {
    setShowWalletExportSuccess(walletName);
    setTimeout(() => setShowWalletExportSuccess(null), 3500);
  };

  const StampIconComponent = getStampIconComponent(theme.stampIcon);
  const cardBg = theme.cardBgColor || '#221A15';
  const textColor = theme.textColor || '#FDFBF7';
  const accentColor = theme.accentColor || '#D4AF37';
  const stampActiveColor = theme.stampActiveColor || '#E5C07B';

  // If Guest Mode and phone is not entered yet, show the customer welcome check-in screen directly
  if (isGuestMode && (!guestPhone || guestPhone.length < 10)) {
    return (
      <div style={{ maxWidth: '440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
        <div className="lf-card animate-fade-in" style={{ padding: '28px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          
          {activeRestaurant?.logoUrl ? (
            <img
              src={activeRestaurant.logoUrl}
              alt="logo"
              style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(212, 175, 55, 0.4)', boxShadow: '0 8px 20px rgba(0,0,0,0.6)' }}
            />
          ) : (
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--gold-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1A1409', fontWeight: 900, fontSize: '20px' }}>
              {(activeRestaurant?.name || 'VIP').slice(0, 2).toUpperCase()}
            </div>
          )}

          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#FDFBF7', marginBottom: '4px' }}>
              {activeRestaurant?.name || 'VIP Loyalty'}
            </h2>
            <p style={{ fontSize: '12px', color: '#8E8478' }}>{activeRestaurant?.tagline || 'Digital Loyalty Pass'}</p>
          </div>

          <div style={{ padding: '12px 16px', borderRadius: '14px', background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.3)', width: '100%' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#F3E5AB', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '2px' }}>
              VIP Loyalty Club
            </span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#FDFBF7' }}>
              {program.rewardTitle || 'Earn ₹100 Instant Discount on Your 5th Visit!'}
            </span>
          </div>

          <form onSubmit={handlePhoneSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '6px' }}>
            <div className="lf-form-group" style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label className="lf-label" style={{ fontSize: '11px', margin: 0 }}>Enter 10-Digit Mobile Number</label>
                <button
                  type="button"
                  onClick={() => {
                    setInputPhone('9876543210');
                    localStorage.setItem('guest_loyalty_phone', '9876543210');
                    registerOrGetCustomer('9876543210');
                    setActiveCustomerPhone('9876543210');
                  }}
                  className="lf-btn-ghost"
                  style={{ fontSize: '10px', color: '#D4AF37', padding: '0 4px', textDecoration: 'underline', cursor: 'pointer' }}
                >
                  ⚡ Demo: 9876543210
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ padding: '10px 12px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#D4CDC3', fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                  +91
                </span>
                <input
                  type="tel"
                  required
                  maxLength="10"
                  autoFocus
                  value={inputPhone}
                  onChange={(e) => setInputPhone(e.target.value.replace(/\D/g, ''))}
                  className="lf-input lf-input-mono"
                  style={{ flex: 1, padding: '10px 14px', fontSize: '15px', letterSpacing: '0.1em' }}
                  placeholder="9876543210"
                />
              </div>
            </div>

            <button
              type="submit"
              className="lf-btn lf-btn-gold"
              style={{ width: '100%', padding: '12px', fontSize: '14px', justifyContent: 'center', marginTop: '4px' }}
            >
              <Sparkles size={16} />
              <span>Check In & Open Loyalty Pass</span>
            </button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginTop: '4px', width: '100%' }}>
            <span style={{ fontSize: '10.5px', color: '#6E655B' }}>
              🔒 Instant check-in • No password or app download required
            </span>

            <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />

            {/* Discreet Staff / Owner Login Link */}
            <button
              type="button"
              onClick={() => setShowMerchantAuthModal(true)}
              className="lf-btn-ghost"
              style={{
                fontSize: '11px',
                color: '#8E8478',
                padding: '6px 12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)'
              }}
            >
              <Lock size={12} style={{ color: '#D4AF37' }} />
              <span>Staff & Restaurant Owner Portal</span>
            </button>
          </div>
        </div>

        {/* Staff & Owner Authentication / Registration Modal */}
        {showMerchantAuthModal && (
          <MerchantLoginModal
            prefilledPhone={inputPhone}
            prefilledRestaurant={activeRestaurant}
            onClose={() => setShowMerchantAuthModal(false)}
            onContinueAsGuest={() => setShowMerchantAuthModal(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
      
      {/* Phone Header Indicator */}
      {isGuestMode ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', borderRadius: '10px', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.08)', fontSize: '11px', color: '#8E8478' }}>
          <span>👤 Member: <strong style={{ color: '#F3E5AB' }}>+91 {currentCustomer?.phone || guestPhone}</strong></span>
          <button
            type="button"
            onClick={handleLogoutGuest}
            style={{ background: 'none', border: 'none', color: '#D4AF37', cursor: 'pointer', fontSize: '11px', textDecoration: 'underline' }}
          >
            Change Number
          </button>
        </div>
      ) : (
        /* Admin Quick Phone Switcher */
        <div className="lf-card" style={{ padding: '12px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Smartphone size={16} style={{ color: '#D4AF37' }} />
              <span style={{ fontSize: '12px', color: '#D4CDC3', fontWeight: 600 }}>Mobile Login:</span>
            </div>
            <form onSubmit={handlePhoneSubmit} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="tel"
                maxLength="10"
                value={inputPhone}
                onChange={(e) => setInputPhone(e.target.value)}
                className="lf-input lf-input-mono"
                style={{ width: '110px', padding: '6px 10px', fontSize: '12px', textAlign: 'center' }}
                placeholder="9876543210"
              />
              <button type="submit" className="lf-btn lf-btn-gold" style={{ padding: '6px 12px', fontSize: '11px' }}>
                Switch
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Main Digital Loyalty Card */}
      <div
        style={{
          backgroundColor: cardBg,
          color: textColor,
          borderRadius: '26px',
          overflow: 'hidden',
          boxShadow: '0 25px 60px -12px rgba(0,0,0,0.9), 0 0 1px 1px rgba(212, 175, 55, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid rgba(255,255,255,0.12)',
          position: 'relative'
        }}
      >
        {/* Pass Header */}
        <div style={{ padding: '20px 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {activeRestaurant.logoUrl ? (
              <img
                src={activeRestaurant.logoUrl}
                alt="logo"
                style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.3)', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                {activeRestaurant.name?.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.02em', color: textColor }}>
                {activeRestaurant.name}
              </h2>
              <p style={{ fontSize: '11px', opacity: 0.75 }}>{activeRestaurant.tagline}</p>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)', opacity: 0.6, display: 'block' }}>LOYALTY POINTS</span>
            <span style={{ fontSize: '18px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: accentColor }}>
              {currentCustomer?.loyaltyPoints || 0}
            </span>
          </div>
        </div>

        {/* Hero Banner Strip */}
        {activeRestaurant.bannerUrl && (
          <div
            style={{
              width: '100%',
              height: '110px',
              backgroundImage: `url(${activeRestaurant.bannerUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative',
              flexShrink: 0
            }}
          >
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.75) 100%)' }} />
            <div style={{ position: 'absolute', bottom: '10px', left: '16px', right: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
              <span style={{ padding: '3px 10px', borderRadius: '999px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', fontWeight: 700, color: '#34D399', border: '1px solid rgba(255,255,255,0.15)' }}>
                {visits} Lifetime Visits
              </span>
              {currentCustomer?.isVip && (
                <span className="lf-badge lf-badge-gold" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
                  👑 VIP GOLD
                </span>
              )}
            </div>
          </div>
        )}

        {/* Reward Status & Stamp Grid */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ padding: '14px 16px', borderRadius: '16px', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '10.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: accentColor }}>
                {isRewardReady ? '🎉 MILESTONE UNLOCKED!' : `COLLECT ${totalStamps - stampsInCycle} MORE STAMPS`}
              </span>
              <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 700, opacity: 0.8 }}>
                {stampsInCycle}/{totalStamps}
              </span>
            </div>
            <div style={{ fontSize: '13.5px', fontWeight: 800, lineHeight: 1.3 }}>
              {program.rewardTitle || '₹100 Instant Discount on Bill'}
            </div>
          </div>

          {/* Interactive Stamp Mark Bubbles */}
          <div style={{ padding: '4px 0' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
              {Array.from({ length: totalStamps }).map((_, idx) => {
                const isFilled = idx < (isRewardReady ? totalStamps : stampsInCycle);
                return (
                  <div
                    key={idx}
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isFilled ? stampActiveColor : 'rgba(0,0,0,0.25)',
                      color: isFilled ? '#171108' : textColor,
                      border: isFilled ? 'none' : '1px dashed rgba(255,255,255,0.25)',
                      boxShadow: isFilled ? `0 0 16px ${stampActiveColor}90` : 'none',
                      transition: 'all 0.3s ease'
                    }}
                    className={isFilled ? 'animate-stamp-burst' : ''}
                  >
                    {isFilled ? (
                      <Check size={22} strokeWidth={3.5} />
                    ) : (
                      <StampIconComponent size={18} strokeWidth={1.75} style={{ opacity: 0.4 }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Rewards Vouchers */}
          {currentCustomer?.vouchers && currentCustomer.vouchers.length > 0 && (
            <div style={{ paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D4AF37', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <RewardIcon size={14} />
                <span>Active Unlocked Vouchers ({currentCustomer.vouchers.filter(v => v.status === 'unredeemed').length})</span>
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {currentCustomer.vouchers.map((v, i) => {
                  const isRedeemed = v.status === 'redeemed';
                  return (
                    <div
                      key={i}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: isRedeemed ? 'rgba(0,0,0,0.3)' : 'rgba(212, 175, 55, 0.12)',
                        border: isRedeemed ? '1px dashed rgba(255,255,255,0.1)' : '1px solid rgba(212, 175, 55, 0.4)',
                        opacity: isRedeemed ? 0.5 : 1
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#FDFBF7' }}>{v.title}</div>
                        <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#F3E5AB', fontWeight: 700, marginTop: '2px' }}>
                          CODE: <span>{v.code}</span>
                        </div>
                      </div>
                      <span className={isRedeemed ? 'lf-badge' : 'lf-badge lf-badge-gold'} style={{ fontSize: '9.5px' }}>
                        {isRedeemed ? 'REDEEMED' : 'READY TO USE'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Barcode Box */}
          <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '18px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.15)' }}>
            <QrCode size={72} color="#000000" />
            <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#1E293B', marginTop: '4px', letterSpacing: '0.08em' }}>
              {currentCustomer?.phone || (isGuestMode ? guestPhone : '9876543210')}
            </div>
            <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#64748B', textTransform: 'uppercase' }}>
              SHOW TO CASHIER WHEN BILLING
            </span>
          </div>

        </div>
      </div>

      {/* Quick Perks & 5-Star Reviews */}
      <div className="lf-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#D4CDC3' }}>Guest Privileges & Review Perks</span>
        
        {links.googleReviewUrl && (
          <a
            href={getGoogleReviewUrl(links.googleReviewUrl)}
            target="_blank"
            rel="noreferrer"
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              background: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              color: '#F3E5AB',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textDecoration: 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Star size={16} style={{ color: '#D4AF37', fill: '#D4AF37' }} />
              <span>Leave 5-Star Google Review</span>
            </div>
            <span className="lf-badge lf-badge-gold" style={{ fontSize: '9px' }}>Free Treat</span>
          </a>
        )}

        {links.instagramHandle && (
          <a
            href={getInstagramUrl(links.instagramHandle)}
            target="_blank"
            rel="noreferrer"
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              background: 'rgba(200, 90, 50, 0.12)',
              border: '1px solid rgba(200, 90, 50, 0.35)',
              color: '#F87171',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textDecoration: 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Camera size={16} style={{ color: '#E07A5F' }} />
              <span>Follow {getInstagramDisplayHandle(links.instagramHandle)}</span>
            </div>
            <span className="lf-badge lf-badge-copper" style={{ fontSize: '9px' }}>Instagram</span>
          </a>
        )}
      </div>

      {/* Optional Native Wallet Export */}
      <div className="lf-card" style={{ padding: '16px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <span style={{ fontSize: '11.5px', color: '#8E8478' }}>Save Pass to Native Wallet (Optional)</span>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => handleWalletSave('Apple Wallet')}
            className="lf-btn lf-btn-secondary"
            style={{ fontSize: '11.5px', padding: '8px 14px' }}
          >
            <span> Add to Apple Wallet</span>
          </button>

          <button
            type="button"
            onClick={() => handleWalletSave('Google Wallet')}
            className="lf-btn lf-btn-secondary"
            style={{ fontSize: '11.5px', padding: '8px 14px' }}
          >
            <span style={{ color: '#D4AF37', fontWeight: 900 }}>G</span> Save to Google Wallet
          </button>
        </div>

        {showWalletExportSuccess && (
          <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34D399', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <CheckCircle2 size={13} />
            <span>Pass saved to {showWalletExportSuccess}!</span>
          </div>
        )}
      </div>

      {/* Staff & Owner Portal Link */}
      <div style={{ textAlign: 'center', padding: '8px 0 16px 0' }}>
        <button
          type="button"
          onClick={() => setShowMerchantAuthModal(true)}
          className="lf-btn-ghost"
          style={{
            fontSize: '11px',
            color: '#8E8478',
            padding: '6px 14px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)'
          }}
        >
          <Lock size={12} style={{ color: '#D4AF37' }} />
          <span>Staff & Restaurant Owner Portal</span>
        </button>
      </div>

      {/* Staff & Owner Authentication / Registration Modal */}
      {showMerchantAuthModal && (
        <MerchantLoginModal
          prefilledPhone={inputPhone || cleanGuestPhone}
          prefilledRestaurant={activeRestaurant}
          onClose={() => setShowMerchantAuthModal(false)}
          onContinueAsGuest={() => setShowMerchantAuthModal(false)}
        />
      )}

    </div>
  );
}
