# Workflow: Create & Customize Restaurant Loyalty Card

## Objective
Design and publish a branded digital loyalty card for a restaurant, configure reward rules, preview in Apple & Google Wallet simulators, and generate shareable pass links.

## Required Inputs
- `restaurant_name`: Name of restaurant/cafe
- `tagline`: Subtitle or cuisine description
- `category`: Business niche (Cafe, Fine Dining, Bar, Bakery, etc.)
- `currency`: Currency symbol (default: ₹)
- `theme`: Preset color palette or custom HEX codes
- `stamps_total`: Number of stamps to earn primary reward (e.g. 5, 8, 10, 12)
- `reward_title`: Reward text (e.g. "₹100 Off on Bill" or "Free Starter")
- `vip_spend_threshold`: Lifetime spend requirement for VIP perks (e.g. ₹5,000)
- `links`: Google Review link, Instagram handle, Phone, WhatsApp, and Address

## Execution Steps
1. **Open Studio**: Launch the Card Studio in the web app or run `tools/export_pass_data.py`.
2. **Configure Brand Assets**: Set background color, text color, accent color, stamp icon, and upload logo/banner.
3. **Verify Wallet Simulators**:
   - Inspect **Apple Wallet** pass layout: Check header logo, strip image, and stamp bubbles.
   - Inspect **Google Wallet** pass layout: Check card background and loyalty meter.
   - Trigger **Flip Card**: Verify back-of-pass links (Google Reviews, Instagram, WhatsApp, Address).
4. **Publish & Persist**: Save card configuration to `data/restaurants.json`.
5. **Output**: Unique Restaurant Pass URL and registration QR code.

## Deterministic Tools
- `tools/export_pass_data.py`: Validates schema and exports `.pkpass` / Google Wallet pass JSON.
