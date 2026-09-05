import { 
  getRestaurants, 
  getCustomers, 
  saveCustomers,
  saveRestaurants,
  fetchCloudCustomers, 
  fetchCloudRestaurants,
  mergeCustomerLists 
} from './_store.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let restaurants = getRestaurants();
  let customers = getCustomers();

  // Async parallel fetch from persistent cloud vault
  try {
    const [cloudCust, cloudRest] = await Promise.all([
      fetchCloudCustomers(),
      fetchCloudRestaurants()
    ]);

    if (Array.isArray(cloudCust) && cloudCust.length > 0) {
      customers = mergeCustomerLists(customers, cloudCust);
      saveCustomers(customers);
    }
    if (Array.isArray(cloudRest) && cloudRest.length > 0) {
      // Merge restaurants uniquely by id
      const restMap = new Map();
      restaurants.forEach(r => restMap.set(r.id, r));
      cloudRest.forEach(r => restMap.set(r.id, { ...(restMap.get(r.id) || {}), ...r }));
      restaurants = Array.from(restMap.values());
      saveRestaurants(restaurants);
    }
  } catch {}

  return res.status(200).json({
    status: 'ok',
    restaurants,
    customers,
    timestamp: Date.now()
  });
}
