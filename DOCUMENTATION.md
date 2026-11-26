# 🌱 AGENTIC AI POWERED FARM ADVISOR SYSTEM — Complete Documentation

> An AI-powered multi-agent crop recommendation system that analyzes soil, water, weather & pest data to deliver precision farming advice with transparent reasoning.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Multi-Agent AI Engine](#3-multi-agent-ai-engine)
4. [Technology Stack](#4-technology-stack)
5. [Project Structure](#5-project-structure)
6. [Module Documentation](#6-module-documentation)
7. [Components Reference](#7-components-reference)
8. [Hooks Reference](#8-hooks-reference)
9. [Crop Database](#9-crop-database)
10. [Internationalization (i18n)](#10-internationalization-i18n)
11. [Authentication System](#11-authentication-system)
12. [Design System & Theming](#12-design-system--theming)
13. [User Flow & Features](#13-user-flow--features)
14. [Report Generation](#14-report-generation)
15. [Configuration Files](#15-configuration-files)
16. [Installation & Setup](#16-installation--setup)
17. [Troubleshooting](#17-troubleshooting)
18. [Future Scope](#18-future-scope)

---

## 1. Project Overview

**AGENTIC AI POWERED FARM ADVISOR SYSTEM** is a web-based intelligent decision support system for Indian farmers. It uses a **multi-agent AI architecture** where 5 specialized agents independently analyze different agricultural parameters (soil, water, pest, weather, season) and a 6th **Decision Fusion Agent** aggregates their scores using a weighted algorithm to recommend the best crop for the farmer's specific conditions.

### Key Features

| Feature | Description |
|---|---|
| **Multi-Agent Analysis** | 5 specialized AI agents + 1 fusion agent collaboratively analyze farm data |
| **12-Crop Database** | Comprehensive Indian crop data with soil, water, temperature, and pest profiles |
| **Trilingual Support** | Full UI in English, Telugu (తెలుగు), and Hindi (हिंदी) |
| **Voice Input/Output** | Speech recognition for farm data input; text-to-speech for results |
| **Downloadable Reports** | Professional HTML advisory reports with print support |
| **Weather Simulation** | 7-day weather forecast with temperature, humidity, and rainfall |
| **Interactive Charts** | Crop confidence scores (bar chart) + weather trends (line chart) |
| **Risk Assessment** | Automated risk level calculation with mitigation factors |
| **Mixed Cropping Advice** | Companion crop recommendations based on nutrient complementarity |
| **Sustainability Score** | Environmental sustainability metric for recommended crops |

---

## 2. System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + TypeScript)            │
│                                                                 │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────────────┐ │
│  │ Auth Page │  │   Index Page │  │      NotFound Page        │ │
│  └────┬─────┘  └──────┬───────┘  └───────────────────────────┘ │
│       │               │                                         │
│       │    ┌──────────┴──────────────────────────────┐         │
│       │    │           Main Application              │         │
│       │    │  ┌────────────┐  ┌──────────────────┐   │         │
│       │    │  │ HeaderBar  │  │   HeroSection    │   │         │
│       │    │  ├────────────┤  ├──────────────────┤   │         │
│       │    │  │ InputPanel │  │  WeatherCard     │   │         │
│       │    │  ├────────────┤  ├──────────────────┤   │         │
│       │    │  │ AgentAnim  │  │ RecommDashboard  │   │         │
│       │    │  ├────────────┤  ├──────────────────┤   │         │
│       │    │  │ Charts     │  │ ReportGenerator  │   │         │
│       │    │  └────────────┘  └──────────────────┘   │         │
│       │    └─────────────────────────────────────────┘         │
│       │                                                         │
│  ┌────┴─────────────────────────────────────────────────────┐  │
│  │                    HOOKS LAYER                            │  │
│  │  useAuth │ useSpeechRecognition │ useSpeechSynthesis │... │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   CORE LIB LAYER                          │  │
│  │  agentEngine.ts │ cropDatabase.ts │ translations.ts       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │               DATA/INTEGRATION LAYER                      │  │
│  │  localStorage (Auth) │ Supabase Client (types/client)     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Input (Voice/Text)
       │
       ▼
┌─────────────┐
│  InputPanel  │──→ FarmInput { soilType, waterSource, season, farmArea, location, state }
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ generateWeatherData()│──→ Simulated WeatherData { temperature, humidity, rainfall, forecast[] }
└──────┬──────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│                    runAnalysis(input, weather)                │
│                                                              │
│  ┌────────────┐ ┌────────────┐ ┌─────────┐ ┌──────────┐    │
│  │ Soil Agent │ │Water Agent │ │Pest Agent│ │Weather   │    │
│  │  (30%)     │ │  (25%)     │ │ (15%)    │ │Agent(15%)│    │
│  └─────┬──────┘ └─────┬──────┘ └────┬─────┘ └────┬─────┘    │
│        │              │             │             │          │
│  ┌─────┴──────┐                                              │
│  │Season Agent│                                              │
│  │  (15%)     │                                              │
│  └─────┬──────┘                                              │
│        │                                                     │
│        ▼                                                     │
│  ┌─────────────────────────────────────────────────┐        │
│  │         Decision Fusion Agent                    │        │
│  │  Total = Σ(agent_score × weight)                │        │
│  │  → Sort all crops → Pick best                   │        │
│  │  → Calculate risk, sustainability, irrigation    │        │
│  └─────────────────────────────────────────────────┘        │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
              AnalysisResult
       ┌───────────────────────────┐
       │ bestCrop, alternatives,   │
       │ mixedCropping, riskLevel, │
       │ sustainabilityScore,      │
       │ irrigationAdvice          │
       └───────────┬───────────────┘
                   │
                   ▼
       ┌───────────────────────┐
       │ RecommendationDashboard│
       │ ChartsSection          │
       │ ReportGenerator        │
       └───────────────────────┘
```

---

## 3. Multi-Agent AI Engine

The core intelligence resides in `src/lib/agentEngine.ts`. It implements a **weighted multi-agent scoring system**.

### 3.1 Agent Descriptions

| # | Agent | Weight | Input | Scoring Logic |
|---|---|---|---|---|
| 1 | **Soil Analysis Agent** 🔬 | 30% | Crop soil types vs user's soil | If match → 90–100, else → 20–50 |
| 2 | **Water Availability Agent** 💧 | 25% | Water source capacity vs crop need | Maps source to capacity (1–3), need to level (1–3) |
| 3 | **Pest Risk Agent** 🐛 | 15% | Crop's inherent pest risk rating | Low→90, Medium→65, High→35 (+ randomness) |
| 4 | **Weather Intelligence Agent** 🌤️ | 15% | Current temperature vs crop's optimal range | In range → 85–100, else score decreases with distance |
| 5 | **Seasonal Pattern Agent** 📅 | 15% | Current season vs crop's growing seasons | Match → 90–100, no match → 15–35 |
| 6 | **Decision Fusion Agent** 🧠 | — | Aggregates all agent scores | Weighted sum, risk analysis, companion crops |

### 3.2 Scoring Algorithm

```
Total Score = (Soil × 0.30) + (Water × 0.25) + (Season × 0.15) 
            + (Temperature × 0.15) + (Pest × 0.15)

Confidence = clamp(15, 98, TotalScore ± random_variance)

Risk Level:
  - LOW:    0 risk factors
  - MEDIUM: 1-2 risk factors  
  - HIGH:   3+ risk factors

Risk Factors are triggered when:
  - Soil score < 60
  - Water score < 60
  - Pest score < 50
  - Temperature > 40°C or < 5°C

Sustainability Score = min(95, TotalScore × 0.9 + random(0–10))
```

### 3.3 Key Interfaces

```typescript
interface FarmInput {
  soilType: string;
  waterSource: string;
  farmArea: number;
  season: string;
  location: string;
  state: string;
}

interface AnalysisResult {
  bestCrop: CropScore;
  alternatives: CropScore[];         // Top 5 alternatives
  mixedCropping: { crop1, crop2, reason };
  riskLevel: 'low' | 'medium' | 'high';
  riskFactors: string[];
  sustainabilityScore: number;
  irrigationAdvice: string;
}
```

### 3.4 Mixed Cropping Logic

The system finds a companion crop by matching the best crop's `companionCrops` array against the full database. If no companion is found, it falls back to the second-ranked crop.

### 3.5 Irrigation Advice

| Water Need | Recommendation |
|---|---|
| High | Drip or flood irrigation with consistent supply |
| Medium | Sprinkler irrigation with weekly monitoring |
| Low | Rain-fed cultivation with supplemental watering |

---

## 4. Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **UI Framework** | React | 18.3.x | Component-based UI rendering |
| **Language** | TypeScript | 5.8.x | Type-safe development |
| **Build Tool** | Vite | 5.4.x | Fast dev server (HMR) + bundling |
| **CSS Framework** | Tailwind CSS | 3.4.x | Utility-first styling |
| **UI Components** | shadcn/ui (Radix) | Various | Accessible, unstyled primitives |
| **Animations** | Framer Motion | 12.x | Declarative animations & transitions |
| **Charts** | Recharts | 2.15.x | BarChart + LineChart visualizations |
| **Routing** | React Router DOM | 6.30.x | Client-side routing |
| **State Mgmt** | React Query | 5.83.x | Server state caching (provider) |
| **Form Validation** | Zod + React Hook Form | Latest | Schema-based form validation |
| **Icons** | Lucide React | 0.462.x | Beautiful SVG icons |
| **Notifications** | Sonner + Toast | Latest | Toast notifications |
| **Backend** | Supabase | 2.98.x | Database & auth (configured, uses localStorage) |
| **Voice** | Web Speech API | Native | Speech recognition + synthesis |
| **Testing** | Vitest + Testing Library | Latest | Unit & component testing |
| **Typography** | Google Fonts | — | Space Grotesk (display) + DM Sans (body) |

---

## 5. Project Structure

```
agriwise-ai-main/
├── index.html                    # Entry HTML (SEO meta tags, OG tags)
├── package.json                  # Dependencies & npm scripts
├── vite.config.ts                # Vite: port 8080, HMR, path aliases
├── tailwind.config.ts            # Tailwind config with custom theme
├── tsconfig.json                 # TypeScript configuration
├── postcss.config.js             # PostCSS with Tailwind + Autoprefixer
├── vitest.config.ts              # Test runner configuration
├── components.json               # shadcn/ui component config
├── .env                          # Environment variables (Supabase keys)
│
├── public/                       # Static assets
│
├── supabase/
│   └── config.toml               # Supabase project config
│
└── src/
    ├── main.tsx                   # React DOM mount point
    ├── App.tsx                    # Root component: routing + auth guards
    ├── App.css                    # Minimal app-level styles
    ├── index.css                  # Full design system (CSS variables, utilities)
    ├── vite-env.d.ts              # Vite type declarations
    │
    ├── pages/
    │   ├── Auth.tsx               # Login/Signup page (localStorage auth)
    │   ├── Index.tsx              # Main dashboard (farm advisor)
    │   └── NotFound.tsx           # 404 page
    │
    ├── components/
    │   ├── HeaderBar.tsx          # Fixed top nav: logo, language, sign out
    │   ├── HeroSection.tsx        # Landing hero: animated particles, CTA
    │   ├── InputPanel.tsx         # Farm input form: 6 fields + voice
    │   ├── WeatherCard.tsx        # Weather display: temp/humidity/rain
    │   ├── AgentAnimation.tsx     # Animated agent icons during analysis
    │   ├── RecommendationDashboard.tsx  # Results: best crop, alts, risk
    │   ├── ChartsSection.tsx      # Recharts: bar + line charts
    │   ├── ReportGenerator.tsx    # HTML report download + print
    │   ├── DocumentationModal.tsx # In-app architecture documentation
    │   ├── NavLink.tsx            # Navigation link component
    │   └── ui/                    # 49 shadcn/ui primitives (button, input...)
    │
    ├── hooks/
    │   ├── useAuth.ts             # Auth state + localStorage session
    │   ├── useSpeechRecognition.ts # Web Speech API: voice-to-text
    │   ├── useSpeechSynthesis.ts  # Web Speech API: text-to-voice
    │   ├── use-mobile.tsx         # Responsive breakpoint detection
    │   └── use-toast.ts           # Toast notification hook
    │
    ├── lib/
    │   ├── agentEngine.ts         # Multi-agent AI engine + scoring
    │   ├── cropDatabase.ts        # 12 crop profiles + soil/water/season data
    │   ├── translations.ts        # i18n: EN/TE/HI translation strings
    │   └── utils.ts               # Utility: cn() classname merger
    │
    ├── integrations/
    │   └── supabase/
    │       ├── client.ts          # Supabase JS client initialization
    │       └── types.ts           # Database schema type definitions
    │
    └── test/
        ├── setup.ts               # Test environment setup (jsdom)
        └── example.test.ts        # Example test
```

---

## 6. Module Documentation

### 6.1 `agentEngine.ts` — Core AI Engine

**Location:** `src/lib/agentEngine.ts` (219 lines)

**Exports:**
- `runAnalysis(input: FarmInput, weather: WeatherData): AnalysisResult` — Main analysis function
- `generateWeatherData(): WeatherData` — Simulated weather data generator
- Interfaces: `FarmInput`, `WeatherData`, `AgentResult`, `CropScore`, `AnalysisResult`

**Internal Functions (Agents):**
- `soilAgent(crop, input)` — Checks soil type compatibility
- `waterAgent(crop, input)` — Maps water source capacity to crop need
- `pestAgent(crop)` — Evaluates pest risk (low/medium/high)
- `weatherAgent(crop, weather)` — Temperature range compatibility
- `seasonAgent(crop, input)` — Season alignment check

### 6.2 `cropDatabase.ts` — Agricultural Data

**Location:** `src/lib/cropDatabase.ts` (242 lines)

**Contains:**
- `CropData` interface with 15 properties per crop
- `cropDatabase[]` — 12 Indian crops with multilingual names (EN/TE/HI)
- `soilTypes[]` — 7 soil types with trilingual labels
- `waterSources[]` — 5 irrigation sources with trilingual labels
- `seasons[]` — 3 Indian agricultural seasons (Kharif, Rabi, Zaid)
- `indianStates[]` — 15 Indian states

### 6.3 `translations.ts` — Internationalization

**Location:** `src/lib/translations.ts` (240 lines)

**Contains:**
- `Language` type: `'en' | 'te' | 'hi'`
- `translations` object: 45+ UI strings in 3 languages
- `t(key, lang)` function — Translation lookup with EN fallback

### 6.4 `utils.ts` — Utilities

**Location:** `src/lib/utils.ts` (6 lines)

Exports `cn()`: merges Tailwind classes using `clsx` + `tailwind-merge`.

---

## 7. Components Reference

### 7.1 `App.tsx` — Root Application

- Sets up `QueryClientProvider`, `TooltipProvider`, `Toaster`, `Sonner`
- Defines `ProtectedRoute`: redirects unauthenticated users to `/auth`
- Defines `AuthRoute`: redirects authenticated users to `/`
- Routes: `/auth` → Auth, `/` → Index (protected), `*` → NotFound

### 7.2 `HeaderBar.tsx` — Navigation Bar

- Fixed top bar with glassmorphism effect
- App title (translated), language selector (EN/TE/HI), sign-out button
- Stop-speaking button (visible only when speech synthesis is active)

### 7.3 `HeroSection.tsx` — Landing Hero

- Full-height hero with dark gradient background
- 20 animated floating particles (Framer Motion)
- Agent icon badges (Soil, Water, Pest, Weather, Decision)
- Two CTA buttons: "Get Started" (scrolls to input) + "View Architecture" (opens docs modal)

### 7.4 `InputPanel.tsx` — Farm Data Input Form

**6 Input Fields:**
| Field | Type | Options |
|---|---|---|
| Soil Type | Dropdown | 7 soil types (trilingual) |
| Water Source | Dropdown | 5 irrigation sources (trilingual) |
| Season | Dropdown | 3 seasons (trilingual) |
| Farm Area | Number input | Acres (default: 5) |
| State | Dropdown | 15 Indian states |
| Location/District | Text input | Free-form with map icon |

- Voice input button with visual feedback (pulse animation when listening)
- Submit button with loading spinner during analysis

### 7.5 `WeatherCard.tsx` — Weather Display

- Gradient card displaying temperature (°C), humidity (%), rainfall (mm)
- Current weather condition text
- All labels are translated

### 7.6 `AgentAnimation.tsx` — Agent Processing Visual

- Shows 6 agent icons with sequential spring animations
- Pulsing box-shadow effect on each agent
- "AI Agents Analyzing..." text with breathing animation
- Displayed only during the 3-second analysis delay

### 7.7 `RecommendationDashboard.tsx` — Results Display

**Sections:**
1. **Best Crop Card** — Hero-style card with crop icon, name, confidence %, total score, reasoning, and agent breakdown (5 scores)
2. **Top Alternatives** — 5 alternative crops with animated confidence bars
3. **Mixed Cropping Strategy** — Companion crop pairing with reasoning
4. **Risk Assessment** — Color-coded (green/amber/red) risk level + factors
5. **Sustainability Score** — Animated progress bar
6. **Irrigation Advice** — Text recommendation based on water need

### 7.8 `ChartsSection.tsx` — Data Visualizations

- **Bar Chart** (Recharts): Crop confidence scores for top 6 crops
- **Line Chart** (Recharts): 7-day weather forecast (temp, rain, humidity)

### 7.9 `ReportGenerator.tsx` — Report Export

- **Download**: Generates an HTML advisory report, creates Blob, triggers download
- **Print**: Opens report in new window + triggers browser print dialog
- Report includes: farm inputs, weather data, agent analysis, recommendation, alternatives, mixed cropping, risk/sustainability

### 7.10 `DocumentationModal.tsx` — In-App Docs

- Dialog modal showing system architecture
- Agent grid with weights, decision flow pipeline, scoring algorithm, tech stack
- All labels translated

---

## 8. Hooks Reference

| Hook | File | Purpose |
|---|---|---|
| `useAuth()` | `useAuth.ts` | Returns `{ user, loading, signOut }`. Manages localStorage sessions and cross-tab sync via `StorageEvent`. |
| `useSpeechRecognition()` | `useSpeechRecognition.ts` | Returns `{ isListening, transcript, startListening, stopListening, error }`. Uses Web Speech API. |
| `useSpeechSynthesis()` | `useSpeechSynthesis.ts` | Returns `{ speak, stop, isSpeaking }`. Text-to-speech with configurable language. |
| `useMobile()` | `use-mobile.tsx` | Returns `boolean`. Detects viewport < 768px. |
| `useToast()` | `use-toast.ts` | Toast notification state management. |

---

## 9. Crop Database

### 12 Supported Crops

| # | Crop | Soil Types | Water | Temp (°C) | Seasons | Pest Risk | Growth (days) | Yield/Acre |
|---|---|---|---|---|---|---|---|---|
| 1 | 🌾 Rice (Paddy) | Clay, Loamy, Alluvial | High | 20–35 | Kharif, Rabi | Medium | 120 | 2–3 tonnes |
| 2 | 🌿 Wheat | Loamy, Clay, Alluvial | Medium | 10–25 | Rabi | Low | 140 | 1.5–2.5 tonnes |
| 3 | 🌿 Cotton | Black, Loamy | Medium | 21–35 | Kharif | High | 180 | 1–2 tonnes |
| 4 | 🎍 Sugarcane | Loamy, Alluvial, Clay | High | 20–38 | Kharif, Rabi | Medium | 360 | 25–35 tonnes |
| 5 | 🥜 Groundnut | Sandy, Loamy, Red | Low | 22–33 | Kharif, Rabi | Low | 120 | 1–1.5 tonnes |
| 6 | 🌽 Maize (Corn) | Loamy, Sandy, Alluvial | Medium | 18–32 | Kharif, Rabi | Medium | 100 | 2–3 tonnes |
| 7 | 🌱 Sorghum (Jowar) | Black, Red, Loamy | Low | 25–40 | Kharif, Rabi | Low | 110 | 1–2 tonnes |
| 8 | 🫘 Chickpea (Chana) | Loamy, Sandy, Clay | Low | 10–25 | Rabi | Medium | 100 | 0.8–1.2 tonnes |
| 9 | 🍅 Tomato | Loamy, Sandy, Red | Medium | 18–30 | All 3 | High | 75 | 8–12 tonnes |
| 10 | 🟡 Turmeric | Loamy, Alluvial, Clay | Medium | 20–35 | Kharif | Low | 270 | 5–8 tonnes |
| 11 | 🌶️ Chilli | Loamy, Sandy, Black | Medium | 20–35 | Kharif, Rabi | High | 90 | 1–2 tonnes |
| 12 | 🧅 Onion | Loamy, Sandy, Alluvial | Medium | 13–28 | Rabi, Kharif | Medium | 130 | 10–15 tonnes |

### Reference Data

**Soil Types (7):** Alluvial, Black (Regur), Red, Clay, Loamy, Sandy, Laterite

**Water Sources (5):** Canal Irrigation, Borewell, Rain-fed, River/Stream, Tank/Pond

**Seasons (3):** Kharif (Jun–Oct), Rabi (Nov–Mar), Zaid (Mar–Jun)

**States (15):** Andhra Pradesh, Telangana, Karnataka, Tamil Nadu, Maharashtra, Madhya Pradesh, Uttar Pradesh, Punjab, Haryana, Rajasthan, Gujarat, Bihar, West Bengal, Odisha, Kerala

---

## 10. Internationalization (i18n)

The system supports **3 languages** with full UI translation:

| Code | Language | Script |
|---|---|---|
| `en` | English | Latin |
| `te` | Telugu | తెలుగు |
| `hi` | Hindi | हिंदी |

- **45+ translated UI strings** covering all labels, buttons, agent names, and status messages
- **Crop names** are stored per-language in the crop database (`name`, `nameTE`, `nameHI`)
- **Soil types, water sources, and seasons** all have trilingual labels
- Language selection is available in the HeaderBar
- Voice recognition and speech synthesis respect the selected language

### Translation Function

```typescript
function t(key: string, lang: Language): string {
  return translations[key]?.[lang] || translations[key]?.en || key;
}
```

Falls back to English if a translation is missing, and returns the key itself as last resort.

---

## 11. Authentication System

### Architecture

The application uses **localStorage-based authentication** (no server-side auth):

| Storage Key | Purpose |
|---|---|
| `agri_users` | Stores all registered users as JSON array |
| `agri_session` | Stores the currently logged-in user session |

### Functions

| Function | Description |
|---|---|
| `signUpLocal(email, password, fullName)` | Creates account, auto-logs in |
| `signInLocal(email, password)` | Validates credentials, creates session |
| `signOutLocal()` | Removes session from localStorage |
| `useAuth()` | React hook for auth state + cross-tab sync |

### Route Guards

- `ProtectedRoute` — Wraps `/`, redirects to `/auth` if not authenticated
- `AuthRoute` — Wraps `/auth`, redirects to `/` if already authenticated

### Note on Supabase

The project has Supabase client configured (`src/integrations/supabase/client.ts`) with database type definitions, but the current auth system is **entirely localStorage-based**. The Supabase integration appears to be scaffolded for future use.

---

## 12. Design System & Theming

### CSS Variables (`src/index.css`)

The design system uses HSL-based CSS custom properties:

**Core Colors:**
| Token | HSL Value | Usage |
|---|---|---|
| `--primary` | 145, 58%, 32% | Green — primary actions, agent theme |
| `--secondary` | 38, 72%, 56% | Gold — secondary highlights |
| `--accent` | 28, 85%, 52% | Orange — accent elements |
| `--destructive` | 0, 72%, 50% | Red — errors, destructive actions |

**Agricultural Semantic Tokens:**
| Token | Usage |
|---|---|
| `--earth` | Soil-related elements |
| `--water` | Water/irrigation elements |
| `--sun` | Sun/temperature elements |
| `--leaf` | Growth/vegetation elements |
| `--safe / --warning / --danger` | Risk level indicators |

**Gradients:**
- `--gradient-hero`: Dark green hero background
- `--gradient-primary`: Green primary button gradient
- `--gradient-accent`: Gold-orange accent gradient
- `--gradient-weather`: Blue weather card gradient
- `--gradient-glass`: Transparent glassmorphism effect

**Typography:**
- Display font: **Space Grotesk** (headings, titles)
- Body font: **DM Sans** (paragraphs, labels)

**Custom CSS Classes:**
| Class | Effect |
|---|---|
| `.glass-card` | Glassmorphism effect with blur + transparency |
| `.glass-card-dark` | Dark variant for hero sections |
| `.gradient-text-primary` | Green gradient text |
| `.gradient-text-accent` | Gold gradient text |
| `.pulse-ring` | Pulsing animation (mic recording) |
| `.float-animation` | Floating vertical animation |
| `.shimmer` | Horizontal shimmer loading effect |

---

## 13. User Flow & Features

### Complete User Journey

```
1. AUTHENTICATION
   ├── Sign Up → Enter name, email, password → Auto-login
   └── Sign In → Enter email, password → Redirect to dashboard

2. DASHBOARD (Index Page)
   ├── Hero Section → "Get Started" or "View Architecture"
   ├── Farm Input Panel
   │   ├── Select: Soil Type, Water Source, Season, State
   │   ├── Enter: Farm Area (acres), Location/District
   │   ├── OR: Voice input (Hindi/Telugu/English)
   │   └── Click "Analyze & Recommend"
   │
   ├── Analysis Phase (3 seconds)
   │   └── Agent Animation → 6 agents pulse sequentially
   │
   ├── Results Display
   │   ├── Best Crop Card (confidence %, reasoning, agent scores)
   │   ├── Top 5 Alternatives (animated progress bars)
   │   ├── Mixed Cropping Strategy (companion pairing)
   │   ├── Risk Assessment (LOW/MEDIUM/HIGH with factors)
   │   ├── Sustainability Score (animated bar)
   │   └── Irrigation Advice (based on water need)
   │
   ├── Data Visualizations
   │   ├── Bar Chart: Crop Confidence Scores
   │   └── Line Chart: 7-Day Weather Forecast
   │
   └── Report Actions
       ├── Download Advisory Report (HTML file)
       └── Print Report (opens print dialog)

3. ADDITIONAL FEATURES
   ├── Language Switching (EN/TE/HI) → Header dropdown
   ├── Text-to-Speech → Click 🔊 on recommendation card
   ├── Architecture Docs → "View Architecture" button → Modal
   └── Sign Out → Header icon
```

---

## 14. Report Generation

The `ReportGenerator` component creates a **professional HTML advisory report** with the following sections:

| Section | Content |
|---|---|
| 1. Farm Input Summary | User's soil, water, area, season, location |
| 2. Weather Assessment | Temperature, humidity, rainfall, condition |
| 3. Multi-Agent Analysis | Each agent's score and detailed analysis |
| 4. Crop Recommendation | Best crop name, confidence, reasoning |
| 5. Alternative Crops | Top 5 alternatives with scores |
| 6. Mixed Cropping Strategy | Companion crop pairing + reason |
| 7. Risk & Sustainability | Risk level, factors, sustainability score, irrigation |

The report includes:
- Unique advisory ID (e.g., `AGR-M2Z9K1`)
- Date and location header
- Official-looking formatting (Georgia serif font, green borders)
- AI disclaimer at the footer
- Print-optimized CSS (`@media print`)

---

## 15. Configuration Files

### `vite.config.ts`

```typescript
{
  server: { host: "::", port: 8080, hmr: { overlay: false } },
  plugins: [react()],        // SWC-based React plugin
  resolve: { alias: { "@": "./src" } }  // Path alias
}
```

### `package.json` Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server on port 8080 |
| `npm run build` | Production build |
| `npm run build:dev` | Dev-mode build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint check |
| `npm test` | Run Vitest tests |
| `npm run test:watch` | Vitest in watch mode |

### `index.html` — SEO Tags

- Title: "AGENTIC AI POWERED FARM ADVISOR SYSTEM"
- OpenGraph tags for social sharing
- Twitter Card meta tags

---

## 16. Installation & Setup

### Prerequisites

- **Node.js** v20+ (LTS recommended)
- **npm** v10+

### Quick Start

```bash
# 1. Navigate to project
cd agriwise-ai-main

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open in browser
# http://localhost:8080/
```

### Environment Variables (`.env`)

The project uses a `.env` file for Supabase configuration. The main keys are:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

> **Note:** The application currently uses localStorage for auth rather than Supabase auth.

---

## 17. Troubleshooting

| Issue | Solution |
|---|---|
| `npm is not recognized` | Install Node.js from https://nodejs.org/ |
| `npm install` fails | Delete `node_modules` and `package-lock.json`, then run `npm install` again |
| Port 8080 in use | Change port in `vite.config.ts` or close conflicting app |
| Blank screen | Check browser DevTools Console (F12) for errors |
| Voice input not working | Use Chrome/Edge; ensure microphone permission is granted |
| Speech output not working | Browser must support Web Speech API |

---

## 18. Future Scope

Potential enhancements to consider:

| Enhancement | Description |
|---|---|
| **Real Weather API** | Integrate with OpenWeatherMap or IMD API for live weather data |
| **Supabase Auth Migration** | Shift from localStorage to Supabase Auth for secure, server-side authentication |
| **Additional Crops** | Expand beyond 12 crops to cover more regional varieties |
| **GPS Location** | Use browser Geolocation API for automatic state/district detection |
| **Historical Data** | Store and visualize past analyses for trend tracking |
| **ML Model Integration** | Replace rule-based scoring with trained ML models for higher accuracy |
| **PWA Support** | Add service worker for offline access in rural areas with limited connectivity |
| **More Languages** | Add Kannada, Tamil, Marathi, and other regional languages |
| **Crop Market Prices** | Integrate with government price APIs for economic recommendations |
| **Soil Testing Integration** | Connect with soil testing lab APIs for real soil data |

---

> **Document generated on:** March 10, 2026  
> **Project:** AGENTIC AI POWERED FARM ADVISOR SYSTEM  
> **Type:** College Project — Multi-Agent AI Architecture
