# Workflow: Cashier Stamping & Check-in Flow

## Objective
Fast 3-second counter workflow for billing staff to lookup customer profiles by QR scan or 10-digit mobile number, add stamps/visits, record bill spend amount, and redeem rewards.

## Required Inputs
- `restaurant_id`: Current active restaurant
- `customer_identifier`: Scanned pass QR data OR 10-digit mobile number
- `action`: `add_stamp`, `add_spend`, `redeem_voucher`
- `bill_amount`: Optional bill amount in ₹ INR

## Execution Steps
1. **Customer Identification**:
   - Cashier scans pass QR code using device camera, OR
   - Types customer's 10-digit mobile number in the Cashier Terminal search box.
2. **Fetch / Register Customer**:
   - If existing customer: load current visits, spend, points, and active vouchers.
   - If new customer: automatically register customer with 0 visits and 0 spend.
3. **Execute Loyalty Actions**:
   - Click `+1 Visit / Stamp`: Increments visit counter.
   - Enter `Bill Amount (₹)`: Adds spend and computes loyalty points (`spend * pointsPerCurrency`).
4. **Milestone Check**:
   - `tools/loyalty_rules_engine.py` checks if customer reached `totalStamps` (e.g. 5 visits).
   - If reached: unlocks Reward Voucher with a unique redemption code (e.g. `BEE-100-XXXX`).
   - If customer lifetime spend >= `vipSpendThreshold`: unlocks VIP Tier Perks.
5. **Redemption**:
   - If customer chooses to use an active voucher: Cashier clicks `Redeem Voucher` and applies the discount to the bill.
6. **Update Storage**: Persists updated record to `data/customers.json`.

## Deterministic Tools
- `tools/loyalty_rules_engine.py`: Computes stamps, points, milestone unlocks, and voucher codes.
