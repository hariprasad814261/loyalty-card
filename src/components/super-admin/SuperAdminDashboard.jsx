import React, { useState } from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import { 
  ShieldAlert, 
  Store, 
  Users, 
  Sparkles, 
  Plus, 
  Copy, 
  Check, 
  Phone, 
  Lock, 
  ExternalLink, 
  MessageSquare,
  KeyRound,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

export function SuperAdminDashboard() {
  const { 
    restaurants, 
    customers, 
    onboardNewRestaurant, 
    switchRestaurant, 
    setActiveTab, 
    setRouteMode,
    verifyMerchantPin
  } = useLoyalty();

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('loyalty_superadmin_auth') === 'true';
  });
  const [adminKey, setAdminKey] = useState('');
  const [authError, setAuthError] = useState('');

  // Form State for Onboarding
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [newShopName, setNewShopName] = useState('');
  const [newShopTagline, setNewShopTagline] = useState('');
  const [newShopCategory, setNewShopCategory] = useState('Restaurant & Dining');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerPhone, setNewOwnerPhone] = useState('');
  const [newOwnerPin, setNewOwnerPin] = useState('1234');

  const [copiedShopId, setCopiedShopId] = useState(null);
  const [copiedType, setCopiedType] = useState(null);

  // Authenticate Super Admin with Master Passphrase
  const handleAdminAuth = (e) => {
    e?.preventDefault();
    if (adminKey.trim() === 'admin2026' || adminKey.trim() === '1234') {
      setIsAuthenticated(true);
      sessionStorage.setItem('loyalty_superadmin_auth', 'true');
      setAuthError('');
    } else {
      setAuthError('Invalid master key. Default key is "admin2026"');
    }
  };

  const handleCreateRestaurant = (e) => {
    e.preventDefault();
    if (!newShopName || !newOwnerPhone) return;

    onboardNewRestaurant({
      name: newShopName,
      tagline: newShopTagline || 'Authentic Handcrafted Flavors',
      category: newShopCategory,
      ownerName: newOwnerName || 'Store Manager',
      ownerPhone: newOwnerPhone.replace(/\D/g, ''),
      ownerPin: newOwnerPin || '1234'
    });

    setNewShopName('');
    setNewShopTagline('');
    setNewOwnerName('');
    setNewOwnerPhone('');
    setNewOwnerPin('1234');
    setShowOnboardModal(false);
  };

  const handleCopyLink = (text, shopId, type) => {
    navigator.clipboard.writeText(text);
    setCopiedShopId(shopId);
    setCopiedType(type);
    setTimeout(() => {
      setCopiedShopId(null);
      setCopiedType(null);
    }, 2000);
  };

  const getBaseOrigin = () => {
    return typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.vercel.app';
  };

  const handleOpenAsMerchant = (rest) => {
    verifyMerchantPin(rest.id, rest.owner?.pin || '1234');
  };

  // Master Lock Screen
  if (!isAuthenticated) {
    return (
      <div 
        style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
      >
        <div 
          className="lf-card animate-fade-in" 
          style={{
            maxWidth: '400px',
            width: '100%',
            padding: '32px 24px',
            textAlign: 'center',
            background: 'linear-gradient(180deg, #1C1510 0%, #100C09 100%)',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            borderRadius: '20px'
          }}
        >
          <div 
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(212, 175, 55, 0.1)',
              border: '2px solid rgba(212, 175, 55, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              color: '#D4AF37'
            }}
          >
            <ShieldAlert size={28} />
          </div>

          <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#D4AF37' }}>
            Platform Control Center
          </span>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#FDFBF7', margin: '4px 0 8px 0' }}>
            Super-Admin Access
          </h2>
          <p style={{ fontSize: '12px', color: '#8E8478', marginBottom: '20px' }}>
            Enter your platform master passphrase to manage restaurants, onboard clients, and set shop PINs.
          </p>

          <form onSubmit={handleAdminAuth} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="password"
              required
              autoFocus
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="Master Passphrase (default: admin2026)"
              className="lf-input"
              style={{ textAlign: 'center', fontSize: '15px' }}
            />

            {authError && (
              <span style={{ fontSize: '11.5px', color: '#F87171' }}>{authError}</span>
            )}

            <button
              type="submit"
              className="lf-btn lf-btn-gold"
              style={{ width: '100%', padding: '12px', justifyContent: 'center' }}
            >
              <KeyRound size={16} />
              <span>Enter Super-Admin</span>
            </button>
          </form>

          <span style={{ fontSize: '10.5px', color: '#6E655B', display: 'block', marginTop: '16px' }}>
            Default test key: <code style={{ color: '#D4AF37' }}>admin2026</code>
          </span>
        </div>
      </div>
    );
  }

  // Calculate Platform Totals
  const totalStamps = customers.reduce((acc, c) => acc + (c.visits || 0), 0);
  const totalVouchers = customers.reduce((acc, c) => acc + (c.vouchers?.length || 0), 0);

  return (
    <div className="lf-container animate-fade-in" style={{ padding: '24px 16px' }}>
      
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ padding: '3px 10px', borderRadius: '100px', background: 'rgba(212, 175, 55, 0.15)', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#F3E5AB', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>
              👑 Super-Admin Master Panel
            </span>
            <span style={{ fontSize: '12px', color: '#8E8478' }}>Single-Hosting Multi-Tenancy</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#FDFBF7', marginTop: '4px' }}>
            Restaurant Merchant Hub
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowOnboardModal(true)}
            className="lf-btn lf-btn-gold"
            style={{ padding: '10px 16px' }}
          >
            <Plus size={16} />
            <span>Onboard New Shop</span>
          </button>

          <button
            onClick={() => {
              sessionStorage.removeItem('loyalty_superadmin_auth');
              setIsAuthenticated(false);
            }}
            className="lf-btn lf-btn-secondary"
            style={{ padding: '10px 14px' }}
          >
            <span>Lock Admin</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="lf-grid-3" style={{ marginBottom: '28px' }}>
        <div className="lf-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(212, 175, 55, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37' }}>
            <Store size={22} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#8E8478', textTransform: 'uppercase', fontWeight: 700 }}>Total Partner Stores</span>
            <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#FDFBF7', margin: 0 }}>{restaurants.length}</h3>
          </div>
        </div>

        <div className="lf-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
            <Users size={22} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#8E8478', textTransform: 'uppercase', fontWeight: 700 }}>Total Enrolled Customers</span>
            <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#FDFBF7', margin: 0 }}>{customers.length}</h3>
          </div>
        </div>

        <div className="lf-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60A5FA' }}>
            <TrendingUp size={22} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#8E8478', textTransform: 'uppercase', fontWeight: 700 }}>Total Digital Stamps Awarded</span>
            <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#FDFBF7', margin: 0 }}>{totalStamps}</h3>
          </div>
        </div>
      </div>

      {/* Onboard New Shop Modal */}
      {showOnboardModal && (
        <div className="lf-modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="lf-card animate-fade-in" style={{ maxWidth: '480px', width: '100%', padding: '28px', background: '#16120F', border: '1px solid rgba(212, 175, 55, 0.35)', borderRadius: '20px' }}>
            <h2 style={{ fontSize: '19px', fontWeight: 800, color: '#FDFBF7', marginBottom: '4px' }}>
              Onboard New Partner Restaurant
            </h2>
            <p style={{ fontSize: '12px', color: '#8E8478', marginBottom: '18px' }}>
              Register the shop details, owner mobile number, and set their private 4-digit Cashier PIN.
            </p>

            <form onSubmit={handleCreateRestaurant} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="lf-form-group">
                <label className="lf-label">Restaurant / Shop Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Copper Chimney or Thalappakatti"
                  value={newShopName}
                  onChange={(e) => setNewShopName(e.target.value)}
                  className="lf-input"
                />
              </div>

              <div className="lf-form-group">
                <label className="lf-label">Tagline or Cuisine</label>
                <input
                  type="text"
                  placeholder="e.g. Authentic Biryani & Tandoor"
                  value={newShopTagline}
                  onChange={(e) => setNewShopTagline(e.target.value)}
                  className="lf-input"
                />
              </div>

              <div className="lf-grid-2">
                <div className="lf-form-group">
                  <label className="lf-label">Owner / Manager Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Anand"
                    value={newOwnerName}
                    onChange={(e) => setNewOwnerName(e.target.value)}
                    className="lf-input"
                  />
                </div>

                <div className="lf-form-group">
                  <label className="lf-label">Owner Mobile (10 Digits) *</label>
                  <input
                    type="tel"
                    required
                    maxLength="10"
                    placeholder="9840123456"
                    value={newOwnerPhone}
                    onChange={(e) => setNewOwnerPhone(e.target.value.replace(/\D/g, ''))}
                    className="lf-input lf-input-mono"
                  />
                </div>
              </div>

              <div className="lf-form-group">
                <label className="lf-label">4-Digit Security PIN *</label>
                <input
                  type="text"
                  required
                  maxLength="4"
                  placeholder="1234"
                  value={newOwnerPin}
                  onChange={(e) => setNewOwnerPin(e.target.value.replace(/\D/g, ''))}
                  className="lf-input lf-input-mono"
                  style={{ letterSpacing: '0.2em', textAlign: 'center', fontSize: '18px', fontWeight: 800 }}
                />
                <span style={{ fontSize: '10.5px', color: '#8E8478' }}>
                  The shopkeeper uses this PIN to unlock their private cashier and CRM terminal.
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowOnboardModal(false)}
                  className="lf-btn lf-btn-secondary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="lf-btn lf-btn-gold"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Create & Generate Links
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Partner Restaurants Table & Link Generator */}
      <div className="lf-card" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#FDFBF7', marginBottom: '16px' }}>
          Active Partner Restaurants ({restaurants.length})
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {restaurants.map((rest) => {
            const restCustomers = customers.filter(c => c.restaurantId === rest.id);
            const portalLink = `${getBaseOrigin()}/?login=true`;
            const passLink = `${getBaseOrigin()}/?pass=${rest.id}`;
            const whatsappMsg = encodeURIComponent(
              `Hello ${rest.owner?.name || 'Partner'}! 🎉\n\nYour VIP Loyalty & Cashier Portal is now live for *${rest.name}*!\n\n🔑 *Cashier Terminal:* ${portalLink}\n📱 *Registered Mobile:* ${rest.owner?.phone || 'Your Mobile'}\n🔒 *4-Digit PIN:* ${rest.owner?.pin || '1234'}\n\n🖨️ *Customer QR Pass Link:* ${passLink}\n\nStart stamping customer visits and building your retention today!`
            );

            return (
              <div 
                key={rest.id} 
                style={{
                  padding: '18px 20px',
                  borderRadius: '16px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}
              >
                {/* Shop Identity */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '260px' }}>
                  {rest.logoUrl ? (
                    <img src={rest.logoUrl} alt="logo" style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--gold-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1A1409', fontWeight: 900 }}>
                      {rest.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#FDFBF7', margin: 0 }}>
                      {rest.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '3px', fontSize: '11.5px', color: '#8E8478' }}>
                      <span>Owner: <strong style={{ color: '#D4CDC3' }}>{rest.owner?.name || 'Store Manager'}</strong></span>
                      <span>•</span>
                      <span><Phone size={11} style={{ display: 'inline', marginRight: '3px' }} />{rest.owner?.phone || 'Not set'}</span>
                      <span>•</span>
                      <span>PIN: <strong style={{ color: '#D4AF37', letterSpacing: '0.08em' }}>{rest.owner?.pin || '1234'}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Performance Stats */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '10px', color: '#8E8478', textTransform: 'uppercase', display: 'block' }}>Customers</span>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: '#FDFBF7' }}>{restCustomers.length}</span>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '10px', color: '#8E8478', textTransform: 'uppercase', display: 'block' }}>Reward Goal</span>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: '#F3E5AB' }}>{rest.program?.totalStamps || 5} Visits</span>
                  </div>
                </div>

                {/* 1-Click Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {/* Copy Customer Pass */}
                  <button
                    type="button"
                    onClick={() => handleCopyLink(passLink, rest.id, 'pass')}
                    className="lf-btn lf-btn-secondary"
                    style={{ padding: '7px 11px', fontSize: '11.5px' }}
                    title="Copy Customer Table QR URL"
                  >
                    {copiedShopId === rest.id && copiedType === 'pass' ? (
                      <Check size={13} style={{ color: '#10B981' }} />
                    ) : (
                      <Copy size={13} />
                    )}
                    <span>Copy QR Pass</span>
                  </button>

                  {/* Send WhatsApp Onboarding Info */}
                  <a
                    href={`https://wa.me/?text=${whatsappMsg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lf-btn lf-btn-secondary"
                    style={{ padding: '7px 11px', fontSize: '11.5px', color: '#25D366', borderColor: 'rgba(37, 211, 102, 0.3)' }}
                    title="Share Login & Standee link to Shopkeeper via WhatsApp"
                  >
                    <MessageSquare size={13} />
                    <span>WhatsApp Invite</span>
                  </a>

                  {/* Open Terminal as Shopkeeper */}
                  <button
                    type="button"
                    onClick={() => handleOpenAsMerchant(rest)}
                    className="lf-btn lf-btn-gold"
                    style={{ padding: '7px 12px', fontSize: '11.5px' }}
                    title="Login directly as this merchant"
                  >
                    <Lock size={13} />
                    <span>Open Store Terminal</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
export default SuperAdminDashboard;
