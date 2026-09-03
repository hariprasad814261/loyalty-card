import { getCustomers, saveCustomers, normalizePhone } from './_store.js';

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
  const { phone, restaurantId, name } = payload;
  const cleanPhone = normalizePhone(phone);

  if (!cleanPhone || cleanPhone.length < 10) {
    return res.status(400).json({ error: 'Valid 10-digit phone number is required' });
  }

  const customers = getCustomers();
  let existing = customers.find(c => normalizePhone(c.phone) === cleanPhone && c.restaurantId === restaurantId);

  if (!existing) {
    existing = {
      id: `cust_${Date.now()}`,
      restaurantId: restaurantId,
      phone: cleanPhone,
      name: name || `Guest ${cleanPhone.slice(-4)}`,
      visits: 0,
      totalSpend: 0,
      loyaltyPoints: 0,
      createdAt: new Date().toISOString(),
      lastVisit: new Date().toISOString(),
      vouchers: []
    };
    customers.push(existing);
    saveCustomers(customers);
  }

  return res.status(200).json({
    success: true,
    customer: existing,
    customers
  });
}
