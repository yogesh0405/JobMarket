import os
from PIL import Image, ImageDraw, ImageFont

# Load crisp base image (1376 x 768)
base = Image.open('/Users/yogesh/Desktop/JobMarket/MobileApp/assets/login_city_header.jpg').convert('RGBA')
W, H = base.size

# We work on a 2x canvas for super-crisp antialiasing, then downsample with LANCZOS
SCALE = 2
w_scaled = W * SCALE
h_scaled = H * SCALE

canvas = base.resize((w_scaled, h_scaled), Image.Resampling.LANCZOS)
draw = ImageDraw.Draw(canvas, 'RGBA')

font_candidates = [
    '/System/Library/Fonts/SFProText-Bold.otf',
    '/System/Library/Fonts/SFProDisplay-Bold.otf',
    '/System/Library/Fonts/Helvetica.ttc',
    '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
    '/Library/Fonts/Arial Bold.ttf',
]

def get_font(size, bold=True):
    for fc in font_candidates:
        if os.path.exists(fc):
            try:
                return ImageFont.truetype(fc, size * SCALE)
            except:
                pass
    return ImageFont.load_default()

font_badge_title = get_font(13.5, bold=True)
font_badge_sub = get_font(10.5, bold=False)

# Colors
NAVY = (30, 37, 94, 255)         # #1E255E
LAPEL = (20, 26, 68, 255)
PRIMARY_BLUE = (10, 88, 226, 255) # #0A58E2
LIGHT_BLUE = (219, 234, 254, 255) # #DBEAFE
WHITE = (255, 255, 255, 255)
CARD_BG = (255, 255, 255, 248)
BORDER_COLOR = (191, 219, 254, 255) # #BFDBFE
SLATE_TEXT = (100, 116, 139, 255) # #64748B
GREEN_BG = (220, 252, 231, 255)  # #DCFCE7
GREEN_ICON = (22, 163, 74, 255)   # #16A34A
BLUE_BG = (239, 246, 255, 255)   # #EFF6FF
AMBER_ICON = (234, 179, 8, 255)
SKIN = (238, 185, 148, 255)
DARK_PANTS = (24, 32, 79, 255)
SHOES = (15, 23, 42, 255)

# --- 1. DRAW NATURAL MODERN PROFESSIONAL (Proportional Height ~340px at 1x) ---
cx = 330 * SCALE
ground_y = 680 * SCALE

# Soft ground shadow
draw.ellipse([cx - 75*SCALE, ground_y - 6*SCALE, cx + 75*SCALE, ground_y + 10*SCALE], fill=(147, 197, 253, 90))

# Legs (natural stance: height ~160px at 1x)
# Hip y = ground_y - 170*SCALE
hip_y = ground_y - 170*SCALE

# Left leg
draw.polygon([
    (cx - 22*SCALE, hip_y),
    (cx - 3*SCALE, hip_y),
    (cx - 6*SCALE, ground_y - 12*SCALE),
    (cx - 24*SCALE, ground_y - 12*SCALE),
], fill=DARK_PANTS)

# Right leg (slight natural angle)
draw.polygon([
    (cx + 3*SCALE, hip_y),
    (cx + 22*SCALE, hip_y),
    (cx + 28*SCALE, ground_y - 12*SCALE),
    (cx + 10*SCALE, ground_y - 12*SCALE),
], fill=DARK_PANTS)

# Shoes (sleek dress shoes)
draw.rounded_rectangle([cx - 28*SCALE, ground_y - 14*SCALE, cx - 2*SCALE, ground_y], radius=3*SCALE, fill=SHOES)
draw.rounded_rectangle([cx + 6*SCALE, ground_y - 14*SCALE, cx + 32*SCALE, ground_y], radius=3*SCALE, fill=SHOES)

# Belt
draw.rectangle([cx - 24*SCALE, hip_y - 6*SCALE, cx + 24*SCALE, hip_y], fill=SHOES)
draw.rectangle([cx - 4*SCALE, hip_y - 6*SCALE, cx + 4*SCALE, hip_y], fill=AMBER_ICON)

# Torso (Suit Jacket, height ~130px at 1x)
shoulder_y = hip_y - 130*SCALE
draw.polygon([
    (cx - 42*SCALE, shoulder_y), # left shoulder
    (cx + 42*SCALE, shoulder_y), # right shoulder
    (cx + 30*SCALE, hip_y),      # right waist
    (cx - 30*SCALE, hip_y),      # left waist
], fill=NAVY)

# White dress shirt V-neck
draw.polygon([
    (cx - 16*SCALE, shoulder_y),
    (cx + 16*SCALE, shoulder_y),
    (cx, shoulder_y + 70*SCALE),
], fill=WHITE)

# Tie (Royal blue)
draw.polygon([
    (cx - 5*SCALE, shoulder_y + 12*SCALE),
    (cx + 5*SCALE, shoulder_y + 12*SCALE),
    (cx + 6*SCALE, shoulder_y + 65*SCALE),
    (cx, shoulder_y + 78*SCALE),
    (cx - 6*SCALE, shoulder_y + 65*SCALE),
], fill=PRIMARY_BLUE)

# Suit Lapels
draw.polygon([
    (cx - 36*SCALE, shoulder_y),
    (cx - 14*SCALE, shoulder_y),
    (cx - 5*SCALE, shoulder_y + 70*SCALE),
    (cx - 24*SCALE, shoulder_y + 75*SCALE),
], fill=LAPEL)

draw.polygon([
    (cx + 36*SCALE, shoulder_y),
    (cx + 14*SCALE, shoulder_y),
    (cx + 5*SCALE, shoulder_y + 70*SCALE),
    (cx + 24*SCALE, shoulder_y + 75*SCALE),
], fill=LAPEL)

# Left Arm & Briefcase
draw.polygon([
    (cx - 42*SCALE, shoulder_y + 4*SCALE),
    (cx - 28*SCALE, shoulder_y + 4*SCALE),
    (cx - 48*SCALE, hip_y - 15*SCALE),
    (cx - 64*SCALE, hip_y - 15*SCALE),
], fill=NAVY)
# Left hand
draw.ellipse([cx - 66*SCALE, hip_y - 20*SCALE, cx - 46*SCALE, hip_y], fill=SKIN)

# Briefcase (modern leather with handle)
bc_x = cx - 85*SCALE
bc_y = hip_y - 10*SCALE
bc_w = 42*SCALE
bc_h = 32*SCALE
draw.rounded_rectangle([bc_x, bc_y, bc_x + bc_w, bc_y + bc_h], radius=5*SCALE, fill=PRIMARY_BLUE, outline=NAVY, width=int(1.5*SCALE))
draw.arc([bc_x + 13*SCALE, bc_y - 8*SCALE, bc_x + 29*SCALE, bc_y + 4*SCALE], start=180, end=0, fill=NAVY, width=int(2*SCALE))
draw.rectangle([bc_x + 18*SCALE, bc_y + 10*SCALE, bc_x + 24*SCALE, bc_y + 15*SCALE], fill=AMBER_ICON)

# Right Arm (slightly bent, hand in pocket)
draw.polygon([
    (cx + 42*SCALE, shoulder_y + 4*SCALE),
    (cx + 28*SCALE, shoulder_y + 4*SCALE),
    (cx + 38*SCALE, hip_y - 10*SCALE),
    (cx + 52*SCALE, hip_y - 10*SCALE),
], fill=NAVY)
draw.ellipse([cx + 36*SCALE, hip_y - 15*SCALE, cx + 52*SCALE, hip_y + 2*SCALE], fill=SKIN)

# Neck
draw.rectangle([cx - 8*SCALE, shoulder_y - 18*SCALE, cx + 8*SCALE, shoulder_y + 2*SCALE], fill=SKIN)

# Head (natural oval)
head_w = 20*SCALE
head_h = 24*SCALE
head_cy = shoulder_y - 28*SCALE
draw.ellipse([cx - head_w, head_cy - head_h, cx + head_w, head_cy + head_h], fill=SKIN)

# Ears
draw.ellipse([cx - head_w - 3*SCALE, head_cy - 4*SCALE, cx - head_w + 2*SCALE, head_cy + 6*SCALE], fill=SKIN)
draw.ellipse([cx + head_w - 2*SCALE, head_cy - 4*SCALE, cx + head_w + 3*SCALE, head_cy + 6*SCALE], fill=SKIN)

# Hair (professional styled)
draw.chord([cx - head_w - 2*SCALE, head_cy - head_h - 4*SCALE, cx + head_w + 2*SCALE, head_cy], start=170, end=370, fill=NAVY)
draw.polygon([
    (cx - head_w, head_cy - 6*SCALE),
    (cx - 8*SCALE, head_cy - 16*SCALE),
    (cx + 12*SCALE, head_cy - 16*SCALE),
    (cx + head_w, head_cy - 6*SCALE),
    (cx + head_w, head_cy - 14*SCALE),
    (cx - head_w, head_cy - 14*SCALE),
], fill=NAVY)


# --- 2. DRAW 3 FLOATING FEATURE CARDS (CLEAN & METICULOUS) ---
card_x = (cx // SCALE + 70) * SCALE
card_w = 265 * SCALE
card_h = 52 * SCALE

def draw_pill_card(x, y, w, h, radius, fill, border):
    # Soft drop shadow
    draw.rounded_rectangle([x + 2*SCALE, y + 4*SCALE, x + w + 2*SCALE, y + h + 4*SCALE], radius=radius, fill=(15, 23, 42, 20))
    # Card surface
    draw.rounded_rectangle([x, y, x + w, y + h], radius=radius, fill=fill, outline=border, width=int(1.2*SCALE))

# 1. DIRECT HIRING CARD
f1_y = ground_y - 265*SCALE
draw_pill_card(card_x, f1_y, card_w, card_h, 15*SCALE, CARD_BG, BORDER_COLOR)
# Icon Circle
ic1_x = card_x + 28*SCALE
ic1_y = f1_y + 26*SCALE
draw.ellipse([ic1_x - 14*SCALE, ic1_y - 14*SCALE, ic1_x + 14*SCALE, ic1_y + 14*SCALE], fill=GREEN_BG, outline=(134, 239, 172, 255), width=int(1*SCALE))
draw.line([ic1_x - 5*SCALE, ic1_y, ic1_x - 1*SCALE, ic1_y + 4*SCALE, ic1_x + 6*SCALE, ic1_y - 4*SCALE], fill=GREEN_ICON, width=int(2.2*SCALE), joint='curve')
# Text
draw.text((card_x + 52*SCALE, f1_y + 10*SCALE), "Direct Hiring", font=font_badge_title, fill=NAVY)
draw.text((card_x + 52*SCALE, f1_y + 29*SCALE), "Zero recruiter commission", font=font_badge_sub, fill=SLATE_TEXT)

# 2. TOP ENTERPRISES CARD
f2_y = ground_y - 200*SCALE
draw_pill_card(card_x, f2_y, card_w, card_h, 15*SCALE, CARD_BG, BORDER_COLOR)
# Icon Circle
ic2_x = card_x + 28*SCALE
ic2_y = f2_y + 26*SCALE
draw.ellipse([ic2_x - 14*SCALE, ic2_y - 14*SCALE, ic2_x + 14*SCALE, ic2_y + 14*SCALE], fill=BLUE_BG, outline=(147, 197, 253, 255), width=int(1*SCALE))
# Building silhouette
draw.rectangle([ic2_x - 6*SCALE, ic2_y - 7*SCALE, ic2_x + 6*SCALE, ic2_y + 7*SCALE], fill=PRIMARY_BLUE)
draw.rectangle([ic2_x - 4*SCALE, ic2_y - 5*SCALE, ic2_x - 2*SCALE, ic2_y - 2*SCALE], fill=WHITE)
draw.rectangle([ic2_x + 2*SCALE, ic2_y - 5*SCALE, ic2_x + 4*SCALE, ic2_y - 2*SCALE], fill=WHITE)
draw.rectangle([ic2_x - 4*SCALE, ic2_y, ic2_x - 2*SCALE, ic2_y + 3*SCALE], fill=WHITE)
draw.rectangle([ic2_x + 2*SCALE, ic2_y, ic2_x + 4*SCALE, ic2_y + 3*SCALE], fill=WHITE)
# Text
draw.text((card_x + 52*SCALE, f2_y + 10*SCALE), "Top Enterprises", font=font_badge_title, fill=NAVY)
draw.text((card_x + 52*SCALE, f2_y + 29*SCALE), "100% verified companies", font=font_badge_sub, fill=SLATE_TEXT)

# 3. FAST SHORTLIST CARD (Navy Accent Card)
f3_y = ground_y - 135*SCALE
draw_pill_card(card_x, f3_y, card_w, card_h, 15*SCALE, NAVY, PRIMARY_BLUE)
# Icon Circle
ic3_x = card_x + 28*SCALE
ic3_y = f3_y + 26*SCALE
draw.ellipse([ic3_x - 14*SCALE, ic3_y - 14*SCALE, ic3_x + 14*SCALE, ic3_y + 14*SCALE], fill=(42, 53, 128, 255), outline=AMBER_ICON, width=int(1*SCALE))
# Lightning
draw.polygon([
    (ic3_x + 1*SCALE, ic3_y - 7*SCALE),
    (ic3_x - 5*SCALE, ic3_y + 1*SCALE),
    (ic3_x - 1*SCALE, ic3_y + 1*SCALE),
    (ic3_x - 2*SCALE, ic3_y + 7*SCALE),
    (ic3_x + 5*SCALE, ic3_y - 1*SCALE),
    (ic3_x + 1*SCALE, ic3_y - 1*SCALE),
], fill=AMBER_ICON)
# Text
draw.text((card_x + 52*SCALE, f3_y + 10*SCALE), "Fast Shortlist", font=font_badge_title, fill=WHITE)
draw.text((card_x + 52*SCALE, f3_y + 29*SCALE), "Direct HR call & interviews", font=font_badge_sub, fill=LIGHT_BLUE)

# Downscale to crisp 1376 x 768
final_img = canvas.resize((W, H), Image.Resampling.LANCZOS).convert('RGB')
output_path = '/Users/yogesh/Desktop/JobMarket/MobileApp/assets/login_header_jobmarket_clean.jpg'
final_img.save(output_path, quality=96)
print('Updated login_header_jobmarket_clean.jpg successfully')
