from PIL import Image, ImageDraw

def process_image(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    
    # Use a very strict threshold to ensure we don't eat into the white shirt!
    # The background must be exactly pure white or very close.
    ImageDraw.floodfill(img, (0, 0), (255, 255, 255, 0), thresh=2)
    ImageDraw.floodfill(img, (img.width-1, 0), (255, 255, 255, 0), thresh=2)
    ImageDraw.floodfill(img, (0, img.height-1), (255, 255, 255, 0), thresh=2)
    ImageDraw.floodfill(img, (img.width-1, img.height-1), (255, 255, 255, 0), thresh=2)
    
    img.save(output_path, "PNG")

process_image("polo_shirt.png", "White Polo Shirt.png")
process_image("polo_shirt.png", "White Shirt.png")
