import csv
import json
import os
from threading import Lock
from rapidfuzz import fuzz
from osm_logic import _haversine

LOCALITY_COORDS = {}

def load_locality_coords():
    global LOCALITY_COORDS
    path = "data/locality_coords.json"
    if os.path.exists(path) and not LOCALITY_COORDS:
        try:
            with open(path, "r", encoding="utf-8") as f:
                LOCALITY_COORDS = json.load(f)
        except Exception as e:
            print(f"Error loading locality_coords: {e}")

BLOCKED_VENUE_KEYWORDS = {
    "bar", "pub", "brewery", "brewing", "brew", "lounge",
    "nightclub", "hookah", "shisha", "restro bar", "restobar",
    "sports bar", "beer", "wine", "cocktail", "taproom",
    "bistro bar", "gastropub", "liquor", "tavern",
    "ale house", "microbrewery"
}

def is_blocked_venue(name):
    name_lower = name.lower()
    return any(keyword in name_lower for keyword in BLOCKED_VENUE_KEYWORDS)

_menu_data = []
_data_loaded = False
_data_lock = Lock()


def _safe_float(value):
    try:
        if not value:
            return 0.0
        return float(str(value).replace(",", "").strip())
    except Exception:
        return 0.0

def load_menu_data():
    global _menu_data, _data_loaded

    if _data_loaded:
        return _menu_data

    with _data_lock:
        if _data_loaded:
            return _menu_data

        file_path = "data/restarunts.csv"

        if not os.path.exists(file_path):
            print(f"[menu_data] Dataset not found: {file_path}")
            _data_loaded = True
            return []

        print(f"[menu_data] Loading from {file_path}…")

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)

                for row in reader:
                    res_name  = row.get("Restaurant_Name", "").strip()
                    item_name = row.get("Item_Name", "").strip()

                    if not res_name or not item_name:
                        continue
                    
                    if is_blocked_venue(res_name):
                        continue

                    place = row.get("Place_Name", "").lower().strip()
                    city  = row.get("City", "").lower().strip()
                    address_parts = [p.title() for p in [place, city] if p]
                    address = ", ".join(address_parts) if address_parts else ""

                    avg_price_val = _safe_float(
                        row.get("Avg_Price_Restaurant")
                        or row.get("Prices")
                        or 0
                    )

                    # Rating
                    rating_val = _safe_float(
                        row.get("Average_Rating")
                        or row.get("Dining_Rating")
                        or row.get("Avg_Rating_Restaurant")
                        or 0
                    )

                    _menu_data.append({
                        "res_name":      res_name,
                        "res_norm":      res_name.lower(),
                        "item_name":     item_name,
                        "item_norm":     item_name.lower(),
                        "rating":        rating_val,
                        "review_count":  int(_safe_float(
                            row.get("Dining_Votes")
                            or row.get("Review_Count")
                            or 0
                        )),
                        "place":         place,
                        "city":          city,
                        # FIXED: address always set from place + city
                        "address":       address,
                        "cuisine":       row.get("Cuisine", "").lower().strip(),
                        "price":         _safe_float(row.get("Prices") or 0),
                        "exact_item":    item_name,
                        "exact_price":   _safe_float(row.get("Prices") or 0),
                        "avg_price":     avg_price_val,
                        "is_expensive":  str(row.get("Is_Expensive", "0")).strip() == "1",
                        "is_bestseller": str(row.get("Best_Seller", "")).upper()
                            in ["BESTSELLER", "MUST TRY", "CHEF'S SPECIAL"],
                    })

            print(f"[menu_data] Loaded {len(_menu_data)} menu entries.")

        except Exception as e:
            print(f"[menu_data] Load error: {e}")

        _data_loaded = True

    return _menu_data


# ─────────────────────────────────────────────
# SEARCH
# ─────────────────────────────────────────────

def find_restaurants_by_menu_item(dish_query: str, location_query: str = "", user_lat: float = None, user_lon: float = None) -> list:
    data = load_menu_data()
    load_locality_coords()
    if not data:
        return []

    dish_norm = dish_query.lower().strip()
    loc_norm  = location_query.lower().strip() if location_query else ""

    # Bengaluru / Bangalore name aliases
    loc_variants = {loc_norm}
    if "bangalore" in loc_norm:
        loc_variants.add("bengaluru")
    if "bengaluru" in loc_norm:
        loc_variants.add("bangalore")

    # FIXED: When a neighbourhood like "SG Palya" is passed, also search city-wide
    # so we get results from both the local area AND the broader Bengaluru dataset.
    if loc_norm and loc_norm not in {"india", "auto-detected", "bengaluru", "bangalore", ""}:
        loc_variants.add("bengaluru")
        loc_variants.add("bangalore")

    is_india_wide = (
        not loc_norm
        or "india" in loc_norm
        or loc_norm == "auto-detected"
    )

    matches: dict = {}

    for row in data:
        # Dish match (substring)
        if dish_norm not in row["item_norm"]:
            continue

        # Location filter
        if not is_india_wide:
            place_match = any(
                var in row["place"] or var in row["city"]
                for var in loc_variants
            )
            # If exact match fails, try fuzzy match on place name
            if not place_match:
                place_match = any(
                    fuzz.token_set_ratio(var, row["place"]) >= 70
                    for var in loc_variants
                )
            if not place_match:
                continue

        distance_val = None
        if user_lat is not None and user_lon is not None:
            coord = LOCALITY_COORDS.get(row["place"])
            if coord:
                distance_val = round(_haversine(user_lat, user_lon, coord["lat"], coord["lon"]), 1)

        res_key = (row["res_name"], row["place"])

        if res_key not in matches:
            matches[res_key] = {
                "name":            row["res_name"],
                "name_norm":       row["res_norm"],
                # FIXED: address always has the real area+city string
                "address":         row["address"],
                # FIXED: 'cuisine' key (matches geoapify/osm/normalise_restaurant)
                "cuisine":         row["cuisine"],
                "rating":          row["rating"],
                "review_count":    row["review_count"],
                "distance":        distance_val,
                "source":          "menu_intelligence",
                "business_status": "OPERATIONAL",
                "photo":           None,
                "items":           [],
                "bestseller_count": 0,
                # FIXED: real avg_price, not 0
                "avg_price":       row["avg_price"],
                "is_expensive":    row["is_expensive"],
                "score_bonus":     20,
                "exact_item":      row["item_name"],
                "exact_price":     row["price"],
            }
        else:
            # Absorb best exact_price from later rows
            if not matches[res_key].get("exact_price") and row["price"]:
                matches[res_key]["exact_price"] = row["price"]
                matches[res_key]["exact_item"]  = row["item_name"]
            if not matches[res_key].get("avg_price") and row["avg_price"]:
                matches[res_key]["avg_price"] = row["avg_price"]

        matches[res_key]["items"].append(row["item_name"])
        if row["is_bestseller"]:
            matches[res_key]["bestseller_count"] += 1

    final_results = []
    for m in matches.values():
        m["items"] = list(set(m["items"]))[:3]
        if m["bestseller_count"] > 0:
            m["score_bonus"] += m["bestseller_count"] * 2
        final_results.append(m)

    # Sort: rating desc, then bestseller count
    final_results.sort(
        key=lambda x: (x.get("rating", 0), x.get("bestseller_count", 0)),
        reverse=True,
    )

    return final_results
