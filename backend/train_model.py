from __future__ import annotations

from pathlib import Path
from random import Random
from typing import Any

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

from .crop_data import CROP_PROFILES, INDIAN_STATES


BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "model.pkl"

CATEGORICAL_FEATURES = ["soilType", "waterSource", "season", "state"]
NUMERIC_FEATURES = ["farmArea", "temperature", "humidity", "rainfall", "waterStress", "pestPressure", "diseasePressure"]

WATER_PRIORITY = {
    "low": ["rain", "tank", "borewell"],
    "medium": ["borewell", "canal", "tank", "river"],
    "high": ["canal", "river", "borewell", "tank"],
}

PEST_NUMERIC = {"low": 0.22, "medium": 0.48, "high": 0.72}


def _synthetic_weather(crop: dict[str, Any], season: str, rng: Random) -> tuple[float, float, float]:
    min_temp, max_temp = crop["tempRange"]
    humidity_min, humidity_max = crop["humidityRange"]
    temperature = rng.uniform(min_temp - 2, max_temp + 2)
    humidity = rng.uniform(humidity_min, humidity_max)

    seasonal_rain = {
        "kharif": rng.uniform(8, 22),
        "rabi": rng.uniform(0, 8),
        "zaid": rng.uniform(0, 6),
    }[season]
    water_bonus = {"low": 0.0, "medium": 3.0, "high": 7.0}[crop["waterNeed"]]
    rainfall = max(0.0, seasonal_rain + water_bonus + rng.uniform(-2.5, 2.5))
    return round(temperature, 2), round(humidity, 2), round(rainfall, 2)


def make_training_data(seed: int = 42) -> pd.DataFrame:
    rng = Random(seed)
    rows: list[dict[str, Any]] = []

    for crop in CROP_PROFILES:
        for season in crop["seasons"]:
            for soil_type in crop["soilTypes"]:
                for _ in range(70):
                    water_source = rng.choice(WATER_PRIORITY[crop["waterNeed"]])
                    temperature, humidity, rainfall = _synthetic_weather(crop, season, rng)
                    rows.append(
                        {
                            "soilType": soil_type,
                            "waterSource": water_source,
                            "season": season,
                            "state": rng.choice(INDIAN_STATES),
                            "farmArea": round(rng.uniform(1.5, 15.0), 2),
                            "temperature": temperature,
                            "humidity": humidity,
                            "rainfall": rainfall,
                            "waterStress": round(rng.uniform(0.0, 0.3), 3),
                            "pestPressure": round(max(0.05, PEST_NUMERIC[crop["pestRisk"]] + rng.uniform(-0.18, 0.12)), 3),
                            "diseasePressure": round(rng.uniform(0.05, 0.35), 3),
                            "label": crop["id"],
                        }
                    )

        # Add a smaller set of imperfect-but-still-valid samples so the model generalizes.
        for _ in range(35):
            season = rng.choice(["kharif", "rabi", "zaid"])
            temperature, humidity, rainfall = _synthetic_weather(crop, season if season in crop["seasons"] else crop["seasons"][0], rng)
            rows.append(
                {
                    "soilType": rng.choice(list({"alluvial", "black", "red", "clay", "loamy", "sandy"})),
                    "waterSource": rng.choice(["canal", "borewell", "rain", "river", "tank"]),
                    "season": season,
                    "state": rng.choice(INDIAN_STATES),
                    "farmArea": round(rng.uniform(1.0, 20.0), 2),
                    "temperature": round(temperature + rng.uniform(-3, 3), 2),
                    "humidity": round(max(25.0, min(95.0, humidity + rng.uniform(-12, 12))), 2),
                    "rainfall": round(max(0.0, rainfall + rng.uniform(-5, 5)), 2),
                    "waterStress": round(rng.uniform(0.0, 0.85), 3),
                    "pestPressure": round(rng.uniform(0.05, 0.9), 3),
                    "diseasePressure": round(rng.uniform(0.05, 0.8), 3),
                    "label": crop["id"],
                }
            )

    return pd.DataFrame(rows)


def train_and_save_model() -> dict[str, Any]:
    dataset = make_training_data()
    x = dataset[CATEGORICAL_FEATURES + NUMERIC_FEATURES]
    y = dataset["label"]

    preprocessor = ColumnTransformer(
        transformers=[
            ("categorical", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL_FEATURES),
            ("numeric", "passthrough", NUMERIC_FEATURES),
        ]
    )
    model = RandomForestClassifier(
        n_estimators=320,
        max_depth=18,
        min_samples_leaf=2,
        random_state=42,
        class_weight="balanced_subsample",
    )
    pipeline = Pipeline([("preprocessor", preprocessor), ("model", model)])
    pipeline.fit(x, y)

    bundle = {
        "model": pipeline,
        "categorical_features": CATEGORICAL_FEATURES,
        "numeric_features": NUMERIC_FEATURES,
        "classes": sorted(dataset["label"].unique().tolist()),
        "samples": int(len(dataset)),
    }
    joblib.dump(bundle, MODEL_PATH)
    return bundle


if __name__ == "__main__":
    train_and_save_model()
    print(f"Model saved to {MODEL_PATH}")
