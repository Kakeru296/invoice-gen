#!/usr/bin/env python3
"""Create InvoiceGen demo video for monday.com Marketplace review."""

from PIL import Image, ImageDraw, ImageFont
import imageio
import numpy as np
import os, sys

W, H = 1280, 720
FPS = 1  # 1 frame per slide
HOLD = 4  # seconds per slide

MONDAY_BLUE = (0, 90, 224)
INVOICE_GREEN = (3, 127, 76)
BG = (247, 248, 252)
WHITE = (255, 255, 255)
DARK = (50, 51, 56)
GRAY = (103, 104, 121)
LIGHT = (230, 232, 240)

def font(size, bold=False):
    try:
        name = "/System/Library/Fonts/Helvetica.ttc"
        return ImageFont.truetype(name, size)
    except:
        return ImageFont.load_default()

def slide_base(title_bar=True):
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    if title_bar:
        # Top nav bar
        d.rectangle([0, 0, W, 52], fill=(255,255,255))
        d.rectangle([0, 52, W, 53], fill=LIGHT)
        # monday logo area
        d.rectangle([8, 10, 28, 42], fill=MONDAY_BLUE, outline=None)
        d.text((36, 16), "monday dev", font=font(18, True), fill=DARK)
        # InvoiceGen badge
        d.rectangle([W-180, 12, W-12, 40], fill=INVOICE_GREEN)
        d.text((W-170, 18), "InvoiceGen", font=font(16), fill=WHITE)
    return img, d

def text_wrapped(d, text, xy, width, f, fill=DARK):
    words = text.split()
    lines, cur = [], ""
    for w in words:
        test = (cur + " " + w).strip()
        if d.textlength(test, font=f) <= width:
            cur = test
        else:
            if cur: lines.append(cur)
            cur = w
    if cur: lines.append(cur)
    x, y = xy
    lh = f.size + 4
    for line in lines:
        d.text((x, y), line, font=f, fill=fill)
        y += lh
    return y

def slide1_title():
    img, d = slide_base(False)
    # Full-screen gradient-ish background
    for y in range(H):
        ratio = y / H
        r = int(3 + ratio * 20)
        g = int(127 - ratio * 50)
        b = int(76 + ratio * 30)
        d.line([(0,y),(W,y)], fill=(r,g,b))
    
    d.text((W//2, 180), "InvoiceGen", font=font(72, True), fill=WHITE, anchor="mm")
    d.text((W//2, 260), "for monday.com", font=font(36), fill=(200,240,220), anchor="mm")
    d.rectangle([W//2-200, 310, W//2+200, 314], fill=WHITE)
    d.text((W//2, 360), "Generate professional PDF invoices", font=font(22), fill=WHITE, anchor="mm")
    d.text((W//2, 395), "from your board items in 2 clicks", font=font(22), fill=WHITE, anchor="mm")
    d.text((W//2, 480), "🎬 Product Demo", font=font(18), fill=(200,240,220), anchor="mm")
    return img

def slide2_problem():
    img, d = slide_base()
    d.text((60, 80), "The Problem", font=font(38, True), fill=DARK)
    d.rectangle([60, 126, 200, 130], fill=INVOICE_GREEN)
    
    items = [
        ("⏱️", "Manually copy board data into invoicing tools"),
        ("🔄", "Switch between monday.com and billing software"),
        ("❌", "Risk of data entry errors"),
        ("📂", "No record of generated invoices"),
    ]
    y = 160
    for icon, text in items:
        d.rectangle([60, y, 80, y+44], fill=INVOICE_GREEN)
        d.text((90, y+8), icon + "  " + text, font=font(22), fill=DARK)
        y += 72
    
    # Right side - illustration
    d.rectangle([720, 140, 1180, 600], fill=WHITE, outline=LIGHT, width=2)
    d.text((730, 160), "Your Workflow Today:", font=font(18, True), fill=GRAY)
    steps = ["1. Check monday.com board","2. Open Excel/Sheets","3. Copy item names & prices","4. Format invoice manually","5. Send to client","6. Repeat every time 😓"]
    for i, s in enumerate(steps):
        c = (220,50,50) if i > 2 else GRAY
        d.text((740, 195+i*54), s, font=font(17), fill=c)
    return img

def slide3_solution():
    img, d = slide_base()
    d.text((60, 80), "The Solution: InvoiceGen", font=font(38, True), fill=INVOICE_GREEN)
    d.rectangle([60, 126, 340, 130], fill=INVOICE_GREEN)
    
    steps = [
        ("1", "Add InvoiceGen Board View to any board"),
        ("2", "Map your price columns (one-time setup)"),
        ("3", "Click Generate → PDF downloaded instantly"),
    ]
    y = 160
    for num, text in steps:
        d.ellipse([60, y, 100, y+40], fill=INVOICE_GREEN)
        d.text((74, y+8), num, font=font(20, True), fill=WHITE)
        d.text((120, y+10), text, font=font(22), fill=DARK)
        if y < 280:
            d.line([(80, y+44), (80, y+72)], fill=INVOICE_GREEN, width=2)
        y += 84

    # Right: before/after
    d.rectangle([680, 140, 1220, 600], fill=WHITE, outline=LIGHT, width=2)
    d.text((690, 160), "With InvoiceGen:", font=font(20, True), fill=INVOICE_GREEN)
    benefits = ["✅ 2 clicks = professional PDF invoice","✅ Auto-fills from board items","✅ Company template (set once)","✅ Multi-currency support","✅ Invoice history tracking","✅ No external tools needed"]
    for i, b in enumerate(benefits):
        d.text((700, 200+i*56), b, font=font(18), fill=DARK)
    return img

def slide4_board_view():
    img, d = slide_base()
    # Simulate board view tab
    tabs = ["バックログ","かんばん","アクティブ","InvoiceGen ✓"]
    x = 60
    for i, tab in enumerate(tabs):
        active = (i == 3)
        col = INVOICE_GREEN if active else LIGHT
        tcol = WHITE if active else GRAY
        bw = len(tab) * 11 + 30
        d.rectangle([x, 62, x+bw, 90], fill=col)
        d.text((x+15, 69), tab, font=font(15), fill=tcol)
        x += bw + 4
    d.rectangle([60, 90, x, 92], fill=INVOICE_GREEN)
    
    # App frame
    d.rectangle([60, 100, W-60, H-60], fill=WHITE, outline=LIGHT, width=1)
    d.text((W//2, 130), "InvoiceGen Board View", font=font(24, True), fill=INVOICE_GREEN, anchor="mm")
    
    # Step 1 card
    d.rectangle([80, 150, 400, 320], fill=BG, outline=LIGHT, width=1)
    d.ellipse([88, 158, 116, 186], fill=INVOICE_GREEN)
    d.text((96, 163), "1", font=font(18, True), fill=WHITE)
    d.text((126, 162), "Select Board", font=font(16, True), fill=DARK)
    d.rectangle([90, 200, 390, 235], fill=WHITE, outline=LIGHT, width=1)
    d.text((100, 210), "▼  タスク  (2 items loaded)", font=font(14), fill=DARK)
    d.rectangle([90, 250, 390, 305], fill=INVOICE_GREEN)
    d.text((170, 265), "Load Board Items →", font=font(16, True), fill=WHITE)
    
    d.text((80, 345), "Board items loaded successfully — ready to invoice!", font=font(15), fill=INVOICE_GREEN)
    return img

def slide5_column_mapping():
    img, d = slide_base()
    d.rectangle([60, 100, W-60, H-60], fill=WHITE, outline=LIGHT, width=1)
    d.text((W//2, 130), "Step 2: Map Columns", font=font(22, True), fill=DARK, anchor="mm")
    
    labels = ["Description Column", "Quantity Column", "Rate / Price Column *"]
    values = ["(use item name)", "Default (1)", "Price ← from board"]
    highlights = [False, False, True]
    
    y = 165
    for i, (label, val, hi) in enumerate(zip(labels, values, highlights)):
        d.text((90, y), label, font=font(14, True), fill=GRAY)
        col = INVOICE_GREEN if hi else LIGHT
        outline = INVOICE_GREEN if hi else LIGHT
        d.rectangle([90, y+24, 560, y+58], fill=WHITE, outline=col, width=2 if hi else 1)
        d.text((105, y+34), val, font=font(14), fill=DARK if hi else GRAY)
        if hi: d.text((460, y+34), "✓", font=font(14), fill=INVOICE_GREEN)
        y += 90

    # Line items preview
    d.rectangle([620, 145, 1210, 620], fill=BG, outline=LIGHT, width=1)
    d.text((630, 158), "Line Items Preview:", font=font(16, True), fill=DARK)
    headers = ["Description", "Qty", "Rate", "Amount"]
    hx = [640, 870, 960, 1080]
    d.rectangle([630, 185, 1205, 210], fill=INVOICE_GREEN)
    for h, x in zip(headers, hx):
        d.text((x, 191), h, font=font(13, True), fill=WHITE)
    
    items_demo = [("タスク１", "1", "¥50,000", "¥50,000"), ("タスク２", "1", "¥30,000", "¥30,000")]
    for i, (desc, qty, rate, amt) in enumerate(items_demo):
        y2 = 215 + i*40
        bg2 = WHITE if i%2==0 else (245,248,252)
        d.rectangle([630, y2, 1205, y2+38], fill=bg2)
        for val, x in zip([desc, qty, rate, amt], hx):
            d.text((x, y2+10), val, font=font(13), fill=DARK)
    
    d.rectangle([900, 310, 1200, 340], fill=LIGHT)
    d.text((910, 318), "Subtotal:  ¥80,000", font=font(13, True), fill=DARK)
    d.rectangle([900, 345, 1200, 375], fill=INVOICE_GREEN)
    d.text((910, 352), "Total:  ¥80,000", font=font(14, True), fill=WHITE)
    return img

def slide6_client_info():
    img, d = slide_base()
    d.rectangle([60, 100, W-60, H-60], fill=WHITE, outline=LIGHT, width=1)
    d.text((W//2, 130), "Step 3: Client Info → Generate PDF", font=font(22, True), fill=DARK, anchor="mm")
    
    # Client form
    fields = [("Client Name", "Acme Corporation"), ("Client Email", "billing@acme.com"), ("Due Date", "2026-06-19")]
    y = 165
    for label, val in fields:
        d.text((90, y), label, font=font(13, True), fill=GRAY)
        d.rectangle([90, y+22, 540, y+52], fill=BG, outline=LIGHT, width=1)
        d.text((105, y+30), val, font=font(14), fill=DARK)
        y += 74
    
    # Big generate button
    d.rectangle([90, 430, 540, 490], fill=INVOICE_GREEN)
    d.text((200, 447), "📄  Generate & Download Invoice", font=font(18, True), fill=WHITE)
    d.text((90, 510), "→ Professional PDF created instantly", font=font(15), fill=INVOICE_GREEN)
    
    # PDF preview card
    d.rectangle([600, 145, 1210, 620], fill=BG, outline=LIGHT, width=1)
    d.text((610, 158), "PDF Invoice Preview:", font=font(16, True), fill=DARK)
    d.rectangle([620, 180, 1200, 610], fill=WHITE, outline=(200,200,200), width=1)
    
    # Fake invoice
    d.text((640, 198), "INVOICE", font=font(28, True), fill=MONDAY_BLUE)
    d.text((640, 232), "INV-240519", font=font(12), fill=GRAY)
    d.text((950, 198), "Your Company Name", font=font(14, True), fill=DARK)
    d.text((950, 218), "info@yourcompany.com", font=font(11), fill=GRAY)
    d.line([(630, 256), (1190, 256)], fill=MONDAY_BLUE, width=2)
    d.text((630, 268), "BILL TO", font=font(10, True), fill=GRAY)
    d.text((630, 284), "Acme Corporation", font=font(13), fill=DARK)
    d.text((900, 268), "DATE", font=font(10, True), fill=GRAY)
    d.text((900, 284), "May 19, 2026", font=font(12), fill=DARK)
    
    # Fake table
    d.rectangle([630, 330, 1190, 355], fill=MONDAY_BLUE)
    for txt, x in [("DESCRIPTION",640),("QTY",870),("RATE",960),("AMOUNT",1060)]:
        d.text((x, 337), txt, font=font(10, True), fill=WHITE)
    d.text((640, 365), "タスク１", font=font(12), fill=DARK)
    d.text((870, 365), "1", font=font(12), fill=DARK)
    d.text((960, 365), "¥50,000", font=font(12), fill=DARK)
    d.text((1060, 365), "¥50,000", font=font(12), fill=DARK)
    d.text((640, 390), "タスク２", font=font(12), fill=DARK)
    d.text((870, 390), "1", font=font(12), fill=DARK)
    d.text((960, 390), "¥30,000", font=font(12), fill=DARK)
    d.text((1060, 390), "¥30,000", font=font(12), fill=DARK)
    d.line([(900, 420), (1190, 420)], fill=LIGHT, width=1)
    d.text((900, 428), "TOTAL:", font=font(13, True), fill=MONDAY_BLUE)
    d.text((1060, 428), "¥80,000", font=font(14, True), fill=MONDAY_BLUE)
    return img

def slide7_history():
    img, d = slide_base()
    d.rectangle([60, 100, W-60, H-60], fill=WHITE, outline=LIGHT, width=1)
    d.text((80, 112), "Invoice History", font=font(22, True), fill=DARK)
    
    headers = ["Invoice #", "Client", "Total", "Date", "Status", "Actions"]
    hx = [90, 220, 390, 540, 680, 850]
    d.rectangle([80, 150, 1200, 178], fill=(247,248,252))
    for h, x in zip(headers, hx):
        d.text((x, 158), h, font=font(12, True), fill=GRAY)
    
    invoices = [
        ("240519", "Acme Corp", "¥80,000", "2026-05-19", "paid", "(200,240,220)"),
        ("240518", "TechStartup Inc", "¥120,000", "2026-05-18", "sent", "(255,243,205)"),
        ("240515", "Design Studio", "¥45,000", "2026-05-15", "draft", "(240,240,240)"),
    ]
    for i, (num, client, total, date, status, sc) in enumerate(invoices):
        y2 = 185 + i*52
        bg2 = WHITE if i%2==0 else (250,251,255)
        d.rectangle([80, y2, 1200, y2+50], fill=bg2)
        scol = {"paid": (46,125,50), "sent": (121,85,72), "draft": (100,100,100)}[status]
        sbg = {"paid": (200,240,220), "sent": (255,243,205), "draft": (240,240,240)}[status]
        for val, x in zip([num, client, total, date], hx[:4]):
            d.text((x, y2+15), val, font=font(13), fill=DARK)
        d.rectangle([hx[4], y2+8, hx[4]+80, y2+38], fill=sbg)
        d.text((hx[4]+8, y2+14), status, font=font(12, True), fill=scol)
        d.rectangle([hx[5], y2+8, hx[5]+70, y2+38], fill=BG, outline=LIGHT, width=1)
        d.text((hx[5]+10, y2+14), "PDF", font=font(12, True), fill=MONDAY_BLUE)
    return img

def slide8_cta():
    img, d = slide_base(False)
    for y in range(H):
        ratio = y / H
        r = int(3 + ratio * 20)
        g = int(127 - ratio * 50)
        b = int(76 + ratio * 30)
        d.line([(0,y),(W,y)], fill=(r,g,b))
    
    d.text((W//2, 160), "InvoiceGen for monday.com", font=font(52, True), fill=WHITE, anchor="mm")
    d.text((W//2, 230), "Stop copying data. Start invoicing in 2 clicks.", font=font(24), fill=(200,240,220), anchor="mm")
    
    features = ["📄 PDF invoices from board items","🏢 Company template","💰 Multi-currency","📋 Invoice history","✅ Free to install"]
    for i, f in enumerate(features):
        x = 120 + (i % 3) * 340
        y = 300 + (i // 3) * 70
        d.text((x, y), f, font=font(18), fill=WHITE)
    
    d.rectangle([W//2-200, 480, W//2+200, 530], fill=WHITE)
    d.text((W//2, 505), "App ID: 11340908", font=font(20, True), fill=INVOICE_GREEN, anchor="mm")
    d.text((W//2, 570), "monday.com App Marketplace", font=font(16), fill=(200,240,220), anchor="mm")
    return img

# Generate slides
print("Creating demo video...")
slides = [
    slide1_title(),
    slide2_problem(),
    slide3_solution(),
    slide4_board_view(),
    slide5_column_mapping(),
    slide6_client_info(),
    slide7_history(),
    slide8_cta(),
]

titles = ["Title","Problem","Solution","Board View","Column Mapping","Generate PDF","History","CTA"]

# Save individual screenshots
os.makedirs("/Users/kakeru/Desktop/app3/scripts/demo_frames", exist_ok=True)
for i, (slide, title) in enumerate(zip(slides, titles)):
    slide.save(f"/Users/kakeru/Desktop/app3/scripts/demo_frames/slide_{i+1:02d}_{title}.png")
    print(f"  Saved slide {i+1}: {title}")

# Create MP4
output_path = "/Users/kakeru/Desktop/app3/scripts/invoicegen_demo.mp4"
frames = []
for slide in slides:
    arr = np.array(slide)
    for _ in range(FPS * HOLD):
        frames.append(arr)

writer = imageio.get_writer(output_path, fps=FPS, codec='libx264', quality=8, macro_block_size=None)
for frame in frames:
    writer.append_data(frame)
writer.close()

size = os.path.getsize(output_path) // 1024
print(f"\nDemo video created: {output_path} ({size} KB)")
print(f"Duration: {len(slides) * HOLD}s | Resolution: {W}x{H}")
