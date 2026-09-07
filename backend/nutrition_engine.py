import pandas as pd
import os
from threading import Lock

# ─────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────

MASTER_PATH = "data/nutrition_master.csv"

_master_df = None
_loaded = False
_lock = Lock()


def safe_float(value):
    try:
        if pd.isna(value):
            return 0.0
        return float(value)
    except Exception:
        return 0.0


# ─────────────────────────────────────────────
# LAZY LOAD
# ─────────────────────────────────────────────

def _load_data():
    global _master_df, _loaded

    if _loaded:
        return

    with _lock:
        if _loaded:
            return

        if not os.path.exists(MASTER_PATH):
            print(f"[nutrition_engine] File not found: {MASTER_PATH}")
            _master_df = pd.DataFrame()
            _loaded = True
            return

        try:
            df = pd.read_csv(MASTER_PATH)

            if "Item Name" not in df.columns:
                print("[nutrition_engine] CSV missing 'Item Name' column.")
                _master_df = pd.DataFrame()
                _loaded = True
                return

            df["Item Name"] = df["Item Name"].astype(str).str.lower().str.strip()
            _master_df = df

        except Exception as e:
            print(f"[nutrition_engine] Load error: {e}")
            _master_df = pd.DataFrame()

        _loaded = True


# ─────────────────────────────────────────────
# LOOKUP WITH FALLBACK MATCHING
# ─────────────────────────────────────────────

def get_nutrition_info(dish: str) -> dict | None:
    """
    FIXED: was exact-match only → almost every Indian dish returned None.

    Strategy:
      1. Exact match
      2. Starts-with match  (e.g. "idli" matches "idli sambar")
      3. Contains match     (e.g. "khichdi" matches "moong dal khichdi")
      4. First-word match   (last resort)
    """

    if not dish:
        return None

    _load_data()

    if _master_df is None or _master_df.empty:
        return None

    dish_clean = dish.lower().strip()

    df = _master_df

    # 1. Exact
    row = df[df["Item Name"] == dish_clean]

    # 2. Starts-with
    if row.empty:
        row = df[df["Item Name"].str.startswith(dish_clean)]

    # 3. Contains (dish_clean inside the CSV name)
    if row.empty:
        row = df[df["Item Name"].str.contains(dish_clean, regex=False)]

    # 4. CSV name contained inside dish_clean (e.g. dish = "dal khichdi", CSV = "khichdi")
    if row.empty:
        first_word = dish_clean.split()[0]
        row = df[df["Item Name"].str.contains(first_word, regex=False)]

    if row.empty:
        return None

    r = row.iloc[0]

    return {
        "source": "nutrition_master",
        "calories":      safe_float(r.get("Calories (kcal)")),
        "protein":       safe_float(r.get("Protein (g)")),
        "carbohydrates": safe_float(r.get("Carbohydrates (g)")),
        "fats":          safe_float(r.get("Fats (g)")),
        "fiber":         safe_float(r.get("Fiber (g)")),
        "sodium":        safe_float(r.get("Sodium (mg)")),
    }
