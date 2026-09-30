import json
import os
from pathlib import Path

# Paths are resolved from the backend/ folder, so the script works from any directory
BACKEND_DIR = Path(__file__).resolve().parent.parent

mapping_file = BACKEND_DIR / 'data' / 'weather_food_mapping.json'
with open(mapping_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

replacements = {
    'soda': 'nimbu pani',
    'ice cream': 'kulfi',
    'waffles': 'rava idli',
    'churros': 'jalebi',
    'donuts': 'gulab jamun',
    'french fries': 'aloo tikki',
    'gelato': 'kulfi',
    'bubble tea': 'masala chai',
    'garlic knots': 'garlic naan',
    'nachos': 'bhel puri',
}
to_remove = ['soda', 'slushie', 'iced latte', 'gelato', 'bubble tea', 'lava cake', 'churros', 'crepes', 'waffles', 'garlic knots', 'donuts', 'cookies', 'nachos', 'french fries', 'ice cream']

for weather_type, groups in data.items():
    for group_name, items in groups.items():
        if isinstance(items, list):
            new_items = []
            for item in items:
                if item in replacements:
                    new_items.append(replacements[item])
                elif item in to_remove:
                    pass
                else:
                    new_items.append(item)
            seen = set()
            dedup_items = []
            for x in new_items:
                if x not in seen:
                    dedup_items.append(x)
                    seen.add(x)
            data[weather_type][group_name] = dedup_items

with open(mapping_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=4)
print('Updated weather_food_mapping.json')

health_rules_file = BACKEND_DIR / 'data' / 'expanded_health_rules.json'
with open(health_rules_file, 'r', encoding='utf-8') as f:
    health_data = json.load(f)

lactose = {
  'id': 'lactose_intolerance',
  'condition': 'Lactose Intolerance',
  'synonyms': ['lactose intolerant', 'lactose intolerance', 'milk allergy', 'dairy intolerant', 'dairy allergy'],
  'allowed_food': ['coconut water', 'oatmeal', 'daliya', 'poha', 'fruit juice', 'rasam', 'idli', 'dosa', 'upma', 'khichdi', 'moong dal', 'brown rice', 'banana', 'fruit bowl'],
  'avoid_food': ['milk', 'curd', 'paneer', 'lassi', 'buttermilk', 'cheese', 'ghee', 'butter', 'yogurt', 'cream', 'curd rice', 'turmeric milk', 'lassi']
}

if not any(r['id'] == lactose['id'] for r in health_data):
    health_data.append(lactose)
    with open(health_rules_file, 'w', encoding='utf-8') as f:
        json.dump(health_data, f, indent=4)
    print('Added lactose_intolerance to expanded_health_rules.json')
else:
    print('lactose_intolerance already exists')
