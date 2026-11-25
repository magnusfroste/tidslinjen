#!/usr/bin/env python3
"""Ritar appikoner (favicon-48, icon-192, icon-512, maskable, apple-touch) i PIL –
motivet är tidslinjen: tre prick på en linje, sista pricken i stjärngult."""
from PIL import Image, ImageDraw

ACCENT = (63, 143, 132, 255)
GOLD = (224, 161, 58, 255)
PAPER = (233, 244, 241, 255)

def draw_icon(size, pad=0.10, ss=4):
    """Motivet ritas i skala och frånleks för skarpa kanter."""
    S = size * ss
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, S - 1, S - 1], radius=int(S * 0.22), fill=ACCENT)
    # linjen (vit) och tre prickar, med marginal = maskable-safe-området
    cy = S // 2
    x0, x1 = int(S * (0.5 - 0.30 + pad)), int(S * (0.5 + 0.30 - pad))
    d.rounded_rectangle([x0, cy - int(S * 0.035), x1, cy + int(S * 0.035)],
                        radius=int(S * 0.035), fill=PAPER)
    r = int(S * 0.10)
    n = 3
    for k in range(n):
        cx = x0 + (x1 - x0) * k // (n - 1)
        fill = GOLD if k == n - 1 else PAPER
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=fill, outline=ACCENT, width=int(S * 0.03))
    img = img.resize((size, size), Image.LANCZOS)
    return img

if __name__ == "__main__":
    import os
    out = os.path.join(os.path.dirname(__file__), "public")
    draw_icon(48).save(os.path.join(out, "favicon-48.png"))
    draw_icon(192).save(os.path.join(out, "icon-192.png"))
    draw_icon(512).save(os.path.join(out, "icon-512.png"))
    # maskable: mindre motiv (remdirad cirkelmask)
    draw_icon(512, pad=0.22).save(os.path.join(out, "icon-maskable-512.png"))
    draw_icon(180).save(os.path.join(out, "apple-touch-icon.png"))
    print("ikoner skrivna")