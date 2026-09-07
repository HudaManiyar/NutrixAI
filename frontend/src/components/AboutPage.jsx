import { useState } from "react";
import { MapPin, Cloud, Clock, Wind, Sun, Snowflake, ArrowRight, Check, ThermometerSun, Brain, Zap, Sunrise } from "lucide-react";
import hero1About from "../assets/images/hero1_about.jpg";
import hero2About from "../assets/images/hero2_about.jpg";

const COLORS = {
  peach: "#E8915A",
  peachHover: "#D47A44",
  peachLight: "#F2B48A",
  peachPale: "#FAE8D8",
  forest: "#3D6B4F",
  forestHover: "#2E5540",
  forestPale: "#D4EDE0",
  amber: "#C9790A",
  amberPale: "#FEF0D0",
  stone: "#7A6E62",
  border: "rgba(200,178,130,0.6)",
  text: "#1C1813",
  muted: "#9A8A78",
  white: "#FDFAF6",
  cardBg: "rgba(255,249,238,0.75)",
  cardBgSolid: "#FFFAEE",
};

const serif = "'Cormorant Garamond', serif";
const sans = "'Inter', sans-serif";

const SCENARIOS = [
  {
    icon: <Snowflake size={18} />,
    weather: "Rainy · 19°C · Bengaluru",
    symptom: '"I have a sore throat and feel tired"',
    context: ["Rainy · 19°C", "Sore throat", "Fatigue"],
    score: "94% Match",
    tags: ["Anti-inflammatory", "Warming", "210 Cal"],
    name: "Turmeric Ginger Soup",
    sub: "Moong dal · lemon · fresh ginger",
    why: <>Cold rain + sore throat → <strong style={{ color: COLORS.peach }}>warming liquids</strong> + anti-inflammatory turmeric ease throat irritation</>,
    macros: [{ val: "8g", w: 52, color: COLORS.peach }, { val: "22g", w: 72, color: COLORS.forest }, { val: "4g", w: 28, color: COLORS.amber }, { val: "6g", w: 60, color: "#7B9E87" }],
    restaurant: "Truffles, Indiranagar",
  },
  {
    icon: <Sun size={18} />,
    weather: "Hot & Sunny · 36°C · Bengaluru",
    symptom: '"I feel dehydrated and low on energy"',
    context: ["Hot · 36°C", "Dehydrated", "Low energy"],
    score: "91% Match",
    tags: ["Hydrating", "Cooling", "180 Cal"],
    name: "Açaí Berry Bowl",
    sub: "Fresh fruits · chia seeds · coconut water",
    why: <>High heat + dehydration → <strong style={{ color: COLORS.peach }}>water-rich fruits</strong> + natural sugars for fast energy</>,
    macros: [{ val: "5g", w: 38, color: COLORS.peach }, { val: "34g", w: 88, color: COLORS.forest }, { val: "3g", w: 22, color: COLORS.amber }, { val: "8g", w: 75, color: "#7B9E87" }],
    restaurant: "The Bowl Co., Koramangala",
  },
  {
    icon: <Wind size={18} />,
    weather: "Overcast · 24°C · Bengaluru",
    symptom: '"I have a headache and skipped lunch"',
    context: ["Overcast · 24°C", "Headache", "Skipped lunch"],
    score: "88% Match",
    tags: ["Balanced", "Iron-rich", "310 Cal"],
    name: "Quinoa Power Bowl",
    sub: "Avocado · black beans · cherry tomato",
    why: <>Overcast + headache + no lunch → <strong style={{ color: COLORS.peach }}>magnesium & iron</strong> from quinoa + complex carbs</>,
    macros: [{ val: "14g", w: 68, color: COLORS.peach }, { val: "38g", w: 90, color: COLORS.forest }, { val: "9g", w: 44, color: COLORS.amber }, { val: "11g", w: 82, color: "#7B9E87" }],
    restaurant: "SodaBottleOpenerWala, HSR",
  },
  {
    icon: <Cloud size={18} />,
    weather: "Cool & Misty · 14°C · Bengaluru",
    symptom: '"Feeling cold, want something comforting"',
    context: ["Cool · 14°C", "Feeling cold", "Comfort craving"],
    score: "96% Match",
    tags: ["Comforting", "Easy Digest", "215 Cal"],
    name: "Dal Khichdi",
    sub: "Moong dal · basmati rice · ghee tadka",
    why: <>Cool misty weather + comfort craving → <strong style={{ color: COLORS.peach }}>warm, soft textures</strong> + easy-digest protein</>,
    macros: [{ val: "9g", w: 55, color: COLORS.peach }, { val: "30g", w: 82, color: COLORS.forest }, { val: "5g", w: 34, color: COLORS.amber }, { val: "5g", w: 52, color: "#7B9E87" }],
    restaurant: "Brahmin's Coffee Bar, Basavanagudi",
  },
];

const PIPELINE = [
  {
    icon: <Sunrise size={22} stroke="white" />,
    gradient: "linear-gradient(135deg, #E8915A, #C45E3E)",
    num: "Step 01",
    title: "Environmental Context",
    body: "Real-time temperature, humidity, and weather data forms the environmental baseline.",
    detailTitle: "Environmental Context Acquisition",
    detailText: "Location and weather APIs deliver real-time atmospheric data — temperature, humidity, and current conditions. This becomes the environmental anchor for every recommendation. Cold + rainy? Your meals shift toward warming, energy-dense options automatically.",
    tag: "Weather API · Location Services",
    tagBg: COLORS.peachPale,
    tagColor: COLORS.peach,
  },
  {
    icon: <Brain size={22} stroke="white" />,
    gradient: "linear-gradient(135deg, #5B8FA8, #3A6B82)",
    num: "Step 02",
    title: "Wellness Input",
    body: "Tell the AI how you feel via chat or voice. It captures your physiological signals.",
    detailTitle: "User Wellness Input Layer",
    detailText: `Users describe symptoms via the AI chatbot — "I have a sore throat" or "I feel tired and need something comforting." The conversational layer captures physiological signals that raw data alone can't provide, personalising the recommendation beyond just weather.`,
    tag: "NLP · Voice Input · Chat Interface",
    tagBg: "rgba(91,143,168,0.15)",
    tagColor: "#3A6B82",
  },
  {
    icon: <Zap size={22} stroke="white" />,
    gradient: `linear-gradient(135deg, ${COLORS.amber}, #A05E05)`,
    num: "Step 03",
    title: "AI Analysis",
    body: "The neural engine intersects weather + symptoms to determine your optimal nutritional profile.",
    detailTitle: "AI Nutritional Analysis Engine",
    detailText: "The backend AI model analyses the intersection of environmental context and wellness signals to determine the most appropriate nutritional profile for this specific moment — mapping macro requirements, anti-inflammatory needs, hydration levels, and energy demands.",
    tag: "Neural Engine · Nutritional Mapping",
    tagBg: COLORS.amberPale,
    tagColor: COLORS.amber,
  },
  {
    icon: <ThermometerSun size={22} stroke="white" />,
    gradient: `linear-gradient(135deg, ${COLORS.forest}, ${COLORS.forestHover})`,
    num: "Step 04",
    title: "Smart Recommendations",
    body: "A dynamic feed with macros, match scores, recipes, and nearby restaurants.",
    detailTitle: "Smart Recommendation Output",
    detailText: "The system generates a targeted feed of meals with macro breakdowns, contextual match scores, full recipe instructions, and nearby restaurant options — all filtered by diet preference and ordered by relevance. One tap connects to Zomato or Swiggy.",
    tag: "Zomato · Swiggy · Recipe Engine",
    tagBg: COLORS.forestPale,
    tagColor: COLORS.forest,
  },
];

export const AboutPage = ({ goHome }) => {
  const [activeDetail, setActiveDetail] = useState(0);
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const setScenario = (idx) => {
    if (idx === scenarioIdx) return;
    setTransitioning(true);
    setTimeout(() => {
      setScenarioIdx(idx);
      setTransitioning(false);
    }, 220);
  };

  const s = SCENARIOS[scenarioIdx];

  return (
    <div style={{ maxWidth: "100%" }}>
      {/* ── HERO SPLIT ─────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", height: "min(88vh, 800px)", minHeight: 480, overflow: "hidden" }}>
        <div style={{ position: "relative", overflow: "hidden" }}>
          <img src={hero1About} alt="Food" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 64px", textAlign: "center", background: COLORS.peach }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 20, background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: COLORS.white, marginBottom: 22 }}>
            <Clock size={10} /> Our Story &amp; Mission
          </div>
          <h1 style={{ fontFamily: serif, fontSize: "clamp(38px, 4.5vw, 68px)", fontWeight: 700, color: COLORS.text, lineHeight: 1.0, letterSpacing: "-0.02em" }}>
            <span style={{ fontWeight: 800, letterSpacing: "0.04em" }}>FOOD</span> — Felt <em style={{ fontStyle: "italic", color: COLORS.white }}>Differently!</em>
          </h1>
          <p style={{ marginTop: 22, fontSize: 15, color: "rgba(28,24,19,0.72)", maxWidth: 380, lineHeight: 1.72 }}>
            Bridging the gap between your environment, your body, and what's on your plate — intelligently.
          </p>
          <div style={{ marginTop: 32, display: "flex", gap: 12, alignItems: "center", justifyContent: "center" }}>
            <button
              onClick={goHome}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 26px", borderRadius: 26, background: COLORS.text, color: COLORS.white, fontSize: 13.5, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: sans, transition: "all 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(28,24,19,0.80)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = COLORS.text; e.currentTarget.style.transform = "none"; }}
            >
              Try Nutrix AI <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ── PAGE BODY ──────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px 100px" }}>

        {/* INTRO */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, padding: "96px 0 80px", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: COLORS.peach, marginBottom: 16 }}>The Problem We're Solving</div>
            <h2 style={{ fontFamily: serif, fontSize: 44, fontWeight: 700, lineHeight: 1.08, letterSpacing: "-0.01em", color: COLORS.text }}>
              Headache? Craving spice? Don't know <em style={{ fontStyle: "italic", color: COLORS.peach }}>what to eat?</em>
            </h2>
            <div style={{ fontSize: 15, lineHeight: 1.78, color: COLORS.stone, marginTop: 24 }}>
              <p>Most food discovery platforms focus on taste, popularity, or calorie counts — forcing you to scroll through endless menus without meaningful guidance.</p>
              <p style={{ marginTop: 14 }}>Nutrix AI reimagines food discovery by making recommendations context-aware and health-focused. We analyse real-time climate data alongside your current physical symptoms to determine the nutritional profile your body actually needs, right now.</p>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { icon: <ThermometerSun size={20} stroke={COLORS.peach} />, bg: COLORS.peachPale, val: "Real-Time", lbl: "Weather-aware meal matching, updated live" },
              { icon: <Brain size={20} stroke={COLORS.forest} />, bg: COLORS.forestPale, val: "Neural", lbl: "AI engine analysing symptoms + climate signals" },
              { icon: <MapPin size={20} stroke={COLORS.amber} />, bg: COLORS.amberPale, val: "Hyper-Local", lbl: "Recommendations from nearby kitchens, delivered" },
            ].map((c, i) => (
              <div key={i} style={{ background: COLORS.cardBg, backdropFilter: "blur(8px)", border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: "22px 26px", display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 46, height: 46, borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: c.bg }}>{c.icon}</div>
                <div>
                  <div style={{ fontFamily: serif, fontSize: 30, fontWeight: 700, color: COLORS.text, lineHeight: 1 }}>{c.val}</div>
                  <div style={{ fontSize: 12, color: "rgba(28,24,19,0.60)", fontWeight: 500, marginTop: 3 }}>{c.lbl}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MANIFESTO */}
        <div style={{ marginBottom: 72, padding: "32px 44px", background: "rgba(232,145,90,0.08)", border: "1.5px solid rgba(232,145,90,0.25)", borderRadius: 20, textAlign: "center" }}>
          <div style={{ fontFamily: serif, fontSize: 22, fontWeight: 600, color: COLORS.text, lineHeight: 1.45 }}>
            Food choices should reflect both environmental conditions and the body's current needs — not just personal preference.
            <span style={{ display: "block", fontWeight: 700, color: COLORS.peach, marginTop: 10 }}>"We built Nutrix AI to finally listen"</span>
          </div>
        </div>

        <hr style={{ border: "none", borderTop: `1px solid ${COLORS.border}` }} />

        {/* HOW IT WORKS */}
        <div style={{ padding: "80px 0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 72, alignItems: "center", marginBottom: 64 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: COLORS.peach, marginBottom: 14 }}>How Nutrix AI Works</div>
              <h2 style={{ fontFamily: serif, fontSize: 42, fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.01em", color: COLORS.text }}>
                A conversation,<br />not a <em style={{ fontStyle: "italic", color: COLORS.peach }}>menu.</em>
              </h2>
              <p style={{ fontSize: 15, lineHeight: 1.78, color: COLORS.stone, marginTop: 20 }}>
                Instead of scrolling through endless menus, you interact with a conversational AI assistant that understands your current state — and responds with meals that genuinely help.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { icon: <ThermometerSun size={15} stroke={COLORS.peach} />, bg: COLORS.peachPale, txt: "Local weather conditions & humidity" },
                { icon: <Zap size={15} stroke={COLORS.forest} />, bg: COLORS.forestPale, txt: "User symptoms and physical feelings" },
                { icon: <Check size={15} stroke={COLORS.amber} />, bg: COLORS.amberPale, txt: "Nutritional requirements & macro balance" },
                { icon: <MapPin size={15} stroke="#3A6B82" />, bg: "rgba(91,143,168,0.15)", txt: "Nearby restaurant availability & delivery" },
              ].map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 18px", borderRadius: 13, background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, transition: "all 0.25s" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: f.bg }}>{f.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{f.txt}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Pipeline */}
          <div style={{ position: "relative" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 0, position: "relative" }}>
              <div style={{ content: "''", position: "absolute", top: 27, left: "13%", width: "74%", height: 2, background: `linear-gradient(to right, ${COLORS.peach}, ${COLORS.amber}, ${COLORS.forest})`, zIndex: 0 }} />
              {PIPELINE.map((p, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "0 14px", position: "relative", zIndex: 1 }}>
                  <div
                    onClick={() => setActiveDetail(activeDetail === i ? -1 : i)}
                    title="Click to expand"
                    style={{ width: 54, height: 54, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, boxShadow: "0 4px 16px rgba(40,25,10,0.12)", border: "3px solid #F2E4C8", cursor: "pointer", background: p.gradient, transition: "transform 0.3s" }}
                  >
                    {p.icon}
                  </div>
                  <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: "0.1em", color: COLORS.muted, textTransform: "uppercase", marginBottom: 5 }}>{p.num}</div>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: COLORS.text, marginBottom: 6 }}>{p.title}</div>
                  <div style={{ fontSize: 12, color: COLORS.stone, lineHeight: 1.6 }}>{p.body}</div>
                </div>
              ))}
            </div>

            {activeDetail >= 0 && (
              <div style={{ marginTop: 32, padding: "24px 32px", background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 18, display: "flex", gap: 20, alignItems: "flex-start" }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: PIPELINE[activeDetail].tagBg }}>
                  {PIPELINE[activeDetail].icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: COLORS.text, marginBottom: 6 }}>{PIPELINE[activeDetail].detailTitle}</div>
                  <div style={{ fontSize: 13, color: COLORS.stone, lineHeight: 1.65 }}>{PIPELINE[activeDetail].detailText}</div>
                  <span style={{ display: "inline-block", marginTop: 10, padding: "3px 10px", borderRadius: 10, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.05em", background: PIPELINE[activeDetail].tagBg, color: PIPELINE[activeDetail].tagColor }}>
                    {PIPELINE[activeDetail].tag}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <hr style={{ border: "none", borderTop: `1px solid ${COLORS.border}` }} />
      </div>

      {/* ── DEMO (full-width background) ──────────────────────────────────── */}
      <div style={{ padding: "80px 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: COLORS.forest, marginBottom: 14 }}>See It In Action</div>
          <h2 style={{ fontFamily: serif, fontSize: 42, fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.01em", color: COLORS.text }}>
            Watch the AI think <em style={{ fontStyle: "italic", color: COLORS.peach }}>in real time.</em>
          </h2>
          <p style={{ fontSize: 14, color: COLORS.muted, marginTop: 12 }}>Pick a scenario — see exactly what Nutrix AI recommends and why.</p>

          <div style={{ marginTop: 48, display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 36, alignItems: "start" }}>
            {/* Scenario list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {SCENARIOS.map((sc, i) => {
                const active = i === scenarioIdx;
                return (
                  <button
                    key={i}
                    onClick={() => setScenario(i)}
                    style={{
                      display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", borderRadius: 16,
                      border: `1.5px solid ${active ? COLORS.peach : COLORS.border}`,
                      background: active ? COLORS.cardBgSolid : COLORS.cardBg,
                      cursor: "pointer", textAlign: "left", fontFamily: sans, transition: "all 0.22s",
                      position: "relative", overflow: "hidden", width: "100%",
                    }}
                  >
                    <div style={{ fontSize: 20, flexShrink: 0, width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", background: COLORS.peachPale, borderRadius: 12, border: `1px solid ${COLORS.border}`, color: COLORS.stone }}>
                      {sc.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.text }}>{sc.weather}</div>
                      <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>{sc.symptom}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Result card */}
            <div style={{ background: COLORS.cardBgSolid, borderRadius: 26, overflow: "hidden", boxShadow: "0 8px 40px rgba(40,25,10,0.08)", border: `1px solid ${COLORS.border}` }}>
              <div style={{ padding: "16px 20px", background: "rgba(255,249,238,0.65)", borderBottom: "1px solid rgba(200,178,130,0.22)", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22A55A", display: "inline-block" }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.stone, letterSpacing: "0.08em", textTransform: "uppercase" }}>Nutrix Neural Engine</span>
                <span style={{ marginLeft: "auto", fontSize: 9.5, fontWeight: 800, background: COLORS.forestPale, color: COLORS.forest, padding: "3px 9px", borderRadius: 8, letterSpacing: "0.06em" }}>LIVE</span>
              </div>
              <div style={{ padding: "22px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
                  {s.context.map((c, i) => (
                    <span key={i} style={{ display: "flex", alignItems: "center" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 11px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: "rgba(255,253,249,0.82)", color: COLORS.stone, border: `1px solid ${COLORS.border}` }}>{c}</span>
                      {i < s.context.length - 1 && <span style={{ fontSize: 10, color: COLORS.muted, margin: "0 8px" }}>→</span>}
                    </span>
                  ))}
                </div>

                <div style={{ background: "rgba(255,253,250,0.92)", border: "1px solid rgba(0,0,0,0.04)", borderRadius: 18, overflow: "hidden", boxShadow: "0 4px 20px rgba(40,25,10,0.05)", opacity: transitioning ? 0 : 1, transform: transitioning ? "translateY(10px)" : "translateY(0)", transition: "opacity 0.22s, transform 0.22s" }}>
                  <div style={{ padding: "16px 16px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 11px", borderRadius: 20, background: COLORS.forestPale, color: COLORS.forest, fontSize: 11, fontWeight: 800 }}>
                        <Check size={10} /> {s.score}
                      </div>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                        {s.tags.map((t, i) => (
                          <span key={i} style={{ padding: "3px 9px", borderRadius: 10, fontSize: 10, fontWeight: 600, background: COLORS.amberPale, color: COLORS.amber }}>{t}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ fontFamily: serif, fontSize: 26, fontWeight: 700, color: COLORS.text, lineHeight: 1, marginBottom: 5 }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 12 }}>{s.sub}</div>
                    <div style={{ padding: "10px 13px", borderRadius: 11, background: COLORS.peachPale, border: "1px solid rgba(232,145,90,0.20)", fontSize: 12, color: COLORS.stone, lineHeight: 1.55 }}>
                      <strong style={{ color: COLORS.peach }}>Why this works:</strong> {s.why}
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderTop: "1px solid rgba(200,178,130,0.20)" }}>
                    {s.macros.map((m, i) => (
                      <div key={i} style={{ padding: "11px 8px", textAlign: "center", borderRight: i < 3 ? "1px solid rgba(200,178,130,0.18)" : "none" }}>
                        <div style={{ fontFamily: serif, fontSize: 20, fontWeight: 700, color: COLORS.text, lineHeight: 1 }}>{m.val}</div>
                        <div style={{ height: 2, borderRadius: 2, background: COLORS.border, margin: "5px 6px 0", overflow: "hidden" }}>
                          <div style={{ height: "100%", borderRadius: 2, background: m.color, width: `${m.w}%`, transition: "width 0.5s ease" }} />
                        </div>
                        <div style={{ fontSize: 9, color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 3, fontWeight: 600 }}>
                          {["Protein", "Carbs", "Fats", "Fiber"][i]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ padding: "13px 20px", borderTop: "1px solid rgba(200,178,130,0.20)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,249,238,0.50)" }}>
                <div style={{ fontSize: 12, color: COLORS.muted }}>Available at <strong style={{ color: COLORS.text, fontWeight: 600 }}>{s.restaurant}</strong></div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button style={{ padding: "5px 11px", borderRadius: 8, fontSize: 10, fontWeight: 800, border: "none", cursor: "pointer", letterSpacing: "0.04em", background: "#FDE2E2", color: "#E23744" }}>ZOMATO</button>
                  <button style={{ padding: "5px 11px", borderRadius: 8, fontSize: 10, fontWeight: 800, border: "none", cursor: "pointer", letterSpacing: "0.04em", background: "#FEEEDC", color: "#FC8019" }}>SWIGGY</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA (image-backed) ─────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px 100px" }}>
        <div style={{ borderRadius: 26, overflow: "hidden", position: "relative", minHeight: 300, display: "flex", alignItems: "center" }}>
          <img src={hero2About} alt="Indian cuisine" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", filter: "brightness(0.55) saturate(0.85)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(28,24,19,0.50) 0%, rgba(28,24,19,0.20) 100%)" }} />
          <div style={{ position: "relative", zIndex: 1, padding: "56px 64px", width: "100%" }}>
            <h2 style={{ fontFamily: serif, fontSize: 52, fontWeight: 700, color: COLORS.white, letterSpacing: "-0.01em", lineHeight: 1.0 }}>
              Ready to eat<br /><em style={{ fontStyle: "italic", color: COLORS.peachLight }}>smarter?</em>
            </h2>
            <div style={{ marginTop: 26 }}>
              <button
                onClick={goHome}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 28px", borderRadius: 26, background: COLORS.peach, color: COLORS.white, fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: sans, transition: "all 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = COLORS.peachHover; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = COLORS.peach; e.currentTarget.style.transform = "none"; }}
              >
                Discover Your Meal <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 40px 40px", borderTop: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: 16, color: COLORS.text, letterSpacing: "-0.01em" }}>
          NUTRIX <span style={{ color: COLORS.amber }}>AI</span>
        </div>
        <div style={{ fontSize: 12, color: COLORS.muted }}>© 2026 · Shruti, Huda &amp; Harshvardhan · Academic Project</div>
      </div>
    </div>
  );
};
