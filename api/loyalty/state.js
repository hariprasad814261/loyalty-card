import { getRestaurants, getCustomers } from './_store.js';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const restaurants = getRestaurants();
  const customers = getCustomers();

  return res.status(200).json({
    status: 'ok',
    restaurants,
    customers,
    timestamp: Date.now()
  });
}
