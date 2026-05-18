#!/usr/bin/env python3
"""
汎用デモ動画生成スクリプト
PIL でフレームを生成し imageio-ffmpeg で MP4 に変換する。

使い方:
  1. SCENES と設定変数を新プロジェクト用に変更する
  2. python3 create_demo_video.py
  3. demo.mp4 が生成される

依存:
  pip3 install Pillow imageio-ffmpeg
"""

from PIL import Image, ImageDraw, ImageFont
import os, tempfile, glob

# ============================================================
# ここを新プロジェクト用に編集する
# ============================================================
OUTPUT_FILE   = "demo.mp4"
FPS           = 24
BG_COLOR      = (15, 23, 42)       # 背景色
PRIMARY_COLOR = (37, 99, 235)      # プログレスバー色
TEXT_COLOR    = (248, 250, 252)    # タイトル色
SUB_COLOR     = (148, 163, 184)    # サブタイトル色
WIDTH, HEIGHT = 1280, 720

# シーン定義: (表示秒数, タイトル, サブタイトル)
SCENES = [
    (2.5, "Step 1: Connect your account", "Click 'Add to [Platform]'"),
    (2.5, "Step 2: Choose a trigger",     "e.g. Status changes to 'Done'"),
    (2.5, "Step 3: Set the recipient",    "Pick the phone / email column"),
    (2.5, "Step 4: Save & activate",      "Automations run instantly"),
    (3.0, "Done!",                        "Messages sent automatically — no code required"),
]
# ============================================================


def _font(size):
    for p in ["/System/Library/Fonts/Helvetica.ttc",
              "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"]:
        try:
            return ImageFont.truetype(p, size)
        except Exception:
            pass
    return ImageFont.load_default()


def draw_frame(draw, title, subtitle, progress):
    W, H = WIDTH, HEIGHT
    bar_w = int(W * progress)
    draw.rectangle([(0, H - 6), (bar_w, H)], fill=PRIMARY_COLOR)

    tf = _font(52)
    tb = draw.textbbox((0, 0), title, font=tf)
    draw.text(((W - (tb[2] - tb[0])) // 2, H // 2 - 60), title, font=tf, fill=TEXT_COLOR)

    sf = _font(30)
    sb = draw.textbbox((0, 0), subtitle, font=sf)
    draw.text(((W - (sb[2] - sb[0])) // 2, H // 2 + 20), subtitle, font=sf, fill=SUB_COLOR)


def generate_frames(tmpdir):
    total = sum(int(s * FPS) for s, _, _ in SCENES)
    idx = cum = 0
    for sec, title, subtitle in SCENES:
        n = int(sec * FPS)
        for i in range(n):
            img  = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
            draw = ImageDraw.Draw(img)
            draw_frame(draw, title, subtitle, (cum + i) / total)
            img.save(os.path.join(tmpdir, f"frame_{idx:05d}.png"))
            idx += 1
        cum += n
    print(f"✅ {idx} フレーム生成完了")


def encode_video(tmpdir):
    try:
        import imageio_ffmpeg
        ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        print("❌ imageio-ffmpeg が見つかりません: pip3 install imageio-ffmpeg")
        return

    list_file = os.path.join(tmpdir, "frames.txt")
    frames    = sorted(glob.glob(os.path.join(tmpdir, "frame_*.png")))
    with open(list_file, "w") as f:
        for fp in frames:
            f.write(f"file '{fp}'\nduration {1/FPS:.6f}\n")
        if frames:
            f.write(f"file '{frames[-1]}'\n")

    cmd = (f'"{ffmpeg}" -y -f concat -safe 0 -i "{list_file}" '
           f'-vf scale={WIDTH}:{HEIGHT} -c:v libx264 -crf 23 -preset fast '
           f'-pix_fmt yuv420p "{OUTPUT_FILE}"')
    if os.system(cmd) == 0:
        print(f"✅ 動画生成完了: {OUTPUT_FILE} ({os.path.getsize(OUTPUT_FILE)//1024} KB)")
    else:
        print("❌ ffmpeg エラー")


if __name__ == "__main__":
    with tempfile.TemporaryDirectory() as tmpdir:
        generate_frames(tmpdir)
        encode_video(tmpdir)
