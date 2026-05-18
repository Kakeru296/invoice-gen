#!/usr/bin/env python3
"""
汎用アプリ素材生成スクリプト
- アイコン: 192×192px PNG
- AppCard: 592×348px PNG

使い方:
  1. 下の設定変数を新プロジェクト用に変更する
  2. python3 create_assets.py
  3. icon_192x192.png と app_card_592x348.png が OUTPUT_DIR に生成される

依存:
  pip3 install Pillow
"""

from PIL import Image, ImageDraw, ImageFont
import os

# ============================================================
# ここを新プロジェクト用に編集する
# ============================================================
APP_NAME    = "Your App"           # アプリ名（AppCard に表示）
APP_TAGLINE = "Your tagline here"  # キャッチコピー（AppCard に表示）
EMOJI       = "🔔"                 # アイコン中央の絵文字
PRIMARY_COLOR = (37, 99, 235)      # メインカラー RGB
ACCENT_COLOR  = (29, 78, 216)      # グラデーション用サブカラー RGB
TEXT_COLOR    = (255, 255, 255)    # テキスト色
OUTPUT_DIR    = "."                # 出力先ディレクトリ
# ============================================================


def _font(size, emoji=False):
    paths = (
        ["/System/Library/Fonts/Apple Color Emoji.ttc"] if emoji else
        ["/System/Library/Fonts/Helvetica.ttc",
         "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"]
    )
    for p in paths:
        try:
            return ImageFont.truetype(p, size)
        except Exception:
            pass
    return ImageFont.load_default()


def make_icon(size=192):
    img  = Image.new("RGB", (size, size), PRIMARY_COLOR)
    draw = ImageDraw.Draw(img)

    ef = _font(int(size * 0.45), emoji=True)
    bb = draw.textbbox((0, 0), EMOJI, font=ef)
    x  = (size - (bb[2] - bb[0])) // 2 - bb[0]
    y  = (size - (bb[3] - bb[1])) // 2 - bb[1] - int(size * 0.05)
    draw.text((x, y), EMOJI, font=ef, embedded_color=True)

    label = APP_NAME[:2].upper()
    lf    = _font(int(size * 0.18))
    lb    = draw.textbbox((0, 0), label, font=lf)
    draw.text(((size - (lb[2] - lb[0])) // 2, size - int(size * 0.22)),
              label, font=lf, fill=TEXT_COLOR)

    out = os.path.join(OUTPUT_DIR, "icon_192x192.png")
    img.save(out)
    print(f"✅ アイコン生成: {out}")


def make_app_card(width=592, height=348):
    img  = Image.new("RGB", (width, height), PRIMARY_COLOR)
    draw = ImageDraw.Draw(img)

    for x in range(width):
        r_ = int(PRIMARY_COLOR[0] + (ACCENT_COLOR[0] - PRIMARY_COLOR[0]) * x / width)
        g_ = int(PRIMARY_COLOR[1] + (ACCENT_COLOR[1] - PRIMARY_COLOR[1]) * x / width)
        b_ = int(PRIMARY_COLOR[2] + (ACCENT_COLOR[2] - PRIMARY_COLOR[2]) * x / width)
        draw.line([(x, 0), (x, height)], fill=(r_, g_, b_))

    ef = _font(64, emoji=True)
    draw.text((50, 60), EMOJI, font=ef, embedded_color=True)

    tf = _font(52)
    draw.text((50, 145), APP_NAME, font=tf, fill=TEXT_COLOR)

    sf = _font(26)
    draw.text((50, 215), APP_TAGLINE, font=sf, fill=(200, 220, 255))

    draw.rectangle([(50, 270), (width - 50, 272)], fill=(255, 255, 255))

    out = os.path.join(OUTPUT_DIR, "app_card_592x348.png")
    img.save(out)
    print(f"✅ AppCard 生成: {out}")


if __name__ == "__main__":
    make_icon()
    make_app_card()
    print("完了。")
