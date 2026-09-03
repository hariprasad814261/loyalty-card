#!/usr/bin/env python3
"""
tools/loyalty_rules_engine.py
Deterministic logic engine for restaurant loyalty math, stamp cycles, tiered spend milestones, and voucher generation.
"""

import sys
import json
import random
import string
from datetime import datetime, timezone

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def generate_voucher_code(prefix: str = "BEE", amount: int = 100) -> str:
    """Generate a unique 12-char alphanumeric voucher code."""
    suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"{prefix}-{amount}-{suffix}"

def process_customer_visit(customer: dict, restaurant: dict, bill_amount: float = 0.0) -> dict:
    """
    Process a visit, increment stamps, add spend, compute points, and unlock rewards.
    """
    updated = dict(customer)
    
    # 1. Update basic visit stats
    updated["visits"] = updated.get("visits", 0) + 1
    updated["totalSpend"] = updated.get("totalSpend", 0.0) + float(bill_amount)
    updated["lastVisit"] = datetime.now(timezone.utc).isoformat()
    
    # 2. Points calculation (e.g. 1 point per 10 currency units spent, or 10 pts per visit)
    points_per_unit = restaurant.get("program", {}).get("pointsPerCurrency", 0.1)
    points_earned = max(10, int(bill_amount * points_per_unit))
    updated["loyaltyPoints"] = updated.get("loyaltyPoints", 0) + points_earned
    
    # 3. Check Stamp Cycle
    total_stamps_needed = restaurant.get("program", {}).get("totalStamps", 5)
    current_stamps_in_cycle = updated["visits"] % total_stamps_needed
    
    # If completed a cycle (e.g. 5th, 10th, 15th visit)
    if updated["visits"] > 0 and current_stamps_in_cycle == 0:
        reward_title = restaurant.get("program", {}).get("rewardTitle", "₹100 Instant Discount")
        new_voucher = {
            "code": generate_voucher_code("BEE", 100 if "100" in reward_title else 200),
            "title": reward_title,
            "amount": 100,
            "status": "unredeemed",
            "earnedAt": datetime.now(timezone.utc).isoformat(),
            "milestoneVisit": updated["visits"]
        }
        if "vouchers" not in updated:
            updated["vouchers"] = []
        updated["vouchers"].append(new_voucher)
        print(f"[REWARD UNLOCKED] Customer {updated.get('phone')} earned: {reward_title} (Code: {new_voucher['code']})")
        
    # 4. Check Lifetime VIP Spend Milestone (e.g. ₹5,000)
    vip_threshold = restaurant.get("program", {}).get("vipSpendThreshold", 5000)
    if updated["totalSpend"] >= vip_threshold and not updated.get("isVip"):
        updated["isVip"] = True
        vip_reward = restaurant.get("program", {}).get("vipReward", "VIP Gold Perks")
        vip_voucher = {
            "code": generate_voucher_code("VIP", 500),
            "title": f"VIP Status Unlocked: {vip_reward}",
            "amount": 500,
            "status": "unredeemed",
            "earnedAt": datetime.now(timezone.utc).isoformat(),
            "isVipTier": True
        }
        if "vouchers" not in updated:
            updated["vouchers"] = []
        updated["vouchers"].append(vip_voucher)
        print(f"[VIP STATUS UNLOCKED] Customer {updated.get('phone')} reached ₹{vip_threshold} lifetime spend!")
        
    return updated

def test_engine():
    sample_restaurant = {
        "id": "rest_001",
        "name": "Cafe Aroma",
        "program": {
            "totalStamps": 5,
            "rewardTitle": "₹100 Instant Discount",
            "vipSpendThreshold": 5000,
            "pointsPerCurrency": 0.1
        }
    }
    customer = {
        "phone": "9876543210",
        "name": "Ramesh",
        "visits": 4,
        "totalSpend": 4500,
        "vouchers": []
    }
    # 5th visit with ₹600 bill
    res = process_customer_visit(customer, sample_restaurant, bill_amount=600)
    assert res["visits"] == 5
    assert res["totalSpend"] == 5100
    assert len(res["vouchers"]) == 2 # 1 for 5th visit + 1 for VIP ₹5000 spend!
    assert res["isVip"] is True
    print("✓ All loyalty engine unit tests passed successfully!")

if __name__ == "__main__":
    test_engine()
