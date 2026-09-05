import React, { useState, useEffect } from 'react';
import { useLoyalty, normalizePhone } from '../../context/LoyaltyContext';
import { 
  Scan, 
  Phone, 
  PlusCircle, 
  CheckCircle, 
  DollarSign, 
  Gift, 
  Award, 
  Sparkles, 
  AlertCircle,
  Clock,
  Crown
} from 'lucide-react';

export default function CashierScanner() {
  const { 
    activeRestaurant, 
    customers = [], 
    activeCustomerPhone, 
    registerOrGetCustomer, 
    addStampToCustomer, 
    redeemVoucher,
    triggerImmediateSync 
  } = useLoyalty();

  const [searchPhone, setSearchPhone] = useState(normalizePhone(activeCustomerPhone) || '9876543210');
  const [billAmount, setBillAmount] = useState('');
  const [lastActionMessage, setLastActionMessage] = useState(null);

  const { program = {} } = activeRestaurant || {};
  const totalStamps = program.totalStamps || 5;

  const cleanPhone = normalizePhone(searchPhone);
  const currentCustomer = customers.find(c => normalizePhone(c.phone) === cleanPhone && (c.restaurantId === activeRestaurant?.id || !c.restaurantId)) ||
    customers.find(c => normalizePhone(c.phone) === cleanPhone) || {
      phone: cleanPhone,
      name: `Guest ${cleanPhone ? cleanPhone.slice(-4) : 'Customer'}`,
      restaurantId: activeRestaurant?.id,
      visits: 0,
      totalSpend: 0,
      loyaltyPoints: 0,
      vouchers: []
    };

  const handleLookup = (phoneToUse) => {
    const target = normalizePhone(phoneToUse || searchPhone);
    if (target.length >= 10) {
      registerOrGetCustomer(target);
      if (typeof triggerImmediateSync === 'function') {
        triggerImmediateSync(target);
      }
    }
  };

  const handleStampOnly = () => {
    if (!cleanPhone || cleanPhone.length < 10) return;
    registerOrGetCustomer(cleanPhone);
    const res = addStampToCustomer(cleanPhone, 0);
    setLastActionMessage(res.message);
    setTimeout(() => setLastActionMessage(null), 4000);
  };

  const handleAddBillAndStamp = (e) => {
    e.preventDefault();
    if (!cleanPhone || cleanPhone.length < 10) return;
    const amount = parseFloat(billAmount);
    if (isNaN(amount) || amount <= 0) return;
    registerOrGetCustomer(cleanPhone);
    const res = addStampToCustomer(cleanPhone, amount);
    setLastActionMessage(res.message);
    setBillAmount('');
    setTimeout(() => setLastActionMessage(null), 4000);
  };

  const handleRedeem = (code) => {
    if (!cleanPhone) return;
    const res = redeemVoucher(cleanPhone, code);
    setLastActionMessage(res.message);
    setTimeout(() => setLastActionMessage(null), 4000);
  };

  const visits = Number(currentCustomer?.visits) || 0;
  const stampsInCycle = visits % totalStamps;
  const isRewardReady = visits > 0 && stampsInCycle === 0;

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      
      {/* Header Banner */}
      <div className="lf-card">
        <div className="lf-card-header" style={{ flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="lf-badge lf-badge-emerald">Live POS Terminal</span>
              <span className="lf-badge lf-badge-gold">3-Second Counter Flow</span>
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#FDFBF7' }}>
              Cashier Quick Stamping & Voucher Billing Terminal
            </h1>
            <p style={{ fontSize: '12px', color: '#8E8478', marginTop: '2px' }}>
              Enter guest mobile number to add stamps, award points, and discount bills instantly.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: '#8E8478' }}>Logged in as:</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#F3E5AB' }}>Till 01 • Main Counter</span>
          </div>
        </div>
      </div>

      {/* Action Notification */}
      {lastActionMessage && (
        <div style={{ padding: '14px 18px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.45)', color: '#34D399', fontSize: '13.5px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 8px 24px rgba(16, 185, 129, 0.2)' }}>
          <CheckCircle size={18} />
          <span>{lastActionMessage}</span>
        </div>
      )}

      {/* Main POS Split View */}
      <div className="lf-grid-2">
        
        {/* Left Column: Phone Search & Keypad */}
        <div className="lf-card">
          <div className="lf-card-header">
            <div className="lf-card-title">
              <Phone size={18} className="lf-card-title-icon" />
              <span>Guest Phone Lookup</span>
            </div>
          </div>

          <div className="lf-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div className="lf-form-group">
              <label className="lf-label">10-Digit Mobile Number</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="tel"
                  maxLength="10"
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value.replace(/\D/g, ''))}
                  onBlur={() => handleLookup()}
                  placeholder="Enter 10 digits"
                  className="lf-input lf-input-mono"
                  style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '0.05em' }}
                />
                <button
                  type="button"
                  onClick={() => handleLookup()}
                  className="lf-btn lf-btn-gold"
                >
                  Lookup
                </button>
              </div>
            </div>

            {/* Quick Recent Guest Selector Chips */}
            <div>
              <span className="lf-label" style={{ marginBottom: '8px', display: 'block' }}>Recent Guest Records</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {customers.slice(0, 4).map((c) => (
                  <button
                    key={c.phone}
                    type="button"
                    onClick={() => {
                      setSearchPhone(c.phone);
                      handleLookup(c.phone);
                    }}
                    className={`lf-icon-pill ${searchPhone === c.phone ? 'active' : ''}`}
                    style={{ fontSize: '11px' }}
                  >
                    <span>{c.name}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', opacity: 0.7 }}>({c.phone.slice(-4)})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Touch Keypad */}
            <div style={{ paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {['1','2','3','4','5','6','7','8','9','C','0','⌫'].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => {
                      if (k === 'C') {
                        setSearchPhone('');
                      } else if (k === '⌫') {
                        setSearchPhone(prev => prev.slice(0, -1));
                      } else {
                        if (searchPhone.length < 10) setSearchPhone(prev => prev + k);
                      }
                    }}
                    className="lf-btn lf-btn-secondary"
                    style={{ padding: '12px', fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Customer Card & Immediate Stamping Actions */}
        <div className="lf-card">
          <div className="lf-card-header">
            <div className="lf-card-title">
              <Award size={18} className="lf-card-title-icon" />
              <span>Customer Loyalty Profile</span>
            </div>
            {currentCustomer?.isVip && (
              <span className="lf-badge lf-badge-gold">VIP Guest</span>
            )}
          </div>

          <div className="lf-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {currentCustomer ? (
              <>
                {/* Stats Summary */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                    <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: '#8E8478', display: 'block' }}>VISITS</span>
                    <span style={{ fontSize: '18px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#FDFBF7' }}>{visits}</span>
                  </div>

                  <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                    <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: '#8E8478', display: 'block' }}>CYCLE STAMPS</span>
                    <span style={{ fontSize: '18px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#D4AF37' }}>{stampsInCycle}/{totalStamps}</span>
                  </div>

                  <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                    <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: '#8E8478', display: 'block' }}>POINTS</span>
                    <span style={{ fontSize: '18px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#34D399' }}>{currentCustomer.loyaltyPoints || 0}</span>
                  </div>
                </div>

                {/* Stamping Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={handleStampOnly}
                    className="lf-btn lf-btn-gold"
                    style={{ padding: '14px', fontSize: '15px' }}
                  >
                    <PlusCircle size={18} />
                    <span>+1 Stamp Only (Quick Check-In)</span>
                  </button>

                  <form onSubmit={handleAddBillAndStamp} style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <input
                        type="number"
                        min="1"
                        step="any"
                        value={billAmount}
                        onChange={(e) => setBillAmount(e.target.value)}
                        placeholder="Enter Bill Amount (₹)"
                        className="lf-input lf-input-mono"
                        style={{ paddingLeft: '28px', fontSize: '13.5px' }}
                      />
                      <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#D4AF37', fontWeight: 700 }}>₹</span>
                    </div>
                    <button
                      type="submit"
                      disabled={!billAmount}
                      className="lf-btn lf-btn-emerald"
                      style={{ opacity: !billAmount ? 0.6 : 1 }}
                    >
                      <DollarSign size={16} />
                      <span>Add Spend + Stamp</span>
                    </button>
                  </form>
                </div>

                {/* Vouchers Redeem Section */}
                {currentCustomer.vouchers && currentCustomer.vouchers.filter(v => v.status === 'unredeemed').length > 0 && (
                  <div style={{ paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D4AF37', marginBottom: '8px', display: 'block' }}>
                      Ready to Redeem Vouchers
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {currentCustomer.vouchers.filter(v => v.status === 'unredeemed').map((v, i) => (
                        <div
                          key={i}
                          style={{
                            padding: '10px 14px',
                            borderRadius: '10px',
                            background: 'rgba(212, 175, 55, 0.12)',
                            border: '1px solid rgba(212, 175, 55, 0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#FDFBF7' }}>{v.title}</div>
                            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#F3E5AB' }}>{v.code}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRedeem(v.code)}
                            className="lf-btn lf-btn-gold"
                            style={{ padding: '6px 12px', fontSize: '11px' }}
                          >
                            Redeem ₹100 Off
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: '#8E8478' }}>
                <p>Enter 10-digit number on the left to view loyalty profile.</p>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
