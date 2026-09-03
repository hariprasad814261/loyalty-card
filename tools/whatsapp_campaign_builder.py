#!/usr/bin/env python3
"""
tools/whatsapp_campaign_builder.py
Deterministic tool to build personalized WhatsApp retention & marketing URLs.
"""

import sys
import urllib.parse

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def generate_whatsapp_link(phone: str, customer_name: str, restaurant_name: str, campaign_type: str, custom_params: dict = None) -> dict:
    """
    Generate direct https://wa.me/ URL with dynamic tags.
    """
    if custom_params is None:
        custom_params = {}
        
    name = customer_name or "Friend"
    clean_phone = "".join(filter(str.isdigit, str(phone)))
    if len(clean_phone) == 10:
        clean_phone = "91" + clean_phone # Default India country code
        
    pass_url = custom_params.get("pass_url", f"https://loyalty.app/pass/{clean_phone}")
    google_review_url = custom_params.get("google_review_url", "https://maps.google.com")
    reward_title = custom_params.get("reward_title", "₹100 Reward")
    stamps_left = custom_params.get("stamps_left", 1)

    templates = {
        "milestone_reminder": (
            f"Hi {name}! 👋 You're only {stamps_left} visit away from unlocking your *{reward_title}* at *{restaurant_name}*! ☕🎉\n\n"
            f"Show your digital loyalty card when you visit: {pass_url}\n\n"
            f"See you soon!"
        ),
        "win_back": (
            f"Hello {name}! ❤️ We miss you at *{restaurant_name}*!\n\n"
            f"Here is an exclusive *15% OFF welcome-back treat* for your next visit this week.\n\n"
            f"Check your loyalty card: {pass_url}\n"
            f"We look forward to serving you!"
        ),
        "google_review": (
            f"Hi {name}! 🌟 Thank you for dining with us at *{restaurant_name}*!\n\n"
            f"If you loved your experience, please take 30 seconds to drop us a 5-star Google Review: {google_review_url}\n\n"
            f"Show your review on your next visit for a *Free Dessert / Beverage* on us! 🎁"
        ),
        "festival_offer": (
            f"✨ Festive Greetings from *{restaurant_name}*! ✨\n\n"
            f"Dear {name}, celebrate the festive season with us and enjoy special double loyalty points & ₹150 off on family orders over ₹1,000!\n\n"
            f"View your card: {pass_url}"
        ),
        "referral_invite": (
            f"Hey {name}! Love the food at *{restaurant_name}*? 🍕\n\n"
            f"Share this link with your friends & family: when they complete their first visit, you both get ₹100 in loyalty rewards!\n\n"
            f"Your referral link: {pass_url}"
        )
    }

    message_text = templates.get(campaign_type, templates["milestone_reminder"])
    encoded_text = urllib.parse.quote(message_text)
    wa_url = f"https://wa.me/{clean_phone}?text={encoded_text}"
    
    return {
        "phone": clean_phone,
        "customer_name": name,
        "campaign_type": campaign_type,
        "message": message_text,
        "url": wa_url
    }

def main():
    res = generate_whatsapp_link(
        phone="9876543210",
        customer_name="Karthik",
        restaurant_name="Cafe Aroma",
        campaign_type="milestone_reminder",
        custom_params={"stamps_left": 1, "reward_title": "₹100 Off"}
    )
    print("Generated WhatsApp Message:\n" + res["message"])
    print("\nWhatsApp Direct URL:\n" + res["url"])

if __name__ == "__main__":
    main()
