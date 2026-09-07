import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

# -----------------------------------------------------
# CONFIG
# -----------------------------------------------------

WEATHERAPI_KEY = os.getenv("WEATHERAPI_KEY")

FALLBACK_WEATHER = {
    "condition": "clear",
    "temp": 25,
    "feels_like": 25,
    "humidity": 50,
    "cloud_cover": 10,
    "area": "Unknown",
    "message": "Fallback"
}

# -----------------------------------------------------
# CONDITION DISPLAY MAP
# -----------------------------------------------------

CONDITION_DISPLAY_MAP = {
    "clear": "Clear Sky ☀️",
    "clouds": "Partly Cloudy ⛅",
    "few clouds": "Mostly Clear 🌤️",
    "scattered clouds": "Partly Cloudy ⛅",
    "broken clouds": "Mostly Cloudy ☁️",
    "overcast clouds": "Overcast ☁️",
    "rain": "Rainy 🌧️",
    "light rain": "Light Rain 🌦️",
    "moderate rain": "Rainy 🌧️",
    "heavy rain": "Heavy Rain 🌧️",
    "drizzle": "Drizzle 🌦️",
    "thunderstorm": "Thunderstorm ⛈️",
    "snow": "Snowy ❄️",
    "mist": "Misty 🌫️",
    "haze": "Hazy 🌥️",
    "fog": "Foggy 🌫️",
    "sunny": "Sunny ☀️",
    "partly cloudy": "Partly Cloudy ⛅",
}

# -----------------------------------------------------
# WEATHER FETCH
# -----------------------------------------------------

def get_current_weather(lat=None, lon=None, query=None):
    if not WEATHERAPI_KEY:
        return FALLBACK_WEATHER

    url = "https://api.weatherapi.com/v1/current.json"

    # Decide the query string 'q' for WeatherAPI
    q_param = ""
    if lat is not None and lon is not None:
        q_param = f"{lat},{lon}"
    elif query:
        q_param = query
    else:
        return FALLBACK_WEATHER

    try:
        response = requests.get(
            url,
            params={
                "key": WEATHERAPI_KEY,
                "q": q_param,
                "aqi": "no"
            },
            timeout=5
        )

        if response.status_code != 200:
            print(f"WeatherAPI returned status {response.status_code}")
            return FALLBACK_WEATHER

        data = response.json()

        current = data.get("current", {})
        location = data.get("location", {})

        return {
            "condition": current.get("condition", {}).get("text", "clear").lower(),
            "temp": current.get("temp_c", 25),
            "feels_like": current.get("feelslike_c", 25),
            "humidity": current.get("humidity", 50),
            "cloud_cover": current.get("cloud", 0),
            "area": location.get("name", "Unknown"),
            "message": "Success"
        }

    except Exception as e:
        print(f"WeatherAPI Error: {e}")
        return FALLBACK_WEATHER


# -----------------------------------------------------
# DISPLAY FORMATTER
# -----------------------------------------------------

def prettify_condition(raw_condition):
    raw = raw_condition.lower().strip()

    if raw in CONDITION_DISPLAY_MAP:
        return CONDITION_DISPLAY_MAP[raw]

    for key, display in CONDITION_DISPLAY_MAP.items():
        if key in raw:
            return display

    return raw_condition.title()


# -----------------------------------------------------
# WEATHER HELPERS
# -----------------------------------------------------

def check_effectively_sunny(weather_data):
    """
    Returns True if it's visually sunny/clear, even if API says 'Mist' or 'Haze'.
    Common in Bangalore mornings: visually bright but API reports Mist/Haze.
    """
    if not weather_data:
        return False

    cond = weather_data.get("condition", "").lower()
    temp = weather_data.get("temp", 25)
    clouds = weather_data.get("cloud_cover", 0)

    # Core logic: Sunny/Clear condition OR (Moderate temp + Low clouds + No rain keywords)
    # Lowered threshold to 16 for Bangalore winter mornings.
    is_sunny = (
        any(x in cond for x in ["sunny", "clear"]) or
        (temp >= 16 and clouds < 40 and
         not any(x in cond for x in ["rain", "storm", "drizzle", "cloud", "overcast"]))
    )
    return is_sunny


# -----------------------------------------------------
# LOAD WEATHER BIOMETRY RULES
# -----------------------------------------------------

def load_weather_biometry():
    try:
        with open("data/weather_biometry.json", "r", encoding="utf-8") as f:
            data = json.load(f)
            return data.get("weather_rules", [])
    except Exception:
        return []

BIOMETRY_RULES = load_weather_biometry()


# -----------------------------------------------------
# WEATHER MODIFIERS
# -----------------------------------------------------

def get_weather_modifiers(weather_data, query_text=None):
    condition = weather_data.get("condition", "clear").lower()
    temp = weather_data.get("temp", 25)
    humidity = weather_data.get("humidity", 50)
    clouds = weather_data.get("cloud_cover", 0)

    q_text = query_text.lower() if query_text else ""

    boost_words = []
    penalty_words = []

    for rule in BIOMETRY_RULES:
        match = False

        # Condition match
        if "matches" in rule:
            if any(m in condition for m in rule["matches"]):
                match = True
            if q_text and any(m in q_text for m in rule["matches"]):
                match = True

        # Threshold match
        if "threshold" in rule:
            t = rule["threshold"]
            condition_met = True

            if "temp" in t:
                if "min" in t["temp"] and temp < t["temp"]["min"]:
                    condition_met = False
                if "max" in t["temp"] and temp > t["temp"]["max"]:
                    condition_met = False

            if "humidity" in t:
                if "min" in t["humidity"] and humidity < t["humidity"]["min"]:
                    condition_met = False
                if "max" in t["humidity"] and humidity > t["humidity"]["max"]:
                    condition_met = False

            if "cloud_cover" in t:
                if "min" in t["cloud_cover"] and clouds < t["cloud_cover"]["min"]:
                    condition_met = False

            if condition_met:
                match = True

        if match:
            boost_words.extend(rule.get("boost_keywords", []))
            penalty_words.extend(rule.get("penalty_keywords", []))

    return list(set(boost_words)), list(set(penalty_words))


# -----------------------------------------------------
# WEATHER FOOD MAPPING
# -----------------------------------------------------

def load_weather_mapping():
    try:
        with open("data/weather_food_mapping.json", "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}

WEATHER_MAPPING = load_weather_mapping()


def get_weather_foods(weather_data, count=10):
    if not WEATHER_MAPPING or not weather_data:
        return []

    cond_obj = weather_data.get("condition", "")
    cond = cond_obj.get("text", "").lower() if isinstance(cond_obj, dict) else str(cond_obj).lower()
    
    temp = weather_data.get("temp", 25)
    hum  = weather_data.get("humidity", 50)
    clouds = weather_data.get("cloud_cover", 0)

    category = "pleasant_mild"

    effectively_sunny = check_effectively_sunny(weather_data)

    if any(x in cond for x in ["rain", "drizzle", "thunderstorm", "shower"]):
        category = "rainy"
    elif effectively_sunny and temp > 32:
        category = "hot_sunny"
    elif effectively_sunny and hum > 70:
        category = "humid_sticky"
    elif effectively_sunny:
        category = "hot_sunny"
    elif temp < 20:
        category = "cold_winter"
    elif clouds > 50 or "cloud" in cond:
        category = "cloudy_gloomy"

    mapping = WEATHER_MAPPING.get(category, WEATHER_MAPPING.get("pleasant_mild", {}))

    results = []
    import random
    comfort      = list(mapping.get("comfort_foods", []))
    healthy      = list(mapping.get("healthy_options", []))
    traditional  = list(mapping.get("traditional_foods", []))
    junk         = list(mapping.get("junk_food", []))
    random.shuffle(comfort); random.shuffle(healthy)
    random.shuffle(traditional); random.shuffle(junk)
    results.extend(comfort[:5])
    results.extend(traditional[:3])
    results.extend(healthy[:2])
    results.extend(junk[:2])

    final = []
    seen = set()
    for item in results:
        key = item.lower()
        if key not in seen:
            final.append(item); seen.add(key)
    return final[:count]


# -----------------------------------------------------
# WEATHER BIAS SCORING
# -----------------------------------------------------

def calculate_weather_bias(dish_candidate, weather_data, query_text=None):
    boost_words, penalty_words = get_weather_modifiers(weather_data, query_text)

    metadata = dish_candidate.get("metadata") or {}
    content = f" {dish_candidate.get('name', '')} {dish_candidate.get('cuisine', '')} {metadata.get('flavor', '')} {metadata.get('course', '')} ".lower()

    bias = 0
    reason = None

    # Penalty first
    for word in penalty_words:
        if f" {word.lower()} " in content:
            bias = -30
            reason = f"Not ideal for {prettify_condition(weather_data.get('condition', 'clear'))} weather."
            break

    # Boost if not penalized
    if bias == 0:
        for word in boost_words:
            if f" {word.lower()} " in content:
                bias = 20
                reason = f"Perfect for {prettify_condition(weather_data.get('condition', 'clear'))} weather!"
                break

    return bias, reason


# ─────────────────────────────────────────────
# UI DATA — drives hero background + mode badge
# ─────────────────────────────────────────────

def get_weather_ui_data(weather_data):
    if not weather_data:
        return {"mode": "Pleasant • Healthy Mode", "hook": "Perfect day for a balanced meal.",
                "icon": "cloud", "bg_type": "pleasant", "temp": 25}

    cond   = weather_data.get("condition", "").lower()
    temp   = weather_data.get("temp", 25)
    clouds = weather_data.get("cloud_cover", 50)

    effectively_sunny = check_effectively_sunny(weather_data)

    if effectively_sunny:
        if temp > 32:
            return {"mode": "Hot & Sunny ☀️",
                    "hook": "It's scorching! Stay hydrated with cooling foods.",
                    "icon": "sun", "bg_type": "heat", "temp": round(temp)}
        return {"mode": "Sunny Morning ☀️",
                "hook": "Beautiful sunny day — great time for a light, balanced meal.",
                "icon": "sun", "bg_type": "sunny", "temp": round(temp)}

    if any(x in cond for x in ["rain","storm","drizzle","thunderstorm","shower"]):
        return {"mode": "Rainy • Comfort Mode 🌧️",
                "hook": "Rainy day — warm soups and teas are perfect.",
                "icon": "cloud-rain", "bg_type": "rain", "temp": round(temp)}

    is_misty = any(x in cond for x in ["mist","fog","haze","smoke"])
    if is_misty and temp < 18:
        return {"mode": "Cool & Misty 🌫️",
                "hook": "Cool misty morning — something warm and comforting.",
                "icon": "thermometer", "bg_type": "cold", "temp": round(temp)}

    if any(x in cond for x in ["cloud","overcast","partly"]) or clouds > 60:
        return {"mode": "Cloudy • Balanced Mode ⛅",
                "hook": "Overcast skies — a hearty, balanced meal hits the spot.",
                "icon": "cloud", "bg_type": "cloudy", "temp": round(temp)}

    if temp < 18:
        return {"mode": "Cool • Warmth Mode",
                "hook": "It's cool today. Something warm sounds perfect.",
                "icon": "thermometer", "bg_type": "cold", "temp": round(temp)}

    return {"mode": "Pleasant • Healthy Mode",
            "hook": "Great weather for a balanced meal.",
            "icon": "cloud", "bg_type": "pleasant", "temp": round(temp)}