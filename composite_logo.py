import sys
from PIL import Image, ImageEnhance

base_img_path = r"C:\Users\lilya\.gemini\antigravity\brain\554cd880-204a-44fb-94e1-cf33aa032b18\people_meeting_fabric8_1785448860987.png"
logo_path = "assets/fabric8_logo_noneedle_cropped.png"
out_path = "assets/people_meeting_success.png"

base = Image.open(base_img_path).convert("RGBA")
logo = Image.open(logo_path).convert("RGBA")

bw, bh = base.size

target_logo_width = int(bw * 0.2)
aspect_ratio = logo.size[1] / logo.size[0]
target_logo_height = int(target_logo_width * aspect_ratio)

logo = logo.resize((target_logo_width, target_logo_height), Image.Resampling.LANCZOS)

alpha = logo.split()[3]
alpha = ImageEnhance.Brightness(alpha).enhance(0.7)
logo.putalpha(alpha)

x = int(bw * 0.75)
y = int(bh * 0.15)

base.paste(logo, (x, y), logo)

base.convert("RGB").save(out_path, "PNG")
print(f"Composited logo and saved to {out_path}")
