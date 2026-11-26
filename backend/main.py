from __future__ import annotations

import hashlib
import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any
from urllib.parse import quote_plus
from urllib.request import Request, urlopen

import joblib
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .crop_data import CROP_PROFILES, SEASONS, SOIL_TYPES, WATER_SOURCES, crop_by_id, localized_crop_name
from .language_tools import default_state, localized_label_map, merge_inputs, parse_voice_input
from .train_model import CATEGORICAL_FEATURES, MODEL_PATH, NUMERIC_FEATURES, train_and_save_model


BASE_DIR = Path(__file__).resolve().parent
ICON_MAP = {
    "soil": "🔬",
    "water": "💧",
    "pest": "🐛",
    "weather": "🌤️",
    "season": "📅",
    "decision": "🧠",
}


class FarmInputPayload(BaseModel):
    soilType: str | None = None
    waterSource: str | None = None
    farmArea: float | None = None
    season: str | None = None
    location: str | None = None
    state: str | None = None
    voiceText: str | None = None
    voiceTextEnglish: str | None = None
    voiceDetectedLanguage: str | None = None
    voiceObservations: list[str] | None = None


class VoiceParseRequest(BaseModel):
    text: str = Field(..., min_length=2)
    language: str = "en"


class AnalyzeRequest(BaseModel):
    language: str = "en"
    formInput: FarmInputPayload


app = FastAPI(title="AgriWise Multilingual Backend", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def ensure_model() -> dict[str, Any]:
    if not MODEL_PATH.exists():
        return train_and_save_model()
    return joblib.load(MODEL_PATH)


MODEL_BUNDLE = ensure_model()


def fetch_json(url: str, timeout: int = 10) -> Any:
    request = Request(url)
    with urlopen(request, timeout=timeout) as response:
        return json.loads(response.read().decode("utf-8"))


def clamp(value: float, minimum: float = 0.0, maximum: float = 100.0) -> float:
    return round(max(minimum, min(maximum, value)), 2)


def fallback_weather(location: str) -> dict[str, Any]:
    digest = hashlib.sha256(location.lower().encode("utf-8")).hexdigest()
    pivot = int(digest[:8], 16)
    temperature = 24 + (pivot % 9)
    humidity = 52 + (pivot % 25)
    rainfall = round((pivot % 11) * 0.9, 1)
    start = datetime.now()
    forecast = []
    for day_index in range(7):
        forecast.append(
            {
                "day": (start + timedelta(days=day_index)).strftime("%a"),
                "temp": temperature + (day_index % 3) - 1,
                "rain": max(0.0, round(rainfall + ((pivot >> day_index) % 5) - 2, 1)),
                "humidity": clamp(humidity + ((pivot >> (day_index + 1)) % 9) - 4, 30, 95),
            }
        )
    return {
        "temperature": temperature,
        "humidity": humidity,
        "rainfall": rainfall,
        "condition": "Seasonal fallback",
        "forecast": forecast,
        "isReal": False,
        "city": location,
        "source": "fallback",
        "provider": "deterministic seasonal fallback",
    }


def fetch_weather(location: str, state: str) -> dict[str, Any]:
    query_candidates = [f"{location}, {state}" if location else state, location, state]
    geocode = None
    for candidate in [item for item in query_candidates if item]:
        search = (
            "https://geocoding-api.open-meteo.com/v1/search"
            f"?name={quote_plus(candidate)}&count=1&language=en&format=json"
        )
        data = fetch_json(search)
        results = data.get("results", [])
        if results:
            geocode = results[0]
            break

    if not geocode:
        return fallback_weather(location or state or "Farm location")

    latitude = geocode["latitude"]
    longitude = geocode["longitude"]
    city = ", ".join(part for part in [geocode.get("name"), geocode.get("admin1"), geocode.get("country")] if part)
    forecast_url = (
        "https://api.open-meteo.com/v1/forecast"
        f"?latitude={latitude}&longitude={longitude}"
        "&current=temperature_2m,relative_humidity_2m,precipitation,weather_code"
        "&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_mean"
        "&timezone=auto&forecast_days=7"
    )
    try:
        weather_data = fetch_json(forecast_url)
    except Exception:
        return fallback_weather(city)

    current = weather_data.get("current", {})
    daily = weather_data.get("daily", {})
    forecast = []
    for index, day_value in enumerate(daily.get("time", [])[:7]):
        forecast.append(
            {
                "day": datetime.fromisoformat(day_value).strftime("%a"),
                "temp": round(float(daily["temperature_2m_max"][index]), 1),
                "rain": round(float(daily["precipitation_sum"][index]), 1),
                "humidity": round(float(daily["relative_humidity_2m_mean"][index]), 1),
            }
        )

    return {
        "temperature": round(float(current.get("temperature_2m", forecast[0]["temp"])), 1),
        "humidity": round(float(current.get("relative_humidity_2m", forecast[0]["humidity"])), 1),
        "rainfall": round(float(current.get("precipitation", forecast[0]["rain"])), 1),
        "condition": "Live forecast",
        "forecast": forecast,
        "isReal": True,
        "city": city,
        "source": "open-meteo",
        "provider": "Open-Meteo",
    }


def numeric_signals(voice_observations: list[str]) -> dict[str, float]:
    joined = " ".join(voice_observations).lower()
    return {
        "waterStress": 0.75 if "water stress" in joined else 0.15,
        "pestPressure": 0.78 if "pest" in joined else 0.25,
        "diseasePressure": 0.7 if "disease" in joined else 0.2,
    }


def build_feature_frame(merged_input: dict[str, Any], weather: dict[str, Any]) -> pd.DataFrame:
    voice_flags = numeric_signals(merged_input.get("voiceObservations", []))
    payload = {
        "soilType": merged_input["soilType"],
        "waterSource": merged_input["waterSource"],
        "season": merged_input["season"],
        "state": merged_input["state"],
        "farmArea": float(merged_input.get("farmArea") or 5.0),
        "temperature": float(weather["temperature"]),
        "humidity": float(weather["humidity"]),
        "rainfall": float(weather["rainfall"]),
        **voice_flags,
    }
    return pd.DataFrame([payload])[CATEGORICAL_FEATURES + NUMERIC_FEATURES]


def water_demand_score(water_need: str, water_source: str, rainfall: float, observations: list[str]) -> float:
    source_scores = {
        "canal": 92,
        "river": 90,
        "borewell": 82,
        "tank": 74,
        "rain": 62,
    }
    base = source_scores.get(water_source, 58)
    need_penalty = {"low": 0, "medium": 8, "high": 14}[water_need]
    rain_bonus = min(12.0, rainfall * 0.8)
    observation_penalty = 18 if any("water stress" in item.lower() for item in observations) else 0
    return clamp(base - need_penalty + rain_bonus - observation_penalty)


def soil_match_score(crop: dict[str, Any], soil_type: str) -> float:
    return 94.0 if soil_type in crop["soilTypes"] else 46.0


def season_match_score(crop: dict[str, Any], season: str) -> float:
    return 92.0 if season in crop["seasons"] else 38.0


def weather_fit_score(crop: dict[str, Any], weather: dict[str, Any]) -> float:
    min_temp, max_temp = crop["tempRange"]
    min_humidity, max_humidity = crop["humidityRange"]
    temperature = float(weather["temperature"])
    humidity = float(weather["humidity"])

    temp_score = max(0.0, 100 - abs(temperature - ((min_temp + max_temp) / 2)) * 6)
    humidity_score = max(0.0, 100 - abs(humidity - ((min_humidity + max_humidity) / 2)) * 2.2)
    return clamp(temp_score * 0.6 + humidity_score * 0.4)


def pest_risk_score(crop: dict[str, Any], observations: list[str], weather: dict[str, Any]) -> float:
    base = {"low": 85, "medium": 68, "high": 48}[crop["pestRisk"]]
    humidity_penalty = max(0.0, (float(weather["humidity"]) - 75) * 0.7)
    observation_penalty = 20 if any("pest" in item.lower() or "disease" in item.lower() for item in observations) else 0
    return clamp(base - humidity_penalty - observation_penalty)


def localized_risk(level: str, language: str) -> str:
    if language == "te":
        return {"low": "తక్కువ", "medium": "మధ్యస్థం", "high": "అధికం"}[level]
    if language == "hi":
        return {"low": "कम", "medium": "मध्यम", "high": "अधिक"}[level]
    return level.title()


def build_reasoning(crop: dict[str, Any], agent_scores: dict[str, float], merged_input: dict[str, Any], weather: dict[str, Any]) -> str:
    statements = []
    if agent_scores["soil"] >= 75:
        statements.append("soil compatibility is strong")
    if agent_scores["water"] >= 75:
        statements.append("the available water source and forecast support the crop")
    if agent_scores["season"] >= 75:
        statements.append("the current season is suitable")
    if agent_scores["weather"] >= 75:
        statements.append("the live weather is within a workable range")
    if agent_scores["pest"] < 60:
        statements.append("pest or disease pressure needs attention")
    if not statements:
        statements.append("the crop remains viable after combining soil, season, water, and weather signals")
    return (
        f"{crop['name']} is recommended because "
        + ", ".join(statements)
        + f". The analysis used {merged_input['soilType']} soil, {merged_input['waterSource']} water source, "
        + f"{merged_input['season']} season, and live weather from {weather['provider']}."
    )


def build_agent_results(crop: dict[str, Any], agent_scores: dict[str, float], merged_input: dict[str, Any], weather: dict[str, Any]) -> list[dict[str, Any]]:
    return [
        {
            "agentName": "Soil Analysis Agent",
            "score": round(agent_scores["soil"], 2),
            "analysis": f"{crop['name']} is {'well matched' if agent_scores['soil'] >= 70 else 'not ideally matched'} for {merged_input['soilType']} soil.",
            "icon": ICON_MAP["soil"],
        },
        {
            "agentName": "Water Availability Agent",
            "score": round(agent_scores["water"], 2),
            "analysis": f"The {merged_input['waterSource']} source plus forecast rainfall of {weather['rainfall']} mm was evaluated against {crop['name']}.",
            "icon": ICON_MAP["water"],
        },
        {
            "agentName": "Pest Risk Agent",
            "score": round(agent_scores["pest"], 2),
            "analysis": f"{crop['name']} currently shows a {crop['pestRisk']} baseline pest profile after weather and voice-note adjustments.",
            "icon": ICON_MAP["pest"],
        },
        {
            "agentName": "Weather Intelligence Agent",
            "score": round(agent_scores["weather"], 2),
            "analysis": f"Current temperature {weather['temperature']}°C and humidity {weather['humidity']}% were compared with the crop comfort range.",
            "icon": ICON_MAP["weather"],
        },
        {
            "agentName": "Seasonal Pattern Agent",
            "score": round(agent_scores["season"], 2),
            "analysis": f"{crop['name']} has {'good' if agent_scores['season'] >= 70 else 'weak'} alignment with the {merged_input['season']} season.",
            "icon": ICON_MAP["season"],
        },
    ]


def crop_payload(crop: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": crop["id"],
        "name": crop["name"],
        "nameTE": crop["nameTE"],
        "nameHI": crop["nameHI"],
        "soilTypes": crop["soilTypes"],
        "waterNeed": crop["waterNeed"],
        "tempRange": crop["tempRange"],
        "seasons": crop["seasons"],
        "pestRisk": crop["pestRisk"],
        "growthDays": crop["growthDays"],
        "yieldPerAcre": crop["yieldPerAcre"],
        "companionCrops": crop["companionCrops"],
        "icon": crop["icon"],
    }


def build_bilingual_response(
    best_crop: dict[str, Any],
    input_data: dict[str, Any],
    weather: dict[str, Any],
    risk_level: str,
    irrigation_advice: str,
    language: str,
) -> dict[str, Any]:
    localized_crop = localized_crop_name(best_crop, language)
    english_summary = (
        f"Best recommended crop is {best_crop['name']} for {input_data['location']}, {input_data['state']}. "
        f"The system considered {SOIL_TYPES[input_data['soilType']]['en']} soil, {WATER_SOURCES[input_data['waterSource']]['en']}, "
        f"{SEASONS[input_data['season']]['en']} season, and live weather at {weather['temperature']}°C with {weather['humidity']}% humidity."
    )
    english_actions = [
        f"Use {best_crop['name']} as the primary crop choice for the current planning cycle.",
        f"Follow this irrigation guidance: {irrigation_advice}",
        f"Monitor risk level: {risk_level.title()} and inspect the field every 2 to 3 days.",
    ]

    if language == "te":
        localized_summary = (
            f"{input_data['location']}, {input_data['state']} కోసం సిఫారసు చేసిన ఉత్తమ పంట {localized_crop}. "
            f"వ్యవస్థ {SOIL_TYPES[input_data['soilType']]['te']} మట్టి, {WATER_SOURCES[input_data['waterSource']]['te']}, "
            f"{SEASONS[input_data['season']]['te']} సీజన్, మరియు {weather['temperature']}°C ఉష్ణోగ్రతను పరిగణించింది."
        )
        localized_actions = [
            f"ప్రస్తుత పంట ప్రణాళికకు {localized_crop} ను ప్రధాన ఎంపికగా తీసుకోండి.",
            f"నీటిపారుదల సూచన: {irrigation_advice}",
            f"ప్రమాద స్థాయి {localized_risk(risk_level, language)} కాబట్టి ప్రతి 2-3 రోజులకు పొలాన్ని పరిశీలించండి.",
        ]
    elif language == "hi":
        localized_summary = (
            f"{input_data['location']}, {input_data['state']} के लिए सुझाई गई सर्वोत्तम फसल {localized_crop} है. "
            f"सिस्टम ने {SOIL_TYPES[input_data['soilType']]['hi']} मिट्टी, {WATER_SOURCES[input_data['waterSource']]['hi']}, "
            f"{SEASONS[input_data['season']]['hi']} मौसम, और {weather['temperature']}°C तापमान को ध्यान में रखा."
        )
        localized_actions = [
            f"मौजूदा योजना के लिए {localized_crop} को मुख्य फसल विकल्प रखें.",
            f"सिंचाई सलाह: {irrigation_advice}",
            f"जोखिम स्तर {localized_risk(risk_level, language)} है, इसलिए हर 2-3 दिन में खेत का निरीक्षण करें.",
        ]
    else:
        localized_summary = english_summary
        localized_actions = english_actions

    return {
        "englishSummary": english_summary,
        "localizedSummary": localized_summary,
        "englishActions": english_actions,
        "localizedActions": localized_actions,
        "englishVoice": english_summary + " " + " ".join(english_actions),
        "localizedVoice": localized_summary + " " + " ".join(localized_actions),
    }


def irrigation_advice_for(crop: dict[str, Any], weather: dict[str, Any], input_data: dict[str, Any]) -> str:
    if crop["waterNeed"] == "high":
        advice = "Use assured irrigation or staged watering because the crop has high moisture demand."
    elif crop["waterNeed"] == "medium":
        advice = "Use moderate irrigation with soil-moisture checks between cycles."
    else:
        advice = "Minimal irrigation is needed; moisture-conserving practices will help."

    if any("water stress" in item.lower() for item in input_data.get("voiceObservations", [])):
        advice += " Voice input mentioned water stress, so inspect root-zone moisture before the next irrigation cycle."
    return advice


def analyze(merged_input: dict[str, Any], language: str, weather: dict[str, Any]) -> dict[str, Any]:
    features = build_feature_frame(merged_input, weather)
    model = MODEL_BUNDLE["model"]
    probabilities = model.predict_proba(features)[0]
    classes = model.classes_

    scored_crops: list[dict[str, Any]] = []
    for index, crop_id in enumerate(classes):
        crop = crop_by_id(str(crop_id))
        agent_scores = {
            "soil": soil_match_score(crop, merged_input["soilType"]),
            "water": water_demand_score(crop["waterNeed"], merged_input["waterSource"], float(weather["rainfall"]), merged_input.get("voiceObservations", [])),
            "season": season_match_score(crop, merged_input["season"]),
            "weather": weather_fit_score(crop, weather),
            "pest": pest_risk_score(crop, merged_input.get("voiceObservations", []), weather),
        }
        total_score = (
            agent_scores["soil"] * 0.30
            + agent_scores["water"] * 0.25
            + agent_scores["season"] * 0.15
            + agent_scores["weather"] * 0.15
            + agent_scores["pest"] * 0.15
        )
        confidence = clamp(float(probabilities[index]) * 100 * 0.55 + total_score * 0.45, 15, 98)
        scored_crops.append(
            {
                "crop": crop_payload(crop),
                "totalScore": round(total_score, 2),
                "soilScore": round(agent_scores["soil"], 2),
                "waterScore": round(agent_scores["water"], 2),
                "seasonScore": round(agent_scores["season"], 2),
                "tempScore": round(agent_scores["weather"], 2),
                "pestScore": round(agent_scores["pest"], 2),
                "confidence": round(confidence),
                "reasoning": build_reasoning(crop, agent_scores, merged_input, weather),
                "agentResults": build_agent_results(crop, agent_scores, merged_input, weather),
            }
        )

    scored_crops.sort(key=lambda item: (item["totalScore"], item["confidence"]), reverse=True)
    best_crop = scored_crops[0]
    alternatives = scored_crops[1:6]
    companion_id = next((crop_id for crop_id in best_crop["crop"]["companionCrops"] if any(item["crop"]["name"].lower().startswith(crop_id) or item["crop"]["id"] == crop_id for item in scored_crops[1:])), None)
    mixed_crop = next((item["crop"] for item in scored_crops[1:] if item["crop"]["id"] == companion_id), alternatives[0]["crop"] if alternatives else best_crop["crop"])

    risk_factors = []
    if best_crop["soilScore"] < 60:
        risk_factors.append("Soil compatibility is below the ideal range.")
    if best_crop["waterScore"] < 60:
        risk_factors.append("Water availability may be insufficient for stable growth.")
    if best_crop["pestScore"] < 60:
        risk_factors.append("Pest or disease pressure requires active scouting.")
    if weather["isReal"] is False:
        risk_factors.append("Weather is running on fallback data, so confirm with a local forecast.")

    risk_level = "low" if not risk_factors else "medium" if len(risk_factors) <= 2 else "high"
    sustainability = round(clamp(best_crop["totalScore"] * 0.9 + (12 if best_crop["crop"]["waterNeed"] == "low" else 4), 25, 96))
    irrigation_advice = irrigation_advice_for(best_crop["crop"], weather, merged_input)
    bilingual = build_bilingual_response(best_crop["crop"], merged_input, weather, risk_level, irrigation_advice, language)

    return {
        "bestCrop": best_crop,
        "alternatives": alternatives,
        "mixedCropping": {
            "crop1": best_crop["crop"],
            "crop2": mixed_crop,
            "reason": f"{best_crop['crop']['name']} and {mixed_crop['name']} can be paired to diversify nutrient demand and reduce single-crop risk.",
        },
        "riskLevel": risk_level,
        "riskFactors": risk_factors,
        "sustainabilityScore": sustainability,
        "irrigationAdvice": irrigation_advice,
        "bilingualResponse": bilingual,
        "voiceInput": {
            "originalText": merged_input.get("voiceText", ""),
            "normalizedEnglish": merged_input.get("voiceTextEnglish", ""),
            "detectedLanguage": merged_input.get("voiceDetectedLanguage", language),
            "observations": merged_input.get("voiceObservations", []),
            "labels": localized_label_map(language),
        },
        "metadata": {
            "weatherSource": weather["source"],
            "weatherProvider": weather["provider"],
            "modelMode": "random-forest + deterministic farm agents",
        },
    }


def normalize_final_input(form_input: dict[str, Any], parsed_voice: dict[str, Any]) -> dict[str, Any]:
    merged = merge_inputs(form_input, parsed_voice)
    merged["soilType"] = merged.get("soilType") or "loamy"
    merged["waterSource"] = merged.get("waterSource") or "borewell"
    merged["season"] = merged.get("season") or "kharif"
    merged["farmArea"] = float(merged.get("farmArea") or 5.0)
    merged["state"] = merged.get("state") or default_state()
    merged["location"] = merged.get("location") or "Hyderabad"
    merged["voiceObservations"] = merged.get("voiceObservations") or parsed_voice.get("observationsEnglish", [])
    return merged


@app.get("/health")
def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "modelPath": str(MODEL_PATH),
        "classes": MODEL_BUNDLE["classes"],
        "samples": MODEL_BUNDLE["samples"],
    }


@app.post("/voice/parse")
def parse_voice(request: VoiceParseRequest) -> dict[str, Any]:
    return parse_voice_input(request.text, request.language)


@app.post("/analyze")
def analyze_farm(request: AnalyzeRequest) -> dict[str, Any]:
    parsed_voice = parse_voice_input(request.formInput.voiceText or "", request.language)
    final_input = normalize_final_input(request.formInput.model_dump(), parsed_voice)
    weather = fetch_weather(final_input["location"], final_input["state"])
    result = analyze(final_input, request.language, weather)

    return {
        "input": final_input,
        "weather": weather,
        "result": result,
        "voiceParse": parsed_voice,
    }
