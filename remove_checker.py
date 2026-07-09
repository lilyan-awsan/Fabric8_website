from PIL import Image

def remove_checkerboard(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    data = img.load()
    width, height = img.size
    
    # The top-left 128x128 is completely background checkerboard.
    # We will use it as a repeating tile to identify the background.
    pattern_w = 64
    pattern_h = 64
    
    # Store the pattern
    pattern = {}
    for y in range(pattern_h):
        for x in range(pattern_w):
            pattern[(x, y)] = data[x, y]
            
    # Iterate and remove matching pixels
    for y in range(height):
        for x in range(width):
            px = data[x, y]
            pat_px = pattern[(x % pattern_w, y % pattern_h)]
            
            # Calculate distance to handle slight compression noise
            dist = abs(px[0] - pat_px[0]) + abs(px[1] - pat_px[1]) + abs(px[2] - pat_px[2])
            
            # If it matches the checkerboard pattern, make it transparent
            if dist < 12:
                data[x, y] = (255, 255, 255, 0)
                
    img.save(output_path, "PNG")

remove_checkerboard("polo_shirt.png", "White Polo Shirt.png")
remove_checkerboard("polo_shirt.png", "White Shirt.png")
print("Done")
