import { getRestaurants, saveRestaurants } from './_store.js';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const { restaurants } = req.body || {};
    if (Array.isArray(restaurants)) {
      saveRestaurants(restaurants);
      return res.status(200).json({ success: true, restaurants });
    }
    return res.status(400).json({ error: 'Invalid restaurants payload' });
  }

  return res.status(200).json({
    success: true,
    restaurants: getRestaurants()
  });
}
