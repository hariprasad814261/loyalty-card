#!/usr/bin/env python3
"""
tools/export_pass_data.py
Deterministic tool to build and validate Apple Wallet (pass.json) and Google Wallet Generic Pass JSON payloads.
"""

import json
import sys

def build_apple_wallet_pass_json(restaurant: dict, customer: dict = None) -> dict:
    """Build Apple Wallet pass.json structure for StoreCard."""
    name = restaurant.get("name", "Restaurant")
    theme = restaurant.get("theme", {})
    program = restaurant.get("program", {})
    links = restaurant.get("links", {})
    
    stamps = customer.get("visits", 0) if customer else 0
    total_stamps = program.get("totalStamps", 5)
    points = customer.get("loyaltyPoints", 0) if customer else 0
    
    pass_data = {
        "formatVersion": 1,
        "passTypeIdentifier": "pass.com.loyaltyforge.restaurant",
        "serialNumber": f"{restaurant.get('id', 'rest_001')}-{customer.get('phone', '0000000000') if customer else 'SAMPLE'}",
        "teamIdentifier": "TEAMID1234",
        "organizationName": name,
        "description": f"{name} Loyalty Card",
        "foregroundColor": theme.get("textColor", "rgb(255, 255, 255)"),
        "backgroundColor": theme.get("cardBgColor", "rgb(43, 26, 18)"),
        "labelColor": theme.get("accentColor", "rgb(230, 156, 36)"),
        "storeCard": {
            "headerFields": [
                {
                    "key": "points",
                    "label": "POINTS",
                    "value": points
                }
            ],
            "primaryFields": [
                {
                    "key": "stamps",
                    "label": f"STAMPS ({stamps}/{total_stamps})",
                    "value": "● " * (stamps % total_stamps) + "○ " * (total_stamps - (stamps % total_stamps))
                }
            ],
            "secondaryFields": [
                {
                    "key": "reward",
                    "label": "CURRENT REWARD",
                    "value": program.get("rewardTitle", "₹100 Off")
                }
            ],
            "backFields": [
                {
                    "key": "googleReview",
                    "label": "Google Reviews",
                    "value": links.get("googleReviewUrl", "")
                },
                {
                    "key": "instagram",
                    "label": "Instagram",
                    "value": links.get("instagramHandle", "")
                },
                {
                    "key": "phone",
                    "label": "Contact Number",
                    "value": links.get("phone", "")
                },
                {
                    "key": "terms",
                    "label": "Terms & Conditions",
                    "value": "Card is valid on all dine-in and takeaway orders. Stamps are tied directly to your mobile number."
                }
            ]
        },
        "barcode": {
            "format": "PKBarcodeFormatQR",
            "message": f"LOYALTY:{restaurant.get('id')}:{customer.get('phone') if customer else 'DEMO'}",
            "messageEncoding": "iso-8859-1"
        }
    }
    return pass_data

def build_google_wallet_generic_pass_json(restaurant: dict, customer: dict = None) -> dict:
    """Build Google Wallet GenericObject pass structure."""
    name = restaurant.get("name", "Restaurant")
    theme = restaurant.get("theme", {})
    program = restaurant.get("program", {})
    
    stamps = customer.get("visits", 0) if customer else 0
    total_stamps = program.get("totalStamps", 5)
    
    return {
        "id": f"issuer_id.{restaurant.get('id', 'rest')}_{customer.get('phone', 'demo') if customer else 'demo'}",
        "classId": f"issuer_id.{restaurant.get('id', 'rest')}_class",
        "state": "ACTIVE",
        "cardTitle": {
            "defaultValue": {
                "language": "en-US",
                "value": name
            }
        },
        "header": {
            "defaultValue": {
                "language": "en-US",
                "value": f"{stamps % total_stamps}/{total_stamps} Stamps"
            }
        },
        "subheader": {
            "defaultValue": {
                "language": "en-US",
                "value": program.get("rewardTitle", "₹100 Off")
            }
        },
        "hexBackgroundColor": theme.get("cardBgColor", "#3E271E"),
        "barcode": {
            "type": "QR_CODE",
            "value": f"LOYALTY:{restaurant.get('id')}:{customer.get('phone') if customer else 'DEMO'}"
        }
    }

def main():
    sample_rest = {
        "id": "rest_001",
        "name": "Cafe Aroma",
        "theme": {"textColor": "#FFF", "cardBgColor": "#2B1A12", "accentColor": "#E69C24"},
        "program": {"totalStamps": 5, "rewardTitle": "₹100 Instant Discount"},
        "links": {"googleReviewUrl": "https://maps.google.com", "phone": "+91 9876543210"}
    }
    apple_pass = build_apple_wallet_pass_json(sample_rest)
    google_pass = build_google_wallet_generic_pass_json(sample_rest)
    print("Apple Wallet Pass JSON Sample:\n", json.dumps(apple_pass, indent=2))
    print("\nGoogle Wallet Pass JSON Sample:\n", json.dumps(google_pass, indent=2))

if __name__ == "__main__":
    main()
