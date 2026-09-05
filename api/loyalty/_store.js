import fs from 'node:fs';
import path from 'node:path';

// Persistent Cloud Storage Vault IDs on api.restful-api.dev (accessible globally with zero setup)
export const CLOUD_VAULT_CUSTOMERS_ID = 'ff808181a067127101a070ae4fb41712';
export const CLOUD_VAULT_RESTAURANTS_ID = 'ff808181a067127101a070ae50371713';
const CLOUD_VAULT_API = 'https://api.restful-api.dev/objects';

export const normalizePhone = (phone) => {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
};

// Monotonic CRDT customer record merger
export function mergeCustomerLists(localList = [], incomingList = []) {
  const map = new Map();

  (localList || []).forEach(cust => {
    if (!cust?.phone) return;
    const clean = normalizePhone(cust.phone);
    const key = `${cust.restaurantId || 'rest'}_${clean}`;
    map.set(key, { ...cust, phone: clean });
  });

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
}

// Initial fallback restaurants if file read fails
const DEFAULT_RESTAURANTS = [
  {
    id: 'rest_001',
    name: 'Cafe Aroma & Roasters',
    tagline: 'Artisanal Coffee & Bakes',
    owner: { name: 'Karthik Raja', phone: '9876543210', pin: '1234' },
    theme: {
      primaryColor: '#D4AF37',
      cardBgColor: '#1A1412',
      accentColor: '#D4AF37',
      textColor: '#FDFBF7',
      stampIcon: 'coffee'
    },
    program: {
      totalStamps: 5,
      rewardTitle: 'Free Signature Cappuccino & Croissant',
      rewardSubtitle: 'Valid on any handcrafted beverage',
      pointsPerCurrency: 1,
      vipSpendThreshold: 5000,
      vipReward: '15% Off Forever + Priority Seating'
    }
  },
  {
    id: 'rest_002',
    name: 'Anjappar Chettinad Kitchen',
    tagline: 'Authentic Chettinad & Biryani Heritage',
    owner: { name: 'Anand Swaminathan', phone: '9840123456', pin: '2468' },
    theme: {
      primaryColor: '#C25E00',
      cardBgColor: '#1F140E',
      accentColor: '#E67E22',
      textColor: '#FDFBF7',
      stampIcon: 'utensils'
    },
    program: {
      totalStamps: 6,
      rewardTitle: 'Free Chettinad Biryani + ₹200 Voucher',
      rewardSubtitle: 'Dine-in or takeaway',
      pointsPerCurrency: 1,
      vipSpendThreshold: 6000,
      vipReward: 'Complimentary Chef Special Dessert on Every Visit'
    }
  },
  {
    id: 'rest_003',
    name: 'Green Bistro & Organic Bowl',
    tagline: 'Clean Eats & Cold-Pressed Juices',
    owner: { name: 'Pooja Sundaram', phone: '9940123456', pin: '9876' },
    theme: {
      primaryColor: '#2D8A4E',
      cardBgColor: '#0E1A12',
      accentColor: '#2ECC71',
      textColor: '#FDFBF7',
      stampIcon: 'leaf'
    },
    program: {
      totalStamps: 4,
      rewardTitle: 'Free Superfood Smoothie Bowl',
      rewardSubtitle: 'Nutrient-rich power breakfast',
      pointsPerCurrency: 1,
      vipSpendThreshold: 4000,
      vipReward: 'Free Detox Drink with Every Meal'
    }
  },
  {
    id: 'rest_burmix',
    name: 'Burmix Street Food',
    tagline: 'Burmese Street Food & Atho Special',
    owner: { name: 'Ramesh Kumar', phone: '9342705016', pin: '1122' },
    theme: {
      primaryColor: '#E65100',
      cardBgColor: '#1A1108',
      accentColor: '#FF9800',
      textColor: '#FDFBF7',
      stampIcon: 'star'
    },
    program: {
      totalStamps: 5,
      rewardTitle: '₹100 Instant Discount on Atho Combo',
      rewardSubtitle: 'Authentic Burmese Egg Atho & Soup',
      pointsPerCurrency: 1,
      vipSpendThreshold: 3500,
      vipReward: 'Complimentary Mohinga Bowl on Weekend Visits'
    }
  }
];

const TMP_CUSTOMERS_PATH = path.join('/tmp', 'loyalty_customers.json');
const TMP_RESTAURANTS_PATH = path.join('/tmp', 'loyalty_restaurants.json');

let inMemoryCustomers = null;
let inMemoryRestaurants = null;

function loadLocalSeed(filename, fallback) {
  try {
    const localPath = path.join(process.cwd(), 'data', filename);
    if (fs.existsSync(localPath)) {
      return JSON.parse(fs.readFileSync(localPath, 'utf8'));
    }
  } catch {}
  return fallback;
}

export async function fetchCloudCustomers() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${CLOUD_VAULT_API}/${CLOUD_VAULT_CUSTOMERS_ID}`, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json?.data?.customers)) {
        return json.data.customers;
      }
    }
  } catch {}
  return null;
}

export async function syncCloudCustomers(customers) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    await fetch(`${CLOUD_VAULT_API}/${CLOUD_VAULT_CUSTOMERS_ID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'loyaltyforge_cloud_customers_v1',
        data: { lastUpdated: Date.now(), customers }
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);
  } catch {}
}

export async function fetchCloudRestaurants() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${CLOUD_VAULT_API}/${CLOUD_VAULT_RESTAURANTS_ID}`, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json?.data?.restaurants) && json.data.restaurants.length > 0) {
        return json.data.restaurants;
      }
    }
  } catch {}
  return null;
}

export async function syncCloudRestaurants(restaurants) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    await fetch(`${CLOUD_VAULT_API}/${CLOUD_VAULT_RESTAURANTS_ID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'loyaltyforge_cloud_restaurants_v1',
        data: { lastUpdated: Date.now(), restaurants }
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);
  } catch {}
}

export function getRestaurants() {
  if (inMemoryRestaurants) return inMemoryRestaurants;
  try {
    if (fs.existsSync(TMP_RESTAURANTS_PATH)) {
      inMemoryRestaurants = JSON.parse(fs.readFileSync(TMP_RESTAURANTS_PATH, 'utf8'));
      return inMemoryRestaurants;
    }
  } catch {}
  inMemoryRestaurants = loadLocalSeed('restaurants.json', DEFAULT_RESTAURANTS);
  return inMemoryRestaurants;
}

export function saveRestaurants(restaurants) {
  inMemoryRestaurants = restaurants;
  try {
    fs.writeFileSync(TMP_RESTAURANTS_PATH, JSON.stringify(restaurants, null, 2));
  } catch {}
  syncCloudRestaurants(restaurants).catch(() => {});
}

export function getCustomers() {
  if (inMemoryCustomers) return inMemoryCustomers;
  try {
    if (fs.existsSync(TMP_CUSTOMERS_PATH)) {
      inMemoryCustomers = JSON.parse(fs.readFileSync(TMP_CUSTOMERS_PATH, 'utf8'));
      return inMemoryCustomers;
    }
  } catch {}
  inMemoryCustomers = loadLocalSeed('customers.json', []);
  return inMemoryCustomers;
}

export function saveCustomers(customers) {
  inMemoryCustomers = customers;
  try {
    fs.writeFileSync(TMP_CUSTOMERS_PATH, JSON.stringify(customers, null, 2));
  } catch {}
  syncCloudCustomers(customers).catch(() => {});
}
