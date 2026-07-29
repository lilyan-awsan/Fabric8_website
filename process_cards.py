from PIL import Image
import glob
import os

files = sorted(glob.glob('assets/needs/values1-*.png'))
out_names = ['partnership', 'precision', 'transparency', 'reliability', 'quality', 'sustainability']

for i, f in enumerate(files):
    if i >= len(out_names): break
    
    img = Image.open(f).convert("RGBA")
    datas = img.getdata()
    
    newData = []
    # Get top-left pixel color as the background to remove (usually white or black)
    bg_color = datas[0]
    
    # We will remove pixels that are very close to bg_color
    threshold = 10
    
    for item in datas:
        if abs(item[0] - bg_color[0]) < threshold and abs(item[1] - bg_color[1]) < threshold and abs(item[2] - bg_color[2]) < threshold:
            # Change to transparent
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)
            
    img.putdata(newData)
    
    # Also crop the transparent borders
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    out_path = f"assets/values_{out_names[i]}.png"
    img.save(out_path, "PNG")
    print(f"Processed {f} -> {out_path}")
