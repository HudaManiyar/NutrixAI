import requests
import math
from threading import Lock

# -----------------------------------------------------
# BLOCKED VENUE KEYWORDS (Keep consistent with geoapify)
# -----------------------------------------------------

BLOCKED_VENUE_KEYWORDS = {
    "bar", "pub", "brewery", "brew", "lounge",
    "nightclub", "taproom", "gastropub",
    "liquor", "tavern", "sports bar"
}

def is_blocked_venue(name: str) -> bool:
    name_lower = name.lower()
    return any(word in name_lower for word in BLOCKED_VENUE_KEYWORDS)


# -----------------------------------------------------
# HAVERSINE DISTANCE
# -----------------------------------------------------

def _haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat/2)**2 +
        math.cos(math.radians(lat1)) *
        math.cos(math.radians(lat2)) *
        math.sin(dlon/2)**2
    )
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


# -----------------------------------------------------
# MAIN FETCH FUNCTION
# -----------------------------------------------------

def fetch_restaurants_osm(lat, lon, radius=3000):
    """
    Fetch restaurants/cafes/fast_food from OpenStreetMap.
    Strict radius filter.
    Duplicate-safe.
    Blocklist-safe.
    """

    overpass_url = "https://overpass-api.de/api/interpreter"

    overpass_query = f"""
    [out:json][timeout:15];
    (
      node["amenity"~"restaurant|cafe|fast_food|food_court|supermarket|convenience"](around:{radius},{lat},{lon});
      way["amenity"~"restaurant|cafe|fast_food|food_court|supermarket|convenience"](around:{radius},{lat},{lon});
      rel["amenity"~"restaurant|cafe|fast_food|food_court|supermarket|convenience"](around:{radius},{lat},{lon});
    );
    out center;
    """

    try:
        response = requests.get(
            overpass_url,
            params={'data': overpass_query},
            timeout=15
        )

        if response.status_code != 200:
            return []

        data = response.json()
        elements = data.get("elements", [])

        results = []
        seen_names = set()

        for el in elements:
            tags = el.get("tags", {})
            name = tags.get("name")

            if not name:
                continue

            # Block bars/pubs
            if is_blocked_venue(name):
                continue

            name_norm = name.lower().strip()

            # Deduplicate
            if name_norm in seen_names:
                continue
            seen_names.add(name_norm)

            el_lat = el.get("lat") or el.get("center", {}).get("lat")
            el_lon = el.get("lon") or el.get("center", {}).get("lon")

            if not el_lat or not el_lon:
                continue

            dist_km = round(_haversine(lat, lon, el_lat, el_lon), 1)

            # Strict radius cutoff
            if dist_km > (radius / 1000):
                continue

            # FIX C: distance-based pseudo-rating (closer = higher pseudo rating)
            pseudo_rating = max(2.0, 5.0 - dist_km)

            results.append({
                "name": name,
                "name_norm": name_norm,
                "rating": pseudo_rating,
                "review_count": 0,
                "distance": dist_km,
                "source": "osm",
                "business_status": "OPERATIONAL",
                "photo": None,
                "address": tags.get("addr:full") or tags.get("addr:street", ""),
                "cuisine": tags.get("cuisine", "")
            })

        results.sort(key=lambda x: x["distance"])
        return results

    except Exception as e:
        print(f"OSM/Overpass Error: {e}")
        return []