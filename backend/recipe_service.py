import requests
from typing import List, Dict, Any, Optional
from threading import Lock

THEMEALDB_BASE_URL = "https://www.themealdb.com/api/json/v1/1"

# Reusable session (faster + cleaner)
_session = requests.Session()

# In-memory cache
_RECIPE_CACHE = {}
_cache_lock = Lock()


# -----------------------------------------------------
# MAIN RECIPE FETCH
# -----------------------------------------------------

def get_recipe_by_name(name: str) -> Optional[Dict[str, Any]]:
    """
    Fetch full recipe details by dish name.
    Uses in-memory cache to prevent repeated API calls.
    """

    if not name:
        return None

    cache_key = name.lower().strip()

    with _cache_lock:
        if cache_key in _RECIPE_CACHE:
            return _RECIPE_CACHE[cache_key]

    try:
        url = f"{THEMEALDB_BASE_URL}/search.php"
        response = _session.get(
            url,
            params={"s": name},
            timeout=8
        )

        if response.status_code != 200:
            _store_cache(cache_key, None)
            return None

        data = response.json()
        meals = data.get("meals")

        if meals:
            result = format_meal(meals[0])
            _store_cache(cache_key, result)
            return result

    except Exception as e:
        print(f"Recipe API error for '{name}': {e}")

    _store_cache(cache_key, None)
    return None


# -----------------------------------------------------
# CATEGORY FETCH
# -----------------------------------------------------

def get_recipes_by_category(category: str) -> List[Dict[str, Any]]:
    if not category:
        return []

    try:
        url = f"{THEMEALDB_BASE_URL}/filter.php"
        response = _session.get(
            url,
            params={"c": category},
            timeout=8
        )

        if response.status_code == 200:
            data = response.json()
            meals = data.get("meals")
            if meals:
                return [format_meal_summary(m) for m in meals[:10]]

    except Exception as e:
        print(f"Category fetch error '{category}': {e}")

    return []


# -----------------------------------------------------
# RANDOM FETCH
# -----------------------------------------------------

def get_random_recipes(count: int = 5) -> List[Dict[str, Any]]:
    results = []

    for _ in range(count):
        try:
            url = f"{THEMEALDB_BASE_URL}/random.php"
            response = _session.get(url, timeout=5)

            if response.status_code == 200:
                data = response.json()
                meals = data.get("meals")
                if meals:
                    results.append(format_meal(meals[0]))

        except Exception:
            continue

    return results


# -----------------------------------------------------
# FORMATTERS
# -----------------------------------------------------

def format_meal(meal: Dict[str, Any]) -> Dict[str, Any]:
    instructions_raw = meal.get("strInstructions", "")

    instructions = [
        s.strip()
        for s in instructions_raw.replace("\r", "").split("\n")
        if s.strip()
    ]

    ingredients = []
    for i in range(1, 21):
        ing = meal.get(f"strIngredient{i}")
        meas = meal.get(f"strMeasure{i}")

        if ing and ing.strip():
            combined = f"{meas or ''} {ing}".strip()
            ingredients.append(combined)

    return {
        "name": meal.get("strMeal"),
        "image": meal.get("strMealThumb"),
        "instructions": instructions,
        "ingredients": ingredients,
        "category": meal.get("strCategory"),
        "cuisine": meal.get("strArea"),
        "source": meal.get("strSource") or "TheMealDB"
    }


def format_meal_summary(meal_summary: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "name": meal_summary.get("strMeal"),
        "image": meal_summary.get("strMealThumb"),
        "id": meal_summary.get("idMeal")
    }


# -----------------------------------------------------
# INTERNAL CACHE HELPER
# -----------------------------------------------------

def _store_cache(key, value):
    with _cache_lock:
        _RECIPE_CACHE[key] = value


# -----------------------------------------------------
# TEST
# -----------------------------------------------------

if __name__ == "__main__":
    test = get_recipe_by_name("Dal Tadka")
    if test:
        print(f"Found: {test['name']}")
    else:
        print("Not found.")