import { 
  getRestaurants, 
  getCustomers, 
  saveCustomers, 
  fetchCloudCustomers, 
  syncCloudCustomers, 
  mergeCustomerLists, 
  normalizePhone 
} from './_store.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const payload = req.body || {};
  const { phone, restaurantId, billAmount = 0 } = payload;
  const cleanPhone = normalizePhone(phone);
  const amountNum = parseFloat(billAmount) || 0;

  if (!cleanPhone || cleanPhone.length < 10) {
    return res.status(400).json({ error: 'Valid 10-digit phone number is required' });
  }

  const restaurants = getRestaurants();
  let customers = getCustomers();

  // Refresh from cloud vault if available
  const cloudCustomers = await fetchCloudCustomers();
  if (Array.isArray(cloudCustomers)) {
    customers = mergeCustomerLists(customers, cloudCustomers);
  }

  const targetRest = restaurants.find(r => r.id === restaurantId || r.id?.toLowerCase() === String(restaurantId).toLowerCase()) || restaurants[0] || {};
  const totalStampsNeeded = targetRest?.program?.totalStamps || 5;
  const rewardTitle = targetRest?.program?.rewardTitle || '₹100 Instant Discount';
  const vipThreshold = targetRest?.program?.vipSpendThreshold || 5000;
  const pointsPerCurrency = targetRest?.program?.pointsPerCurrency || 1;

  const index = customers.findIndex(c => normalizePhone(c.phone) === cleanPhone && (c.restaurantId === restaurantId || !c.restaurantId));
  const target = index >= 0 ? customers[index] : {
    id: `cust_${Date.now()}`,
    restaurantId: restaurantId || targetRest.id || 'rest_001',
    phone: cleanPhone,
    name: `Guest ${cleanPhone.slice(-4)}`,
    visits: 0,
    totalSpend: 0,
    loyaltyPoints: 0,
    createdAt: new Date().toISOString(),
    vouchers: []
  };

  const newVisits = (Number(target.visits) || 0) + 1;
  const newSpend = (Number(target.totalSpend) || 0) + amountNum;
  const pointsEarned = Math.max(10, Math.round(amountNum * pointsPerCurrency));
  const newPoints = (Number(target.loyaltyPoints) || 0) + pointsEarned;
  const newVouchers = [...(target.vouchers || [])];

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

  let isVip = target.isVip || false;
  if (newSpend >= vipThreshold && !isVip) {
    isVip = true;
    newVouchers.push({
      code: `BEE-VIP-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      title: `VIP Perks Unlocked: ${targetRest?.program?.vipReward || 'Exclusive Discount'}`,
      amount: 500,
      status: 'unredeemed',
      earnedAt: new Date().toISOString(),
      isVipTier: true
    });
  }

  const updatedCust = {
    ...target,
    restaurantId: restaurantId || target.restaurantId || targetRest.id,
    visits: newVisits,
    totalSpend: newSpend,
    loyaltyPoints: newPoints,
    isVip,
    lastVisit: new Date().toISOString(),
    vouchers: newVouchers
  };

  if (index >= 0) {
    customers[index] = updatedCust;
  } else {
    customers.push(updatedCust);
  }

  saveCustomers(customers);
  await syncCloudCustomers(customers);

  // Broadcast to universal and dedicated cloud pub/sub topics
  const pubSubPayload = JSON.stringify({
    type: 'STAMP_AWARDED',
    restaurantId: updatedCust.restaurantId,
    customer: updatedCust
  });

  try {
    const pubHeaders = { 'Title': 'STAMP_AWARDED', 'Priority': 'high' };
    fetch('https://ntfy.sh/loyaltyforge_universal_sync', { method: 'POST', headers: pubHeaders, body: pubSubPayload }).catch(() => {});
    fetch(`https://ntfy.sh/loyaltyforge_sync_${cleanPhone}`, { method: 'POST', headers: pubHeaders, body: pubSubPayload }).catch(() => {});
    if (updatedCust.restaurantId) {
      fetch(`https://ntfy.sh/loyaltyforge_room_${updatedCust.restaurantId}`, { method: 'POST', headers: pubHeaders, body: pubSubPayload }).catch(() => {});
    }
  } catch {}

  return res.status(200).json({
    success: true,
    customer: updatedCust,
    customers,
    message: `Stamp added successfully to +91 ${cleanPhone}!`
  });
}
