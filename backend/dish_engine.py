import json
import threading
import os
import re
# Unused imports removed in local image migration
from recipe_service import get_recipe_by_name

# ──────────────────────────────────────────────────────
# FOOD CATEGORY CLASSIFICATION
# Used to route fruit/vegetable items to grocery stores
# instead of restaurants in app.py
# ──────────────────────────────────────────────────────

FOOD_CATEGORIES = {
    # FRUITS — suggest fruit/grocery shops
    "banana":            "FRUIT",
    "papaya":            "FRUIT",
    "mango":             "FRUIT",
    "apple":             "FRUIT",
    "stewed apple":      "FRUIT",
    "orange":            "FRUIT",
    "watermelon":        "FRUIT",
    "pomegranate":       "FRUIT",
    "guava":             "FRUIT",
    "pineapple":         "FRUIT",
    "pear":              "FRUIT",
    "grapes":            "FRUIT",
    "kiwi":              "FRUIT",
    "strawberry":        "FRUIT",
    "blueberry":         "FRUIT",
    "mango lassi":       "DRINK",  # processed, so restaurant ok

    # VEGETABLES — suggest vegetable markets / grocery stores
    "cucumber":          "VEGETABLE",
    "carrot":            "VEGETABLE",
    "spinach":           "VEGETABLE",
    "beetroot":          "VEGETABLE",
    "broccoli":          "VEGETABLE",
    "capsicum":          "VEGETABLE",
    "tomato":            "VEGETABLE",
    "banana stem":       "VEGETABLE",
    "raw papaya":        "VEGETABLE",

    # DRINKS — restaurants/cafes
    "buttermilk":        "DRINK",
    "coconut water":     "DRINK",
    "ginger tea":        "DRINK",
    "green tea":         "DRINK",
    "turmeric milk":     "DRINK",
    "honey lemon water": "DRINK",
    "cold coffee":       "DRINK",

    # SNACKS — bakeries/cafes
    "oatmeal":           "SNACK",
    "sprouts":           "SNACK",
    "salad":             "SNACK",
    "daliya":            "SNACK",

    # MEALS — restaurants (default)
    "idli":              "MEAL",
    "dosa":              "MEAL",
    "khichdi":           "MEAL",
    "curd rice":         "MEAL",
    "upma":              "MEAL",
    "poha":              "MEAL",
    "biryani":           "MEAL",
    "sambar":            "MEAL",
    "rasam":             "MEAL",
    "moong dal":         "MEAL",
    "moong dal soup":    "MEAL",
    "dal tadka":         "MEAL",
    "tomato soup":       "MEAL",
    "vegetable soup":    "MEAL",
    "chicken soup":      "MEAL",
    "paneer tikka":      "MEAL",
    "roti":              "MEAL",
    "whole grains":      "MEAL",
    "ragi dosa":         "MEAL",
    "moong dal khichdi": "MEAL",
    "dal chawal":        "MEAL",
    "saag paneer":       "MEAL",
    "grilled chicken":   "MEAL",
    "bajra roti":        "MEAL",
    "methi thepla":      "MEAL",
    "baingan bharta":    "MEAL",
    "jeera rice":        "MEAL",
    "mixed vegetable sabzi":  "MEAL",
    "lauki soup":        "MEAL",
    "dal palak":         "MEAL",
    "brown rice":        "MEAL",
    "rajma masala":      "MEAL",
    "chana masala":      "MEAL",
    "poha with peanuts": "MEAL",
    "grilled fish":      "MEAL",
}


def get_food_category(dish_norm: str) -> str:
    """Return FRUIT, VEGETABLE, DRINK, SNACK or MEAL for a dish name."""
    d = (dish_norm or "").lower().strip()
    if d in FOOD_CATEGORIES:
        return FOOD_CATEGORIES[d]
    # Keyword fallbacks
    for kw in ["apple", "mango", "banana", "orange", "papaya", "melon", "berry", "guava", "pear"]:
        if kw in d:
            return "FRUIT"
    for kw in ["spinach", "carrot", "beetroot", "cucumber", "vegetable", "broccoli", "capsicum"]:
        if kw in d:
            return "VEGETABLE"
    for kw in ["tea", "coffee", "milk", "water", "juice", "lassi", "smoothie", "drink"]:
        if kw in d:
            return "DRINK"
    return "MEAL"

# ──────────────────────────────────────────────────────
# CONFIG
# ──────────────────────────────────────────────────────
STATIC_IMAGES_PATH = "data/static_images.json"
file_lock = threading.Lock()

# ──────────────────────────────────────────────────────
# SEMANTIC NORMALIZATION
# ──────────────────────────────────────────────────────

CORE_ALIASES = {
    "khichdi":           ["moong dal khichdi", "dal khichdi", "plain khichdi", "mung khichdi"],
    "curd rice":         ["thayir sadam", "dahi chawal", "yogurt rice", "dahi rice"],
    "idli":              ["idly", "steamed rice cakes", "rice idli"],
    "dosa":              ["dosai", "rice crepe", "masala dosa", "plain dosa"],
    "biryani":           ["biriyani", "veg biryani", "vegetable biryani"],
    "banana":            ["ripe banana", "yellow banana", "kela"],
    "honey lemon water": ["lemon honey water", "nimbu paani with honey"],
    "ginger tea":        ["adrak chai", "ginger infusion", "adrak tea"],
    "oatmeal":           ["oats porridge", "masala oats", "porridge", "oats"],
    "daliya":            ["broken wheat porridge", "dalia", "wheat porridge"],
    "buttermilk":        ["chaas", "chaash", "mattha"],
    "turmeric milk":     ["haldi doodh", "golden milk", "haldi milk"],
    "moong dal soup":    ["lentil soup", "dal shorba", "moong soup"],
    "rasam":             ["tomato rasam", "pepper rasam", "jeera rasam"],
    "stewed apple":      ["cooked apple", "apple compote"],
    "upma":              ["uppma", "uppuma", "sooji upma", "rava upma"],
    "poha":              ["aval", "beaten rice", "chivda"],
    "coconut water":     ["nariyal pani", "tender coconut"],
    "green tea":         ["tulsi tea", "herbal tea"],
    "vegetable soup":    ["mixed veg soup", "clear soup", "veg broth"],
    "tomato soup":       ["tamatar soup", "cream of tomato"],
    "banana stem":       ["banana trunk", "vazhaithandu"],
    "papaya":            ["papita", "raw papaya"],
    "moong dal":         ["split moong", "yellow moong", "green moong dal"],
    "ragi dosa":         ["finger millet dosa", "nachni dosa"],
    "moong dal khichdi": ["dal khichdi", "moong khichdi"],
    "dal chawal":        ["dal rice", "rice and dal", "dal with rice", "dal with chawal"],
    "saag paneer":       ["palak paneer", "spinach paneer"],
    "grilled chicken":   ["tandoori chicken", "grilled chicken tikka"],
    "bajra roti":        ["pearl millet roti", "bajra chapati"],
    "methi thepla":      ["fenugreek thepla", "thepla"],
    "baingan bharta":    ["roasted eggplant", "baigan bharta"],
    "jeera rice":        ["cumin rice", "zeera rice"],
    "mixed vegetable sabzi": ["veg sabzi", "mixed sabzi", "sabzi"],
    "lauki soup":        ["bottle gourd soup", "dudhi soup"]
}

def build_alias_map():
    mapping = {}
    for canonical, aliases in CORE_ALIASES.items():
        c = canonical.lower().strip()
        mapping[c] = c
        for alias in aliases:
            mapping[alias.lower().strip()] = c
    return mapping

ALIAS_MAP = build_alias_map()

def clean_text(text):
    text = (text or "").lower().strip()
    text = re.sub(r"\(.*?\)", "", text)
    text = re.sub(r"[^a-z0-9\s]", "", text)
    return re.sub(r"\s+", " ", text).strip()

def normalize_dish(dish):
    d = clean_text(dish)
    return ALIAS_MAP.get(d, d) if d else ""

def get_dish_aliases(dish):
    dish_norm = normalize_dish(dish)
    if not dish_norm:
        return []
    aliases = {dish_norm}
    for alias, can in ALIAS_MAP.items():
        if can == dish_norm:
            aliases.add(alias)
    return list(aliases)


# ──────────────────────────────────────────────────────
# STATIC IMAGE CACHE
# ──────────────────────────────────────────────────────

def load_static_images():
    if not os.path.exists(STATIC_IMAGES_PATH):
        return {}
    try:
        with open(STATIC_IMAGES_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}

def save_to_static_images(dish_norm, url):
    with file_lock:
        os.makedirs(os.path.dirname(STATIC_IMAGES_PATH), exist_ok=True)
        data = load_static_images()
        data[dish_norm] = url
        try:
            with open(STATIC_IMAGES_PATH, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=4, ensure_ascii=False)
        except Exception:
            pass


# ──────────────────────────────────────────────────────
# CURATED DISH IMAGE MAP — verified Wikimedia Commons URLs
# Each URL points to the SPECIFIC dish, not a generic photo.
# ──────────────────────────────────────────────────────

LOCAL_IMAGE_BASE = "/images/foods"

LOCAL_IMAGE_MAP = {
    "biryani": "biryani.jpg",
    "khichdi": "khichdi.png",
    "idli": "idli.jpg",
    "dosa": "dosa.jpg",
    "upma": "upma.jpg",
    "poha": "poha.png",
    "rasam": "rasam.jpg",
    "curd rice": "curd_rice.png",
    "dal": "dal.jpg",
    "dal chawal": "dal.jpg",
    "moong dal": "moong_dal.jpg",
    "moong dal soup": "moong_dal_soup.png",
    "pav bhaji": "pav_bhaji.png",
    "momos": "momos.png",
    "bhajiya": "bhajiya.png",
    "pakora": "bhajiya.png",
    "oatmeal": "oatmeal.jpg",
    "oats": "oatmeal.jpg",
    "daliya": "daliya.jpg",
    "brown rice": "brown_rice.jpg",
    "plain rice": "plain_rice.jpg",
    "white rice": "plain_rice.jpg",
    "jeera rice": "jeera_rice.jpg",
    "saag paneer": "saag_paneer.jpg",
    "paneer": "paneer.jpg",
    "ginger tea": "ginger_tea.jpg",
    "green tea": "green_tea.jpg",
    "turmeric milk": "turmeric_milk.jpg",
    "haldi milk": "turmeric_milk.jpg",
    "coffee": "coffee.jpg",
    "cold coffee": "cold_coffee.jpg",
    "masala chai": "masala_chai.png",
    "hot chocolate": "hot_chocolate.png",
    "buttermilk": "buttermilk.jpg",
    "lassi": "lassi.jpg",
    "coconut water": "coconut_water.jpg",
    "fruit juice": "fruit_juice.jpg",
    "amla juice": "amla_juice.jpg",
    "fruit bowl": "fruit_bowl.jpg",
    "banana": "banana.jpg",
    "papaya": "papaya.jpg",
    "watermelon": "watermelon.jpg",
    "mango": "mango.jpg",
    "apple": "apple.jpg",
    "pomegranate": "pomegranate.jpg",
    "toast": "toast.jpg",
    "boiled egg": "boiled_egg.jpg",
    "egg whites": "boiled_egg.jpg",
    "hot soup": "hot_soup.jpg",
    "tomato soup": "tomato_soup.jpg",
    "vegetable soup": "vegetable_soup.jpg",
    "chicken soup": "chicken_soup.jpg",
    "samosa": "samosa.jpg",
    "pakora": "pakora.jpg",
    "vada pav": "vada_pav.jpg",
    "pani puri": "pani_puri.jpg",
    "kulfi": "kulfi.jpg",
    "raita": "raita.jpg",
    "honey lemon water": "honey_lemon_water.jpg",
    "lemon water": "honey_lemon_water.jpg",
    "salad": "salad.jpg",
    "sprouts": "sprouts.jpg",
    "sprouts chaat": "sprouts.jpg",
}

CATEGORY_FALLBACK = {
    "DRINK": "ginger_tea.jpg",
    "FRUIT": "fruit_bowl.jpg",
    "VEGETABLE": "salad.jpg",
    "SNACK": "samosa.jpg",
    "MEAL": "khichdi.jpg",
}

def get_food_image(dish: str) -> str:
    """Deprecated — images now fetched via Unsplash in app.py"""
    return None



# ──────────────────────────────────────────────────────
# CURATED RECIPES (inline, so "View Recipe" always shows real steps)
# ──────────────────────────────────────────────────────

CURATED_RECIPES_INLINE = {
    "upma": {
        "name": "Upma",
        "ingredients": [
            "1 cup rava (semolina)", "2 cups water", "1 onion (chopped)",
            "1 tsp mustard seeds", "1 tsp urad dal", "8–10 curry leaves",
            "2 green chillies (slit)", "1 tsp ginger (grated)",
            "Salt to taste", "2 tsp oil", "Fresh coriander to garnish"
        ],
        "instructions": [
            "Dry roast rava in a pan on medium heat for 3–4 minutes until light golden and fragrant. Set aside.",
            "Heat oil in the same pan. Add mustard seeds and let them splutter.",
            "Add urad dal, curry leaves, green chillies and ginger. Sauté for 30 seconds.",
            "Add chopped onion and sauté until translucent (about 3 minutes).",
            "Pour in 2 cups of water and add salt. Bring to a boil.",
            "Slowly add the roasted rava while stirring continuously to avoid lumps.",
            "Reduce heat to low, cover and cook for 2 minutes until rava absorbs all water.",
            "Fluff with a fork, garnish with fresh coriander and serve hot."
        ],
    },
    "idli": {
        "name": "Idli",
        "ingredients": [
            "2 cups idli rice (or parboiled rice)", "1 cup urad dal (black gram)",
            "½ tsp fenugreek seeds", "Salt to taste", "Water as needed"
        ],
        "instructions": [
            "Soak rice and fenugreek seeds together for 6 hours. Soak urad dal separately for 4 hours.",
            "Grind urad dal first to a smooth, fluffy batter. Grind rice to a slightly coarse batter.",
            "Mix both batters together, add salt, and ferment overnight (8–10 hours) in a warm place.",
            "Grease idli moulds lightly with oil. Pour batter into each mould.",
            "Steam for 10–12 minutes on medium heat. Check with a toothpick — it should come out clean.",
            "Remove idlis and serve hot with sambar and coconut chutney."
        ],
    },
    "khichdi": {
        "name": "Khichdi",
        "ingredients": [
            "½ cup moong dal (split yellow)", "½ cup rice", "1 tsp turmeric",
            "1 tsp cumin seeds", "1 tsp ginger (grated)", "1 tsp ghee",
            "Salt to taste", "2½ cups water", "Fresh coriander to garnish"
        ],
        "instructions": [
            "Wash rice and moong dal together until water runs clear. Soak for 20 minutes.",
            "Heat ghee in a pressure cooker. Add cumin seeds and let them splutter.",
            "Add grated ginger and sauté for 30 seconds.",
            "Drain the soaked rice and dal. Add to the cooker along with turmeric and salt.",
            "Pour in 2½ cups water. Pressure cook for 3–4 whistles on medium heat.",
            "Allow pressure to release naturally. Open and mash lightly with a spoon.",
            "Adjust consistency with hot water if needed. Serve hot topped with a drizzle of ghee."
        ],
    },
    "curd rice": {
        "name": "Curd Rice",
        "ingredients": [
            "1 cup cooked rice (slightly overcooked)", "1 cup fresh curd (yogurt)",
            "¼ cup milk", "1 tsp mustard seeds", "1 tsp urad dal",
            "8 curry leaves", "2 dried red chillies", "1 tsp ginger (grated)",
            "2 tsp oil", "Salt to taste", "Pomegranate seeds for garnish (optional)"
        ],
        "instructions": [
            "Mash the overcooked rice slightly while still warm.",
            "Mix in curd and milk. Add salt and stir until smooth and creamy.",
            "Heat oil in a small pan. Add mustard seeds and let them splutter.",
            "Add urad dal, red chillies, curry leaves and ginger. Fry for 30 seconds.",
            "Pour the tempering over the curd rice and mix gently.",
            "Refrigerate for 15–20 minutes for best flavour. Serve cold or at room temperature."
        ],
    },
    "ginger tea": {
        "name": "Ginger Tea",
        "ingredients": [
            "2 cups water", "1 cup milk", "1-inch fresh ginger (crushed)",
            "2 tsp tea leaves (or 2 tea bags)", "2 tsp sugar (or honey)",
            "2–3 crushed cardamom pods (optional)"
        ],
        "instructions": [
            "Crush the ginger roughly using a mortar or the back of a knife.",
            "Bring 2 cups of water to a boil. Add ginger and cardamom.",
            "Simmer for 3–4 minutes to let ginger infuse.",
            "Add tea leaves and boil for 1 minute.",
            "Pour in milk and bring to a full boil again.",
            "Strain into cups, sweeten with sugar or honey, and serve hot."
        ],
    },
    "dosa": {
        "name": "Dosa",
        "ingredients": [
            "2 cups idli rice", "½ cup urad dal", "½ tsp fenugreek seeds",
            "Salt to taste", "Oil for cooking"
        ],
        "instructions": [
            "Soak rice and fenugreek seeds for 6 hours. Soak urad dal separately for 4 hours.",
            "Grind urad dal to a smooth batter. Grind rice to a slightly coarse batter. Mix both, add salt.",
            "Ferment overnight. The batter should double in size and smell slightly tangy.",
            "Heat a non-stick or cast iron tawa on high. Sprinkle a few drops of water — it should sizzle.",
            "Pour a ladle of batter in the centre. Spread in quick circular motions to a thin crepe.",
            "Drizzle oil on the edges. Cook until golden and crispy on the bottom (2–3 min).",
            "Fold and serve hot with sambar and coconut chutney."
        ],
    },
    "oatmeal": {
        "name": "Oatmeal",
        "ingredients": [
            "1 cup rolled oats", "2 cups water or milk", "1 tsp honey",
            "Pinch of salt", "Toppings: banana slices, nuts, berries"
        ],
        "instructions": [
            "Bring water or milk to a boil in a saucepan.",
            "Add rolled oats and a pinch of salt. Stir well.",
            "Cook on medium-low heat for 5 minutes, stirring occasionally, until oats absorb liquid.",
            "Remove from heat. Let sit for 1 minute — it will thicken.",
            "Pour into a bowl, drizzle with honey, and add your choice of toppings."
        ],
    },
    "buttermilk": {
        "name": "Buttermilk (Chaas)",
        "ingredients": [
            "1 cup fresh curd (yogurt)", "1 cup cold water",
            "½ tsp roasted cumin powder", "¼ tsp black salt",
            "Fresh mint leaves", "Salt to taste"
        ],
        "instructions": [
            "Whisk the curd until smooth. Add cold water and whisk again until frothy.",
            "Add roasted cumin powder, black salt and regular salt.",
            "Taste and adjust seasoning. Add more water for thinner consistency.",
            "Garnish with torn mint leaves and serve chilled."
        ],
    },
    "poha": {
        "name": "Poha",
        "ingredients": [
            "2 cups thick poha (flattened rice)", "1 onion (finely chopped)",
            "1 potato (small, diced)", "½ cup green peas",
            "1 tsp mustard seeds", "8 curry leaves", "2 green chillies (slit)",
            "½ tsp turmeric", "1 tsp sugar", "2 tsp oil",
            "Salt to taste", "Lemon juice and coriander to garnish"
        ],
        "instructions": [
            "Rinse poha gently in a sieve under running water until soft but not mushy. Drain and set aside.",
            "Mix turmeric, salt and sugar into the soaked poha.",
            "Heat oil in a pan. Add mustard seeds until they splutter.",
            "Add curry leaves, green chillies, then potato. Cook until tender (5–6 min).",
            "Add onion and sauté until light golden. Add green peas.",
            "Add the poha and mix gently. Heat through for 2 minutes.",
            "Squeeze lemon juice over, garnish with coriander and serve warm."
        ],
    },
    "daliya": {
        "name": "Daliya (Broken Wheat Porridge)",
        "ingredients": [
            "½ cup broken wheat (daliya)", "1½ cups water",
            "½ cup milk", "1 tsp ghee", "Pinch of salt",
            "Jaggery or sugar to taste (optional)"
        ],
        "instructions": [
            "Dry roast the daliya in a pan for 3 minutes until nutty and light golden.",
            "Heat ghee in a pressure cooker. Add roasted daliya and sauté for 1 minute.",
            "Add water and a pinch of salt. Pressure cook for 2 whistles.",
            "Release pressure, open and stir in milk. Simmer for 3 minutes.",
            "Add jaggery or sugar if making it sweet. Adjust consistency as needed.",
            "Serve warm for a nourishing, easy-to-digest meal."
        ],
    },
    "tomato soup": {
        "name": "Tomato Soup",
        "ingredients": [
            "4 large ripe tomatoes", "1 onion (chopped)", "4 garlic cloves",
            "1 tsp butter", "1 tsp sugar", "Salt and pepper to taste",
            "Fresh basil or cream to garnish"
        ],
        "instructions": [
            "Heat butter in a pan. Sauté onion and garlic until softened (5 min).",
            "Add chopped tomatoes. Season with salt, pepper and sugar.",
            "Cover and cook on medium heat for 15 minutes until tomatoes break down.",
            "Cool slightly then blend until smooth.",
            "Strain through a sieve for a silky texture. Return to heat.",
            "Simmer for 3 more minutes. Serve hot with cream or fresh basil."
        ],
    },
    "green tea": {
        "name": "Green Tea",
        "ingredients": [
            "1 tsp green tea leaves (or 1 green tea bag)",
            "250ml hot water (80°C, not boiling)", "Honey to taste (optional)",
            "Lemon slice (optional)"
        ],
        "instructions": [
            "Heat water to 80°C — boiling water makes green tea bitter.",
            "Place tea leaves in a strainer or use a tea bag in your cup.",
            "Pour hot water and steep for exactly 2–3 minutes.",
            "Remove leaves or bag immediately — over-steeping turns it bitter.",
            "Add honey and a squeeze of lemon if desired. Sip and enjoy."
        ],
    },
    "banana": {
        "name": "Banana (Best Ways to Eat)",
        "ingredients": ["1–2 ripe bananas", "Optional: honey, nuts, curd"],
        "instructions": [
            "Eat fresh as-is for a quick energy boost. Ripe bananas are easiest to digest.",
            "Slice and mix with a bowl of curd and a drizzle of honey for a probiotic-rich snack.",
            "Mash with a fork and mix into oatmeal or daliya for natural sweetness.",
            "Freeze for 2 hours and blend for a one-ingredient healthy ice cream.",
            "Best consumed in the morning or before/after exercise for sustained energy."
        ],
    },
    "coconut water": {
        "name": "Coconut Water",
        "ingredients": ["1 fresh tender coconut"],
        "instructions": [
            "Use a sharp knife or ask a vendor to cut the top of a fresh tender coconut.",
            "Insert a straw and drink directly for maximum freshness and electrolytes.",
            "For chilled coconut water, refrigerate the whole coconut for 2 hours before opening.",
            "Scoop out the soft coconut flesh after drinking and eat it as a snack.",
            "Best consumed in the morning on an empty stomach or after exercise."
        ],
    },
    "moong dal soup": {
        "name": "Moong Dal Soup",
        "ingredients": [
            "½ cup moong dal (split yellow)", "2 cups water",
            "½ tsp turmeric", "1 tsp cumin seeds", "1 tsp ghee",
            "Salt to taste", "Lemon juice and coriander"
        ],
        "instructions": [
            "Wash moong dal thoroughly. Pressure cook with water and turmeric for 3 whistles.",
            "Blend or mash the cooked dal until smooth. Add more water for desired consistency.",
            "Heat ghee in a small pan. Add cumin seeds until they splutter.",
            "Pour the tempering over the soup. Add salt and lemon juice.",
            "Garnish with fresh coriander and serve warm. Excellent for upset stomachs."
        ],
    },
    "rasam": {
        "name": "Rasam",
        "ingredients": [
            "2 tomatoes (chopped)", "1 lemon-sized ball of tamarind",
            "1 tsp black pepper", "1 tsp cumin seeds", "4 garlic cloves",
            "½ tsp turmeric", "1 tsp ghee", "Curry leaves",
            "Salt to taste", "Fresh coriander"
        ],
        "instructions": [
            "Soak tamarind in ½ cup warm water for 10 minutes. Squeeze out the pulp.",
            "Crush black pepper, cumin and garlic together roughly.",
            "In a pot, combine tamarind water, tomatoes, turmeric, salt and the crushed spices.",
            "Bring to a boil and simmer for 8–10 minutes until tomatoes are soft.",
            "Heat ghee in a small pan. Add curry leaves and pour over the rasam.",
            "Garnish with coriander and serve hot as a soup or with rice."
        ],
    },
    "vegetable soup": {
        "name": "Clear Vegetable Soup",
        "ingredients": [
            "1 carrot (diced)", "1 potato (small, diced)", "½ cup green peas",
            "1 onion (chopped)", "2 garlic cloves", "1 inch ginger",
            "3 cups water or vegetable broth", "Salt, pepper, cumin to taste",
            "Fresh coriander and lemon to finish"
        ],
        "instructions": [
            "Sauté onion, garlic and ginger in ½ tsp oil for 2 minutes.",
            "Add all vegetables and stir for 2 minutes.",
            "Pour in water or broth. Bring to a boil.",
            "Add salt, pepper and cumin. Simmer for 15 minutes until veggies are tender.",
            "Taste and adjust seasoning. Add a squeeze of lemon.",
            "Garnish with fresh coriander and serve hot."
        ],
    },
}

def get_curated_recipe(dish_norm):
    """Return inline curated recipe for a dish if it exists."""
    return CURATED_RECIPES_INLINE.get(dish_norm)


# ──────────────────────────────────────────────────────
# METADATA
# ──────────────────────────────────────────────────────

def get_dish_metadata(dish):
    dish_norm = normalize_dish(dish)
    if not dish_norm:
        return None
    try:
        meal_data = get_recipe_by_name(dish_norm)
        if not meal_data:
            return None
        return {
            "instructions": meal_data.get("instructions"),
            "ingredients":  meal_data.get("ingredients"),
            "category":     meal_data.get("category"),
            "cuisine":      meal_data.get("cuisine"),
            "image":        meal_data.get("image"),
        }
    except Exception:
        return None


# ──────────────────────────────────────────────────────
# RESTAURANT SEARCH HELPERS
# ──────────────────────────────────────────────────────

def simplify_for_restaurant_search(dish):
    dish = clean_text(dish)
    stop_words = {"with", "and", "for", "the", "hot", "cold"}
    words = [w for w in dish.split() if w not in stop_words]
    return " ".join(words) if words else dish