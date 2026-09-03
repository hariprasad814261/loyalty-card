import React from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import { 
  Lock, 
  QrCode, 
  ScanLine, 
  Users, 
  Sparkles, 
  LogOut, 
  ExternalLink 
} from 'lucide-react';

export function ShopPortalHeader() {
  const { 
    activeRestaurant, 
    activeTab, 
    setActiveTab, 
    merchantSession, 
    merchantLogout 
  } = useLoyalty();

  const handleOpenCustomerPass = () => {
    const url = `/?pass=${activeRestaurant?.id || ''}`;
    window.open(url, '_blank');
  };

  return (
    <header className="lf-header animate-fade-in" style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.25)', background: '#14100E' }}>
      <div className="lf-container">
        <div className="lf-header-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          
          {/* Shop Identity (Strictly Isolated - No Dropdown) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {activeRestaurant?.logoUrl ? (
              <img
                src={activeRestaurant.logoUrl}
                alt="logo"
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  objectFit: 'cover',
                  border: '1.5px solid rgba(212, 175, 55, 0.4)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                }}
              />
            ) : (
              <div 
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'var(--gold-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#1A1409',
                  fontWeight: 900,
                  fontSize: '16px'
                }}
              >
                {(activeRestaurant?.name || 'S').slice(0, 2).toUpperCase()}
              </div>
            )}

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '17px', fontWeight: 800, color: '#FDFBF7', margin: 0 }}>
                  {activeRestaurant?.name || 'Merchant Dashboard'}
                </h1>
                <span 
                  style={{
                    padding: '2px 8px',
                    borderRadius: '100px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#34D399',
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}
                >
                  Verified Store
                </span>
              </div>
              <p style={{ fontSize: '11.5px', color: '#8E8478', margin: 0 }}>
                Owner: <span style={{ color: '#D4CDC3', fontWeight: 600 }}>{merchantSession?.ownerName || activeRestaurant?.owner?.name || 'Store Manager'}</span>
                {merchantSession?.ownerPhone && ` (+91 ${merchantSession.ownerPhone})`}
              </p>
            </div>
          </div>

          {/* Dedicated Tab Navigation */}
          <nav className="lf-nav-bar" style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setActiveTab('cashier')}
              className={`lf-nav-btn ${activeTab === 'cashier' ? 'active' : ''}`}
            >
              <ScanLine size={15} />
              <span>Cashier Terminal</span>
            </button>

            <button
              onClick={() => setActiveTab('crm')}
              className={`lf-nav-btn ${activeTab === 'crm' ? 'active' : ''}`}
            >
              <Users size={15} />
              <span>Customer CRM</span>
            </button>

            <button
              onClick={() => setActiveTab('standee')}
              className={`lf-nav-btn ${activeTab === 'standee' ? 'active' : ''}`}
            >
              <QrCode size={15} />
              <span>QR Standee Kit</span>
            </button>

            <button
              onClick={() => setActiveTab('studio')}
              className={`lf-nav-btn ${activeTab === 'studio' ? 'active' : ''}`}
            >
              <Sparkles size={15} />
              <span>Card Studio</span>
            </button>
          </nav>

          {/* Quick Actions: Preview Customer Pass & Lock Terminal */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handleOpenCustomerPass}
              className="lf-btn lf-btn-secondary"
              style={{ padding: '8px 12px', fontSize: '12px', gap: '6px' }}
              title="Test Customer Table Pass"
            >
              <ExternalLink size={13} style={{ color: '#D4AF37' }} />
              <span>View Table Pass</span>
            </button>

            <button
              type="button"
              onClick={merchantLogout}
              className="lf-btn lf-btn-secondary"
              style={{
                padding: '8px 12px',
                fontSize: '12px',
                gap: '6px',
                borderColor: 'rgba(239, 68, 68, 0.3)',
                color: '#F87171'
              }}
              title="Lock Cashier Terminal"
            >
              <Lock size={13} />
              <span>Lock Terminal</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
export default ShopPortalHeader;
