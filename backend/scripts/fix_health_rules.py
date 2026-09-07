import json
import os

RULES_FILE = "data/expanded_health_rules.json"

def main():
    if not os.path.exists(RULES_FILE):
        print(f"Error: {RULES_FILE} not found.")
        return

    with open(RULES_FILE, "r", encoding="utf-8") as f:
        rules = json.load(f)

    # 1. Remove weather entries
    weather_ids = {"Weather-Based Picks", "Weather-Optimized Nutrition", "weather"}
    rules = [r for r in rules if r.get("id") not in weather_ids]

    # 2. Add exact weather entry
    weather_rule = {
        "id": "weather",
        "condition": "weather",
        "synonyms": ["weather", "discover food", "healthy foods", "what to eat", "suggest food"],
        "allowed_food": ["curd rice", "khichdi", "dal tadka", "moong dal", "tomato soup", "ragi dosa", "poha", "upma", "idli", "rasam", "vegetable biryani", "chana masala", "methi thepla", "saag paneer", "jeera rice"],
        "avoid_food": ["fried food", "heavy desserts", "processed food", "alcohol", "sugary drinks"],
        "source": "curated"
    }
    rules.append(weather_rule)

    # 3. Replacements map
    replacements = {
        "warm water": "rasam",
        "water": "coconut water",
        "lemon water": "ginger tea",
        "honey lemon water": "ginger tea",
        "soft diet": "khichdi",
        "calcium rich food": "ragi dosa",
        "high fiber veg": "vegetable soup",
        "lean protein": "grilled chicken",
        "iodized salt": "idli",
        "oats leaves": "oatmeal",
        "boiled veggies": "mixed vegetable sabzi",
        "boiled potato": "poha",
        "barley water": "buttermilk",
        "fennel seeds": "jeera rice",
        "flax seeds": "daliya",
        "olive oil": "grilled fish",
        "turmeric": "turmeric milk",
        "dalia": "daliya",
        "idlis": "idli",
        "dairy": "curd rice",
        "dal with chawal": "dal chawal"
    }

    # 4. Apply replacements and lowercase
    for r in rules:
        for list_name in ["allowed_food", "avoid_food"]:
            if list_name in r:
                new_list = []
                for item in r[list_name]:
                    item_lower = item.lower().strip()
                    # Apply substitution if exists, otherwise keep lowercase
                    if item_lower in replacements:
                        new_list.append(replacements[item_lower])
                    else:
                        new_list.append(item_lower)
                # Deduplicate and update
                r[list_name] = list(dict.fromkeys(new_list))

    with open(RULES_FILE, "w", encoding="utf-8") as f:
        json.dump(rules, f, indent=4, ensure_ascii=False)
    
    print("Fix 1 & 2 applied successfully.")

if __name__ == "__main__":
    main()
