# Workflow: Generate Restaurant QR Code & Counter Standee Kit

## Objective
Generate scannable, print-ready marketing standees, acrylic table tents, and high-resolution QR codes for counter placement in restaurants.

## Required Inputs
- `restaurant_id`: ID from `data/restaurants.json`
- `pass_url`: Customer registration URL
- `headline`: Marketing hook (e.g., "Scan & Get ₹100 Off on Your 5th Visit!")
- `format`: Standee size (`A5_portrait`, `A6_portrait`, `square_table_tent`, `png_qr_only`)

## Execution Steps
1. **Generate Vector QR**: Call `tools/generate_qr.py` passing the customer pass URL to generate a crisp, high-resolution QR code with embedded logo.
2. **Compose Standee Layout**: Call `tools/generate_standee_pdf.py` or use the web app Standee Generator.
3. **Download Assets**:
   - Save temporary renders to `.tmp/standee_<restaurant_id>.pdf`.
   - Output ready-to-print PDF or 300 DPI PNG.
4. **Deploy**: Print standee on 300 GSM cardstock or insert into acrylic table stand for dining tables and cashier counter.

## Deterministic Tools
- `tools/generate_qr.py`: Produces error-correction level 'H' QR codes.
- `tools/generate_standee_pdf.py`: Generates print-ready vector PDF documents.
