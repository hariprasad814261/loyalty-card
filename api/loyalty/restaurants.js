import { 
  getRestaurants, 
  saveRestaurants, 
  fetchCloudRestaurants, 
  syncCloudRestaurants 
} from './_store.js';

export default async function handler(req, res) {
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
      await syncCloudRestaurants(restaurants);
      return res.status(200).json({ success: true, restaurants });
    }
    return res.status(400).json({ error: 'Invalid restaurants payload' });
  }

  let restaurants = getRestaurants();
  const cloudRest = await fetchCloudRestaurants();
  if (Array.isArray(cloudRest) && cloudRest.length > 0) {
    const restMap = new Map();
    restaurants.forEach(r => restMap.set(r.id, r));
    cloudRest.forEach(r => restMap.set(r.id, { ...(restMap.get(r.id) || {}), ...r }));
    restaurants = Array.from(restMap.values());
    saveRestaurants(restaurants);
  }

  return res.status(200).json({
    success: true,
    restaurants
  });
}
