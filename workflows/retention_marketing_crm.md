# Workflow: Customer Retention & Marketing CRM

## Objective
Convert customer visit history into repeatable revenue using 1-click personalized WhatsApp, SMS, and Google Review marketing campaigns.

## Required Inputs
- `restaurant_id`: Active restaurant
- `campaign_type`: `win_back`, `milestone_reminder`, `google_review_booster`, `birthday_festival`, `referral_invite`
- `customer_list`: Target customer segment

## Segmentation Rules
- **Almost There**: Customers with `stamps == totalStamps - 1` (e.g. 4/5 stamps).
- **Inactive / At Risk**: Customers whose `lastVisit > 30 days` ago.
- **Top VIPs**: Customers with `totalSpend >= vipSpendThreshold`.
- **Review Prospects**: Customers with `>= 2 visits` who haven't left a review.

## Execution Steps
1. **Load Database**: Query `data/customers.json` for active restaurant guests.
2. **Apply Filter / Segment**: Filter customers according to campaign type.
3. **Build Message Payload**: Call `tools/whatsapp_campaign_builder.py` to generate URL-encoded WhatsApp direct links with dynamic tags:
   - `{customer_name}`
   - `{restaurant_name}`
   - `{stamps_remaining}`
   - `{reward_title}`
   - `{pass_url}`
   - `{google_review_url}`
4. **Dispatch**: Cashier or restaurant owner clicks the WhatsApp icon next to customer to send 1-click personalized invitation.

## Deterministic Tools
- `tools/whatsapp_campaign_builder.py`: Formats messages and generates ready-to-open `https://wa.me/{phone}?text={encoded_message}` links.
