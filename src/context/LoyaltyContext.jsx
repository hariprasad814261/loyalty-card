import React, { createContext, useContext, useState, useEffect } from 'react';
import initialRestaurants from '../../data/restaurants.json';
import initialCustomers from '../../data/customers.json';
import { DEFAULT_RESTAURANT } from '../utils/presetTemplates';

export const normalizePhone = (p) => {
  if (!p) return '';
  const digits = String(p).replace(/\D/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
};

// Monotonic CRDT customer merger: visit counts and points NEVER revert backwards!
export const mergeCustomerRecords = (localList = [], incomingList = []) => {
  const map = new Map();

  // 1. Seed with local records
  (localList || []).forEach(cust => {
    if (!cust?.phone) return;
    const clean = normalizePhone(cust.phone);
    const key = `${cust.restaurantId || 'rest'}_${clean}`;
    map.set(key, { ...cust, phone: clean });
  });

  // 2. Merge incoming records preserving highest visits & spend
  (incomingList || []).forEach(inc => {
    if (!inc?.phone) return;
    const clean = normalizePhone(inc.phone);
    const key = `${inc.restaurantId || 'rest'}_${clean}`;
    if (!map.has(key)) {
      map.set(key, { ...inc, phone: clean });
    } else {
      const existing = map.get(key);
      const higherVisits = Math.max(Number(existing.visits) || 0, Number(inc.visits) || 0);
      const higherSpend = Math.max(Number(existing.totalSpend) || 0, Number(inc.totalSpend) || 0);
      const higherPoints = Math.max(Number(existing.loyaltyPoints) || 0, Number(inc.loyaltyPoints) || 0);

      // Merge vouchers uniquely by code
      const voucherMap = new Map();
      (existing.vouchers || []).forEach(v => { if (v?.code) voucherMap.set(v.code, v); });
      (inc.vouchers || []).forEach(v => {
        if (v?.code && (!voucherMap.has(v.code) || v.status === 'redeemed')) {
          voucherMap.set(v.code, v);
        }
      });

      map.set(key, {
        ...existing,
        ...inc,
        phone: clean,
        visits: higherVisits,
        totalSpend: higherSpend,
        loyaltyPoints: higherPoints,
        vouchers: Array.from(voucherMap.values()),
        lastVisit: (new Date(existing.lastVisit || 0) > new Date(inc.lastVisit || 0))
          ? existing.lastVisit
          : inc.lastVisit
      });
    }
  });

  return Array.from(map.values());
};

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

  // Parse URL on initial load for QR code scanning, merchant portal, or super admin
  const getInitialRouteState = () => {
    try {
      const pathname = window.location.pathname || '';
      const searchParams = new URLSearchParams(window.location.search || '');
      const hash = window.location.hash || '';
      
      let restId = searchParams.get('pass') || searchParams.get('restaurant') || searchParams.get('resto') || searchParams.get('id') || searchParams.get('portal') || searchParams.get('shop');
      let tab = 'studio';
      let mode = 'demo'; // 'demo' | 'guest' | 'merchant' | 'super-admin' | 'login'

      if (pathname === '/super-admin' || searchParams.has('admin') || searchParams.get('mode') === 'admin' || hash.includes('super-admin')) {
        mode = 'super-admin';
        tab = 'crm';
      } else if (pathname === '/login' || searchParams.has('login') || searchParams.get('mode') === 'login' || hash.includes('login')) {
        mode = 'login';
      } else if (pathname.startsWith('/portal') || searchParams.has('portal') || searchParams.has('shop')) {
        const parts = pathname.replace(/^\/portal\/?/, '').split('/').filter(Boolean);
        if (parts[0]) restId = parts[0];
        mode = 'merchant';
        tab = 'cashier';
      } else if (pathname === '/pass' || pathname.startsWith('/pass/') || searchParams.has('pass') || hash.includes('pass')) {
        const parts = pathname.replace(/^\/pass\/?/, '').split('/').filter(Boolean);
        if (parts[0]) restId = parts[0];
        mode = 'guest';
        tab = 'customer-pass';
      }

      return { restId, tab, mode, isGuest: mode === 'guest' };
    } catch {
      return { restId: null, tab: 'studio', mode: 'demo', isGuest: false };
    }
  };

  const initialRoute = getInitialRouteState();

  const [routeMode, setRouteMode] = useState(initialRoute.mode);
  const [isGuestMode, setIsGuestMode] = useState(initialRoute.isGuest);

  // Active Merchant Session (for shopkeeper/cashier logged in with phone + PIN)
  const [merchantSession, setMerchantSession] = useState(() => {
    try {
      const saved = sessionStorage.getItem('loyalty_merchant_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeRestaurantId, setActiveRestaurantId] = useState(() => {
    // When a QR code is scanned in the URL, that scanned shop MUST take top priority over stale merchant sessions!
    if (initialRoute.restId) return initialRoute.restId;
    if (merchantSession?.restaurantId) return merchantSession.restaurantId;
    return restaurants[0]?.id || 'rest_001';
  });

  // Live listener for QR code scans and URL updates on mobile (popstate, hashchange, tab focus)
  useEffect(() => {
    const handleUrlSync = () => {
      const route = getInitialRouteState();
      if (route.restId) {
        const matched = restaurants.find(r => 
          r.id === route.restId || 
          r.id?.toLowerCase() === String(route.restId).toLowerCase() ||
          r.name?.toLowerCase().replace(/[^a-z0-9]/g, '') === String(route.restId).toLowerCase().replace(/[^a-z0-9]/g, '')
        );
        const targetId = matched ? matched.id : route.restId;
        setActiveRestaurantId(targetId);
        setRouteMode(route.mode);
        setIsGuestMode(route.isGuest);
        if (route.tab) setActiveTab(route.tab);
      }
    };

    window.addEventListener('popstate', handleUrlSync);
    window.addEventListener('hashchange', handleUrlSync);
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        handleUrlSync();
      }
    });

    return () => {
      window.removeEventListener('popstate', handleUrlSync);
      window.removeEventListener('hashchange', handleUrlSync);
    };
  }, [restaurants]);

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

  // Cross-tab real-time sync via BroadcastChannel (Cashier Terminal <-> Customer Pass)
  const broadcastSync = (type, payload) => {
    if (typeof window !== 'undefined' && window.BroadcastChannel) {
      try {
        const ch = new BroadcastChannel('loyalty_forge_sync');
        ch.postMessage({ type, payload });
        ch.close();
      } catch {}
    }
  };

  // Real-time synchronization with server for cross-device updates (Laptop Cashier <-> Customer Phone)
  const syncWithServer = async () => {
    try {
      const res = await fetch('/api/loyalty/state');
      if (res.ok) {
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          return; // Ignore if HTML rewrite was returned
        }

        if (data?.serverIp && data.serverIp !== '127.0.0.1') {
          setServerIp(data.serverIp);
        }
        if (Array.isArray(data.restaurants) && data.restaurants.length > 0) {
          setRestaurants(data.restaurants);
        }
        if (Array.isArray(data.customers)) {
          setCustomers(prev => {
            const guestStored = typeof window !== 'undefined' ? localStorage.getItem('guest_loyalty_phone') : '';
            const targetPhone = normalizePhone(guestStored || activeCustomerPhone);

            const currentCust = prev.find(c => normalizePhone(c.phone) === targetPhone && c.restaurantId === activeRestaurantId);
            const serverCust = data.customers.find(c => normalizePhone(c.phone) === targetPhone && c.restaurantId === activeRestaurantId);

            if (serverCust && currentCust && (serverCust.visits > currentCust.visits || serverCust.loyaltyPoints > currentCust.loyaltyPoints)) {
              setLastStampAnimationTimestamp(Date.now());
            } else if (serverCust && !currentCust && serverCust.visits > 0) {
              setLastStampAnimationTimestamp(Date.now());
            }

            // CRDT Monotonic Merge: visits & points NEVER revert backwards!
            return mergeCustomerRecords(prev, data.customers);
          });
        }
      }
    } catch (e) {
      // offline fallback
    }
  };

  useEffect(() => {
    syncWithServer();
    const interval = setInterval(syncWithServer, 1200);
    return () => clearInterval(interval);
  }, [activeCustomerPhone, activeRestaurantId]);

  // Universal Cloud Real-Time Pub/Sub Channel (Laptop Cashier <-> Mobile Phone across Internet/Hotspot)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleIncomingMessage = (rawMessage) => {
      try {
        const parsed = typeof rawMessage === 'string' ? JSON.parse(rawMessage) : rawMessage;
        if (parsed?.type === 'STAMP_AWARDED' && parsed.customer) {
          setCustomers(prev => mergeCustomerRecords(prev, [parsed.customer]));
          const guestStored = localStorage.getItem('guest_loyalty_phone') || '';
          const targetClean = normalizePhone(guestStored || activeCustomerPhone);
          const custClean = normalizePhone(parsed.customer.phone);
          if (custClean === targetClean && (parsed.customer.restaurantId === activeRestaurantId || !parsed.customer.restaurantId)) {
            setLastStampAnimationTimestamp(Date.now());
          }
        }
      } catch {}
    };

    // 1. Instant Real-Time SSE Stream
    let es;
    if (window.EventSource) {
      try {
        es = new EventSource('https://ntfy.sh/loyaltyforge_universal_sync/sse');
        es.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data?.message) {
              handleIncomingMessage(data.message);
            }
          } catch {}
        };
      } catch {}
    }

    // 2. Active Mobile Polling (bypasses mobile browser battery throttles)
    const pollCloud = async () => {
      try {
        const res = await fetch('https://ntfy.sh/loyaltyforge_universal_sync/json?poll=1');
        if (res.ok) {
          const lines = (await res.text()).split('\n').filter(Boolean);
          for (const line of lines) {
            try {
              const item = JSON.parse(line);
              if (item?.message) handleIncomingMessage(item.message);
            } catch {}
          }
        }
      } catch {}
    };

    const pollInterval = setInterval(pollCloud, 1500);

    // 3. Mobile Wakeup / Tab Focus trigger
    const onWakeup = () => {
      syncWithServer();
      pollCloud();
    };
    window.addEventListener('visibilitychange', onWakeup);
    window.addEventListener('focus', onWakeup);

    return () => {
      if (es) es.close();
      clearInterval(pollInterval);
      window.removeEventListener('visibilitychange', onWakeup);
      window.removeEventListener('focus', onWakeup);
    };
  }, [activeRestaurantId, activeCustomerPhone]);

  // Multi-tab real-time sync listener (Instant confetti on customer pass when cashier stamps)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.BroadcastChannel) return;
    const channel = new BroadcastChannel('loyalty_forge_sync');

    channel.onmessage = (event) => {
      const { type, payload } = event.data || {};
      if (type === 'STAMP_AWARDED') {
        const targetClean = normalizePhone(activeCustomerPhone);
        const payloadClean = normalizePhone(payload?.phone);
        if (payloadClean === targetClean && payload?.restaurantId === activeRestaurantId) {
          setLastStampAnimationTimestamp(Date.now());
        }
        if (payload?.customer) {
          setCustomers(prev => mergeCustomerRecords(prev, [payload.customer]));
        }
      }
    };

    return () => channel.close();
  }, [activeCustomerPhone, activeRestaurantId]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('loyalty_restaurants', JSON.stringify(restaurants));
  }, [restaurants]);

  useEffect(() => {
    localStorage.setItem('loyalty_customers', JSON.stringify(customers));
  }, [customers]);

  const activeRestaurant = restaurants.find(r => 
    r.id === activeRestaurantId || 
    r.id?.toLowerCase() === String(activeRestaurantId).toLowerCase() ||
    r.name?.toLowerCase().replace(/[^a-z0-9]/g, '') === String(activeRestaurantId).toLowerCase().replace(/[^a-z0-9]/g, '')
  ) || restaurants[0] || DEFAULT_RESTAURANT;
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

  // Smart Role Detection: Check if a phone number belongs to the restaurant owner/staff
  const checkIsOwnerPhone = (restaurantId, inputPhone) => {
    if (!inputPhone) return { isOwner: false };
    const clean = inputPhone.replace(/\D/g, '');
    if (clean.length < 10) return { isOwner: false };
    const rest = restaurants.find(r => r.id === restaurantId);
    if (!rest || !rest.owner?.phone) return { isOwner: false };
    const ownerClean = (rest.owner.phone || '').replace(/\D/g, '');
    const isOwner = ownerClean.length >= 10 && ownerClean.endsWith(clean.slice(-10));
    return {
      isOwner,
      restaurant: rest,
      ownerName: rest.owner.name || 'Store Owner'
    };
  };

  // Find any restaurant registered to a given owner mobile number (for /login page)
  const findRestaurantByOwnerPhone = (inputPhone) => {
    if (!inputPhone) return null;
    const clean = inputPhone.replace(/\D/g, '');
    if (clean.length < 10) return null;
    return restaurants.find(r => {
      const ownerClean = (r.owner?.phone || '').replace(/\D/g, '');
      return ownerClean.length >= 10 && ownerClean.endsWith(clean.slice(-10));
    }) || null;
  };

  // Verify merchant 4-digit PIN and create session
  const verifyMerchantPin = (restaurantId, pin) => {
    const rest = restaurants.find(r => r.id === restaurantId);
    if (!rest) return { success: false, error: 'Restaurant not found' };
    const expectedPin = rest.owner?.pin || '1234';
    if (pin.trim() === expectedPin.trim()) {
      const session = {
        restaurantId: rest.id,
        restaurantName: rest.name,
        ownerPhone: rest.owner?.phone || '',
        ownerName: rest.owner?.name || 'Store Owner',
        loggedInAt: Date.now()
      };
      setMerchantSession(session);
      try {
        sessionStorage.setItem('loyalty_merchant_session', JSON.stringify(session));
      } catch {}
      setActiveRestaurantId(rest.id);
      setIsGuestMode(false);
      setRouteMode('merchant');
      setActiveTab('cashier'); // Land on Cashier Scanner POS
      return { success: true, restaurant: rest };
    }
    return { success: false, error: 'Incorrect 4-digit PIN. Please check and try again.' };
  };

  // Verify merchant phone + PIN on the /login screen
  const verifyMerchantLogin = (phone, pin) => {
    const clean = (phone || '').replace(/\D/g, '');
    const rest = findRestaurantByOwnerPhone(clean);
    if (!rest) {
      return { success: false, error: 'No registered restaurant found for this mobile number.' };
    }
    return verifyMerchantPin(rest.id, pin);
  };

  // End merchant session
  const merchantLogout = () => {
    setMerchantSession(null);
    try {
      sessionStorage.removeItem('loyalty_merchant_session');
    } catch {}
    setRouteMode('demo');
  };

  // Super-Admin / Merchant Onboarding: Add new restaurant with dedicated owner phone & PIN (Strict Uniqueness)
  const onboardNewRestaurant = (customData = {}) => {
    const cleanPhone = (customData.ownerPhone || '').replace(/\D/g, '');
    const cleanName = (customData.name || '').trim().toLowerCase();

    // 1. Strict Duplicate Mobile Number Check: An owner cannot create multiple accounts with the same number
    if (cleanPhone.length >= 10) {
      const existingOwner = restaurants.find(r => {
        const op = (r.owner?.phone || '').replace(/\D/g, '');
        return op.length >= 10 && op.endsWith(cleanPhone.slice(-10));
      });
      if (existingOwner) {
        return {
          success: false,
          error: `Mobile number +91 ${cleanPhone.slice(-10)} is already registered to "${existingOwner.name}". Please log in with your 4-digit PIN instead of creating a duplicate account.`,
          existingRestaurant: existingOwner
        };
      }
    }

    // 2. Strict Duplicate Shop Name Check: Prevent identical restaurant names
    if (cleanName) {
      const existingName = restaurants.find(r => (r.name || '').trim().toLowerCase() === cleanName);
      if (existingName) {
        return {
          success: false,
          error: `A restaurant named "${existingName.name}" already exists. Please choose a unique name or log in with your owner PIN.`,
          existingRestaurant: existingName
        };
      }
    }

    const newId = customData.id || `rest_${(customData.name || 'shop').toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 16)}_${Date.now().toString().slice(-4)}`;
    const newRest = {
      ...DEFAULT_RESTAURANT,
      id: newId,
      name: customData.name || 'New Restaurant',
      tagline: customData.tagline || 'Artisanal Culinary Craft',
      category: customData.category || 'Restaurant & Dining',
      owner: {
        name: customData.ownerName || 'Store Manager',
        phone: cleanPhone,
        pin: customData.ownerPin || '1234'
      },
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
    return { success: true, restaurant: newRest };
  };

  // Add new restaurant (Card Studio fallback)
  const addNewRestaurant = (customData = {}) => {
    return onboardNewRestaurant(customData);
  };

  // Register customer or get existing record
  const registerOrGetCustomer = (phone, name = 'Guest Customer') => {
    const cleanPhone = normalizePhone(phone);
    let existing = customers.find(c => normalizePhone(c.phone) === cleanPhone && c.restaurantId === activeRestaurantId);
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
      if (data?.customers) setCustomers(prev => mergeCustomerRecords(prev, data.customers));
    }).catch(() => {});

    return existing;
  };

  // Add visit / stamp to customer
  const addStampToCustomer = (phone, billAmount = 0) => {
    const cleanPhone = normalizePhone(phone);
    const amountNum = parseFloat(billAmount) || 0;
    const totalStampsNeeded = activeRestaurant.program?.totalStamps || 5;
    const rewardTitle = activeRestaurant.program?.rewardTitle || '₹100 Instant Discount';
    const vipThreshold = activeRestaurant.program?.vipSpendThreshold || 5000;
    const pointsPerCurrency = activeRestaurant.program?.pointsPerCurrency || 1;

    let targetUpdatedCust = null;

    setCustomers(prev => {
      const index = prev.findIndex(c => normalizePhone(c.phone) === cleanPhone && c.restaurantId === activeRestaurantId);
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

      targetUpdatedCust = updatedCust;

      if (index >= 0) {
        const copy = [...prev];
        copy[index] = updatedCust;
        return copy;
      }
      return [...prev, updatedCust];
    });

    setActiveCustomerPhone(cleanPhone);
    setLastStampAnimationTimestamp(Date.now());

    // Broadcast across browser tabs on same device
    broadcastSync('STAMP_AWARDED', {
      phone: cleanPhone,
      restaurantId: activeRestaurantId,
      customer: targetUpdatedCust
    });

    // Broadcast across cloud to mobile phones on any network (Mobile Data, Hotspot, Wi-Fi)
    try {
      const payloadStr = JSON.stringify({
        type: 'STAMP_AWARDED',
        restaurantId: activeRestaurantId,
        customer: targetUpdatedCust
      });
      fetch('https://ntfy.sh/loyaltyforge_universal_sync', {
        method: 'POST',
        headers: { 'Title': 'STAMP_AWARDED', 'Priority': 'high' },
        body: payloadStr
      }).catch(() => {});
      fetch(`https://ntfy.sh/loyaltyforge_room_${activeRestaurantId}`, {
        method: 'POST',
        headers: { 'Title': 'STAMP_AWARDED', 'Priority': 'high' },
        body: payloadStr
      }).catch(() => {});
    } catch {}

    // Broadcast to server (local API / Vercel serverless)
    fetch('/api/loyalty/stamp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: cleanPhone, restaurantId: activeRestaurantId, billAmount: amountNum })
    }).then(r => r.json()).then(data => {
      if (data?.customers) setCustomers(prev => mergeCustomerRecords(prev, data.customers));
    }).catch(() => {});

    return {
      success: true,
      message: `Stamp added successfully to +91 ${cleanPhone}! +10 Loyalty Points awarded.`
    };
  };

  // Redeem voucher
  const redeemCustomerVoucher = (phone, voucherCode) => {
    const cleanPhone = normalizePhone(phone);
    setCustomers(prev => prev.map(c => {
      if (normalizePhone(c.phone) === cleanPhone && c.restaurantId === activeRestaurantId) {
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
        routeMode,
        setRouteMode,
        merchantSession,
        checkIsOwnerPhone,
        findRestaurantByOwnerPhone,
        verifyMerchantPin,
        verifyMerchantLogin,
        merchantLogout,
        onboardNewRestaurant,
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
