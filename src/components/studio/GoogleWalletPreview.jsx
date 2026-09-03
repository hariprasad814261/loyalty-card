import React from 'react';
import { getStampIconComponent } from '../../utils/stampIconHelper';
import { getInstagramUrl, getInstagramDisplayHandle, getGoogleReviewUrl } from '../../utils/socialLinkHelper';
import { 
  Check, 
  MapPin, 
  Phone, 
  Camera, 
  QrCode,
  Info,
  Star,
  ExternalLink
} from 'lucide-react';

export default function GoogleWalletPreview({ restaurant, customer, isFlipped, onFlipToggle }) {
  const { theme = {}, program = {}, links = {} } = restaurant || {};

  const totalStamps = program.totalStamps || 5;
  const currentVisits = customer?.visits || 0;
  const activeStampsInCycle = currentVisits % totalStamps;
  const isRewardReady = currentVisits > 0 && activeStampsInCycle === 0;

  const cardBg = theme.cardBgColor || '#221A15';
  const textColor = theme.textColor || '#FDFBF7';
  const accentColor = theme.accentColor || '#D4AF37';
  const stampActiveColor = theme.stampActiveColor || '#E5C07B';

  const StampIconComponent = getStampIconComponent(theme.stampIcon);

  const googleReviewUrl = getGoogleReviewUrl(links.googleReviewUrl);
  const instagramUrl = getInstagramUrl(links.instagramHandle);
  const instagramDisplay = getInstagramDisplayHandle(links.instagramHandle);

  return (
    <div className="lf-flip-container">
      <div className={`lf-flip-inner ${isFlipped ? 'flipped' : ''}`}>
        
        {/* FRONT OF GOOGLE WALLET PASS */}
        <div
          className="lf-flip-front"
          style={{
            backgroundColor: cardBg,
            color: textColor,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '26px',
            border: '1px solid rgba(255,255,255,0.12)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Subtle Pass Header Gloss */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '36px', background: 'linear-gradient(180deg, rgba(255,255,255,0.08), transparent)', pointerEvents: 'none' }} />

          {/* Material Top Bar */}
          <div style={{ padding: '12px 16px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 2, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: accentColor, display: 'inline-block', boxShadow: `0 0 8px ${accentColor}` }}></span>
              <span style={{ fontSize: '10.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.85 }}>Google Wallet</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ textAlign: 'right', marginRight: '4px' }}>
                <span style={{ fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)', opacity: 0.6, display: 'block' }}>POINTS</span>
                <span style={{ fontSize: '14px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: accentColor, lineHeight: 1 }}>
                  {customer?.loyaltyPoints || 0}
                </span>
              </div>
              <button
                type="button"
                onClick={onFlipToggle}
                style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', color: textColor, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Flip pass"
              >
                <Info size={12} />
              </button>
            </div>
          </div>

          {/* Restaurant Header */}
          <div style={{ padding: '10px 16px 8px', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 2 }}>
            {restaurant.logoUrl ? (
              <img
                src={restaurant.logoUrl}
                alt="logo"
                style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid rgba(255,255,255,0.25)', boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '11px' }}>
                {restaurant.name?.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ fontSize: '13.5px', fontWeight: 800, lineHeight: 1.1, color: textColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{restaurant.name}</h3>
              <p style={{ fontSize: '10px', opacity: 0.75, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{restaurant.tagline || restaurant.category || 'Loyalty Program'}</p>
            </div>
          </div>

          {/* Hero Banner Strip Photo (Burmix / Restaurant Custom Image) */}
          {restaurant.bannerUrl ? (
            <div
              style={{
                width: '100%',
                height: '88px',
                backgroundImage: `url(${restaurant.bannerUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                flexShrink: 0
              }}
            >
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.7) 100%)' }} />
            </div>
          ) : (
            <div style={{ width: '100%', height: '76px', background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', opacity: 0.4 }}>
              Google Wallet Pass Banner
            </div>
          )}

          {/* Reward Status & Interactive Stamp Matrix */}
          <div style={{ padding: '10px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>
            
            {/* Reward Title & Progress */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: accentColor }}>
                  {isRewardReady ? '🎉 REWARD UNLOCKED!' : `COLLECT ${totalStamps - activeStampsInCycle} MORE STAMPS`}
                </span>
                <span style={{ padding: '2px 7px', borderRadius: '999px', fontSize: '9.5px', fontWeight: 800, background: 'rgba(212, 175, 55, 0.15)', color: '#F3E5AB', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                  {activeStampsInCycle}/{totalStamps} STAMPS
                </span>
              </div>
              
              <div style={{ fontSize: '12px', fontWeight: 700, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {program.rewardTitle || '₹100 Instant Discount on Bill'}
              </div>
            </div>

            {/* Stamp Grid Matrix */}
            <div style={{ padding: '4px 0' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                {Array.from({ length: totalStamps }).map((_, idx) => {
                  const isFilled = idx < (isRewardReady ? totalStamps : activeStampsInCycle);
                  return (
                    <div
                      key={idx}
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isFilled ? stampActiveColor : 'rgba(0,0,0,0.25)',
                        color: isFilled ? '#171108' : textColor,
                        border: isFilled ? 'none' : '1px dashed rgba(255,255,255,0.3)',
                        boxShadow: isFilled ? `0 0 14px ${stampActiveColor}80` : 'none',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {isFilled ? (
                        <Check size={18} strokeWidth={3.5} />
                      ) : (
                        <StampIconComponent size={15} strokeWidth={1.75} style={{ opacity: 0.4 }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Barcode & Till Scan Bar */}
            <div style={{ paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)', opacity: 0.6, display: 'block' }}>PHONE NUMBER</span>
                <span style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{customer?.phone || '9876543210'}</span>
              </div>

              {/* QR Barcode */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ background: '#FFFFFF', padding: '3px', borderRadius: '4px' }}>
                  <QrCode size={34} color="#000000" />
                </div>
                <span style={{ fontSize: '8px', fontFamily: 'var(--font-mono)', opacity: 0.5, marginTop: '2px' }}>TILL SCAN</span>
              </div>

              {/* Flip Button */}
              <button
                type="button"
                onClick={onFlipToggle}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: textColor,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Flip to details"
              >
                <Info size={13} />
              </button>
            </div>

          </div>
        </div>

        {/* BACK OF GOOGLE WALLET PASS */}
        <div
          className="lf-flip-back"
          style={{
            backgroundColor: cardBg,
            color: textColor,
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '26px',
            border: '1px solid rgba(255,255,255,0.12)',
            overflowY: 'auto'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '14px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: textColor }}>{restaurant.name} Pass Info</h4>
            <button
              type="button"
              onClick={onFlipToggle}
              className="lf-btn lf-btn-secondary"
              style={{ padding: '4px 10px', fontSize: '11px' }}
            >
              Done
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
            
            {/* 1. Google Review Link Button Card */}
            {googleReviewUrl && (
              <div style={{ padding: '10px 12px', borderRadius: '10px', background: 'rgba(212, 175, 55, 0.12)', border: '1px solid rgba(212, 175, 55, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Star size={16} style={{ color: '#D4AF37', fill: '#D4AF37' }} />
                  <div>
                    <div style={{ fontWeight: 700, color: '#FDFBF7', fontSize: '12px' }}>Google Maps Reviews</div>
                    <div style={{ fontSize: '10px', opacity: 0.75 }}>Rate us 5-stars for bonus rewards</div>
                  </div>
                </div>
                <a
                  href={googleReviewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="lf-btn lf-btn-gold"
                  style={{ padding: '5px 10px', fontSize: '11px', textDecoration: 'none' }}
                >
                  <span>Review</span>
                  <ExternalLink size={10} />
                </a>
              </div>
            )}

            {/* 2. Instagram Direct Link Button Card */}
            {instagramUrl && (
              <div style={{ padding: '10px 12px', borderRadius: '10px', background: 'rgba(200, 90, 50, 0.12)', border: '1px solid rgba(200, 90, 50, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Camera size={16} style={{ color: '#E07A5F' }} />
                  <div>
                    <div style={{ fontWeight: 700, color: '#FDFBF7', fontSize: '12px' }}>Instagram Official Page</div>
                    <div style={{ fontSize: '10px', color: '#F87171', fontWeight: 600 }}>{instagramDisplay}</div>
                  </div>
                </div>
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="lf-btn lf-btn-secondary"
                  style={{ padding: '5px 10px', fontSize: '11px', borderColor: 'rgba(200,90,50,0.4)', color: '#F87171', textDecoration: 'none' }}
                >
                  <span>Follow</span>
                  <ExternalLink size={10} />
                </a>
              </div>
            )}

            {/* Contact */}
            {links.phone && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ opacity: 0.7, display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={13} /> Contact Phone</span>
                <a href={`tel:${links.phone}`} style={{ fontFamily: 'var(--font-mono)', color: '#FDFBF7', textDecoration: 'none' }}>{links.phone}</a>
              </div>
            )}

            {/* Address */}
            {links.address && (
              <div style={{ padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ opacity: 0.7, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}><MapPin size={13} /> Location</span>
                <p style={{ fontSize: '11px', opacity: 0.9, lineHeight: 1.4 }}>{links.address}</p>
              </div>
            )}

            {/* Loyalty Rules */}
            <div style={{ paddingTop: '6px' }}>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)', opacity: 0.6, display: 'block', marginBottom: '4px' }}>PROGRAM TERMS</span>
              <p style={{ fontSize: '10.5px', opacity: 0.75, lineHeight: 1.5 }}>
                • 1 stamp awarded per visit / dining check-in.<br />
                • Complete {totalStamps} stamps to claim {program.rewardTitle}.<br />
                • Linked indestructible to your mobile number.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
