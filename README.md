# Nutrix AI

Nutrix AI is a climate-intelligent food recommendation app. It combines real-time weather data with how you're feeling right now to recommend Indian dishes that actually fit the moment — then finds nearby restaurants that serve them.

Built as an academic project by **Shruti**, **Huda**, and **Harshvardhan** (MSc. AI/ML).

## Demo

**Video walkthrough:** [Watch on Google Drive](https://drive.google.com/file/d/1GwpdfF16x5HhRBbCW3BDus6uPjueIz6z/view?usp=sharing)

| Discover | Chatbot in action |
|---|---|
| ![Discover page](docs/screenshots/discover.png) | ![Chatbot](docs/screenshots/chatbot.png) |

| Recipe card | Location prompt |
|---|---|
| ![Food card](docs/screenshots/foodcard.png) | ![Location prompt](docs/screenshots/locationprompt.png) |

| Saves | About |
|---|---|
| ![Saves page](docs/screenshots/saves.png) | ![About page](docs/screenshots/about.png) |

## How it works

1. **Environmental context** — the app reads your location and pulls live weather (temperature, condition) for it.
2. **Wellness input** — you tell the chatbot how you feel ("I have a sore throat", "feeling cold") or just let it use the weather alone.
3. **AI analysis** — the backend maps weather + symptoms to a nutritional profile (warming vs. cooling, anti-inflammatory, hydrating, etc.).
4. **Recommendations** — you get a feed of matching dishes with macros, a match score, full recipes, and nearby restaurants pulled from local delivery listings.

## Tech stack

- **Frontend:** React (Vite), Framer Motion, Lucide icons
- **Backend:** FastAPI (Python), Groq / Google Generative AI for the conversational layer, Geoapify for location & restaurant data, WeatherAPI for live weather

## Project structure

```
Food/
├── frontend/          # React + Vite app
│   └── src/
│       ├── App.jsx
│       ├── components/
│       └── assets/images/
├── backend/           # FastAPI server
│   ├── app.py
│   └── data/
└── docs/screenshots/  # README images
```

## Running it locally

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
copy .env.example .env         # Windows — then fill in your API keys
# cp .env.example .env         # macOS/Linux
uvicorn app:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173` (frontend) and talks to `http://localhost:8000` (backend).

### API keys you'll need

Copy `backend/.env.example` to `backend/.env` and fill in your own keys for:

- `GROQ_API_KEY` — conversational AI (Groq)
- `GOOGLE_API_KEY` — Google Generative AI
- `GEOAPIFY_API_KEY` — location & restaurant data
- `WEATHERAPI_KEY` — live weather
- `UNSPLASH_ACCESS_KEY` — fallback images for dishes without a local photo

None of these are included in this repo — you'll need to sign up for your own free-tier keys.

## License

Academic project — built for coursework, not for commercial use.
