import { cropDatabase, CropData } from './cropDatabase';

export interface FarmInput {
  soilType: string;
  waterSource: string;
  farmArea: number;
  season: string;
  location: string;
  state: string;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  condition: string;
  forecast: { day: string; temp: number; rain: number; humidity: number }[];
}

export interface AgentResult {
  agentName: string;
  score: number;
  analysis: string;
  icon: string;
}

export interface CropScore {
  crop: CropData;
  totalScore: number;
  soilScore: number;
  waterScore: number;
  seasonScore: number;
  tempScore: number;
  pestScore: number;
  confidence: number;
  reasoning: string;
  agentResults: AgentResult[];
}

export interface AnalysisResult {
  bestCrop: CropScore;
  alternatives: CropScore[];
  mixedCropping: { crop1: CropData; crop2: CropData; reason: string };
  riskLevel: 'low' | 'medium' | 'high';
  riskFactors: string[];
  sustainabilityScore: number;
  irrigationAdvice: string;
}

function soilAgent(crop: CropData, input: FarmInput): AgentResult {
  const match = crop.soilTypes.includes(input.soilType);
  const score = match ? 90 + Math.random() * 10 : 20 + Math.random() * 30;
  return {
    agentName: 'Soil Analysis Agent',
    score,
    analysis: match
      ? `${crop.name} thrives in ${input.soilType} soil. Excellent compatibility.`
      : `${input.soilType} soil is not ideal for ${crop.name}. Consider soil amendment.`,
    icon: '🔬',
  };
}

function waterAgent(crop: CropData, input: FarmInput): AgentResult {
  const waterMap: Record<string, number> = {
    canal: 3, river: 3, borewell: 2, tank: 2, rain: 1,
  };
  const needMap: Record<string, number> = { low: 1, medium: 2, high: 3 };
  const available = waterMap[input.waterSource] || 1;
  const needed = needMap[crop.waterNeed];
  const score = available >= needed ? 85 + Math.random() * 15 : Math.max(20, 70 - (needed - available) * 25 + Math.random() * 10);
  return {
    agentName: 'Water Availability Agent',
    score,
    analysis: available >= needed
      ? `${input.waterSource} provides adequate water for ${crop.name} (${crop.waterNeed} requirement).`
      : `Water deficit detected. ${crop.name} needs ${crop.waterNeed} water but ${input.waterSource} may be insufficient.`,
    icon: '💧',
  };
}

function pestAgent(crop: CropData): AgentResult {
  const riskScores: Record<string, number> = { low: 90, medium: 65, high: 35 };
  const score = (riskScores[crop.pestRisk] || 50) + Math.random() * 10;
  return {
    agentName: 'Pest Risk Agent',
    score: Math.min(score, 100),
    analysis: `${crop.name} has ${crop.pestRisk} pest risk. ${crop.pestRisk === 'high' ? 'Integrated pest management strongly recommended.' : 'Standard monitoring advised.'}`,
    icon: '🐛',
  };
}

function weatherAgent(crop: CropData, weather: WeatherData): AgentResult {
  const [minT, maxT] = crop.tempRange;
  const inRange = weather.temperature >= minT && weather.temperature <= maxT;
  const score = inRange ? 85 + Math.random() * 15 : Math.max(15, 60 - Math.abs(weather.temperature - (minT + maxT) / 2) * 3);
  return {
    agentName: 'Weather Intelligence Agent',
    score: Math.min(score, 100),
    analysis: inRange
      ? `Current ${weather.temperature}°C is within optimal range (${minT}-${maxT}°C) for ${crop.name}.`
      : `Temperature ${weather.temperature}°C is outside optimal ${minT}-${maxT}°C for ${crop.name}.`,
    icon: '🌤️',
  };
}

function seasonAgent(crop: CropData, input: FarmInput): AgentResult {
  const match = crop.seasons.includes(input.season);
  const score = match ? 90 + Math.random() * 10 : 15 + Math.random() * 20;
  return {
    agentName: 'Seasonal Pattern Agent',
    score,
    analysis: match
      ? `${crop.name} is well-suited for ${input.season} season cultivation.`
      : `${crop.name} is not typically grown in ${input.season}. High failure risk.`,
    icon: '📅',
  };
}

export function runAnalysis(input: FarmInput, weather: WeatherData): AnalysisResult {
  const cropScores: CropScore[] = cropDatabase.map((crop) => {
    const soil = soilAgent(crop, input);
    const water = waterAgent(crop, input);
    const pest = pestAgent(crop);
    const wthr = weatherAgent(crop, weather);
    const season = seasonAgent(crop, input);

    const soilScore = soil.score * 0.30;
    const waterScore = water.score * 0.25;
    const seasonScore = season.score * 0.15;
    const tempScore = wthr.score * 0.15;
    const pestScore = pest.score * 0.15;
    const totalScore = soilScore + waterScore + seasonScore + tempScore + pestScore;

    const confidence = Math.min(98, Math.max(15, totalScore + (Math.random() * 5 - 2.5)));

    const reasons: string[] = [];
    if (soil.score > 70) reasons.push(`Soil compatibility is strong`);
    if (water.score > 70) reasons.push(`Water availability is adequate`);
    if (season.score > 70) reasons.push(`Season alignment is optimal`);
    if (wthr.score > 70) reasons.push(`Temperature conditions are favorable`);
    if (pest.score > 70) reasons.push(`Pest risk is manageable`);
    if (soil.score <= 70) reasons.push(`Soil type may not be ideal`);
    if (water.score <= 70) reasons.push(`Water availability could be a challenge`);

    return {
      crop,
      totalScore,
      soilScore: soil.score,
      waterScore: water.score,
      seasonScore: season.score,
      tempScore: wthr.score,
      pestScore: pest.score,
      confidence: Math.round(confidence),
      reasoning: reasons.join('. ') + '.',
      agentResults: [soil, water, pest, wthr, season],
    };
  });

  cropScores.sort((a, b) => b.totalScore - a.totalScore);

  const best = cropScores[0];
  const alternatives = cropScores.slice(1, 6);

  // Mixed cropping
  const companion = cropDatabase.find((c) =>
    best.crop.companionCrops.some((cc) => c.name.toLowerCase().includes(cc.toLowerCase())) &&
    c.id !== best.crop.id
  );
  const mixedCrop2 = companion || cropScores[1]?.crop;

  const riskFactors: string[] = [];
  if (best.soilScore < 60) riskFactors.push('Soil compatibility is below optimal');
  if (best.waterScore < 60) riskFactors.push('Water availability may be insufficient');
  if (best.pestScore < 50) riskFactors.push('High pest pressure expected');
  if (weather.temperature > 40 || weather.temperature < 5) riskFactors.push('Extreme temperature conditions');

  const riskLevel = riskFactors.length === 0 ? 'low' : riskFactors.length <= 2 ? 'medium' : 'high';
  const sustainabilityScore = Math.round(Math.min(95, best.totalScore * 0.9 + Math.random() * 10));

  const irrigationAdvice = best.crop.waterNeed === 'high'
    ? 'Drip or flood irrigation recommended. Ensure consistent water supply throughout growth cycle.'
    : best.crop.waterNeed === 'medium'
    ? 'Sprinkler irrigation recommended. Moderate watering schedule with weekly monitoring.'
    : 'Minimal irrigation needed. Rain-fed cultivation suitable with supplemental watering during dry spells.';

  return {
    bestCrop: best,
    alternatives,
    mixedCropping: {
      crop1: best.crop,
      crop2: mixedCrop2,
      reason: `${best.crop.name} and ${mixedCrop2.name} have complementary nutrient needs and different pest profiles, making them excellent mixed-cropping partners.`,
    },
    riskLevel,
    riskFactors,
    sustainabilityScore,
    irrigationAdvice,
  };
}

export function generateWeatherData(): WeatherData {
  const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Clear'];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const baseTemp = 25 + Math.random() * 10;

  return {
    temperature: Math.round(baseTemp),
    humidity: Math.round(55 + Math.random() * 30),
    rainfall: Math.round(Math.random() * 15 * 10) / 10,
    condition: conditions[Math.floor(Math.random() * conditions.length)],
    forecast: days.map((day) => ({
      day,
      temp: Math.round(baseTemp + (Math.random() * 6 - 3)),
      rain: Math.round(Math.random() * 20 * 10) / 10,
      humidity: Math.round(50 + Math.random() * 35),
    })),
  };
}
