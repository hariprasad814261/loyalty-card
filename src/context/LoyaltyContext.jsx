import React, { createContext, useContext, useState, useEffect } from 'react';
import initialRestaurants from '../../data/restaurants.json';
import initialCustomers from '../../data/customers.json';
import { DEFAULT_RESTAURANT } from '../utils/presetTemplates';

const LoyaltyContext = createContext();

export function LoyaltyProvider({ children }) {
  // Load restaurants with localStorage fallback
  const [restaurants, setRestaurants] = useState(() => {
    const saved = localStorage.getItem('loyalty_restaurants');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return initialRestaurants || [DEFAULT_RESTAURANT];
  });

  // Parse URL on initial load for QR code scanning from mobile phones
  const getInitialRouteState = () => {
    try {
      const pathname = window.location.pathname || '';
      const searchParams = new URLSearchParams(window.location.search || '');
      const hash = window.location.hash || '';
      
      let restId = searchParams.get('pass') || searchParams.get('restaurant') || searchParams.get('resto') || searchParams.get('id');
      let tab = 'studio';
      let isGuest = false;

      if (pathname === '/pass' || pathname.startsWith('/pass/') || pathname.startsWith('/pass')) {
        const parts = pathname.replace(/^\/pass\/?/, '').split('/').filter(Boolean);
        if (parts[0]) restId = parts[0];
        tab = 'customer-pass';
        isGuest = true;
      } else if (searchParams.has('pass')) {
        tab = 'customer-pass';
        isGuest = true;
      } else if (hash.includes('pass')) {
        tab = 'customer-pass';
        const match = hash.match(/pass\/?([a-zA-Z0-9_-]+)?/);
        if (match && match[1]) restId = match[1];
        isGuest = true;
      }

      return { restId, tab, isGuest };
    } catch {
      return { restId: null, tab: 'studio', isGuest: false };
    }
  };

  const initialRoute = getInitialRouteState();

  const [isGuestMode, setIsGuestMode] = useState(initialRoute.isGuest);

  const [activeRestaurantId, setActiveRestaurantId] = useState(() => {
    if (initialRoute.restId && restaurants.some(r => r.id === initialRoute.restId)) {
      return initialRoute.restId;
    }
    return restaurants[0]?.id || 'rest_001';
  });

  // Load customers with localStorage fallback
  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('loyalty_customers');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return initialCustomers || [];
  });

  const [activeTab, setActiveTab] = useState(initialRoute.tab || 'studio'); // 'studio' | 'standee' | 'customer-pass' | 'cashier' | 'crm'
  const [activeCustomerPhone, setActiveCustomerPhone] = useState(() => {
    const savedGuestPhone = localStorage.getItem('guest_loyalty_phone');
    if (savedGuestPhone) return savedGuestPhone;
    return initialRoute.isGuest ? '' : '9876543210';
  });
  const [lastStampAnimationTimestamp, setLastStampAnimationTimestamp] = useState(null);

  const [serverIp, setServerIp] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return window.location.hostname;
    }
    return '';
  });

  // Real-time synchronization with server for cross-device updates (Laptop Cashier <-> Customer Phone)
  const syncWithServer = async () => {
    try {
      const res = await fetch('/api/loyalty/state');
      if (res.ok) {
        const data = await res.json();
        if (data?.serverIp && data.serverIp !== '127.0.0.1') {
          setServerIp(data.serverIp);
        }
        if (Array.isArray(data.customers)) {
          setCustomers(prev => {
            // Check if activeCustomer visits or stamps increased to trigger confetti on phone!
            const currentCust = prev.find(c => c.phone === activeCustomerPhone && c.restaurantId === activeRestaurantId);
            const serverCust = data.customers.find(c => c.phone === activeCustomerPhone && c.restaurantId === activeRestaurantId);
            if (serverCust && currentCust && serverCust.visits > currentCust.visits) {
              setLastStampAnimationTimestamp(Date.now());
            }
            return data.customers;
          });
        }
      }
    } catch (e) {
      // offline fallback
    }
  };

  useEffect(() => {
    syncWithServer();
    const interval = setInterval(syncWithServer, 1000);
    return () => clearInterval(interval);
  }, [activeCustomerPhone, activeRestaurantId]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('loyalty_restaurants', JSON.stringify(restaurants));
  }, [restaurants]);

  useEffect(() => {
    localStorage.setItem('loyalty_customers', JSON.stringify(customers));
  }, [customers]);

  const activeRestaurant = restaurants.find(r => r.id === activeRestaurantId) || restaurants[0] || DEFAULT_RESTAURANT;
  const activeCustomer = customers.find(c => c.phone === activeCustomerPhone && c.restaurantId === activeRestaurantId) || {
    phone: activeCustomerPhone,
    name: 'Guest Customer',
    restaurantId: activeRestaurantId,
    visits: 0,
    totalSpend: 0,
    loyaltyPoints: 0,
    vouchers: []
  };

  // Update active restaurant properties
  const updateActiveRestaurant = (patch) => {
    const updated = restaurants.map(r => {
      if (r.id === activeRestaurantId) {
        return {
          ...r,
          ...patch,
          theme: { ...r.theme, ...(patch.theme || {}) },
          program: { ...r.program, ...(patch.program || {}) },
          links: { ...r.links, ...(patch.links || {}) }
        };
      }
      return r;
    });
    setRestaurants(updated);
    fetch('/api/loyalty/restaurants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restaurants: updated })
    }).catch(() => {});
  };

  // Switch restaurant
  const switchRestaurant = (id) => {
    setActiveRestaurantId(id);
  };

  // Add new restaurant
  const addNewRestaurant = (customData = {}) => {
    const newId = `rest_${Date.now()}`;
    const newRest = {
      ...DEFAULT_RESTAURANT,
      id: newId,
      name: customData.name || 'New Restaurant',
      ...customData
    };
    const updated = [...restaurants, newRest];
    setRestaurants(updated);
    setActiveRestaurantId(newId);
    fetch('/api/loyalty/restaurants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restaurants: updated })
    }).catch(() => {});
    return newRest;
  };

  // Register or retrieve customer
  const registerOrGetCustomer = (phone, name = 'Guest Customer') => {
    const cleanPhone = phone.replace(/\D/g, '');
    let existing = customers.find(c => c.phone === cleanPhone && c.restaurantId === activeRestaurantId);
    if (!existing) {
      const newCust = {
        id: `cust_${Date.now()}`,
        restaurantId: activeRestaurantId,
        phone: cleanPhone,
        name: name || `Guest ${cleanPhone.slice(-4)}`,
        visits: 0,
        totalSpend: 0,
        loyaltyPoints: 0,
        lastVisit: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        vouchers: []
      };
      setCustomers(prev => [...prev, newCust]);
      existing = newCust;
    }
    setActiveCustomerPhone(cleanPhone);

    fetch('/api/loyalty/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: cleanPhone, restaurantId: activeRestaurantId, name })
    }).then(r => r.json()).then(data => {
      if (data?.customers) setCustomers(data.customers);
    }).catch(() => {});

    return existing;
  };

  // Add visit / stamp to customer
  const addStampToCustomer = (phone, billAmount = 0) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const amountNum = parseFloat(billAmount) || 0;
    const totalStampsNeeded = activeRestaurant.program?.totalStamps || 5;
    const rewardTitle = activeRestaurant.program?.rewardTitle || '₹100 Instant Discount';
    const vipThreshold = activeRestaurant.program?.vipSpendThreshold || 5000;
    const pointsPerCurrency = activeRestaurant.program?.pointsPerCurrency || 1;

    setCustomers(prev => {
      const index = prev.findIndex(c => c.phone === cleanPhone && c.restaurantId === activeRestaurantId);
      const target = index >= 0 ? prev[index] : {
        id: `cust_${Date.now()}`,
        restaurantId: activeRestaurantId,
        phone: cleanPhone,
        name: `Guest ${cleanPhone.slice(-4)}`,
        visits: 0,
        totalSpend: 0,
        loyaltyPoints: 0,
        createdAt: new Date().toISOString(),
        vouchers: []
      };

      const newVisits = target.visits + 1;
      const newSpend = target.totalSpend + amountNum;
      const pointsEarned = Math.max(10, Math.round(amountNum * pointsPerCurrency));
      const newPoints = target.loyaltyPoints + pointsEarned;
      const newVouchers = [...(target.vouchers || [])];

      // Check stamp milestone cycle
      if (newVisits % totalStampsNeeded === 0) {
        const randCode = Math.random().toString(36).substring(2, 6).toUpperCase();
        newVouchers.push({
          code: `BEE-100-${randCode}`,
          title: rewardTitle,
          amount: 100,
          status: 'unredeemed',
          earnedAt: new Date().toISOString(),
          milestoneVisit: newVisits
        });
      }

      // Check VIP threshold
      let isVip = target.isVip || false;
      if (newSpend >= vipThreshold && !isVip) {
        isVip = true;
        newVouchers.push({
          code: `BEE-VIP-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
          title: `VIP Perks Unlocked: ${activeRestaurant.program?.vipReward || 'Exclusive Discount'}`,
          amount: 500,
          status: 'unredeemed',
          earnedAt: new Date().toISOString(),
          isVipTier: true
        });
      }

      const updatedCust = {
        ...target,
        visits: newVisits,
        totalSpend: newSpend,
        loyaltyPoints: newPoints,
        isVip,
        lastVisit: new Date().toISOString(),
        vouchers: newVouchers
      };

      if (index >= 0) {
        const copy = [...prev];
        copy[index] = updatedCust;
        return copy;
      }
      return [...prev, updatedCust];
    });

    setActiveCustomerPhone(cleanPhone);
    setLastStampAnimationTimestamp(Date.now());

    // Broadcast to server so all connected mobile phones update instantly!
    fetch('/api/loyalty/stamp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: cleanPhone, restaurantId: activeRestaurantId, billAmount: amountNum })
    }).then(r => r.json()).then(data => {
      if (data?.customers) setCustomers(data.customers);
    }).catch(() => {});

    return {
      success: true,
      message: `Stamp added successfully to +91 ${cleanPhone}! +10 Loyalty Points awarded.`
    };
  };

  // Redeem voucher
  const redeemCustomerVoucher = (phone, voucherCode) => {
    const cleanPhone = phone.replace(/\D/g, '');
    setCustomers(prev => prev.map(c => {
      if (c.phone === cleanPhone && c.restaurantId === activeRestaurantId) {
        return {
          ...c,
          vouchers: (c.vouchers || []).map(v => {
            if (v.code === voucherCode) {
              return { ...v, status: 'redeemed', redeemedAt: new Date().toISOString() };
            }
            return v;
          })
        };
      }
      return c;
    }));

    fetch('/api/loyalty/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: cleanPhone, restaurantId: activeRestaurantId, voucherCode })
    }).then(r => r.json()).then(data => {
      if (data?.customers) setCustomers(data.customers);
    }).catch(() => {});

    return {
      success: true,
      message: `Voucher ${voucherCode} successfully redeemed! ₹100 discount applied to bill.`
    };
  };

  // Reset to default sample data
  const resetToDefaultData = () => {
    setRestaurants(initialRestaurants || [DEFAULT_RESTAURANT]);
    setCustomers(initialCustomers || []);
    setActiveRestaurantId(initialRestaurants?.[0]?.id || 'rest_001');
    localStorage.removeItem('loyalty_restaurants');
    localStorage.removeItem('loyalty_customers');
  };

  return (
    <LoyaltyContext.Provider
      value={{
        restaurants,
        activeRestaurant,
        activeRestaurantId,
        customers,
        activeCustomer,
        activeCustomerPhone,
        activeTab,
        isGuestMode,
        setIsGuestMode,
        serverIp,
        lastStampAnimationTimestamp,
        setActiveTab,
        setActiveCustomerPhone,
        switchCustomer: setActiveCustomerPhone,
        updateActiveRestaurant,
        switchRestaurant,
        addNewRestaurant,
        registerOrGetCustomer,
        addStampToCustomer,
        redeemCustomerVoucher,
        redeemVoucher: redeemCustomerVoucher,
        resetToDefaultData
      }}
    >
      {children}
    </LoyaltyContext.Provider>
  );
}

export function useLoyalty() {
  const context = useContext(LoyaltyContext);
  if (!context) {
    throw new Error('useLoyalty must be used within a LoyaltyProvider');
  }
  return context;
}
