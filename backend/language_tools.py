from __future__ import annotations

import re
from typing import Any

from .crop_data import INDIAN_STATES, SEASONS, SOIL_TYPES, WATER_SOURCES


FIELD_PATTERNS = {
    "soilType": {
        "alluvial": ["alluvial", "ondru", "ఒండ్రు", "जलोढ़"],
        "black": ["black soil", "black", "regur", "nalla regadi", "నల్ల రేగడి", "काली मिट्टी", "काली", "रेगुर"],
        "red": ["red soil", "erra matti", "ఎర్ర మట్టి", "लाल मिट्टी"],
        "clay": ["clay", "banka matti", "బంక మట్టి", "चिकनी मिट्टी"],
        "loamy": ["loamy", "loam", "loamy soil", "domat", "లోమ్", "లోమ్ మట్టి", "दोमट"],
        "sandy": ["sandy", "isuka matti", "ఇసుక మట్టి", "बलुई", "रेतीली"],
        "laterite": ["laterite", "లేటరైట్", "लेटेराइट"],
    },
    "waterSource": {
        "canal": ["canal", "కాలువ", "nahar", "नहर"],
        "borewell": ["borewell", "bore well", "borwell", "bore", "bore bavi", "బోర్", "బోరు బావి", "बोरवेल", "ट्यूबवेल"],
        "rain": ["rain fed", "rainfed", "rain water", "వర్షాధారం", "వర్షం మీద", "वर्षा आधारित"],
        "river": ["river", "stream", "నది", "ప్రవాహం", "नदी", "धारा"],
        "tank": ["tank", "pond", "cheruvu", "చెరువు", "కుంట", "तालाब", "पोखर"],
    },
    "season": {
        "kharif": ["kharif", "karif", "monsoon", "ఖరీఫ్", "खरीफ"],
        "rabi": ["rabi", "winter", "రబీ", "रबी"],
        "zaid": ["zaid", "zayed", "summer", "జైద్", "ज़ायद"],
    },
}

STATE_PATTERNS = {
    "Andhra Pradesh": ["andhra pradesh", "ఆంధ్రప్రదేశ్", "आंध्र प्रदेश", "ap"],
    "Telangana": ["telangana", "తెలంగాణ", "तेलंगाना", "tg"],
    "Karnataka": ["karnataka", "ಕರ್ನಾಟಕ", "కర్ణాటక", "कर्नाटक"],
    "Tamil Nadu": ["tamil nadu", "தமிழ்நாடு", "తమిళనాడు", "तमिलनाडु"],
    "Maharashtra": ["maharashtra", "మహారాష్ట్ర", "महाराष्ट्र"],
    "Madhya Pradesh": ["madhya pradesh", "మధ్యప్రదేశ్", "मध्य प्रदेश", "mp"],
    "Uttar Pradesh": ["uttar pradesh", "ఉత్తరప్రదేశ్", "उत्तर प्रदेश", "up"],
    "Punjab": ["punjab", "పంజాబ్", "पंजाब"],
    "Haryana": ["haryana", "హర్యానా", "हरियाणा"],
    "Rajasthan": ["rajasthan", "రాజస్థాన్", "राजस्थान"],
    "Gujarat": ["gujarat", "ગુજરાત", "గుజరాత్", "गुजरात"],
    "Bihar": ["bihar", "బీహార్", "बिहार"],
    "West Bengal": ["west bengal", "పశ్చిమ బెంగాల్", "पश्चिम बंगाल"],
    "Odisha": ["odisha", "ఒడిశా", "ओडिशा", "orissa"],
    "Kerala": ["kerala", "കേരളം", "కేరళ", "केरल"],
}

OBSERVATION_PATTERNS = {
    "water_stress": {
        "patterns": [
            "water stress",
            "dry",
            "wilting",
            "irrigation problem",
            "low moisture",
            "నీటి ఒత్తిడి",
            "ఎండిపోతోంది",
            "తేమ తక్కువ",
            "पानी की कमी",
            "सूख रहा",
            "नमी कम",
        ],
        "negative_patterns": ["no water stress", "water is enough", "నీటి సమస్య లేదు", "पानी की कमी नहीं"],
        "english": "Water stress is present in parts of the field.",
        "te": "పొలంలోని కొన్ని భాగాల్లో నీటి ఒత్తిడి కనిపిస్తోంది.",
        "hi": "खेत के कुछ हिस्सों में पानी की कमी दिखाई दे रही है.",
    },
    "pest_pressure": {
        "patterns": [
            "pest",
            "insect",
            "borer",
            "aphid",
            "worm",
            "తెగులు",
            "పురుగు",
            "कीट",
            "कीड़े",
            "सुंडी",
        ],
        "negative_patterns": ["no pest", "no insect", "major pest attack not seen", "తెగులు లేదు", "कीट नहीं"],
        "english": "Pest pressure signs were mentioned in the voice note.",
        "te": "వాయిస్ నోట్‌లో తెగుళ్ల ఒత్తిడి లక్షణాలు చెప్పబడ్డాయి.",
        "hi": "वॉइस नोट में कीट दबाव के संकेत बताए गए हैं.",
    },
    "disease_pressure": {
        "patterns": [
            "disease",
            "fungal",
            "blight",
            "spot",
            "yellowing",
            "వ్యాధి",
            "పసుపుదనం",
            "फफूंद",
            "रोग",
            "पीला पड़ना",
        ],
        "negative_patterns": ["no disease", "disease not seen", "వ్యాధి లేదు", "रोग नहीं"],
        "english": "Disease symptoms were mentioned and should be monitored.",
        "te": "వ్యాధి లక్షణాలు వినిపించాయి, క్రమం తప్పకుండా పరిశీలించాలి.",
        "hi": "रोग के लक्षण बताए गए हैं, नियमित निगरानी ज़रूरी है.",
    },
    "healthy_crop": {
        "patterns": [
            "healthy",
            "good growth",
            "stable",
            "బాగుంది",
            "సరే ఉంది",
            "अच्छा है",
            "ठीक है",
        ],
        "negative_patterns": [],
        "english": "The crop condition sounds generally stable.",
        "te": "పంట పరిస్థితి మొత్తం మీద స్థిరంగా ఉన్నట్లు ఉంది.",
        "hi": "फसल की स्थिति कुल मिलाकर स्थिर लग रही है.",
    },
}

NUMBER_WORDS = {
    "one": 1,
    "two": 2,
    "three": 3,
    "four": 4,
    "five": 5,
    "six": 6,
    "seven": 7,
    "eight": 8,
    "nine": 9,
    "ten": 10,
    "eleven": 11,
    "twelve": 12,
    "ఒకటి": 1,
    "రెండు": 2,
    "మూడు": 3,
    "నాలుగు": 4,
    "ఐదు": 5,
    "ఆరు": 6,
    "ఏడు": 7,
    "ఎనిమిది": 8,
    "తొమ్మిది": 9,
    "పది": 10,
    "एक": 1,
    "दो": 2,
    "तीन": 3,
    "चार": 4,
    "पांच": 5,
    "छह": 6,
    "सात": 7,
    "आठ": 8,
    "नौ": 9,
    "दस": 10,
}

ACRE_UNITS = ["acre", "acres", "ఎకరం", "ఎకరాలు", "ఎకరాల", "एकड़", "एकड़"]


def detect_language(text: str, requested_language: str | None = None) -> str:
    if re.search(r"[\u0C00-\u0C7F]", text):
        return "te"
    if re.search(r"[\u0900-\u097F]", text):
        return "hi"
    if requested_language in {"en", "te", "hi"}:
        return requested_language
    return "en"


def normalize_text(text: str) -> str:
    lowered = text.strip().lower()
    return re.sub(r"\s+", " ", lowered)


def _match_value(normalized_text: str, candidates: dict[str, list[str]]) -> str | None:
    for value, patterns in candidates.items():
        if any(pattern in normalized_text for pattern in patterns):
            return value
    return None


def extract_acres(normalized_text: str) -> float | None:
    unit_pattern = "|".join(re.escape(unit) for unit in ACRE_UNITS)
    digit_match = re.search(rf"(\d+(?:\.\d+)?)\s*(?:{unit_pattern})", normalized_text)
    if digit_match:
        return float(digit_match.group(1))

    if any(unit in normalized_text for unit in ACRE_UNITS):
        for word, value in NUMBER_WORDS.items():
            if re.search(rf"\b{re.escape(word)}\b", normalized_text):
                return float(value)
    return None


def extract_state(normalized_text: str) -> str | None:
    for state, patterns in STATE_PATTERNS.items():
        if any(pattern in normalized_text for pattern in patterns):
            return state
    return None


def _clean_location_candidate(candidate: str) -> str | None:
    candidate = candidate.strip(" ,.-")
    candidate = re.sub(r"^(in|near|at|from)\b", "", candidate, flags=re.IGNORECASE).strip(" ,.-")
    candidate = re.sub(r"\b(in|near|at|from)\b$", "", candidate, flags=re.IGNORECASE).strip(" ,.-")
    candidate = re.sub(r"(లో|లోని|के पास|के निकट)$", "", candidate).strip(" ,.-")
    words = [word for word in candidate.split() if word]
    if not words:
        return None
    if len(words) >= 3:
        candidate = " ".join(words[-2:])
        candidate = re.sub(r"^(in|near|at|from)\b", "", candidate, flags=re.IGNORECASE).strip(" ,.-")
    if len(candidate) < 3:
        return None
    return candidate.title()


def extract_location(original_text: str, normalized_text: str, state: str | None) -> str | None:
    location_patterns = [
        r"([A-Za-z ]+?)\s+district",
        r"([A-Za-z ]+?)\s+mandal",
        r"([A-Za-z ]+?)\s+near",
        r"([ఀ-౿ ]+?)\s+జిల్లా",
        r"([ऀ-ॿ ]+?)\s+जिला",
    ]

    for pattern in location_patterns:
        match = re.search(pattern, original_text, flags=re.IGNORECASE)
        if match:
            candidate = _clean_location_candidate(match.group(1))
            if candidate:
                return candidate

    if state:
        for alias in STATE_PATTERNS[state]:
            if alias in normalized_text:
                before_state = normalized_text.split(alias, maxsplit=1)[0].strip(" ,.-")
                candidate = _clean_location_candidate(before_state)
                if candidate and len(candidate.split()) <= 2:
                    return candidate
    return None


def summarize_extracted_fields(fields: dict[str, Any]) -> str:
    parts: list[str] = []
    if fields.get("soilType"):
        parts.append(f"soil type as {SOIL_TYPES[fields['soilType']]['en']}")
    if fields.get("waterSource"):
        parts.append(f"water source as {WATER_SOURCES[fields['waterSource']]['en']}")
    if fields.get("season"):
        parts.append(f"season as {SEASONS[fields['season']]['en']}")
    if fields.get("farmArea"):
        parts.append(f"farm area around {fields['farmArea']} acres")
    if fields.get("location"):
        parts.append(f"location near {fields['location']}")
    if fields.get("state"):
        parts.append(f"state as {fields['state']}")
    return ", ".join(parts)


def localize_field_value(field: str, value: Any, language: str) -> str:
    if value is None:
        return ""
    if field == "soilType":
        return SOIL_TYPES[str(value)][language]
    if field == "waterSource":
        return WATER_SOURCES[str(value)][language]
    if field == "season":
        return SEASONS[str(value)][language]
    return str(value)


def summarize_localized_fields(fields: dict[str, Any], language: str) -> str:
    if language == "en":
        return summarize_extracted_fields(fields)

    parts: list[str] = []
    if fields.get("soilType"):
        parts.append(localize_field_value("soilType", fields["soilType"], language))
    if fields.get("waterSource"):
        parts.append(localize_field_value("waterSource", fields["waterSource"], language))
    if fields.get("season"):
        parts.append(localize_field_value("season", fields["season"], language))
    if fields.get("farmArea"):
        if language == "te":
            parts.append(f"{fields['farmArea']} ఎకరాలు")
        elif language == "hi":
            parts.append(f"{fields['farmArea']} एकड़")
    if fields.get("location"):
        parts.append(str(fields["location"]))
    if fields.get("state"):
        parts.append(str(fields["state"]))
    return " | ".join(parts)


def _observation_detected(normalized_text: str, config: dict[str, Any]) -> bool:
    if any(pattern in normalized_text for pattern in config.get("negative_patterns", [])):
        return False
    return any(pattern in normalized_text for pattern in config["patterns"])


def parse_voice_input(text: str, requested_language: str | None = None) -> dict[str, Any]:
    original_text = text.strip()
    normalized_text = normalize_text(original_text)
    detected_language = detect_language(original_text, requested_language)

    extracted_fields: dict[str, Any] = {
        "soilType": _match_value(normalized_text, FIELD_PATTERNS["soilType"]),
        "waterSource": _match_value(normalized_text, FIELD_PATTERNS["waterSource"]),
        "season": _match_value(normalized_text, FIELD_PATTERNS["season"]),
        "farmArea": extract_acres(normalized_text),
        "state": extract_state(normalized_text),
    }
    extracted_fields["location"] = extract_location(original_text, normalized_text, extracted_fields["state"])

    observations_english: list[str] = []
    observations_localized: list[str] = []
    for config in OBSERVATION_PATTERNS.values():
        if _observation_detected(normalized_text, config):
            observations_english.append(config["english"])
            observations_localized.append(config.get(detected_language, config["english"]))

    english_summary = summarize_extracted_fields(extracted_fields)
    if observations_english:
        prefix = f"The voice input indicates {english_summary}. " if english_summary else "The voice input indicates: "
        english_summary = prefix + " ".join(observations_english)
    elif english_summary:
        english_summary = f"The voice input indicates {english_summary}."
    else:
        english_summary = "The voice input was captured, but only general field notes could be inferred."

    localized_summary = " ".join(observations_localized).strip()
    if not localized_summary:
        localized_summary = summarize_localized_fields(extracted_fields, detected_language) or original_text

    confidence = 45
    confidence += 10 * len([value for value in extracted_fields.values() if value not in (None, "")])
    confidence += 8 * len(observations_english)

    assumptions: list[str] = []
    if not extracted_fields["state"]:
        assumptions.append("State was not clearly heard from the voice input.")
    if not extracted_fields["location"]:
        assumptions.append("District or location was not clearly heard from the voice input.")

    return {
        "originalText": original_text,
        "detectedLanguage": detected_language,
        "normalizedEnglish": english_summary,
        "localizedInterpretation": localized_summary,
        "extractedFields": extracted_fields,
        "observationsEnglish": observations_english,
        "observationsLocalized": observations_localized,
        "confidence": min(confidence, 97),
        "assumptions": assumptions,
    }


def merge_inputs(form_input: dict[str, Any], parsed_voice: dict[str, Any]) -> dict[str, Any]:
    merged = dict(form_input)
    for key, value in parsed_voice["extractedFields"].items():
        if merged.get(key) in (None, "", 0):
            merged[key] = value

    merged["voiceText"] = parsed_voice.get("originalText", "")
    merged["voiceTextEnglish"] = parsed_voice.get("normalizedEnglish", "")
    merged["voiceDetectedLanguage"] = parsed_voice.get("detectedLanguage", "en")
    merged["voiceObservations"] = parsed_voice.get("observationsEnglish", [])
    return merged


def localized_label_map(language: str) -> dict[str, str]:
    if language == "te":
        return {
            "englishSummary": "ఆంగ్ల సారాంశం",
            "localizedSummary": "స్థానిక భాష సారాంశం",
        }
    if language == "hi":
        return {
            "englishSummary": "अंग्रेज़ी सारांश",
            "localizedSummary": "स्थानीय भाषा सारांश",
        }
    return {
        "englishSummary": "English summary",
        "localizedSummary": "Localized summary",
    }


def default_state() -> str:
    return INDIAN_STATES[1]
