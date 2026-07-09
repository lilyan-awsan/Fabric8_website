from PIL import Image

def remove_white_bg(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()

    # The background is white (e.g. 255, 255, 255 or slightly off-white)
    # The shirt is also white, so we must be careful.
    # Actually, a better approach for a white shirt on a white background without rembg
    # is to do a flood fill from the corners!
    
    # Let's use ImageDraw to do a flood fill on the alpha channel.
    from PIL import ImageDraw
    
    # Create a mask
    mask = Image.new('L', img.size, 255) # 255 means keep
    
    # We want to fill the mask with 0 (transparent) starting from the corner.
    # The background is white.
    ImageDraw.floodfill(img, (0, 0), (255, 255, 255, 0), thresh=10)
    ImageDraw.floodfill(img, (img.width-1, 0), (255, 255, 255, 0), thresh=10)
    ImageDraw.floodfill(img, (0, img.height-1), (255, 255, 255, 0), thresh=10)
    ImageDraw.floodfill(img, (img.width-1, img.height-1), (255, 255, 255, 0), thresh=10)
    
    img.save(output_path, "PNG")

remove_white_bg("White Polo Shirt.png", "White Polo Shirt.png")
