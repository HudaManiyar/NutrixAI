import { useState, useEffect, useRef } from "react";
import {
  Star, MapPin, Cloud, CloudRain, Sun, Thermometer,
  ChevronRight, Utensils, Zap, Wind, Send, MessageSquare,
  Menu, RefreshCcw, Navigation, Clock, TrendingUp, X,
  ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Droplets,
  Mic, MicOff, Heart, Bookmark, ShoppingCart, Bot, Leaf
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { LocationPrompt } from "./components/LocationPrompt";
import { RecipeModal } from "./components/RecipeModal";
import { SavedItemsPage } from "./components/SavedItemsPage";
import { AboutPage } from "./components/AboutPage";
import { useSavedItems } from "./components/useSavedItems";
import { NutrixFoodCard } from "./components/NutrixFoodCard";

// ─── Weather food image imports ───────────────────────────────────────────────
import acai from './assets/images/acai.png';
import avocadotoast from './assets/images/avocadotoast.png';
import ramen from './assets/images/ramen.png';
import khichdi from './assets/images/khichdi.png';
import pasta from './assets/images/pasta.png';
import quinoa from './assets/images/quinoa.png';
import logoImg from './assets/images/logo.png';

// ─── Self-hosted dish photos (replaces live Wikimedia/Unsplash lookups) ───────
import dishBiryani from './assets/images/food/biryani.jpg';
import dishButterChicken from './assets/images/food/butterchicken.jpg';
import dishChai from './assets/images/food/chai.jpg';
import dishCoconutWater from './assets/images/food/coconutwater.jpg';
import dishColdCoffee from './assets/images/food/coldcoffee.jpg';
import dishCurdRice from './assets/images/food/curdrice.jpg';
import dishDalMakhani from './assets/images/food/dalmakhani.jpg';
import dishDosa from './assets/images/food/dosa.jpg';
import dishDryFruits from './assets/images/food/dryfruits.jpg';
import dishEggs from './assets/images/food/eggs.jpg';
import dishFrenchToast from './assets/images/food/frenchtoast.jpg';
import dishFruits from './assets/images/food/fruits.jpg';
import dishHotChoco from './assets/images/food/hotchocolate.jpg';
import dishIceCream from './assets/images/food/icecream.jpg';
import dishIdli from './assets/images/food/idli.jpg';
import dishKhichdi from './assets/images/food/khichdi.jpg';
import dishKulfi from './assets/images/food/kulfi.jpg';
import dishLassi from './assets/images/food/lassi.jpg';
import dishLemonRice from './assets/images/food/lemonrice.jpg';
import dishMomos from './assets/images/food/momos.jpg';
import dishNoodles from './assets/images/food/noodles.jpg';
import dishOats from './assets/images/food/oats.jpg';
import dishPakora from './assets/images/food/pakora.jpg';
import dishPaneer from './assets/images/food/paneer.jpg';
import dishPaniPuri from './assets/images/food/panipuri.jpg';
import dishParatha from './assets/images/food/paratha.jpg';
import dishPavBhaji from './assets/images/food/pavbhaji.jpg';
import dishPizza from './assets/images/food/pizza.jpg';
import dishPoha from './assets/images/food/poha.jpg';
import dishPongal from './assets/images/food/pongal.jpg';
import dishRaita from './assets/images/food/raita.jpg';
import dishRajma from './assets/images/food/rajma.jpg';
import dishRasam from './assets/images/food/rasam.jpg';
import dishRice from './assets/images/food/rice.jpg';
import dishSambarRice from './assets/images/food/sambarrice.jpg';
import dishSamosa from './assets/images/food/samosa.jpg';
import dishSoup from './assets/images/food/soup.jpg';
import dishTea from './assets/images/food/tea.jpg';
import dishThali from './assets/images/food/thali.jpg';
import heroThali from './assets/images/thali_hero.png';
import dishToast from './assets/images/food/toast.jpg';
import dishTomatoSoup from './assets/images/food/tomatosoup.jpg';
import dishUpma from './assets/images/food/upma.jpg';
import dishUthapam from './assets/images/food/uthapam.jpg';
import dishVadaPav from './assets/images/food/vadapav.jpg';
import dishWater from './assets/images/food/water.jpg';
import dishLemonWater from './assets/images/food/lemonwater.jpg';
import dishTurmericMilk from './assets/images/food/turmericmilk.jpg';
import dishJuice from './assets/images/food/juice.jpg';

const weatherImageMap = {
  rain: ramen,           // Rainy day → warm ramen
  rainy: ramen,
  hot: acai,              // Hot & sunny (>32°C) → cooling acai bowl
  heat: acai,
  sunny: avocadotoast,    // Pleasant sun → light avocado toast
  cloudy: pasta,          // Cloudy/overcast → hearty pasta
  overcast: pasta,
  cold: khichdi,          // Cold or misty → warming khichdi
  misty: khichdi,
  pleasant: heroThali,    // Pleasant default → hero thali spread
  default: heroThali,
};

// ─── Dish image map ───────────────────────────────────────────────────────────
// Self-hosted local photos only. Anything NOT listed here falls through to the
// backend's live image (item.image) and then the KEYWORD_FALLBACKS below —
// intentionally NOT to a hand-curated URL list anymore.
const DISH_IMAGES = {
  // Rice & khichdi family
  "poha": dishPoha,
  "idli": dishIdli,
  "dosa": dishDosa,
  "neer dosa": dishDosa,
  "pesarattu": dishDosa,
  "khichdi": dishKhichdi,
  "moong dal khichdi": dishKhichdi,
  "upma": dishUpma,
  "uttapam": dishUthapam,
  "biryani": dishBiryani,
  "rasam": dishRasam,
  "sambar": dishSambarRice,
  "sambar rice": dishSambarRice,
  "curd rice": dishCurdRice,
  "lemon rice": dishLemonRice,
  "jeera rice": dishRice,
  "plain rice": dishRice,
  "brown rice": dishRice,
  "white rice": dishRice,
  "steamed rice": dishRice,
  "pongal": dishPongal,

  // Dal / paneer mains
  "dal makhani": dishDalMakhani,
  "dal": dishDalMakhani,
  "dal chawal": dishDalMakhani,
  "dal tadka": dishDalMakhani,
  "dal palak": dishDalMakhani,
  "moong dal": dishDalMakhani,
  "paneer": dishPaneer,
  "paneer tikka": dishPaneer,
  "paneer butter masala": dishPaneer,
  "butter chicken": dishButterChicken,
  "rajma chawal": dishRajma,
  "rajma masala": dishRajma,

  // Snacks
  "samosa": dishSamosa,
  "pakora": dishPakora,
  "pani puri": dishPaniPuri,
  "vada pav": dishVadaPav,
  "pav bhaji": dishPavBhaji,
  "momos": dishMomos,
  "pizza": dishPizza,
  "noodles": dishNoodles,
  "maggi": dishNoodles,
  "paratha": dishParatha,
  "thalipeeth": dishParatha,
  "toast": dishToast,
  "french toast": dishFrenchToast,

  // Breakfast / light
  "oatmeal": dishOats,
  "raita": dishRaita,
  "egg": dishEggs,
  "boiled egg": dishEggs,
  "thali": dishThali,

  // Soups
  "vegetable soup": dishSoup,
  "chicken soup": dishSoup,
  "moong dal soup": dishSoup,
  "tomato soup": dishTomatoSoup,

  // Drinks
  "lassi": dishLassi,
  "mango lassi": dishLassi,
  "buttermilk": dishLassi,
  "masala chai": dishChai,
  "ginger tea": dishTea,
  "green tea": dishTea,
  "cold coffee": dishColdCoffee,
  "hot chocolate": dishHotChoco,
  "coconut water": dishCoconutWater,
  "kulfi": dishKulfi,
  "ice cream": dishIceCream,
  "ors": dishWater,
  "water": dishWater,
  "warm water": dishWater,
  "ginger water": dishWater,
  "lemon water": dishLemonWater,
  "honey lemon water": dishLemonWater,
  "nimbu pani": dishLemonWater,
  "turmeric milk": dishTurmericMilk,
  "golden milk": dishTurmericMilk,
  "fruit juice": dishJuice,
  "orange juice": dishJuice,
  "amla juice": dishJuice,
  "juice": dishJuice,

  // Fruits & dry fruits
  "banana": dishFruits,
  "papaya": dishFruits,
  "mango": dishFruits,
  "apple": dishFruits,
  "stewed apple": dishFruits,
  "orange": dishFruits,
  "watermelon": dishFruits,
  "pomegranate": dishFruits,
  "fruit bowl": dishFruits,
  "fruit salad": dishFruits,
  "dates": dishDryFruits,
  "nuts": dishDryFruits,
  "almonds": dishDryFruits,
};

const PLACEHOLDER = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80";

const KEYWORD_FALLBACKS = [
  { words: ["soup", "broth", "rasam"], img: "https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80" },
  { words: ["tea", "chai"], img: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80" },
  { words: ["coffee"], img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80" },
  { words: ["juice", "lemon", "water"], img: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=800&q=80" },
  { words: ["ice cream", "icecream", "kulfi", "dessert", "sweet"], img: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800&q=80" },
  { words: ["rice", "pulao", "khichdi"], img: "https://images.unsplash.com/photo-1667574574861-01ea06b647fd?w=800&q=80" },
  { words: ["dal", "lentil"], img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80" },
  { words: ["paneer", "tikka", "curry"], img: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&q=80" },
  { words: ["salad", "sprout", "bowl"], img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80" },
  { words: ["biryani", "fried rice"], img: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=800&q=80" },
  { words: ["pizza"], img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80" },
  { words: ["burger"], img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80" },
  { words: ["noodle", "pasta"], img: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80" },
  { words: ["wrap", "sandwich", "roll"], img: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&q=80" },
  { words: ["chicken", "fish", "meat"], img: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&q=80" },
  { words: ["milk", "lassi", "butter"], img: "https://images.unsplash.com/photo-1622597467836-f38240662c8b?w=800&q=80" },
];

const getDishImage = (item) => {
  const key = (item?.dish || "").toLowerCase().trim();
  if (DISH_IMAGES[key]) return DISH_IMAGES[key];
  const firstWord = key.split(" ")[0];
  if (DISH_IMAGES[firstWord]) return DISH_IMAGES[firstWord];
  for (const [mapKey, mapUrl] of Object.entries(DISH_IMAGES)) {
    if (key.includes(mapKey) || mapKey.includes(key)) return mapUrl;
  }
  // Catch-all buckets for dish names the backend/LLM generates dynamically
  // (e.g. "hot soup", "garlic soup") that won't match an exact/substring key above.
  if (key.includes("soup") && !key.includes("tomato")) return dishSoup;
  if (key.includes("rice")) return dishRice;
  if (key.includes("juice")) return dishJuice;
  const img = item?.image || "";
  if (img && img.startsWith("http") && !img.includes("placeholder")) return img;
  for (const { words, img: fallbackImg } of KEYWORD_FALLBACKS) {
    if (words.some((w) => key.includes(w))) return fallbackImg;
  }
  return PLACEHOLDER;
};

// ─── Dish display-name formatting ─────────────────────────────────────────────
// Backend dish names arrive lowercase (e.g. "curd rice", "ors"). This renders
// them properly capitalised for display, with known acronyms kept fully upper.
const ACRONYM_DISH_NAMES = new Set(["ors"]);
const formatDishName = (name) => {
  if (!name) return "";
  const lower = name.toLowerCase().trim();
  if (ACRONYM_DISH_NAMES.has(lower)) return lower.toUpperCase();
  return lower
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
};

// ─── Weather headline map ─────────────────────────────────────────────────────
const weatherHeadlines = {
  rain: "Rainy day outside?\nWarm your soul with comfort food.",
  rainy: "Rainy day outside?\nWarm your soul with comfort food.",
  hot: "Scorching outside?\nBeat the heat the Indian way.",
  sunny: "Sunny day, great appetite?\nDiscover the best food for you.",
  cloudy: "Cloudy skies today?\nA hearty Indian meal hits the spot.",
  overcast: "Cloudy skies today?\nA hearty Indian meal hits the spot.",
  cold: "Cool air outside?\nSomething hot and nourishing awaits.",
  misty: "Misty morning vibes?\nCozy up with something wholesome.",
  pleasant: "What are you\ncraving today?",
  default: "What are you\ncraving today?",
};

// ─── ADD 3: Weather reasoning line map ──────────────────────────────────────
const weatherReasoningMap = {
  "hot_sunny": "Showing cooling foods to beat the heat 🥤",
  "rainy": "Showing warm comfort foods for rainy weather ☔",
  "cold_winter": "Showing warming foods for cold weather 🍲",
  "cloudy_gloomy": "Showing hearty foods for cloudy skies ⛅",
  "humid_sticky": "Showing light foods for humid weather 💨",
  "pleasant_mild": "Showing balanced foods for pleasant weather 🌤️",
};

// ─── ADD 1: Meal time client-side filtering ───────────────────────────────────
const BREAKFAST_FOODS = ["idli", "dosa", "upma", "poha", "oatmeal", "daliya", "ginger tea", "green tea", "banana", "toast", "neer dosa"];
const LUNCH_FOODS = ["biryani", "dal chawal", "khichdi", "curd rice", "roti", "rajma", "paneer", "sambar", "rasam", "dal tadka"];
const DINNER_FOODS = ["khichdi", "soup", "rasam", "dal", "roti", "moong dal", "vegetable soup", "idli", "curd rice", "turmeric milk"];

const filterByMealTime = (results, mealTime) => {
  if (mealTime === "Any Time") return results;
  const timeList = mealTime === "Breakfast" ? BREAKFAST_FOODS
    : mealTime === "Lunch" ? LUNCH_FOODS : DINNER_FOODS;
  const filtered = results.filter(r =>
    timeList.some(food => (r.dish || "").toLowerCase().includes(food))
  );
  return filtered.length >= 2 ? filtered : results; // fallback to all if too few matches
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [text, setText] = useState("");
  const BACKEND_URL = "http://127.0.0.1:8000";
  const [location, setLocation] = useState("");
  const [coords, setCoords] = useState(null);
  const [results, setResults] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [weather, setWeather] = useState({ temp: null, condition: "clear" });
  const [weatherUi, setWeatherUi] = useState({
    mode: "Pleasant • Healthy Mode",
    hook: "Great weather for a balanced meal",
    icon: "cloud",
    bg_type: "pleasant",
  });
  const [weatherPrelude, setWeatherPrelude] = useState("");
  const [loading, setLoading] = useState(false);
  const [recipeModal, setRecipeModal] = useState(null);
  const [diet, setDiet] = useState("all");
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [page, setPage] = useState("home");
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [locationDismissed, setLocationDismissed] = useState(false);
  const [lastQuery, setLastQuery] = useState("weather");
  const [mealTime, setMealTime] = useState("Any Time");
  const [showAllResults, setShowAllResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => JSON.parse(localStorage.getItem("recent_searches") || "[]"));
  const chatEndRef = useRef(null);
  const transcriptRef = useRef("");
  const hasAutoTriggered = useRef(false);
  const userInteractedRef = useRef(false);

  const { liked, bookmarked, toggleLike, toggleBookmark, removeLiked, removeBookmarked } = useSavedItems();

  const getGreeting = () => {
    const nowIST = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata", hour: "numeric", hour12: false });
    const h = parseInt(nowIST, 10);
    if (h >= 5 && h < 12) return "Good Morning";
    if (h >= 12 && h < 17) return "Good Afternoon";
    if (h >= 17 && h < 21) return "Good Evening";
    return "Good Night";
  };
  const [greeting, setGreeting] = useState(getGreeting);
  const [context, setContext] = useState(null);

  useEffect(() => {
    setGreeting(getGreeting());
    const timer = setInterval(() => setGreeting(getGreeting()), 60_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [page]);

  // ── 10-minute weather refresh ─────────────────────────────────────────────
  const weatherIntervalRef = useRef(null);

  useEffect(() => {
    if (!navigator.geolocation) { setLocation("Bengaluru"); return; }
    try {
      const saved = JSON.parse(localStorage.getItem("fp_location") || "null");
      if (saved?.name && saved?.lat && saved?.lon) {
        setLocation(saved.name);
        setCoords({ lat: saved.lat, lon: saved.lon });
        loadInitialWeather(saved.name, saved.lat, saved.lon);

        // FIX 1: re-fetch weather every 10 minutes
        weatherIntervalRef.current = setInterval(() => {
          loadInitialWeather(saved.name, saved.lat, saved.lon);
        }, 10 * 60 * 1000);

        return;
      }
    } catch { }
    setShowLocationPrompt(true);
  }, []);

  // Clear interval on unmount
  useEffect(() => {
    return () => { if (weatherIntervalRef.current) clearInterval(weatherIntervalRef.current); };
  }, []);

  // Collapse back to the top 5 whenever a new result set comes in
  useEffect(() => {
    setShowAllResults(false);
  }, [results]);

  useEffect(() => {
    if (location && coords) {
      if (lastQuery === "weather") {
        loadInitialWeather(location, coords.lat, coords.lon);
      } else {
        handleSend(lastQuery);
      }
    }
  }, [diet]);

  // ADD 1: Re-fetch when meal time changes
  useEffect(() => {
    if (location && coords && (results.length > 0 || lastQuery !== "weather")) {
      if (lastQuery === "weather") {
        loadInitialWeather(location, coords.lat, coords.lon);
      } else {
        handleSend(lastQuery);
      }
    }
  }, [mealTime]);

  const requestLocation = () => {
    navigator.geolocation.getCurrentPosition(
      async ({ coords: pos }) => {
        const { latitude, longitude } = pos;
        setCoords({ lat: latitude, lon: longitude });
        setShowLocationPrompt(false);
        try {
          const geo = await fetch(`${BACKEND_URL}/geocode/reverse?lat=${latitude}&lon=${longitude}`).then((r) => r.json());
          const displayName = geo.city || geo.neighbourhood || "Bengaluru";
          setLocation(displayName);
          localStorage.setItem("fp_location", JSON.stringify({ name: displayName, lat: latitude, lon: longitude }));
          loadInitialWeather(displayName, latitude, longitude);
        } catch {
          setLocation("Bengaluru");
          loadInitialWeather("Bengaluru", 12.9716, 77.5946);
        }
      },
      (err) => {
        // GPS denied or unavailable — keep the prompt open so user can type their location
        // Only dismiss if user explicitly clicked Maybe Later
        console.warn("GPS error:", err.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Called when user types a location name manually and clicks Confirm
  const handleManualLocation = async (typedText) => {
    try {
      const res = await fetch(`${BACKEND_URL}/geocode/search?text=${encodeURIComponent(typedText)}`).then(r => r.json());
      if (res.lat && res.lon) {
        const displayName = res.name || typedText;
        setLocation(displayName);
        setCoords({ lat: res.lat, lon: res.lon });
        localStorage.setItem("fp_location", JSON.stringify({ name: displayName, lat: res.lat, lon: res.lon }));
        setShowLocationPrompt(false);
        loadInitialWeather(displayName, res.lat, res.lon);
      } else {
        // Location text not resolved — fall back to text-only (no GPS coords)
        setLocation(typedText);
        setCoords(null);
        localStorage.setItem("fp_location", JSON.stringify({ name: typedText, lat: null, lon: null }));
        setShowLocationPrompt(false);
        loadInitialWeather(typedText, 12.9716, 77.5946);
      }
    } catch {
      setLocation(typedText);
      setCoords(null);
      setShowLocationPrompt(false);
      loadInitialWeather(typedText, 12.9716, 77.5946);
    }
  };

  const handleChangeLocation = () => {
    localStorage.removeItem("fp_location");
    setLocation("");
    setCoords(null);
    setLocationDismissed(false);
    setShowLocationPrompt(true);
    hasAutoTriggered.current = false;
    setChatHistory([]);
    setResults([]);
  };

  const loadInitialWeather = async (city, lat, lon) => {
    setLoading(true);
    setLastQuery("weather");
    try {
      // FIX 3: debug log to verify call is made with real coords
      console.log("[Nutrix] loadInitialWeather calling /recommend:", { text: "weather", city, lat, lon });

      const res = await fetch(
        `${BACKEND_URL}/recommend?text=weather&location=${encodeURIComponent(city)}&lat=${lat}&lon=${lon}&diet=${diet}`,
        { method: "POST" }
      );
      const data = await res.json();
      console.log("[Nutrix] /recommend response dishes:", data.filter(i => i.type === "food").map(i => i.dish));
      applyWeatherFromResponse(data);

      const top = data.find((i) => i.weather_prelude || i.weather_ui);
      const prelude = top?.weather_prelude || "";
      const modeLabel = top?.weather_ui?.mode || "Pleasant • Healthy Mode";

      const greeting = prelude
        ? `${prelude}`
        : `In ${city}: ${modeLabel}. Here are recommendations for this weather.`;

      // FIX 3: set food results from THIS call (don't need autoTriggerQuery)
      const foodItems = data.filter((i) => i.type === "food");
      if (foodItems.length > 0) {
        setResults(foodItems);
        const names = foodItems.map((f) => formatDishName(f.dish)).slice(0, 3).join(", ");
        const extra = foodItems.length > 3 ? ` and ${foodItems.length - 3} more` : "";
        // ADD 3: Use bg_type from API to show a contextual reasoning line in chat
        const bgType = top?.weather_ui?.bg_type || "pleasant_mild";
        const reasoningLine = weatherReasoningMap[bgType] || "Showing foods matched to your current weather 🌿";
        setChatHistory([
          { type: "system", text: greeting },
          { type: "system", text: reasoningLine },
          { type: "system", text: `Showing ${foodItems.length} picks: ${names}${extra}. Type a symptom to refine.` }
        ]);
      } else if (!hasAutoTriggered.current) {
        // No results yet — trigger secondary query
        autoTriggerQuery(greeting, city, lat, lon);
      }

      const withCtx = [...data].reverse().find((i) => i.context);
      if (withCtx) setContext(withCtx.context);
    } catch (e) {
      console.error("Weather load error:", e);
    } finally {
      setLoading(false);
    }
  };

  const autoTriggerQuery = async (greetingMsg, city, lat, lon) => {
    if (hasAutoTriggered.current) return;
    hasAutoTriggered.current = true;

    setChatHistory([{ type: "system", text: greetingMsg }]);
    setLoading(true);

    try {
      let url = `${BACKEND_URL}/recommend?text=weather&location=${encodeURIComponent(city || "Bengaluru")}&diet=${diet}`;
      if (lat && lon) url += `&lat=${lat}&lon=${lon}`;
      console.log("[Nutrix] autoTriggerQuery calling /recommend:", url);
      const res = await fetch(url, { method: "POST" });
      const data = await res.json();
      applyWeatherFromResponse(data);

      const foodItems = data.filter((i) => i.type === "food");
      if (foodItems.length > 0) {
        setResults(foodItems);
        const names = foodItems.map((f) => formatDishName(f.dish)).slice(0, 3).join(", ");
        const extra = foodItems.length > 3 ? ` and ${foodItems.length - 3} more` : "";
        setChatHistory((prev) => [
          ...prev,
          { type: "system", text: `Showing ${foodItems.length} recommendations: ${names}${extra}. Tell me how you feel to refine these further.` },
        ]);
      }
      // FIX 3: NO hardcoded fallback — if API returns nothing, show empty state cleanly

      const withCtx = [...data].reverse().find((i) => i.context);
      if (withCtx) setContext(withCtx.context);
    } catch (e) {
      console.error("Auto-trigger error:", e);
    } finally {
      setLoading(false);
    }
  };

  const applyWeatherFromResponse = (data) => {
    const top = data.find((i) => i.weather_prelude || i.weather_ui);
    if (!top) return;
    if (top.weather_prelude) setWeatherPrelude(top.weather_prelude);
    if (top.weather_ui) setWeatherUi(top.weather_ui);

    const prelude = top.weather_prelude || "";
    const degreeSign = "\u00b0";
    const tempMatch =
      prelude.match(new RegExp("(\\d+)\\s*" + degreeSign + "C", "i")) ||
      prelude.match(new RegExp("(\\d+)\\s*" + degreeSign, "i")) ||
      prelude.match(/(\d+)\s*degrees/i);

    const tempFromUi =
      typeof top.weather_ui?.temp === "number" ? top.weather_ui.temp :
        typeof top.weather_ui?.temperature === "number" ? top.weather_ui.temperature :
          null;

    const parsedTemp = tempMatch
      ? parseInt(tempMatch[1])
      : tempFromUi !== null
        ? Math.round(tempFromUi)
        : null;

    setWeather({
      temp: parsedTemp,
      condition: top.weather_ui?.bg_type || "pleasant",
    });
  };

  useEffect(() => {
    if (chatHistory.length > 2 && userInteractedRef.current) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]);

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setVoiceError("Voice not supported in this browser. Use Chrome or Edge."); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onstart = () => { setIsListening(true); setVoiceError(""); };
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map((r) => r[0].transcript).join("");
      setText(transcript);
      transcriptRef.current = transcript;
    };
    recognition.onend = () => {
      setIsListening(false);
      if (transcriptRef.current.trim()) { handleSend(transcriptRef.current.trim()); transcriptRef.current = ""; }
    };
    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error === "no-speech") setVoiceError("No speech detected. Try again.");
      else if (event.error === "not-allowed") setVoiceError("Microphone access denied.");
      else setVoiceError("Voice error: " + event.error);
    };
    recognition.start();
  };

  const saveRecentSearch = (query) => {
    if (query === "weather") return;
    const updated = [query, ...recentSearches.filter(q => q !== query)].slice(0, 3);
    setRecentSearches(updated);
    localStorage.setItem("recent_searches", JSON.stringify(updated));
  };

  const handleSend = async (manualText) => {
    const query = manualText || text;
    if (!query) return;
    userInteractedRef.current = true;
    setLoading(true);
    setLastQuery(query);
    saveRecentSearch(query);
    setChatHistory((prev) => [...prev, { type: "user", text: query }]);
    setText("");
    try {
      let url = `${BACKEND_URL}/recommend?text=${encodeURIComponent(query)}&location=${encodeURIComponent(location || "Bengaluru")}&diet=${diet}`;
      if (coords) url += `&lat=${coords.lat}&lon=${coords.lon}`;
      if (context) url += `&previous_context=${encodeURIComponent(context)}`;
      const res = await fetch(url, { method: "POST" });
      const data = await res.json();
      applyWeatherFromResponse(data);
      const sysMsgs = data.filter((i) => i.type === "question" || i.type === "message");
      sysMsgs.forEach((msg) => {
        setChatHistory((prev) => [...prev, { 
          type: "system", 
          text: msg.message || msg.why || "I found some recommendations for you.",
          note_type: msg.note_type 
        }]);
      });
      const foodItems = data.filter((i) => i.type === "food");
      if (foodItems.length > 0) {
        setResults(foodItems);
        const cond = (foodItems[0]?.context || "your condition").replace(/_/g, " ");
        const names = foodItems.map((f) => formatDishName(f.dish)).slice(0, 3).join(", ");
        const preludeText = foodItems[0]?.weather_prelude || "";
        const extra = foodItems.length > 3 ? ` and ${foodItems.length - 3} more` : "";
        const reply = preludeText
          ? `${preludeText} Here are ${foodItems.length} recommendations for ${cond}: ${names}${extra}.`
          : `Found ${foodItems.length} safe options for ${cond}: ${names}${extra}.`;
        setChatHistory((prev) => [...prev, { type: "system", text: reply }]);
      }
      const withCtx = [...data].reverse().find((i) => i.context);
      if (withCtx) setContext(withCtx.context);
    } catch (err) {
      console.error(err);
      setChatHistory((prev) => [...prev, { type: "system", text: "Couldn't reach the server. Make sure the backend is running on port 8000." }]);
    } finally {
      setLoading(false);
    }
  };

  const weatherCondition = weatherUi.bg_type || "pleasant";
  const heroImage = weatherImageMap[weatherCondition?.toLowerCase()] ?? heroThali;
  const heroHeadline = (weatherHeadlines[weatherCondition] || weatherHeadlines.default);

  const getWeatherLabel = (bg) => {
    switch (bg) {
      case "rain": return "Rainy";
      case "cold": return "Cold";
      case "heat": case "hot": return "Hot";
      case "cloudy": return "Cloudy";
      case "sunny": return "Sunny";
      default: return "Pleasant";
    }
  };

  const getWeatherLucideIcon = (bg, size = 14) => {
    switch (bg) {
      case "rain": return <CloudRain size={size} />;
      case "cold": return <Wind size={size} />;
      case "heat": case "hot": return <Sun size={size} />;
      case "cloudy": return <Cloud size={size} />;
      case "sunny": return <Sun size={size} />;
      default: return <Cloud size={size} />;
    }
  };

  const savesCount = Object.keys(liked).length + Object.keys(bookmarked).length;

  const meshBg = {
    backgroundColor: "#F2E4C8",
    backgroundImage: `
      radial-gradient(circle at 78%  6%,  rgba(210,145,40,0.50)  0%, transparent 38%),
      radial-gradient(circle at 12% 12%, rgba(240,195,90,0.30)  0%, transparent 35%),
      radial-gradient(circle at 20% 52%, rgba(235,185,70,0.18)  0%, transparent 30%),
      radial-gradient(circle at 60% 98%, rgba(185,140,55,0.28)  0%, transparent 45%)
    `,
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
    minHeight: "100vh",
  };

  // ── Saves page ────────────────────────────────────────────────────────────────
  if (page === "saves") {
    return (
      <div style={meshBg}>
        <SavedItemsPage
          liked={liked}
          bookmarked={bookmarked}
          removeLiked={removeLiked}
          removeBookmarked={removeBookmarked}
          onBack={() => setPage("home")}
          savesCount={savesCount}
          location={location}
          weather={weather}
          weatherUi={weatherUi}
          getWeatherLucideIcon={getWeatherLucideIcon}
          getWeatherLabel={getWeatherLabel}
          handleChangeLocation={handleChangeLocation}
          setPage={setPage}
          getDishImage={getDishImage}
          formatDishName={formatDishName}
          setRecipeModal={setRecipeModal}
        />
        <RecipeModal recipeModal={recipeModal} setRecipeModal={setRecipeModal} getDishImage={getDishImage} formatDishName={formatDishName} />
      </div>
    );
  }

  // ── About page ───────────────────────────────────────────────────────────────
  if (page === "about") {
    return (
      <div style={meshBg} className="font-sans">
        <nav style={{ height: 62, position: "sticky", top: 0, zIndex: 100, background: "rgba(242,228,200,0.88)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", borderBottom: "1px solid rgba(200,178,130,0.45)", display: "flex", alignItems: "center", padding: "0 32px" }}>
          <a href="#" onClick={(e) => { e.preventDefault(); setPage("home"); }} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", marginRight: 32 }}>
            <div style={{ width: 54, height: 54, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <img src={logoImg} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
            <div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: 20, color: "#1C1813", lineHeight: 1.05, letterSpacing: "-0.01em" }}>NUTRIX <span style={{ color: "#C9790A" }}>AI</span></div>
              <div style={{ fontSize: 9, color: "#9A8A78", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2 }}>Your Smart Nutritionist</div>
            </div>
          </a>
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={() => setPage("home")} style={{ padding: "6px 18px", borderRadius: 22, fontSize: 14, fontWeight: 600, color: "#7A6E62", background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Discover</button>
            <button onClick={() => setPage("about")} style={{ padding: "6px 18px", borderRadius: 22, fontSize: 14, fontWeight: 600, color: "#E8915A", background: "#FAE8D8", border: "none", cursor: "pointer", fontFamily: "inherit" }}>About</button>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setPage("saves")} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 16px", borderRadius: 22, background: "#3D6B4F", color: "#FDFAF6", fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
              My Saves {savesCount > 0 && <span style={{ width: 18, height: 18, background: "#E8915A", borderRadius: "50%", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "white" }}>{savesCount}</span>}
            </button>
          </div>
        </nav>
        <AboutPage goHome={() => setPage("home")} />
      </div>
    );
  }

  return (
    <div style={meshBg} className="font-sans">

      {/* ── LOCATION PROMPT ───────────────────────────────────────────────────── */}
      {showLocationPrompt && !locationDismissed && (
        <LocationPrompt
          onAllow={requestLocation}
          onDismiss={() => {
            setShowLocationPrompt(false);
            setLocationDismissed(true);
            if (!location) {
              setLocation("Bengaluru");
              setCoords({ lat: 12.9716, lon: 77.5946 });
              loadInitialWeather("Bengaluru", 12.9716, 77.5946);
            }
          }}
          mode={location ? "change" : "enable"}
          currentLocation={
            location
              ? `${location}${weather.temp !== null ? ` · ${weather.temp}°C` : ""} ${getWeatherLabel(weatherUi.bg_type)}`
              : ""
          }
          onManualConfirm={handleManualLocation}
        />
      )}

      {/* ── NAVBAR ──────────────────────────────────────────────────────────── */}
      <nav style={{
        height: 62, position: "sticky", top: 0, zIndex: 100,
        background: "rgba(242,228,200,0.88)",
        backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
        borderBottom: "1px solid rgba(200,178,130,0.45)",
        display: "flex", alignItems: "center", padding: "0 32px", gap: 0,
      }}>
        <a href="#" onClick={(e) => { e.preventDefault(); setPage("home"); }} style={{ display: "flex", alignItems: "center", gap: 11, textDecoration: "none", marginRight: 32 }}>
          <div style={{ width: 60, height: 60, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <img src={logoImg} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
          <div>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: 22, color: "#1C1813", lineHeight: 1.05, letterSpacing: "-0.01em" }}>
              NUTRIX <span style={{ color: "#E8915A" }}>AI</span>
            </div>
            <div style={{ fontSize: 9, color: "#9A8A78", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 }}>
              Your Smart Nutritionist
            </div>
          </div>
        </a>

        {/* Global Navigation - Segmented Control */}
        <div style={{ display: "flex", alignItems: "center", gap: 2, background: "rgba(200,178,130,0.12)", padding: "4px 5px", borderRadius: 24, position: "relative" }}>
          {["home", "about"].map((p) => {
            const isActive = page === p;
            const label = p === "home" ? "Discover" : "About";
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  padding: "6px 16px", borderRadius: 20, fontSize: 13.5, fontWeight: 600,
                  color: isActive ? "#1C1813" : "#7A6E62",
                  background: "transparent", border: "none", cursor: "pointer",
                  fontFamily: "inherit", position: "relative", zIndex: 1,
                  transition: "color 0.15s"
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav-pill"
                    style={{
                      position: "absolute", inset: 0,
                      background: "rgba(255,255,255,0.95)", borderRadius: 20,
                      boxShadow: "0 2px 8px rgba(40,25,10,0.07), 0 1px 0 rgba(255,255,255,0.9)",
                      zIndex: -1
                    }}
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  />
                )}
                {label}
              </button>
            )
          })}
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "4px 4px 4px 14px", borderRadius: 24,
            background: "rgba(255,249,238,0.75)",
            border: "1px solid rgba(200,178,130,0.5)",
            fontSize: 12.5, color: "#1C1813", whiteSpace: "nowrap"
          }}>
            <MapPin size={13} style={{ color: "#E8915A", flexShrink: 0 }} />
            <span style={{ fontWeight: 600, color: "#1C1813" }}>{location || "Locating…"}</span>
            {location && (
              <button onClick={handleChangeLocation} style={{ background: "none", border: "none", fontSize: 10, color: "#E8915A", fontWeight: 800, letterSpacing: "0.04em", cursor: "pointer", marginRight: 4, padding: 0, fontFamily: "inherit" }}>
                CHANGE
              </button>
            )}

            {/* Weather Tag */}
            <div style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "5px 12px", borderRadius: 18,
              background: "linear-gradient(135deg, rgba(232,145,90,0.08) 0%, rgba(201,121,10,0.04) 100%)",
              border: "1px solid rgba(232,145,90,0.13)",
              color: "#C9790A", marginLeft: "auto"
            }}>
              {getWeatherLucideIcon(weatherUi.bg_type, 14)}
              <span style={{ fontWeight: 800, color: "#1C1813", fontSize: 13, marginLeft: 1 }}>
                {weather.temp !== null ? `${weather.temp}°C` : "25°C"}
              </span>
              {/* FIX 1: Use backend's mode string directly — e.g. "Sunny Morning ☀️" not remapped */}
              <span style={{ fontSize: 11, fontWeight: 500, color: "#7A6E62", marginLeft: 1 }}>
                {weatherUi.mode ? weatherUi.mode.split("•")[0].trim().split(" ")[0] : getWeatherLabel(weatherUi.bg_type)}
              </span>
            </div>
          </div>

          <button onClick={() => setPage("saves")} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 16px", borderRadius: 22, background: "#3D6B4F", color: "#FDFAF6", fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#2E5540"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#3D6B4F"; e.currentTarget.style.transform = "none"; }}
          >
            My Saves
            {savesCount > 0 && (
              <span style={{ width: 18, height: 18, background: "#E8915A", borderRadius: "50%", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "white" }}>
                {savesCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <div style={{ padding: "44px 40px 0", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 40, gap: 32, position: "relative" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 58, fontWeight: 600, color: "#1C1813", lineHeight: 1.1, maxWidth: 560, letterSpacing: "-0.01em", whiteSpace: "pre-line" }}>
              {heroHeadline}
            </div>

            <p style={{ fontSize: 16.5, color: "#3A2E22", marginTop: 14, lineHeight: 1.55, maxWidth: 490, fontWeight: 500 }}>
              Tell us how you feel or describe a symptom, and we’ll match you with the best local food for your body and weather.
            </p>

            {/* FIX 1: Only Any Diet + Vegetarian — Non-Veg removed (no non-veg data) */}
            <div style={{ display: "flex", gap: 8, marginTop: 18, flexWrap: "wrap" }}>
              {["Any Diet", "Vegetarian"].map((d) => {
                const dietKey = d === "Any Diet" ? "all" : "vegetarian";
                const isActive = diet === dietKey;
                return (
                  <button key={d} onClick={() => setDiet(dietKey)} style={{ padding: "7px 15px", borderRadius: 22, fontSize: 12.5, fontWeight: 600, border: isActive ? "1.5px solid #3D6B4F" : "1.5px solid rgba(200,178,130,0.6)", background: isActive ? "#3D6B4F" : "rgba(255,249,238,0.75)", color: isActive ? "white" : "#7A6E62", cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit" }}>
                    {d}
                  </button>
                );
              })}
            </div>

            {/* ADD 1: Meal Time filter row */}
            <div style={{ display: "flex", gap: 7, marginTop: 10, flexWrap: "wrap" }}>
              {["Any Time", "Breakfast", "Lunch", "Dinner"].map((t) => {
                const isActive = mealTime === t;
                return (
                  <button key={t} onClick={() => setMealTime(t)} style={{ padding: "5px 13px", borderRadius: 20, fontSize: 11.5, fontWeight: 600, border: isActive ? "1.5px solid #C9790A" : "1.5px solid rgba(200,178,130,0.5)", background: isActive ? "rgba(201,121,10,0.12)" : "rgba(255,249,238,0.75)", color: isActive ? "#C9790A" : "#7A6E62", cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit" }}>
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ flexShrink: 0, width: 480, height: 480, position: "relative" }}>
            <img src={heroImage} alt="Hero food" style={{ width: "100%", height: "100%", objectFit: "contain", filter: "drop-shadow(0 24px 48px rgba(40,25,10,0.22)) drop-shadow(0 8px 16px rgba(40,25,10,0.14))" }} />
          </div>
        </div>
      </div>

      {/* ── MAIN LAYOUT ──────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 40px 72px", display: "grid", gridTemplateColumns: "400px 1fr", gap: 32 }}>

        {/* LEFT: Chat */}
        <div style={{ position: "sticky", top: 78, height: "fit-content" }}>
          <div style={{ background: "rgba(255,251,245,0.78)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", borderRadius: 28, overflow: "hidden", boxShadow: "0 8px 40px rgba(40,25,10,0.08), 0 1px 0 rgba(255,255,255,0.9) inset", border: "1px solid rgba(0,0,0,0.05)" }}>
            {/* Header */}
            <div style={{ padding: "18px 20px", background: "rgba(255,249,238,0.65)", borderBottom: "1px solid rgba(200,178,130,0.22)", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: "linear-gradient(135deg, #E8915A, #C45E3E)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(232,145,90,0.4)", flexShrink: 0 }}>
                <Bot size={22} stroke="white" strokeWidth={1.8} />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: "#1C1813", fontSize: 15 }}>Food Genius</div>
                <div style={{ fontSize: 9.5, color: "#E8915A", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 }}>Neural Engine</div>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 7, height: 7, background: "#22A55A", borderRadius: "50%", display: "inline-block" }} />
                <span style={{ fontSize: 11, color: "#22A55A", fontWeight: 700 }}>LIVE</span>
                <button onClick={() => { setChatHistory([]); setContext(null); setResults([]); }} style={{ marginLeft: 8, background: "none", border: "none", cursor: "pointer", color: "#9A8A78", display: "flex", alignItems: "center" }} title="Reset">
                  <RefreshCcw size={14} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div style={{ padding: "14px 16px", height: 264, overflowY: "auto", display: "flex", flexDirection: "column", gap: 9 }}>
              {chatHistory.length === 0 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#9A8A78", fontSize: 12.5, textAlign: "center", fontStyle: "italic" }}>
                  Tell me how you feel or describe a craving…
                </div>
              )}
              {chatHistory.map((msg, i) => {
                const isDisclaimer = msg.note_type === "disclaimer";
                const isSystem = msg.type === "system";
                const isUser = msg.type === "user";

                let bg = "rgba(255,253,249,0.90)";
                let border = "1px solid rgba(200,178,130,0.18)";
                let color = "#1C1813";

                if (isUser) {
                  bg = "rgba(232,145,90,0.15)";
                  border = "1px solid rgba(232,145,90,0.12)";
                } else if (isDisclaimer) {
                  bg = "rgba(254,244,232,0.95)";
                  border = "1px solid rgba(232,145,90,0.4)";
                  color = "#C45E3E";
                }

                return (
                  <div key={i} style={{ 
                    padding: "10px 13px", 
                    borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px", 
                    background: bg, 
                    border: border, 
                    alignSelf: isUser ? "flex-end" : "flex-start",
                    maxWidth: "90%",
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: 12,
                    fontWeight: 500,
                    lineHeight: 1.55,
                    color: color,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 6
                  }}>
                    {isDisclaimer && <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 2, color: "#C45E3E" }} />}
                    <span>{msg.text}</span>
                  </div>
                )
              })}
              {loading && (
                <div style={{ padding: "10px 13px", borderRadius: "16px 16px 16px 4px", background: "rgba(255,253,249,0.90)", border: "1px solid rgba(200,178,130,0.18)", alignSelf: "flex-start", display: "flex", gap: 5 }}>
                  {[0, 0.2, 0.4].map((d, idx) => (
                    <span key={idx} style={{ width: 7, height: 7, background: "#E8915A", borderRadius: "50%", display: "inline-block" }} />
                  ))}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: "12px 16px 16px", borderTop: "1px solid rgba(200,178,130,0.22)", display: "flex", alignItems: "center", gap: 7 }}>
              <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder="Describe your symptoms..."
                style={{ flex: 1, background: "rgba(255,253,249,0.95)", border: "1px solid rgba(200,178,130,0.30)", borderRadius: 14, padding: "9px 13px", color: "#1C1813", fontSize: 12.5, fontFamily: "Inter, sans-serif", outline: "none", transition: "all 0.2s" }}
                onFocus={e => { e.target.style.borderColor = "#E8915A"; e.target.style.background = "white"; e.target.style.boxShadow = "0 0 0 3px rgba(232,145,90,0.10)"; }}
                onBlur={e => { e.target.style.borderColor = "rgba(200,178,130,0.30)"; e.target.style.background = "rgba(255,253,249,0.95)"; e.target.style.boxShadow = "none"; }}
              />
              <button onClick={handleVoiceInput} style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid rgba(200,178,130,0.30)", background: isListening ? "#E8915A" : "rgba(255,251,245,0.9)", color: isListening ? "white" : "#7A6E62", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                <Mic size={16} />
              </button>
              <button onClick={() => handleSend()} style={{ width: 36, height: 36, borderRadius: 10, border: "none", background: "linear-gradient(135deg, #E8915A, #C45E3E)", color: "white", boxShadow: "0 3px 10px rgba(232,145,90,0.4)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 15, transition: "all 0.2s" }}>
                <Send size={15} />
              </button>
            </div>
          </div>

          {/* FIX 2: bottom chips removed */}
        </div>

        {/* RIGHT: Food Feed */}
        <div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 32 }}>
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 44, fontWeight: 700, color: "#1C1813", lineHeight: 1 }}>Today's Selection</div>
              <div style={{ fontSize: 11, color: "#9A8A78", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 3 }}>Optimised for your local climate</div>
            </div>
          </div>

          {results.length === 0 && (
            <div style={{ borderRadius: 28, border: "2px dashed rgba(200,178,130,0.4)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 60, textAlign: "center", minHeight: 430, background: "rgba(255,253,250,0.5)" }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: "#FAE8D8", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <Utensils size={28} style={{ color: "#E8915A" }} className={loading ? "animate-pulse" : ""} />
              </div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, color: "#9A8A78", marginBottom: 8, transition: "all 0.3s" }}>
                {loading ? "Reviewing local menus…" : 
                 (lastQuery && lastQuery !== "weather") ? "No recommendations found" : "Waiting for your query…"}
              </div>
              <p style={{ fontSize: 13, color: "#9A8A78", maxWidth: 330, lineHeight: 1.5, opacity: 0.85 }}>
                {loading ? "Matching current weather and coordinates with our local Indian food matrix to find the best recommendations." : 
                 (lastQuery && lastQuery !== "weather") ? `We couldn't find items that match your request for "${lastQuery}" on a ${diet === "vegetarian" ? "Vegetarian" : "Any Diet"} plan.` : 
                 "Describe a symptom or what you are craving to generate your personalised nutrition plan."}
              </p>
            </div>
          )}

          {(showAllResults
            ? filterByMealTime(results, mealTime)
            : filterByMealTime(results, mealTime).slice(0, 5)
          ).map((item, index) => (
            <NutrixFoodCard key={index} item={item} index={index} getDishImage={getDishImage} formatDishName={formatDishName} liked={liked} bookmarked={bookmarked} toggleLike={toggleLike} toggleBookmark={toggleBookmark} onViewRecipe={() => setRecipeModal(item)} />
          ))}

          {filterByMealTime(results, mealTime).length > 5 && (
            <button
              onClick={() => setShowAllResults(v => !v)}
              style={{ width: "100%", marginTop: 8, padding: "12px", borderRadius: 14, fontSize: 13, color: "#E8915A", fontWeight: 700, background: "rgba(232,145,90,0.08)", border: "1.5px dashed rgba(232,145,90,0.4)", cursor: "pointer", fontFamily: "inherit" }}
            >
              {showAllResults ? "Show Less ↑" : "See All →"}
            </button>
          )}
        </div>
      </div>

      {/* Recipe Modal */}
      <RecipeModal recipeModal={recipeModal} setRecipeModal={setRecipeModal} getDishImage={getDishImage} formatDishName={formatDishName} />
    </div>
  );
}
