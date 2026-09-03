#!/usr/bin/env python3
"""
tools/generate_qr.py
Deterministic tool for generating high-resolution, scannable QR codes for restaurant digital passes.
"""

import sys
import os
import argparse
import qrcode
from PIL import Image, ImageDraw

def generate_qr(data: str, output_path: str, fill_color: str = "#000000", back_color: str = "#FFFFFF", box_size: int = 10, border: int = 2) -> str:
    """Generate high-resolution QR code and save to output_path."""
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=box_size,
        border=border,
    )
    qr.add_data(data)
    qr.make(fit=True)

    img = qr.make_image(fill_color=fill_color, back_color=back_color).convert('RGB')
    img.save(output_path)
    print(f"QR code successfully generated: {output_path}")
    return output_path

def main():
    parser = argparse.ArgumentParser(description="Generate restaurant pass QR code")
    parser.add_argument("--data", required=True, help="Data URL or string to encode")
    parser.add_argument("--output", default=".tmp/pass_qr.png", help="Output file path")
    parser.add_argument("--fill-color", default="#000000", help="QR fill color")
    parser.add_argument("--back-color", default="#FFFFFF", help="QR background color")
    parser.add_argument("--box-size", type=int, default=10, help="Box size in pixels")
    
    args = parser.parse_args()
    generate_qr(args.data, args.output, args.fill_color, args.back_color, args.box_size)

if __name__ == "__main__":
    main()
