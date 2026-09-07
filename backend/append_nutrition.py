import csv
import os

csv_file = 'data/nutrition_master.csv'

# Item Name,Calories (kcal),Carbohydrates (g),Protein (g),Fats (g),Fiber (g),Sodium (mg)
new_rows = [
    ['khichdi', '150', '28', '6', '3', '2', '0'],
    ['idli', '58', '12', '2', '0.4', '0.5', '0'],
    ['rasam', '30', '5', '1', '0.5', '0.5', '0'],
    ['oatmeal', '150', '27', '5', '3', '4', '0'],
    ['poha', '250', '50', '4', '3', '2', '0'],
    ['daliya', '150', '30', '5', '1', '4', '0'],
    ['moong dal', '120', '20', '8', '0.5', '4', '0'],
    ['brown rice', '215', '45', '5', '1.5', '3', '0'],
]

existing_items = set()
with open(csv_file, 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    next(reader) # skip header
    for row in reader:
        if row:
            existing_items.add(row[0].strip().lower())

with open(csv_file, 'a', encoding='utf-8', newline='') as f:
    writer = csv.writer(f)
    for row in new_rows:
        if row[0] not in existing_items:
            writer.writerow(row)
            print(f"Added {row[0]}")
