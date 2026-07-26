
import json

mapping = {
    'F8-001': {'finishes': ['Embroidery', 'DTF'], 'placements': ['Left Chest', 'Right Chest', 'Full Back', 'Upper Left Sleeve', 'Upper Right Sleeve']},
    'F8-002': {'finishes': ['Embroidery'], 'placements': ['Left Chest', 'Full Back']},
    'F8-003': {'finishes': ['Embroidery'], 'placements': ['Full Back', 'Front Left Chest Pocket']},
    'F8-004': {'finishes': [], 'placements': []}, # N/A
    'F8-005': {'finishes': ['Embroidery'], 'placements': ['Front Center']},
    'F8-006': {'finishes': ['Embroidery', 'DTF'], 'placements': ['Front Center']},
    'F8-007': {'finishes': ['Embroidery'], 'placements': ['Left Chest']},
    'F8-008': {'finishes': ['Embroidery'], 'placements': ['Right Thigh Pocket', 'Left Thigh Pocket']},
    'F8-009': {'finishes': [], 'placements': []}, # N/A
    'F8-010': {'finishes': ['Embroidery', 'DTF'], 'placements': ['Front Center Panel', 'Side Panel']},
    'F8-011': {'finishes': ['Embroidery'], 'placements': ['Left Chest', 'Right Chest', 'Upper Left Sleeve']},
    'F8-012': {'finishes': ['Embroidery'], 'placements': ['Left Chest', 'Right Chest', 'Upper Left Sleeve']},
    'F8-013': {'finishes': [], 'placements': []}, # N/A
    'F8-014': {'finishes': ['Embroidery', 'DTF'], 'placements': ['Bottom Left Corner', 'Bottom Right Corner']},
    'F8-015': {'finishes': ['Embroidery', 'DTF'], 'placements': ['Center Pocket', 'Bottom Left/Right Corner']},
    'F8-016': {'finishes': ['Embroidery', 'DTF'], 'placements': ['Left Corner', 'Right Corner']},
    'F8-017': {'finishes': ['Embroidery', 'DTF'], 'placements': ['Center Pocket', 'Left Corner', 'Right Corner']},
    'F8-018': {'finishes': ['DTF'], 'placements': ['Left Chest', 'Right Chest', 'Full Front', 'Full Back', 'Sleeve']},
    'F8-019': {'finishes': ['DTF'], 'placements': ['Left Chest', 'Full Front', 'Full Back', 'Sleeve']},
    'F8-020': {'finishes': ['DTF'], 'placements': ['Left Chest', 'Right Chest', 'Full Back', 'Sleeve']},
    'F8-021': {'finishes': ['DTF'], 'placements': ['Left Chest', 'Right Chest', 'Full Back', 'Sleeve', 'Collar']},
    'F8-022': {'finishes': ['Embroidery'], 'placements': ['Left Chest', 'Right Chest', 'Full Back', 'Sleeve']},
    'F8-023': {'finishes': ['Embroidery', 'DTF'], 'placements': ['Left Chest', 'Full Front', 'Full Back', 'Sleeve', 'Hood']},
    'F8-024': {'finishes': ['Embroidery', 'DTF'], 'placements': ['Left Chest', 'Right Chest', 'Full Back', 'Sleeve', 'Hood']},
    'F8-025': {'finishes': ['Embroidery', 'DTF'], 'placements': ['Left Chest', 'Right Chest', 'Full Back', 'Sleeve']}
}

with open('data/products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

for p in products:
    sku = p.get('sku')
    if sku in mapping:
        p['supportedFinishes'] = mapping[sku]['finishes']
        p['supportedPlacements'] = mapping[sku]['placements']

with open('data/products.json', 'w', encoding='utf-8') as f:
    json.dump(products, f, indent=2)

print('Updated branding mapping')

