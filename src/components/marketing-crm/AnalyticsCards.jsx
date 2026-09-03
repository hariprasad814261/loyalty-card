import React from 'react';
import { Users, TrendingUp, DollarSign, Award, Sparkles } from 'lucide-react';

export default function AnalyticsCards({ customers = [], restaurant = {} }) {
  const totalCustomers = customers.length;
  const totalVisits = customers.reduce((sum, c) => sum + (c.visits || 0), 0);
  const totalSpend = customers.reduce((sum, c) => sum + (c.totalSpend || 0), 0);
  const vipCount = customers.filter(c => c.isVip).length;

  const repeatCustomers = customers.filter(c => (c.visits || 0) > 1).length;
  const repeatRate = totalCustomers > 0 ? Math.round((repeatCustomers / totalCustomers) * 100) : 0;

  const stats = [
    {
      id: 'guests',
      label: 'Enrolled Guests',
      value: totalCustomers.toLocaleString(),
      subtext: '+12% this week',
      icon: Users,
      badgeColor: 'lf-badge-gold'
    },
    {
      id: 'visits',
      label: 'Visits Generated',
      value: totalVisits.toLocaleString(),
      subtext: `${repeatRate}% repeat guest rate`,
      icon: TrendingUp,
      badgeColor: 'lf-badge-emerald'
    },
    {
      id: 'revenue',
      label: 'Tracked Revenue',
      value: `₹${totalSpend.toLocaleString()}`,
      subtext: 'Across loyalty tickets',
      icon: DollarSign,
      badgeColor: 'lf-badge-gold'
    },
    {
      id: 'vips',
      label: 'VIP Gold Members',
      value: vipCount.toString(),
      subtext: 'High spenders (>₹3,000)',
      icon: Award,
      badgeColor: 'lf-badge-copper'
    }
  ];

  return (
    <div className="lf-grid-4">
      {stats.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.id} className="lf-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: '#8E8478', letterSpacing: '0.04em' }}>
                {item.label}
              </span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(212, 175, 55, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37' }}>
                <Icon size={16} />
              </div>
            </div>

            <div style={{ fontSize: '24px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#FDFBF7', letterSpacing: '-0.02em' }}>
              {item.value}
            </div>

            <div style={{ fontSize: '11px', color: '#D4CDC3', marginTop: '4px', opacity: 0.8 }}>
              {item.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
}
