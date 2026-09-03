import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getLocalNetworkIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Find active non-internal IPv4
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return '127.0.0.1';
}

function loyaltyApiPlugin() {
  const dataDir = path.resolve(__dirname, 'data');
  const customersPath = path.join(dataDir, 'customers.json');
  const restaurantsPath = path.join(dataDir, 'restaurants.json');

  const readJson = (filePath, fallback = []) => {
    try {
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      }
    } catch (e) {
      console.error('Failed to read JSON', filePath, e);
    }
    return fallback;
  };

  const writeJson = (filePath, data) => {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write JSON', filePath, e);
    }
  };

  return {
    name: 'loyalty-api-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/loyalty')) {
          return next();
        }

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.end();
          return;
        }

        const urlObj = new URL(req.url, 'http://localhost:5173');
        const pathname = urlObj.pathname;

        // GET /api/loyalty/state
        if (req.method === 'GET' && pathname === '/api/loyalty/state') {
          const customers = readJson(customersPath, []);
          const restaurants = readJson(restaurantsPath, []);
          const serverIp = getLocalNetworkIp();
          res.statusCode = 200;
          res.end(JSON.stringify({ customers, restaurants, serverIp, timestamp: Date.now() }));
          return;
        }

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          let payload = {};
          try {
            if (body) payload = JSON.parse(body);
          } catch (e) {}

          // POST /api/loyalty/stamp
          if (req.method === 'POST' && pathname === '/api/loyalty/stamp') {
            const { phone, restaurantId, billAmount = 0 } = payload;
            const digits = (phone || '').replace(/\D/g, '');
            const cleanPhone = digits.length > 10 ? digits.slice(-10) : digits;
            const amountNum = parseFloat(billAmount) || 0;

            const customers = readJson(customersPath, []);
            const restaurants = readJson(restaurantsPath, []);
            const targetRest = restaurants.find(r => r.id === restaurantId) || restaurants[0] || {};
            const totalStampsNeeded = targetRest?.program?.totalStamps || 5;
            const rewardTitle = targetRest?.program?.rewardTitle || '₹100 Instant Discount';
            const vipThreshold = targetRest?.program?.vipSpendThreshold || 5000;
            const pointsPerCurrency = targetRest?.program?.pointsPerCurrency || 1;

            const index = customers.findIndex(c => {
              const cDigits = (c.phone || '').replace(/\D/g, '');
              const cPhone = cDigits.length > 10 ? cDigits.slice(-10) : cDigits;
              return cPhone === cleanPhone && c.restaurantId === restaurantId;
            });
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

            const newVisits = target.visits + 1;
            const newSpend = target.totalSpend + amountNum;
            const pointsEarned = Math.max(10, Math.round(amountNum * pointsPerCurrency));
            const newPoints = target.loyaltyPoints + pointsEarned;
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

            writeJson(customersPath, customers);
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, customer: updatedCust, customers, message: `Stamp added successfully to +91 ${cleanPhone}!` }));
            return;
          }

          // POST /api/loyalty/register
          if (req.method === 'POST' && pathname === '/api/loyalty/register') {
            const { phone, restaurantId, name } = payload;
            const digits = (phone || '').replace(/\D/g, '');
            const cleanPhone = digits.length > 10 ? digits.slice(-10) : digits;
            const customers = readJson(customersPath, []);
            let existing = customers.find(c => {
              const cDigits = (c.phone || '').replace(/\D/g, '');
              const cPhone = cDigits.length > 10 ? cDigits.slice(-10) : cDigits;
              return cPhone === cleanPhone && c.restaurantId === restaurantId;
            });
            if (!existing) {
              existing = {
                id: `cust_${Date.now()}`,
                restaurantId: restaurantId,
                phone: cleanPhone,
                name: name || `Guest ${cleanPhone.slice(-4)}`,
                visits: 0,
                totalSpend: 0,
                loyaltyPoints: 0,
                lastVisit: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                vouchers: []
              };
              customers.push(existing);
              writeJson(customersPath, customers);
            }
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, customer: existing, customers }));
            return;
          }

          // POST /api/loyalty/redeem
          if (req.method === 'POST' && pathname === '/api/loyalty/redeem') {
            const { phone, restaurantId, voucherCode } = payload;
            const digits = (phone || '').replace(/\D/g, '');
            const cleanPhone = digits.length > 10 ? digits.slice(-10) : digits;
            const customers = readJson(customersPath, []);
            const updated = customers.map(c => {
              const cDigits = (c.phone || '').replace(/\D/g, '');
              const cPhone = cDigits.length > 10 ? cDigits.slice(-10) : cDigits;
              if (cPhone === cleanPhone && c.restaurantId === restaurantId) {
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
            });
            writeJson(customersPath, updated);
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, customers: updated, message: `Voucher ${voucherCode} redeemed successfully!` }));
            return;
          }

          // POST /api/loyalty/restaurants
          if (req.method === 'POST' && pathname === '/api/loyalty/restaurants') {
            if (Array.isArray(payload.restaurants)) {
              writeJson(restaurantsPath, payload.restaurants);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, restaurants: payload.restaurants }));
              return;
            }
          }

          // Fallback
          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Endpoint not found' }));
        });
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), loyaltyApiPlugin()],
  server: {
    port: 5173,
    open: false,
    host: true,
    watch: {
      ignored: ['**/assets/**', '**/.tmp/**', '**/data/**']
    }
  }
});
