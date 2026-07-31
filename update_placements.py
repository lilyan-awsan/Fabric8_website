import json
import os

products_file = 'data/products.json'

with open(products_file, 'r', encoding='utf-8') as f:
    products = json.load(f)

table_data = {
    "Polo Shirt": {"cap": "Both", "placements": ["Left Chest", "Right Chest", "Full Back", "Upper Left Sleeve", "Upper Right Sleeve"]},
    "Waiter Vest": {"cap": "Embroidery", "placements": ["Left Chest", "Full Back"]},
    "Cargo Vest": {"cap": "Embroidery", "placements": ["Full Back", "Front Left Chest Pocket"]},
    "Chef Hat": {"cap": "N/A", "placements": []},
    "Chef Beret": {"cap": "Embroidery", "placements": ["Front Center"]},
    "Chef Bandana": {"cap": "Both", "placements": ["Front Center"]},
    "Medical Lab Coats": {"cap": "Embroidery", "placements": ["Left Chest"]},
    "Cargo Pants": {"cap": "Embroidery", "placements": ["Right Thigh Pocket", "Left Thigh Pocket"]},
    "Workwear/Waiter Pants": {"cap": "N/A", "placements": []},
    "Caps": {"cap": "Both", "placements": ["Front Center Panel", "Side Panel"]},
    "Chef Jackets": {"cap": "Embroidery", "placements": ["Left Chest", "Right Chest", "Upper Left Sleeve"]},
    "Medical Scrubs": {"cap": "Embroidery", "placements": ["Left Chest", "Right Chest", "Upper Left Sleeve"]},
    "Chef Pants": {"cap": "N/A", "placements": []},
    "Full Apron": {"cap": "Both", "placements": ["Bottom Left Corner", "Bottom Right Corner"]},
    "Full Apron W/ Pocket": {"cap": "Both", "placements": ["Center Pocket", "Bottom Left Corner", "Bottom Right Corner"]},
    "Half Apron": {"cap": "Both", "placements": ["Left Corner", "Right Corner"]},
    "Half Apron W/ Pocket": {"cap": "Both", "placements": ["Center Pocket", "Left Corner", "Right Corner"]},
    "T-shirt": {"cap": "DTF", "placements": ["Left Chest", "Right Chest", "Full Front", "Full Back", "Sleeve"]},
    "OVERSIZED T-shirt": {"cap": "DTF", "placements": ["Left Chest", "Full Front", "Full Back", "Sleeve"]},
    "Dri-Fit T-shirt": {"cap": "DTF", "placements": ["Left Chest", "Right Chest", "Full Back", "Sleeve"]},
    "Dri-Fit Polo": {"cap": "DTF", "placements": ["Left Chest", "Right Chest", "Full Back", "Sleeve", "Collar"]},
    "Shirts": {"cap": "Embroidery", "placements": ["Left Chest", "Right Chest", "Full Back", "Sleeve"]},
    "Hoodie": {"cap": "Both", "placements": ["Left Chest", "Full Front", "Full Back", "Sleeve", "Hood"]},
    "Zip-up Hoodie": {"cap": "Both", "placements": ["Left Chest", "Right Chest", "Full Back", "Sleeve", "Hood"]},
    "Puffer Jacket": {"cap": "Both", "placements": ["Left Chest", "Right Chest", "Full Back", "Sleeve"]}
}

for p in products:
    name = p['name']
    if name in table_data:
        data = table_data[name]
        p['customizationCapability'] = data['cap']
        
        # Build placement objects with default coords
        # In a real app we'd define x/y specific to each, but for now we give generic ones
        # which can be adjusted in the admin dashboard later.
        placement_objects = []
        for p_name in data['placements']:
            # generic default coords
            placement_objects.append({
                "name": p_name,
                "x": 50,
                "y": 30,
                "w": 15,
                "h": 15
            })
        p['placements'] = placement_objects

with open(products_file, 'w', encoding='utf-8') as f:
    json.dump(products, f, indent=2)

print("Successfully updated products.json")
