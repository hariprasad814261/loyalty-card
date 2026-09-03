import React, { useState } from 'react';
import { LoyaltyProvider, useLoyalty } from './context/LoyaltyContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import CardConfigForm from './components/studio/CardConfigForm';
import LivePreviewContainer from './components/studio/LivePreviewContainer';
import StandeeGenerator from './components/qr-standee/StandeeGenerator';
import CustomerMobilePass from './components/customer-pass/CustomerMobilePass';
import CashierScanner from './components/cashier/CashierScanner';
import CustomerTable from './components/marketing-crm/CustomerTable';
import { 
  Palette, 
  Printer, 
  Smartphone, 
  Scan, 
  Users, 
  Plus, 
  RotateCcw, 
  Sparkles, 
  Utensils, 
  HelpCircle,
  X,
  Crown,
  ChevronDown
} from 'lucide-react';

function NavigationHeader({ onOpenHelp }) {
  const { 
    restaurants, 
    activeRestaurantId, 
    switchRestaurant, 
    addNewRestaurant, 
    activeTab, 
    setActiveTab,
    resetToDefaultData 
  } = useLoyalty();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newRestName, setNewRestName] = useState('');
  const [newRestTagline, setNewRestTagline] = useState('');

  const handleAddRestaurant = (e) => {
    e.preventDefault();
    if (!newRestName) return;
    addNewRestaurant({
      name: newRestName,
      tagline: newRestTagline || 'Authentic Culinary Craft'
    });
    setNewRestName('');
    setNewRestTagline('');
    setShowAddModal(false);
  };

  const navItems = [
    { id: 'studio', label: 'Card Studio', icon: Palette },
    { id: 'standee', label: 'QR Standee Kit', icon: Printer },
    { id: 'customer-pass', label: 'Customer Mobile Pass', icon: Smartphone },
    { id: 'cashier', label: 'Cashier Terminal', icon: Scan },
    { id: 'crm', label: 'Retention Hub', icon: Users }
  ];

  return (
    <>
      <header className="lf-header">
        <div className="lf-header-inner">
          
          {/* Brand Logo & Restaurant Switcher */}
          <div className="lf-brand-block">
            <div className="lf-brand-emblem">
              <Crown size={20} strokeWidth={2.5} />
            </div>
            <div>
              <div className="lf-brand-title">LoyaltyForge</div>
              <div className="lf-brand-subtitle">Automated Retention Engine</div>
            </div>

            {/* Restaurant Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '12px' }}>
              <div style={{ position: 'relative' }}>
                <select
                  value={activeRestaurantId}
                  onChange={(e) => switchRestaurant(e.target.value)}
                  className="lf-select"
                  style={{
                    padding: '8px 32px 8px 12px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    borderRadius: '8px',
                    backgroundColor: 'rgba(28, 23, 20, 0.9)',
                    borderColor: 'rgba(212, 175, 55, 0.25)',
                    color: '#FDFBF7',
                    minWidth: '180px',
                    appearance: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {restaurants.map((r) => (
                    <option key={r.id} value={r.id} style={{ background: '#1A1412', color: '#FDFBF7' }}>
                      {r.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '10px', pointerEvents: 'none', color: '#D4AF37' }} />
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="lf-btn lf-btn-secondary"
                style={{ padding: '8px 10px', borderRadius: '8px' }}
                title="Add New Restaurant"
              >
                <Plus size={14} style={{ color: '#D4AF37' }} />
              </button>
            </div>
          </div>

          {/* Navigation Segmented Bar */}
          <nav className="lf-nav-bar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`lf-nav-btn ${isActive ? 'active' : ''}`}
                >
                  <Icon size={15} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={onOpenHelp}
              className="lf-btn lf-btn-secondary"
              style={{ padding: '7px 14px', fontSize: '12px' }}
            >
              <HelpCircle size={14} style={{ color: '#D4AF37' }} />
              <span>SOP Guide</span>
            </button>

            <button
              type="button"
              onClick={resetToDefaultData}
              className="lf-btn lf-btn-ghost"
              style={{ padding: '7px 10px' }}
              title="Reset Demo Data"
            >
              <RotateCcw size={14} />
            </button>
          </div>

        </div>
      </header>

      {/* Add Restaurant Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)'
        }}>
          <div className="lf-card" style={{ maxWidth: '440px', width: '100%', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '14px', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '17px', color: '#FDFBF7' }}>Onboard New Restaurant</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="lf-btn-ghost"
                style={{ cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddRestaurant} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="lf-form-group">
                <label className="lf-label">Restaurant Name</label>
                <input
                  type="text"
                  required
                  value={newRestName}
                  onChange={(e) => setNewRestName(e.target.value)}
                  placeholder="e.g. Copper Chimney Fine Dining"
                  className="lf-input"
                />
              </div>

              <div className="lf-form-group">
                <label className="lf-label">Cuisine & Tagline</label>
                <input
                  type="text"
                  value={newRestTagline}
                  onChange={(e) => setNewRestTagline(e.target.value)}
                  placeholder="e.g. Heritage Awadhi & Tandoor"
                  className="lf-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="lf-btn lf-btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="lf-btn lf-btn-gold">
                  Create Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function HelpGuideModal({ onClose }) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(10px)'
    }}>
      <div className="lf-card" style={{ maxWidth: '640px', width: '100%', maxHeight: '85vh', overflowY: 'auto', padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={20} style={{ color: '#D4AF37' }} />
            <h3 style={{ fontSize: '18px', color: '#FDFBF7' }}>Digital Loyalty Platform Operating Manual</h3>
          </div>
          <button type="button" onClick={onClose} className="lf-btn-ghost" style={{ cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: '#D4CDC3', fontSize: '13px', lineHeight: '1.6' }}>
          <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(212, 175, 55, 0.08)', border: '1px solid rgba(212, 175, 55, 0.25)', color: '#F3E5AB' }}>
            👑 <b>No App Required For Guests</b>: Works in any mobile browser. All customer visits, stamps, spend, and points are securely linked to their 10-digit mobile number.
          </div>

          <div>
            <h4 style={{ color: '#FDFBF7', fontSize: '14px', marginBottom: '8px' }}>End-to-End System Journey:</h4>
            <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><b>1. Card Studio</b>: Choose luxury warm themes, customize stamp count (5, 8, 10), and view pixel-perfect Apple & Google Wallet simulators with 3D flip.</li>
              <li><b>2. Standee Generator</b>: Download ready-to-print A5/A6 acrylic standees with high-resolution vector QR codes for dining tables.</li>
              <li><b>3. Guest Check-In</b>: Guest scans table QR with camera, enters mobile number once, and pass loads instantly.</li>
              <li><b>4. Cashier Stamping</b>: Cashier looks up phone number or scans pass, then clicks <code>+1 Stamp</code> or enters bill amount.</li>
              <li><b>5. Reward Unlocked</b>: Upon 5th visit, a ₹100 reward voucher unlocks automatically for the cashier to redeem.</li>
              <li><b>6. Retention CRM</b>: Dispatch 1-click personalized WhatsApp invitations to inactive guests and 1-stamp-away customers.</li>
            </ol>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button type="button" onClick={onClose} className="lf-btn lf-btn-gold">
            Return to Studio
          </button>
        </div>
      </div>
    </div>
  );
}

function GuestCustomerPassLayout() {
  const { activeRestaurant, setIsGuestMode } = useLoyalty();

  return (
    <div className="lf-app" style={{ background: '#0D0A08', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Clean Guest Header with Restaurant Branding Only */}
      <header style={{
        padding: '14px 20px',
        background: 'rgba(18, 14, 12, 0.95)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(16px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {activeRestaurant.logoUrl ? (
            <img
              src={activeRestaurant.logoUrl}
              alt="logo"
              style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid rgba(212, 175, 55, 0.4)' }}
            />
          ) : (
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--gold-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1A1409', fontWeight: 900, fontSize: '14px' }}>
              {activeRestaurant.name?.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#FDFBF7', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              {activeRestaurant.name}
            </div>
            <div style={{ fontSize: '10.5px', color: '#D4AF37', fontWeight: 600 }}>
              Digital VIP Loyalty Pass
            </div>
          </div>
        </div>

        {/* Discreet Owner / Admin link */}
        <button
          type="button"
          onClick={() => setIsGuestMode(false)}
          className="lf-btn-ghost"
          style={{ fontSize: '11px', opacity: 0.6, color: '#8E8478', cursor: 'pointer', padding: '6px 10px' }}
          title="Open LoyaltyForge Admin Suite"
        >
          Staff / Admin
        </button>
      </header>

      {/* Main Customer Pass Content */}
      <main style={{ flex: 1, padding: '20px 16px', maxWidth: '460px', margin: '0 auto', width: '100%' }}>
        <CustomerMobilePass />
      </main>

      <footer style={{
        padding: '16px',
        textAlign: 'center',
        color: '#6E655B',
        fontSize: '11px',
        fontFamily: 'var(--font-mono)'
      }}>
        Powered by {activeRestaurant.name} • No App Needed
      </footer>
    </div>
  );
}

function MainApp() {
  const { activeTab, isGuestMode } = useLoyalty();
  const [showHelp, setShowHelp] = useState(false);

  if (isGuestMode) {
    return <GuestCustomerPassLayout />;
  }

  return (
    <div className="lf-app">
      <NavigationHeader onOpenHelp={() => setShowHelp(true)} />

      <main className="lf-container">
        {activeTab === 'studio' && (
          <div className="lf-studio-grid">
            <div>
              <CardConfigForm />
            </div>
            <div className="lf-sticky-workstation">
              <LivePreviewContainer />
            </div>
          </div>
        )}

        {activeTab === 'standee' && <StandeeGenerator />}
        {activeTab === 'customer-pass' && <CustomerMobilePass />}
        {activeTab === 'cashier' && <CashierScanner />}
        {activeTab === 'crm' && <CustomerTable />}
      </main>

      {showHelp && <HelpGuideModal onClose={() => setShowHelp(false)} />}

      <footer style={{
        padding: '24px',
        textAlign: 'center',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        color: '#6E655B',
        fontSize: '11.5px',
        fontFamily: 'var(--font-mono)'
      }}>
        LoyaltyForge Digital Hospitality Suite • WAT Architecture • Drive F Storage
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <LoyaltyProvider>
        <MainApp />
      </LoyaltyProvider>
    </ErrorBoundary>
  );
}
