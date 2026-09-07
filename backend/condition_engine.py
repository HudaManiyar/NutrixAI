import json
import difflib
import os

RULES_PATH = "data/expanded_health_rules.json"

# -----------------------------------------------------
# LOAD RULES SAFELY
# -----------------------------------------------------

def load_rules():
    if not os.path.exists(RULES_PATH):
        print("WARNING: expanded_health_rules.json not found.")
        return []
    try:
        with open(RULES_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"ERROR loading rules: {e}")
        return []

HEALTH_RULES = load_rules()

SYNONYM_MAP = {}
ALL_SYNONYMS = []

# -----------------------------------------------------
# INDEXING
# -----------------------------------------------------

def _index_rule(rule):
    try:
        c_id = rule.get("id", "").lower().strip()
        if not c_id:
            return

        # ID
        SYNONYM_MAP[c_id] = c_id
        if c_id not in ALL_SYNONYMS:
            ALL_SYNONYMS.append(c_id)

        # Main condition name
        main_cond = rule.get("condition", "").lower().strip()
        if main_cond:
            SYNONYM_MAP[main_cond] = c_id
            if main_cond not in ALL_SYNONYMS:
                ALL_SYNONYMS.append(main_cond)

        # Synonyms
        for syn in rule.get("synonyms", []):
            s_norm = syn.lower().strip()
            if s_norm:
                SYNONYM_MAP[s_norm] = c_id
                if s_norm not in ALL_SYNONYMS:
                    ALL_SYNONYMS.append(s_norm)

    except Exception as e:
        print(f"Rule indexing error: {e}")

# Index all rules
for rule in HEALTH_RULES:
    _index_rule(rule)

# -----------------------------------------------------
# REGISTER NON-HEALTH INTENTS
# -----------------------------------------------------

for intent in ["weather", "mood", "general_tasty"]:
    SYNONYM_MAP[intent] = intent
    if intent not in ALL_SYNONYMS:
        ALL_SYNONYMS.append(intent)

# -----------------------------------------------------
# NORMALIZATION
# -----------------------------------------------------

def normalize_condition(raw_condition):
    raw = raw_condition.lower().strip()

    # Direct match
    if raw in SYNONYM_MAP:
        return SYNONYM_MAP[raw]

    # Fuzzy match (stricter threshold)
    matches = difflib.get_close_matches(raw, ALL_SYNONYMS, n=1, cutoff=0.8)

    if matches:
        best_match = matches[0]
        return SYNONYM_MAP[best_match]

    # No match
    return raw

# -----------------------------------------------------
# RELOAD (For Manual Rule Updates)
# -----------------------------------------------------

def reload_synonyms():
    global SYNONYM_MAP, ALL_SYNONYMS, HEALTH_RULES

    HEALTH_RULES = load_rules()
    SYNONYM_MAP = {}
    ALL_SYNONYMS = []

    for rule in HEALTH_RULES:
        _index_rule(rule)

    for intent in ["weather", "mood", "general_tasty"]:
        SYNONYM_MAP[intent] = intent
        if intent not in ALL_SYNONYMS:
            ALL_SYNONYMS.append(intent)

# -----------------------------------------------------
# GET ALL CONDITION IDS
# -----------------------------------------------------

def get_all_conditions():
    return [rule.get("id") for rule in HEALTH_RULES if rule.get("id")]