import React, { useState } from 'react';
import { 
  X, 
  MessageSquare, 
  Send, 
  Sparkles, 
  Check, 
  Phone, 
  Award, 
  Coffee, 
  Star,
  ExternalLink
} from 'lucide-react';

export default function WhatsAppCampaignModal({ customer, restaurant, onClose }) {
  const [template, setTemplate] = useState('one_away');
  const [customDiscount, setCustomDiscount] = useState('15%');

  const templates = [
    {
      id: 'one_away',
      title: '🎯 1 Stamp Away Reminder',
      desc: 'Nudge guests who need only 1 more stamp to unlock ₹100 reward.',
      getMessage: () => 
        `Hey ${customer.name || 'Foodie'}! ☕ You're only *1 stamp away* from unlocking your *${restaurant.program?.rewardTitle || '₹100 Discount'}* at *${restaurant.name}*!\n\nShow your digital pass on your next visit to claim it: ${window.location.origin}/pass/${restaurant.id}\n\nSee you soon!`
    },
    {
      id: 'inactive_winback',
      title: '🎁 Inactive Win-Back Special',
      desc: 'Invite guests who haven\'t visited in >30 days with a special incentive.',
      getMessage: () => 
        `Hi ${customer.name || 'Friend'}! We've missed you at *${restaurant.name}*! ❤️\n\nCome back this week and get a *Free Dessert* with your meal. Just show your mobile pass: ${window.location.origin}/pass/${restaurant.id}\n\nReserve your table: ${restaurant.links?.phone || ''}`
    },
    {
      id: 'google_review',
      title: '⭐ 5-Star Google Review Booster',
      desc: 'Ask happy regular guests to leave a 5-star Google review.',
      getMessage: () => 
        `Dear ${customer.name || 'Guest'}, thank you for being our regular guest at *${restaurant.name}*! ⭐\n\nCould you take 30 seconds to rate us on Google? It helps our small team immensely:\n${restaurant.links?.googleReviewUrl || 'https://maps.google.com'}\n\nShow this message on your next visit for 50 bonus loyalty points!`
    },
    {
      id: 'weekend_vip',
      title: '👑 Weekend VIP Gold Pass',
      desc: 'Exclusive discount invitation for top spenders.',
      getMessage: () => 
        `Exclusive VIP Invitation for ${customer.name || 'VIP Guest'}! 👑\n\nEnjoy an extra *${customDiscount} VIP Discount* this weekend at *${restaurant.name}*.\n\nYour active loyalty points balance: *${customer.loyaltyPoints || 0} pts*.\nPass link: ${window.location.origin}/pass/${restaurant.id}`
    }
  ];

  const selectedTemplate = templates.find(t => t.id === template) || templates[0];
  const messageBody = selectedTemplate.getMessage();

  const handleLaunchWhatsApp = () => {
    const rawPhone = customer.phone?.replace(/[^0-9]/g, '') || '';
    const phoneWithCountry = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const url = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(messageBody)}`;
    window.open(url, '_blank');
  };

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
      <div className="lf-card animate-fade-in" style={{ maxWidth: '620px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)' }}>
              <MessageSquare size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#FDFBF7' }}>1-Click WhatsApp Retention Campaign</h3>
              <p style={{ fontSize: '11px', color: '#8E8478' }}>
                Recipient: <b style={{ color: '#F3E5AB' }}>{customer.name}</b> (+91 {customer.phone})
              </p>
            </div>
          </div>

          <button type="button" onClick={onClose} className="lf-btn-ghost" style={{ cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* Campaign Type Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div>
            <label className="lf-label" style={{ marginBottom: '8px', display: 'block' }}>Choose Marketing Message Goal</label>
            <div className="lf-grid-2">
              {templates.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={`lf-preset-card ${template === t.id ? 'active' : ''}`}
                  style={{ padding: '12px' }}
                >
                  <div>
                    <div className="lf-preset-title" style={{ fontSize: '12px' }}>{t.title}</div>
                    <div className="lf-preset-desc" style={{ fontSize: '10px' }}>{t.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Message Preview Box */}
          <div className="lf-form-group">
            <label className="lf-label">Formatted WhatsApp Message Body</label>
            <div
              style={{
                padding: '14px',
                borderRadius: '12px',
                background: '#0B141A',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#E9EDEF',
                fontFamily: 'var(--font-sans)',
                fontSize: '12.5px',
                lineHeight: 1.55,
                whiteSpace: 'pre-wrap',
                boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.5)'
              }}
            >
              {messageBody}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              type="button"
              onClick={onClose}
              className="lf-btn lf-btn-secondary"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleLaunchWhatsApp}
              className="lf-btn lf-btn-emerald"
              style={{ padding: '10px 20px', fontSize: '13.5px' }}
            >
              <Send size={15} />
              <span>Launch WhatsApp Chat</span>
              <ExternalLink size={13} style={{ opacity: 0.7 }} />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
