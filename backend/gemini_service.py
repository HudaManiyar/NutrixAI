import os
import json
from dotenv import load_dotenv

load_dotenv()

try:
    from google import genai
    GOOGLE_AVAILABLE = True
except Exception:
    GOOGLE_AVAILABLE = False

try:
    from groq_service import GroqService
    GROQ_AVAILABLE = True
except Exception:
    GROQ_AVAILABLE = False


class GeminiService:
    _groq_calls_this_session = 0
    _GROQ_SESSION_LIMIT = 20  # max Groq calls per server session
    """
    Groq  = Primary LLM
    Gemini = Fallback LLM (google-genai SDK)
    """

    def __init__(self):
        self.google_api_key = os.getenv("GOOGLE_API_KEY")
        self.gemini_client = None
        self.model_name = "gemini-2.0-flash"

        # ── Groq (Primary) ─────────────────
        self.groq = GroqService() if GROQ_AVAILABLE else None

        # ── Gemini (Fallback) ──────────────
        # google-genai SDK: Client(api_key=...) → client.models.generate_content()
        if GOOGLE_AVAILABLE and self.google_api_key:
            try:
                self.gemini_client = genai.Client(api_key=self.google_api_key)
                print("Gemini fallback initialised (google-genai SDK).")
            except Exception as e:
                print(f"Gemini init error: {e}")
                self.gemini_client = None

    def is_available(self) -> bool:
        if self.groq and self.groq.is_available():
            return True
        if self.gemini_client:
            return True
        return False

    def _ask_llm(self, prompt: str) -> str:
        # 1. Primary → Groq (with session limit)
        if self.groq and self.groq.is_available():
            if GeminiService._groq_calls_this_session < GeminiService._GROQ_SESSION_LIMIT:
                try:
                    GeminiService._groq_calls_this_session += 1
                    res = self.groq.generate_content(prompt)
                    if res:
                        return res
                except Exception as e:
                    print(f"Groq error: {e}")
            else:
                print(f"[Groq] Session limit reached, using Gemini")

        # 2. Fallback → Gemini
        if self.gemini_client:
            try:
                response = self.gemini_client.models.generate_content(
                    model=self.model_name,
                    contents=prompt
                )
                return (response.text or "").strip()
            except Exception as e:
                print(f"Gemini error: {e}")

        return ""

    def cross_check_location(self, text: str, detected_location: str) -> str:
        # Disabled — too expensive, location detection works without LLM
        return detected_location

    def cross_check_restaurants(self, dish: str, restaurants: list) -> list:
        # Disabled — too expensive in tokens, marginal benefit
        return restaurants  # just return as-is

    def extract_symptoms(self, text: str):
        if not self.is_available():
            return None

        prompt = (
            f'Extract ONLY health symptoms or moods from:\n"{text}"\n\n'
            "Return comma-separated tags. If none found, return 'unknown'.\n"
            "Return ONLY the tags."
        )

        res = self._ask_llm(prompt)
        return res.lower().strip() if res else None

    def generate_health_rules(self, condition: str) -> dict:
        """Generates allowed and avoided Indian foods for a new health condition."""
        if not self.is_available():
            return {}

        prompt = (
            f"You are a clinical dietitian for Indian cuisine. The user has this condition: '{condition}'.\n"
            "Generate a JSON object with exactly two keys: 'allowed_food' and 'avoid_food'.\n"
            "Each key should map to an array of 8-10 specific Indian dishes or food items.\n"
            "Ensure the foods are scientifically appropriate for the condition.\n"
            "Return ONLY standard JSON. No markdown formatting, no backticks, no extra text."
        )

        result_text = self._ask_llm(prompt)
        if not result_text:
            return {}

        try:
            # Clean possible markdown formatting
            clean_text = result_text.strip()
            if clean_text.startswith("```json"):
                clean_text = clean_text[7:]
            if clean_text.startswith("```"):
                clean_text = clean_text[3:]
            if clean_text.endswith("```"):
                clean_text = clean_text[:-3]
                
            data = json.loads(clean_text.strip())
            
            # Validate structure
            if "allowed_food" in data and "avoid_food" in data:
                return data
            return {}
        except Exception as e:
            print(f"Error parsing generated health rules for '{condition}': {e}")
            return {}
