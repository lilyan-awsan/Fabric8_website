from PIL import Image
import glob

files = sorted(glob.glob('assets/needs/values1-*.png'))
out_names = ['partnership', 'precision', 'transparency', 'reliability', 'quality', 'sustainability']

for i, f in enumerate(files):
    if i >= len(out_names): break
    
    img = Image.open(f).convert("RGBA")
    width, height = img.size
    
    # We want to crop the logo. The logo is roughly in the middle.
    # Text is at the top (y < 35%) and bottom (y > 60%).
    # Let's crop from y=30% to y=65%
    min_y = int(height * 0.30)
    max_y = int(height * 0.65)
    
    # Create a new image for the cropped area
    cropped = img.crop((0, min_y, width, max_y))
    
    # Get bounding box of non-transparent pixels
    bbox = cropped.getbbox()
    if bbox:
        cropped = cropped.crop(bbox)
        out_path = f"assets/icon_{out_names[i]}.png"
        cropped.save(out_path, "PNG")
        print(f"Extracted icon {out_names[i]} to {out_path}")
    else:
        print(f"Failed to find non-transparent pixels in {out_names[i]}")
