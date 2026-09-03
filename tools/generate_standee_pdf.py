#!/usr/bin/env python3
"""
tools/generate_standee_pdf.py
Deterministic tool to generate ready-to-print restaurant table tents and counter standees (A5/A6 PDF).
"""

import sys
import os
import argparse
import qrcode
from io import BytesIO

try:
    from reportlab.lib.pagesizes import A5, A6
    from reportlab.lib import colors
    from reportlab.lib.units import mm, inch
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image as RLImage, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False

from PIL import Image, ImageDraw, ImageFont

def generate_standee_reportlab(restaurant_name: str, tagline: str, offer_headline: str, pass_url: str, output_path: str, size: str = "A5", brand_color_hex: str = "#E69C24"):
    """Generate high quality PDF standee using reportlab."""
    page_size = A5 if size.upper() == "A5" else A6
    doc = SimpleDocTemplate(
        output_path,
        pagesize=page_size,
        leftMargin=15*mm,
        rightMargin=15*mm,
        topMargin=15*mm,
        bottomMargin=15*mm
    )

    # Generate QR Code image in memory
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=2,
    )
    qr.add_data(pass_url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color=brand_color_hex, back_color="#FFFFFF").convert('RGB')
    
    qr_buffer = BytesIO()
    qr_img.save(qr_buffer, format='PNG')
    qr_buffer.seek(0)

    styles = getSampleStyleSheet()
    
    # Custom styles
    brand_color = colors.HexColor(brand_color_hex)
    dark_bg = colors.HexColor("#1A1A1A")
    
    title_style = ParagraphStyle(
        'RestaurantTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=brand_color,
        alignment=1 # Center
    )
    
    tagline_style = ParagraphStyle(
        'RestaurantTagline',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor("#666666"),
        alignment=1
    )
    
    offer_style = ParagraphStyle(
        'OfferHeadline',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=dark_bg,
        alignment=1
    )
    
    instruction_style = ParagraphStyle(
        'Instructions',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#444444"),
        alignment=1
    )

    sub_inst_style = ParagraphStyle(
        'SubInstructions',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#888888"),
        alignment=1
    )

    story = []
    story.append(Spacer(1, 10*mm))
    story.append(Paragraph(restaurant_name.upper(), title_style))
    story.append(Spacer(1, 2*mm))
    if tagline:
        story.append(Paragraph(tagline, tagline_style))
    story.append(Spacer(1, 8*mm))
    
    # Offer Card Box
    story.append(Paragraph(f"★ {offer_headline} ★", offer_style))
    story.append(Spacer(1, 8*mm))
    
    # QR Image
    qr_rl_img = RLImage(qr_buffer, width=50*mm, height=50*mm)
    story.append(qr_rl_img)
    story.append(Spacer(1, 6*mm))
    
    story.append(Paragraph("SCAN WITH YOUR PHONE CAMERA", instruction_style))
    story.append(Spacer(1, 2*mm))
    story.append(Paragraph("No App Download Needed • Earn Rewards on Every Visit", sub_inst_style))
    story.append(Spacer(1, 6*mm))
    story.append(Paragraph(f"<b>Powered by LoyaltyForge Digital Pass</b>", sub_inst_style))

    doc.build(story)
    print(f"Standee PDF generated successfully: {output_path}")
    return output_path

def main():
    parser = argparse.ArgumentParser(description="Generate restaurant standee PDF")
    parser.add_argument("--name", default="Cafe Aroma & Roasters", help="Restaurant name")
    parser.add_argument("--tagline", default="Artisanal Coffee & Fresh Bakes", help="Tagline")
    parser.add_argument("--offer", default="Scan & Earn ₹100 Off on 5th Visit!", help="Headline offer")
    parser.add_argument("--url", default="https://loyalty.restaurant.com/pass/cafe_aroma", help="Pass URL")
    parser.add_argument("--output", default=".tmp/standee_preview.pdf", help="Output PDF path")
    parser.add_argument("--size", default="A5", choices=["A5", "A6"], help="Page size")
    parser.add_argument("--color", default="#E69C24", help="Brand accent HEX color")
    
    args = parser.parse_args()
    os.makedirs(os.path.dirname(os.path.abspath(args.output)), exist_ok=True)
    
    if REPORTLAB_AVAILABLE:
        generate_standee_reportlab(args.name, args.tagline, args.offer, args.url, args.output, args.size, args.color)
    else:
        print("Notice: reportlab not installed in current environment; client-side JS PDF engine will handle browser downloads.")

if __name__ == "__main__":
    main()
