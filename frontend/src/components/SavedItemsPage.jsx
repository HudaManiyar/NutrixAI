import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, MapPin, Star, CalendarDays, Search, Bookmark, Heart, Trash2, ArrowRight } from "lucide-react";
import logoImg from "../assets/images/logo.png";

const PLACEHOLDER = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80";

function formatDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "";
  }
}

// ─── Match Score Ring ─────────────────────────────────────────────────────────
function MatchRing({ score }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const ringColor = score >= 90 ? "#3D6B4F" : score >= 75 ? "#E8915A" : "#C9790A";

  return (
    <div style={{
      position: "absolute", top: 12, right: 12,
      background: "rgba(253,250,246,0.95)", borderRadius: "50%",
      padding: 3, backdropFilter: "blur(6px)",
      boxShadow: "0 2px 10px rgba(60,40,20,0.15)", zIndex: 2,
    }}>
      <div style={{ position: "relative", width: 52, height: 52 }}>
        <svg width="52" height="52" viewBox="0 0 52 52" style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
          <circle cx="26" cy="26" r={r} fill="none" stroke="#E0D4C4" strokeWidth="3.5" />
          <circle cx="26" cy="26" r={r} fill="none" stroke={ringColor} strokeWidth="3.5"
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.2s ease" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, color: "#1C1813", lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: 6, color: "#9A8A78", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", marginTop: 1 }}>MATCH</span>
        </div>
      </div>
    </div>
  );
}

// ─── Recipe Card (Saved Recipes tab) ─────────────────────────────────────────
function RecipeCard({ item, onRemove, onViewRecipe, index, getDishImage, formatDishName }) {
  const [hovered, setHovered] = useState(false);
  const score = Math.min(99, Math.round(item.score || 82));
  const imgSrc = getDishImage ? getDishImage(item) : (item.image || PLACEHOLDER);
  const nutrition = item.nutrition || {};
  const tags = item.health_tags?.length > 0 ? item.health_tags.slice(0, 2) : ["Healthy Choice"];
  const tagStyles = [
    { background: "#D4EDE0", color: "#2E5540" },
    { background: "#FEF0D0", color: "#7A4A05" },
    { background: "#FAE8D8", color: "#8B4513" },
  ];
  const badge = item.place_type === "grocery" ? "GROCERY" : item.recipe ? "HOME RECIPE" : "RESTAURANT";

  const macros = [
    { label: "Protein", value: Math.round(nutrition.protein || 0), unit: "g", color: "#E8915A", pct: Math.min(100, (nutrition.protein || 0) * 5) },
    { label: "Carbs",   value: Math.round(nutrition.carbohydrates || 0), unit: "g", color: "#3D6B4F", pct: Math.min(100, (nutrition.carbohydrates || 0) * 1.6) },
    { label: "Fats",    value: Math.round(nutrition.fats || 0), unit: "g", color: "#C9790A", pct: Math.min(100, (nutrition.fats || 0) * 4) },
    { label: "Fiber",   value: Math.round(nutrition.fiber || 0), unit: "g", color: "#7B9E87", pct: Math.min(100, (nutrition.fiber || 0) * 10) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.45, delay: index * 0.07 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "rgba(255,253,250,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRadius: 28,
        border: "1px solid rgba(0,0,0,0.04)",
        overflow: "hidden",
        boxShadow: hovered
          ? "0 20px 60px rgba(40,25,10,0.09), 0 1px 0 rgba(255,255,255,0.95) inset"
          : "0 8px 40px rgba(40,25,10,0.06), 0 1px 0 rgba(255,255,255,0.95) inset",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "transform 0.3s, box-shadow 0.3s",
      }}
    >
      {/* Image Area */}
      <div style={{ position: "relative", height: 200, overflow: "hidden" }}>
        <img
          src={imgSrc}
          alt={item.dish}
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            transform: hovered ? "scale(1.05)" : "scale(1)",
            transition: "transform 0.5s ease",
          }}
          onError={e => { e.target.src = PLACEHOLDER; }}
        />
        {/* Gradient overlay */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(28,24,19,0.55) 0%, transparent 55%)" }} />

        {/* Badge top-left */}
        <div style={{
          position: "absolute", top: 12, left: 12,
          padding: "4px 10px", borderRadius: 20,
          background: "rgba(253,250,246,0.92)", backdropFilter: "blur(4px)",
          fontSize: 9.5, fontWeight: 700, color: "#1C1813", letterSpacing: "0.04em",
        }}>
          {badge}
        </div>

        {/* Match ring */}
        <MatchRing score={score} />

        {/* Dish name bottom-left */}
        <div style={{ position: "absolute", bottom: 12, left: 14, right: 14, zIndex: 2 }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, color: "#FDFAF6", lineHeight: 1.1 }}>
            {formatDishName ? formatDishName(item.dish) : item.dish}
          </div>
          {item.description && (
            <div style={{ fontSize: 10, color: "rgba(253,250,246,0.65)", marginTop: 2 }}>{item.description}</div>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div style={{ padding: "16px 18px 18px" }}>
        {/* Saved date */}
        <div style={{ fontSize: 10, color: "#9A8A78", marginBottom: 10, display: "flex", alignItems: "center", gap: 4 }}>
          <CalendarDays size={11} />
          Saved {formatDate(item.date)}
        </div>

        {/* Tags */}
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>
          {tags.map((tag, i) => (
            <span key={i} style={{ padding: "3px 10px", borderRadius: 20, fontSize: 10.5, fontWeight: 600, ...tagStyles[i % tagStyles.length] }}>
              {tag}
            </span>
          ))}
          {nutrition.calories > 0 && (
            <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 10.5, fontWeight: 600, background: "#FEF0D0", color: "#7A4A05" }}>
              {Math.round(nutrition.calories)} Cal
            </span>
          )}
        </div>

        {/* Macros */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, marginBottom: 14 }}>
          {macros.map(m => (
            <div key={m.label} style={{ background: "rgba(255,253,249,0.75)", borderRadius: 10, padding: "7px 5px", border: "1px solid rgba(0,0,0,0.04)", textAlign: "center" }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontWeight: 700, color: "#1C1813", lineHeight: 1 }}>{m.value}{m.unit}</div>
              <div style={{ height: 2, borderRadius: 2, background: "rgba(200,178,130,0.4)", margin: "4px 0 3px", overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 2, background: m.color, width: m.pct + "%" }} />
              </div>
              <div style={{ fontSize: 7.5, color: "#9A8A78", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600 }}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", gap: 8, paddingTop: 12, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <button
            onClick={() => onViewRecipe && onViewRecipe(item)}
            style={{
              flex: 1, padding: 9, borderRadius: 12,
              background: "#1C1813", color: "#FDFAF6",
              fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer",
              fontFamily: "inherit", transition: "all 0.2s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#E8915A"; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(232,145,90,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#1C1813"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            View Full Recipe
          </button>
          <button
            onClick={() => onRemove(item.dish)}
            title="Remove from saves"
            style={{
              width: 36, height: 36, borderRadius: 10,
              border: "1px solid rgba(0,0,0,0.07)", background: "rgba(255,253,249,0.9)",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              color: "#9A8A78", transition: "all 0.2s", flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#E23744"; e.currentTarget.style.color = "#E23744"; e.currentTarget.style.background = "#FFF0F0"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.07)"; e.currentTarget.style.color = "#9A8A78"; e.currentTarget.style.background = "rgba(255,253,249,0.9)"; }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Place Row (Favourite Places tab) ─────────────────────────────────────────
function PlaceRow({ place, onRemove, index }) {
  const [hovered, setHovered] = useState(false);
  const isOpen = place.business_status === "OPERATIONAL" || place.isOpen === true;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12, scale: 0.97 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 16,
        padding: "18px 22px", borderRadius: 20,
        background: "rgba(255,253,250,0.92)", backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(0,0,0,0.04)",
        boxShadow: hovered
          ? "0 8px 32px rgba(40,25,10,0.08)"
          : "0 4px 24px rgba(40,25,10,0.05), 0 1px 0 rgba(255,255,255,0.95) inset",
        transform: hovered ? "translateX(4px)" : "none",
        transition: "transform 0.25s, box-shadow 0.25s",
      }}
    >
      {/* Icon */}
      <div style={{
        width: 48, height: 48, borderRadius: 14, flexShrink: 0,
        background: "#FAE8D8", display: "flex", alignItems: "center", justifyContent: "center", color: "#E8915A",
      }}>
        <MapPin size={22} />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: "#1C1813" }}>{place.name}</div>
        <div style={{ fontSize: 11, color: "#9A8A78", marginTop: 4, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          {place.rating > 0 && (
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: 600, color: "#1C1813" }}>
              <Star size={12} style={{ color: "#C9790A", fill: "#C9790A" }} />
              {typeof place.rating === "number" ? place.rating.toFixed(1) : place.rating}
            </span>
          )}
          {isOpen && <span style={{ color: "#3D6B4F", fontWeight: 600 }}>Open Now</span>}
          {place.cuisine && <span style={{ color: "#7A6E62" }}>{place.cuisine}</span>}
          {place.price_label && <span style={{ fontWeight: 700, color: "#7A6E62" }}>{place.price_label}</span>}
        </div>
        <div style={{ fontSize: 10, color: "#9A8A78", marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}>
          <CalendarDays size={10} />
          Saved {formatDate(place.date)}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <a
          href={`https://www.google.com/search?q=${encodeURIComponent("zomato " + (place.name || ""))}`}
          target="_blank" rel="noreferrer"
          style={{ padding: "7px 14px", borderRadius: 9, fontSize: 10, fontWeight: 800, background: "#FDE2E2", color: "#E23744", border: "none", cursor: "pointer", letterSpacing: "0.04em", textDecoration: "none", transition: "all 0.2s", fontFamily: "inherit" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#E23744"; e.currentTarget.style.color = "white"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#FDE2E2"; e.currentTarget.style.color = "#E23744"; }}
        >ZOMATO</a>
        <a
          href={`https://www.google.com/search?q=${encodeURIComponent("swiggy " + (place.name || ""))}`}
          target="_blank" rel="noreferrer"
          style={{ padding: "7px 14px", borderRadius: 9, fontSize: 10, fontWeight: 800, background: "#FEEEDC", color: "#FC8019", border: "none", cursor: "pointer", letterSpacing: "0.04em", textDecoration: "none", transition: "all 0.2s", fontFamily: "inherit" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#FC8019"; e.currentTarget.style.color = "white"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#FEEEDC"; e.currentTarget.style.color = "#FC8019"; }}
        >SWIGGY</a>
        <button
          onClick={() => onRemove(place.id || place.name)}
          title="Remove"
          style={{
            width: 34, height: 34, borderRadius: 9,
            border: "1px solid rgba(0,0,0,0.07)", background: "rgba(255,253,249,0.9)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            color: "#9A8A78", transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#E23744"; e.currentTarget.style.color = "#E23744"; e.currentTarget.style.background = "#FFF0F0"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.07)"; e.currentTarget.style.color = "#9A8A78"; e.currentTarget.style.background = "rgba(255,253,249,0.9)"; }}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ tab, onGoDiscover }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ textAlign: "center", padding: "96px 40px" }}
    >
      <div style={{
        width: 72, height: 72, borderRadius: "50%",
        background: "rgba(255,253,249,0.9)", border: "1px solid rgba(0,0,0,0.06)",
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 20px", color: "#9A8A78",
        boxShadow: "0 4px 20px rgba(40,25,10,0.06)",
      }}>
        {tab === "recipes" ? <Bookmark size={30} /> : <Heart size={30} />}
      </div>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 700, color: "#1C1813", marginBottom: 10 }}>
        {tab === "recipes" ? "No saved recipes yet" : "No favourite places yet"}
      </div>
      <div style={{ fontSize: 14, color: "#9A8A78", maxWidth: 340, margin: "0 auto 24px", lineHeight: 1.6 }}>
        {tab === "recipes"
          ? "Bookmark food cards on the Discover page to save recipes here."
          : "Heart restaurant rows on the Discover page to save your favourite spots here."}
      </div>
      <button
        onClick={onGoDiscover}
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "11px 26px", borderRadius: 24,
          background: "#E8915A", color: "white",
          fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer",
          fontFamily: "inherit", transition: "all 0.2s",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "#D47A44"; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(232,145,90,0.35)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "#E8915A"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
      >
        Go to Discover <ArrowRight size={14} />
      </button>
    </motion.div>
  );
}

// ─── Main SavedItemsPage ───────────────────────────────────────────────────────
export function SavedItemsPage({
  liked, bookmarked, removeLiked, removeBookmarked, onBack,
  savesCount, location, weather, weatherUi,
  getWeatherLucideIcon, getWeatherLabel, handleChangeLocation, setPage,
  getDishImage, formatDishName, setRecipeModal,
}) {
  const [activeTab, setActiveTab] = useState("recipes");
  const [searchQ, setSearchQ] = useState("");

  // Bookmarked = Saved Recipes (food cards with bookmark button)
  const savedRecipes = Object.values(bookmarked || {}).sort((a, b) => new Date(b.date) - new Date(a.date));
  // Liked = Favourite Places (restaurant rows with heart button)
  const favouritePlaces = Object.values(liked || {}).sort((a, b) => new Date(b.date) - new Date(a.date));

  const filterRecipes = (arr) =>
    searchQ
      ? arr.filter(i => (i.dish || "").toLowerCase().includes(searchQ.toLowerCase()))
      : arr;

  const filterPlaces = (arr) =>
    searchQ
      ? arr.filter(i => (i.name || "").toLowerCase().includes(searchQ.toLowerCase()) || (i.cuisine || "").toLowerCase().includes(searchQ.toLowerCase()))
      : arr;

  const filteredRecipes = filterRecipes(savedRecipes);
  const filteredPlaces = filterPlaces(favouritePlaces);

  return (
    <div style={{ fontFamily: "Inter, sans-serif", color: "#1C1813", minHeight: "100vh" }}>

      {/* ── Navbar (matches Discover page nav) ── */}
      <nav style={{
        height: 62, position: "sticky", top: 0, zIndex: 100,
        background: "rgba(242,228,200,0.88)",
        backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
        borderBottom: "1px solid rgba(200,178,130,0.45)",
        display: "flex", alignItems: "center", padding: "0 32px", gap: 0,
      }}>
        {/* Logo */}
        <a href="#" onClick={e => { e.preventDefault(); setPage && setPage("home"); }}
          style={{ display: "flex", alignItems: "center", gap: 11, textDecoration: "none", marginRight: 32 }}>
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

        {/* Global Navigation — Segmented Control */}
        <div style={{ display: "flex", alignItems: "center", gap: 2, background: "rgba(200,178,130,0.12)", padding: "4px 5px", borderRadius: 24, position: "relative" }}>
          {["home", "about"].map((p) => {
            const label = p === "home" ? "Discover" : "About";
            return (
              <button
                key={p}
                onClick={() => setPage && setPage(p)}
                style={{
                  padding: "6px 16px", borderRadius: 20, fontSize: 13.5, fontWeight: 600,
                  color: "#7A6E62",
                  background: "transparent", border: "none", cursor: "pointer",
                  fontFamily: "inherit", position: "relative", zIndex: 1,
                  transition: "color 0.15s"
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Right */}
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
            {location && handleChangeLocation && (
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
              {getWeatherLucideIcon && getWeatherLucideIcon(weatherUi?.bg_type, 14)}
              <span style={{ fontWeight: 800, color: "#1C1813", fontSize: 13, marginLeft: 1 }}>
                {weather?.temp != null ? `${weather.temp}°C` : "25°C"}
              </span>
              <span style={{ fontSize: 11, fontWeight: 500, color: "#7A6E62", marginLeft: 1 }}>
                {weatherUi?.mode ? weatherUi.mode.split("•")[0].trim().split(" ")[0] : (getWeatherLabel && getWeatherLabel(weatherUi?.bg_type))}
              </span>
            </div>
          </div>

          <button onClick={() => setPage && setPage("saves")} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 16px", borderRadius: 22, background: "#3D6B4F", color: "#FDFAF6", fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit" }}
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

      {/* ── Page Header ── */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "56px 40px 0", textAlign: "center" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
          color: "#E8915A", marginBottom: 14,
        }}>
          <span style={{ display: "block", width: 24, height: 1, background: "#E8915A", opacity: 0.5 }} />
          Your Collection
          <span style={{ display: "block", width: 24, height: 1, background: "#E8915A", opacity: 0.5 }} />
        </div>
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 64, fontWeight: 700, lineHeight: 0.95,
          color: "#1C1813", letterSpacing: "-0.02em",
        }}>
          My Saves
        </div>
        <div style={{
          fontSize: 15, color: "#9A8A78", marginTop: 12,
          fontStyle: "italic", fontFamily: "'Cormorant Garamond', serif",
        }}>
          Your personalized library of recipes and local spots
        </div>
      </div>

      {/* ── Controls ── */}
      <div style={{
        maxWidth: 1280, margin: "0 auto",
        padding: "32px 40px 0",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
      }}>
        {/* Tab toggle */}
        <div style={{
          display: "flex", alignItems: "center",
          background: "rgba(255,253,249,0.82)", backdropFilter: "blur(8px)",
          border: "1px solid rgba(0,0,0,0.06)", borderRadius: 28,
          padding: 4, gap: 2,
        }}>
          {/* Saved Recipes tab */}
          <button
            onClick={() => setActiveTab("recipes")}
            style={{
              padding: "8px 22px", borderRadius: 22, fontSize: 13, fontWeight: 600,
              border: "none", cursor: "pointer", fontFamily: "inherit", transition: "all 0.22s",
              background: activeTab === "recipes" ? "#E8915A" : "transparent",
              color: activeTab === "recipes" ? "white" : "#7A6E62",
              boxShadow: activeTab === "recipes" ? "0 2px 12px rgba(232,145,90,0.3)" : "none",
              display: "flex", alignItems: "center", gap: 7,
            }}
          >
            <Bookmark size={14} fill={activeTab === "recipes" ? "currentColor" : "none"} />
            Saved Recipes
            <span style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 18, height: 18, borderRadius: "50%",
              fontSize: 10, fontWeight: 800,
              background: activeTab === "recipes" ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.08)",
              color: activeTab === "recipes" ? "white" : "#7A6E62",
            }}>
              {savedRecipes.length}
            </span>
          </button>

          {/* Favourite Places tab */}
          <button
            onClick={() => setActiveTab("places")}
            style={{
              padding: "8px 22px", borderRadius: 22, fontSize: 13, fontWeight: 600,
              border: "none", cursor: "pointer", fontFamily: "inherit", transition: "all 0.22s",
              background: activeTab === "places" ? "#E8915A" : "transparent",
              color: activeTab === "places" ? "white" : "#7A6E62",
              boxShadow: activeTab === "places" ? "0 2px 12px rgba(232,145,90,0.3)" : "none",
              display: "flex", alignItems: "center", gap: 7,
            }}
          >
            <Heart size={14} fill={activeTab === "places" ? "currentColor" : "none"} />
            Favourite Places
            <span style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 18, height: 18, borderRadius: "50%",
              fontSize: 10, fontWeight: 800,
              background: activeTab === "places" ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.08)",
              color: activeTab === "places" ? "white" : "#7A6E62",
            }}>
              {favouritePlaces.length}
            </span>
          </button>
        </div>

        {/* Search bar */}
        <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
          <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9A8A78", pointerEvents: "none" }} />
          <input
            type="text"
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            placeholder="Search your saves..."
            style={{
              width: "100%", padding: "10px 16px 10px 38px",
              background: "rgba(255,253,249,0.88)", backdropFilter: "blur(8px)",
              border: "1px solid rgba(0,0,0,0.07)", borderRadius: 22,
              fontSize: 13, color: "#1C1813", fontFamily: "inherit", outline: "none",
              transition: "all 0.2s",
            }}
            onFocus={e => { e.target.style.borderColor = "#E8915A"; e.target.style.background = "white"; e.target.style.boxShadow = "0 0 0 3px rgba(232,145,90,0.10)"; }}
            onBlur={e => { e.target.style.borderColor = "rgba(0,0,0,0.07)"; e.target.style.background = "rgba(255,253,249,0.88)"; e.target.style.boxShadow = "none"; }}
          />
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 40px 80px" }}>

        <AnimatePresence mode="wait">
          {/* ── Saved Recipes Tab ── */}
          {activeTab === "recipes" && (
            <motion.div
              key="recipes"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28 }}
            >
              {filteredRecipes.length === 0 ? (
                <EmptyState tab="recipes" onGoDiscover={() => setPage && setPage("home")} />
              ) : (
                <>
                  <div style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                    color: "#9A8A78", marginBottom: 16, display: "flex", alignItems: "center", gap: 10,
                  }}>
                    {filteredRecipes.length} saved recipe{filteredRecipes.length !== 1 ? "s" : ""}
                    <span style={{ flex: 1, height: 1, background: "rgba(200,178,130,0.35)", display: "block" }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
                    <AnimatePresence>
                      {filteredRecipes.map((item, i) => (
                        <RecipeCard
                          key={item.dish}
                          item={item}
                          index={i}
                          onRemove={removeBookmarked}
                          onViewRecipe={setRecipeModal}
                          getDishImage={getDishImage}
                          formatDishName={formatDishName}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* ── Favourite Places Tab ── */}
          {activeTab === "places" && (
            <motion.div
              key="places"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28 }}
            >
              {filteredPlaces.length === 0 ? (
                <EmptyState tab="places" onGoDiscover={() => setPage && setPage("home")} />
              ) : (
                <>
                  <div style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                    color: "#9A8A78", marginBottom: 16, display: "flex", alignItems: "center", gap: 10,
                  }}>
                    {filteredPlaces.length} favourite place{filteredPlaces.length !== 1 ? "s" : ""}
                    <span style={{ flex: 1, height: 1, background: "rgba(200,178,130,0.35)", display: "block" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <AnimatePresence>
                      {filteredPlaces.map((place, i) => (
                        <PlaceRow
                          key={place.id || place.name}
                          place={place}
                          index={i}
                          onRemove={removeLiked}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
