import React, { useState } from 'react';
import { LoyaltyProvider, useLoyalty } from './context/LoyaltyContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import CardConfigForm from './components/studio/CardConfigForm';
import LivePreviewContainer from './components/studio/LivePreviewContainer';
import StandeeGenerator from './components/qr-standee/StandeeGenerator';
import CustomerMobilePass from './components/customer-pass/CustomerMobilePass';
import CashierScanner from './components/cashier/CashierScanner';
import CustomerTable from './components/marketing-crm/CustomerTable';
import SuperAdminDashboard from './components/super-admin/SuperAdminDashboard';
import MerchantLoginModal from './components/auth/MerchantLoginModal';
import ShopPortalHeader from './components/portal/ShopPortalHeader';
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
  ChevronDown,
  KeyRound,
  Lock,
  ShieldCheck
} from 'lucide-react';

function NavigationHeader({ onOpenHelp }) {
  const { 
    restaurants, 
    activeRestaurantId, 
    switchRestaurant, 
    addNewRestaurant, 
    activeTab, 
    setActiveTab,
    resetToDefaultData,
    setRouteMode 
  } = useLoyalty();

  const [showAddModal, setShowAddModal] = useState(false);

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
              onClick={() => setRouteMode('login')}
              className="lf-btn lf-btn-secondary"
              style={{ padding: '7px 11px', fontSize: '12px', gap: '5px' }}
              title="Cashier / Merchant Terminal Login"
            >
              <Lock size={13} style={{ color: '#D4AF37' }} />
              <span>Merchant Login</span>
            </button>

            <button
              type="button"
              onClick={() => setRouteMode('super-admin')}
              className="lf-btn lf-btn-secondary"
              style={{ padding: '7px 11px', fontSize: '12px', gap: '5px' }}
              title="Platform Super-Admin Panel"
            >
              <Crown size={13} style={{ color: '#F59E0B' }} />
              <span>Super-Admin</span>
            </button>

            <button
              type="button"
              onClick={onOpenHelp}
              className="lf-btn lf-btn-secondary"
              style={{ padding: '7px 12px', fontSize: '12px' }}
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

      {/* Unified Add Restaurant / Merchant Registration Modal */}
      {showAddModal && (
        <MerchantLoginModal
          defaultAuthMode="register"
          onClose={() => setShowAddModal(false)}
        />
      )}
    </>
  );
}

function HelpGuideModal({ onClose }) {
  const sopSteps = [
    {
      title: "Card Studio (Design & Program Setup)",
      desc: "Customize store branding, choose luxury color themes, set reward milestones (e.g., 5 stamps = ₹100 flat discount), and link Google Review / Instagram pages."
    },
    {
      title: "Table & Counter Standees (Print & Deploy)",
      desc: "Download high-resolution 300 DPI vector PDF/PNG standees formatted for A5/A6 acrylic table tents. Place them on all dining tables and billing counters."
    },
    {
      title: "Guest Self-Check-in (Zero-Friction Scan)",
      desc: "Customers point their smartphone camera at the table QR code. Entering their 10-digit mobile number once instantly loads their digital VIP loyalty pass without downloading any app."
    },
    {
      title: "Cashier Counter Stamping (3-Second Flow)",
      desc: "During billing, the cashier enters the guest's mobile number on the Live POS Terminal and taps '+1 Stamp Only' (or enters the bill amount for automatic point calculation)."
    },
    {
      title: "Milestone Reward Unlocking & Redemption",
      desc: "When milestone visits are reached (e.g., 5th visit), a unique reward voucher code automatically unlocks on the customer's phone pass. The cashier clicks 'Redeem' to apply the discount."
    },
    {
      title: "Automated WhatsApp Retention CRM",
      desc: "Access the Retention Hub to view VIP diners, visit histories, and dispatch 1-click pre-formatted personalized WhatsApp invitations to guests who are 1 stamp away from a reward."
    }
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(10px)'
    }}>
      <div className="lf-card" style={{ maxWidth: '680px', width: '100%', maxHeight: '88vh', overflowY: 'auto', padding: '24px 26px' }}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '14px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={20} style={{ color: '#D4AF37' }} />
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#FDFBF7', margin: 0 }}>Standard Operating Procedure (SOP) Manual</h3>
              <span style={{ fontSize: '11px', color: '#8E8478' }}>End-to-End System Operational Playbook</span>
            </div>
          </div>
          <button type="button" onClick={onClose} className="lf-btn-ghost" style={{ cursor: 'pointer', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: '#D4CDC3', fontSize: '13px', lineHeight: '1.55' }}>
          
          {/* Core Principle Banner */}
          <div style={{ padding: '12px 14px', borderRadius: '12px', background: 'rgba(212, 175, 55, 0.08)', border: '1px solid rgba(212, 175, 55, 0.25)', color: '#F3E5AB', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <Crown size={16} style={{ color: '#D4AF37', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: '#FAF7F2' }}>Core Principle — 100% Zero Friction</strong>: Guests never install an app or remember passwords. All stamps, points, and rewards permanently sync to their 10-digit mobile number across any device.
            </div>
          </div>

          {/* Operational Workflow Steps */}
          <div>
            <h4 style={{ color: '#D4AF37', fontSize: '13.5px', fontWeight: 700, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              6-Step Operational Lifecycle:
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {sopSteps.map((step, idx) => (
                <div 
                  key={idx} 
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)'
                  }}
                >
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'rgba(212, 175, 55, 0.15)',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
                    color: '#F3E5AB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    flexShrink: 0,
                    marginTop: '1px'
                  }}>
                    {idx + 1}
                  </div>
                  <div>
                    <strong style={{ color: '#FDFBF7', fontSize: '12.5px', display: 'block', marginBottom: '2px' }}>
                      {step.title}
                    </strong>
                    <span style={{ fontSize: '12px', color: '#B8AEA2', lineHeight: '1.45' }}>
                      {step.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Access Credentials & Portals Quick Reference */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', marginTop: '4px' }}>
            <div style={{ padding: '10px 12px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#F3E5AB', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Lock size={12} style={{ color: '#D4AF37' }} />
                <span>Store Owner & Cashier Login</span>
              </div>
              <p style={{ fontSize: '11px', color: '#8E8478', margin: 0 }}>
                Click <b>Merchant Login</b> or <b>Staff Portal</b>. Enter registered owner mobile number + 4-digit PIN to access store-isolated POS stamping terminal.
              </p>
            </div>

            <div style={{ padding: '10px 12px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#F3E5AB', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Crown size={12} style={{ color: '#F59E0B' }} />
                <span>Super-Admin Master Access</span>
              </div>
              <p style={{ fontSize: '11px', color: '#8E8478', margin: 0 }}>
                Master Control Mode is protected by passphrase (default: <code style={{ color: '#F59E0B', background: 'rgba(245,158,11,0.1)', padding: '1px 4px', borderRadius: '4px' }}>admin2026</code>) to manage all restaurant clients, reset PINs, and onboard shops.
              </p>
            </div>
          </div>

        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '18px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button type="button" onClick={onClose} className="lf-btn lf-btn-gold" style={{ padding: '8px 20px', fontSize: '12.5px' }}>
            Got it • Return to Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}

function GuestCustomerPassLayout() {
  const { activeRestaurant } = useLoyalty();
  const [showStaffModal, setShowStaffModal] = useState(false);

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
          {activeRestaurant?.logoUrl ? (
            <img
              src={activeRestaurant.logoUrl}
              alt="logo"
              style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid rgba(212, 175, 55, 0.4)' }}
            />
          ) : (
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--gold-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1A1409', fontWeight: 900, fontSize: '14px' }}>
              {(activeRestaurant?.name || 'VIP').slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#FDFBF7', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              {activeRestaurant?.name || 'Loyalty Club'}
            </div>
            <div style={{ fontSize: '10.5px', color: '#D4AF37', fontWeight: 600 }}>
              Digital VIP Loyalty Pass
            </div>
          </div>
        </div>

        {/* Staff / Admin Portal Trigger */}
        <button
          type="button"
          onClick={() => setShowStaffModal(true)}
          className="lf-btn-ghost"
          style={{ fontSize: '11px', color: '#D4AF37', cursor: 'pointer', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '5px', borderRadius: '8px', background: 'rgba(212, 175, 55, 0.08)', border: '1px solid rgba(212, 175, 55, 0.25)' }}
          title="Open Staff & Owner Portal"
        >
          <Lock size={12} />
          <span>Staff / Owner</span>
        </button>
      </header>

      {/* Main Customer Pass Content */}
      <main style={{ flex: 1, padding: '20px 16px', maxWidth: '460px', margin: '0 auto', width: '100%' }}>
        <CustomerMobilePass />
      </main>

      {/* Staff & Owner Modal Triggered from Header */}
      {showStaffModal && (
        <MerchantLoginModal
          prefilledRestaurant={activeRestaurant}
          onClose={() => setShowStaffModal(false)}
          onContinueAsGuest={() => setShowStaffModal(false)}
        />
      )}

      <footer style={{
        padding: '16px',
        textAlign: 'center',
        color: '#6E655B',
        fontSize: '11px',
        fontFamily: 'var(--font-mono)'
      }}>
        Powered by {activeRestaurant?.name || 'Restaurant'} • No App Needed
      </footer>
    </div>
  );
}

function MainApp() {
  const { 
    activeTab, 
    isGuestMode, 
    routeMode, 
    setRouteMode, 
    merchantSession 
  } = useLoyalty();
  const [showHelp, setShowHelp] = useState(false);

  // 1. Super-Admin Master Control Center
  if (routeMode === 'super-admin') {
    return (
      <div className="lf-app">
        <header className="lf-header" style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.25)', background: '#14100E' }}>
          <div className="lf-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="lf-brand-emblem">
                <Crown size={20} strokeWidth={2.5} />
              </div>
              <div>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#FDFBF7' }}>LoyaltyForge Platform Master</span>
                <span style={{ fontSize: '11px', color: '#D4AF37', display: 'block' }}>Super-Admin Mode</span>
              </div>
            </div>
            <button
              onClick={() => setRouteMode('demo')}
              className="lf-btn lf-btn-secondary"
              style={{ fontSize: '12px', padding: '6px 14px' }}
            >
              Exit to Studio Preview
            </button>
          </div>
        </header>
        <main>
          <SuperAdminDashboard />
        </main>
      </div>
    );
  }

  // 2. Merchant / Cashier Standalone Login (/login)
  if (routeMode === 'login' && !merchantSession) {
    return (
      <div className="lf-app">
        <header className="lf-header" style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.25)', background: '#14100E' }}>
          <div className="lf-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="lf-brand-emblem">
                <Crown size={20} strokeWidth={2.5} />
              </div>
              <div>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#FDFBF7' }}>LoyaltyForge Partner Terminal</span>
                <span style={{ fontSize: '11px', color: '#D4AF37', display: 'block' }}>Merchant Login</span>
              </div>
            </div>
            <button
              onClick={() => setRouteMode('demo')}
              className="lf-btn lf-btn-secondary"
              style={{ fontSize: '12px', padding: '6px 14px' }}
            >
              Return to Studio
            </button>
          </div>
        </header>
        <main style={{ padding: '24px 16px' }}>
          <MerchantLoginModal isStandalonePage={true} onClose={() => setRouteMode('merchant')} />
        </main>
      </div>
    );
  }

  // 3. Guest Customer Mobile Pass
  if (isGuestMode || routeMode === 'guest') {
    return <GuestCustomerPassLayout />;
  }

  // 4. Logged-in Merchant Isolated Portal (No Restaurant Switcher!)
  if (merchantSession || routeMode === 'merchant') {
    return (
      <div className="lf-app">
        <ShopPortalHeader />

        <main className="lf-container">
          {activeTab === 'cashier' && <CashierScanner />}
          {activeTab === 'crm' && <CustomerTable />}
          {activeTab === 'standee' && <StandeeGenerator />}
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
          {activeTab === 'customer-pass' && <CustomerMobilePass />}
        </main>

        <footer style={{
          padding: '24px',
          textAlign: 'center',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          color: '#6E655B',
          fontSize: '11.5px',
          fontFamily: 'var(--font-mono)'
        }}>
          {merchantSession?.restaurantName || 'Store'} Cashier Terminal • Isolated Merchant Session • LoyaltyForge
        </footer>
      </div>
    );
  }

  // 5. Default General Preview / Studio Mode
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
