import { getRestaurants, getCustomers, saveCustomers, normalizePhone } from './_store.js';

export default function handler(req, res) {
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
  const customers = getCustomers();

  const targetRest = restaurants.find(r => r.id === restaurantId) || restaurants[0] || {};
  const totalStampsNeeded = targetRest?.program?.totalStamps || 5;
  const rewardTitle = targetRest?.program?.rewardTitle || '₹100 Instant Discount';
  const vipThreshold = targetRest?.program?.vipSpendThreshold || 5000;
  const pointsPerCurrency = targetRest?.program?.pointsPerCurrency || 1;

  const index = customers.findIndex(c => normalizePhone(c.phone) === cleanPhone && c.restaurantId === restaurantId);
  const target = index >= 0 ? customers[index] : {
    id: `cust_${Date.now()}`,
    restaurantId: restaurantId,
    phone: cleanPhone,
    name: `Guest ${cleanPhone.slice(-4)}`,
    visits: 0,
    totalSpend: 0,
    loyaltyPoints: 0,
    createdAt: new Date().toISOString(),
    vouchers: []
  };

  const newVisits = (target.visits || 0) + 1;
  const newSpend = (target.totalSpend || 0) + amountNum;
  const pointsEarned = Math.max(10, Math.round(amountNum * pointsPerCurrency));
  const newPoints = (target.loyaltyPoints || 0) + pointsEarned;
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

  return res.status(200).json({
    success: true,
    customer: updatedCust,
    customers,
    message: `Stamp added successfully to +91 ${cleanPhone}!`
  });
}
