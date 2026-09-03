import React, { useState } from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import AnalyticsCards from './AnalyticsCards';
import WhatsAppCampaignModal from './WhatsAppCampaignModal';
import { 
  Users, 
  Search, 
  MessageSquare, 
  Sparkles, 
  Crown, 
  Clock, 
  Filter, 
  Gift, 
  Check, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';

export default function CustomerTable() {
  const { customers, activeRestaurant, switchCustomer } = useLoyalty();
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'one_away' | 'vip' | 'inactive'
  const [searchTerm, setSearchTerm] = useState('');
  const [activeModalCustomer, setActiveModalCustomer] = useState(null);

  const totalStamps = activeRestaurant?.program?.totalStamps || 5;

  // Strict Tenant Scoping: Ensure customers only belong to the active restaurant
  const restaurantCustomers = customers.filter(c => !c.restaurantId || c.restaurantId === activeRestaurant?.id);

  // Search & Filter Logic
  const filteredCustomers = restaurantCustomers.filter((c) => {
    // Search matching
    const matchesSearch = 
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.phone?.includes(searchTerm);
    if (!matchesSearch) return false;

    const visits = c.visits || 0;
    const stampsInCycle = visits % totalStamps;
    const isOneAway = stampsInCycle === totalStamps - 1;

    if (filterTab === 'one_away') return isOneAway;
    if (filterTab === 'vip') return c.isVip || (c.totalSpend || 0) >= (activeRestaurant?.program?.vipSpendThreshold || 3000);
    if (filterTab === 'inactive') {
      if (!c.lastVisit) return false;
      const daysSince = (new Date() - new Date(c.lastVisit)) / (1000 * 60 * 60 * 24);
      return daysSince >= 30;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      
      {/* Top Header */}
      <div className="lf-card">
        <div className="lf-card-header" style={{ flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="lf-badge lf-badge-gold">Retention CRM</span>
              <span className="lf-badge lf-badge-emerald">WhatsApp Automation Hub</span>
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#FDFBF7' }}>
              Customer Loyalty & Retention Marketing Engine
            </h1>
            <p style={{ fontSize: '12px', color: '#8E8478', marginTop: '2px' }}>
              Track guest visit habits, lifetime spend, and trigger automated WhatsApp retention campaigns.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: '#8E8478' }}>Active Restaurant:</span>
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#D4AF37' }}>{activeRestaurant.name}</span>
          </div>
        </div>
      </div>

      {/* Analytics KPI Row */}
      <AnalyticsCards customers={customers} restaurant={activeRestaurant} />

      {/* Customer Database Card */}
      <div className="lf-card">
        
        {/* Table Filter Controls */}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          
          {/* Segment Tabs */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.5)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', overflowX: 'auto' }}>
            {[
              { id: 'all', label: 'All Guests', count: customers.length },
              { id: 'one_away', label: '🎯 1 Stamp Away', count: customers.filter(c => (c.visits % totalStamps) === totalStamps - 1).length },
              { id: 'vip', label: '👑 VIP Spenders', count: customers.filter(c => c.isVip || (c.totalSpend || 0) >= 3000).length },
              { id: 'inactive', label: '💤 Inactive >30d', count: customers.filter(c => c.lastVisit && (new Date() - new Date(c.lastVisit)) / (1000 * 60 * 60 * 24) >= 30).length }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterTab(tab.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  background: filterTab === tab.id ? 'var(--gold-gradient)' : 'transparent',
                  color: filterTab === tab.id ? '#171108' : '#8E8478',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab.label} <span style={{ opacity: 0.7, fontSize: '10.5px' }}>({tab.count})</span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search phone or guest name..."
              className="lf-input lf-input-mono"
              style={{ paddingLeft: '32px', fontSize: '12px' }}
            />
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '12px', color: '#8E8478' }} />
          </div>

        </div>

        {/* Table Body */}
        <div className="lf-table-container">
          <table className="lf-table">
            <thead>
              <tr>
                <th>Guest Profile</th>
                <th>Mobile Number</th>
                <th>Visits & Stamps</th>
                <th>Lifetime Spend</th>
                <th>Points</th>
                <th>Vouchers</th>
                <th>Last Seen</th>
                <th style={{ textAlign: 'right' }}>WhatsApp Outreach</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((c) => {
                  const visits = c.visits || 0;
                  const stampsInCycle = visits % totalStamps;
                  const isOneAway = stampsInCycle === totalStamps - 1;

                  return (
                    <tr key={c.phone}>
                      
                      {/* Name & Avatar */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.15)', border: '1px solid rgba(212, 175, 55, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px', color: '#F3E5AB' }}>
                            {c.name?.slice(0, 1) || 'G'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#FDFBF7', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>{c.name}</span>
                              {c.isVip && (
                                <span className="lf-badge lf-badge-gold" style={{ fontSize: '8.5px', padding: '2px 6px' }}>VIP</span>
                              )}
                            </div>
                            <span style={{ fontSize: '10.5px', color: '#8E8478' }}>Regular Diner</span>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12.5px', color: '#D4CDC3' }}>
                          +91 {c.phone}
                        </span>
                      </td>

                      {/* Visits & Stamps */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#FDFBF7' }}>
                            {visits} visits
                          </span>
                          <span className={isOneAway ? 'lf-badge lf-badge-gold' : 'lf-badge'} style={{ fontSize: '9.5px', padding: '2px 6px' }}>
                            {stampsInCycle}/{totalStamps} stamps
                          </span>
                        </div>
                      </td>

                      {/* Spend */}
                      <td>
                        <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#D4AF37' }}>
                          ₹{(c.totalSpend || 0).toLocaleString()}
                        </span>
                      </td>

                      {/* Points */}
                      <td>
                        <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#34D399' }}>
                          {c.loyaltyPoints || 0} pts
                        </span>
                      </td>

                      {/* Vouchers */}
                      <td>
                        {c.vouchers && c.vouchers.filter(v => v.status === 'unredeemed').length > 0 ? (
                          <span className="lf-badge lf-badge-emerald" style={{ fontSize: '10px' }}>
                            {c.vouchers.filter(v => v.status === 'unredeemed').length} Active
                          </span>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#5C544B' }}>—</span>
                        )}
                      </td>

                      {/* Last Visit */}
                      <td>
                        <span style={{ fontSize: '11.5px', color: '#8E8478', fontFamily: 'var(--font-mono)' }}>
                          {c.lastVisit || 'Today'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => setActiveModalCustomer(c)}
                          className="lf-btn lf-btn-emerald"
                          style={{ padding: '6px 12px', fontSize: '11.5px' }}
                        >
                          <MessageSquare size={13} />
                          <span>WhatsApp</span>
                        </button>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" style={{ padding: '36px', textAlign: 'center', color: '#8E8478' }}>
                    No customer records matching selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* WhatsApp Modal Trigger */}
      {activeModalCustomer && (
        <WhatsAppCampaignModal
          customer={activeModalCustomer}
          restaurant={activeRestaurant}
          onClose={() => setActiveModalCustomer(null)}
        />
      )}

    </div>
  );
}
