export interface FarmInput {
  soilType: string;
  waterSource: string;
  farmArea: number;
  season: string;
  location: string;
  state: string;
  voiceText?: string;
  voiceTextEnglish?: string;
  voiceDetectedLanguage?: string;
  voiceObservations?: string[];
}

export interface CropData {
  id: string;
  name: string;
  nameTE: string;
  nameHI: string;
  soilTypes: string[];
  waterNeed: "low" | "medium" | "high";
  tempRange: [number, number];
  seasons: string[];
  pestRisk: "low" | "medium" | "high";
  growthDays: number;
  yieldPerAcre: string;
  companionCrops: string[];
  icon: string;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  condition: string;
  forecast: { day: string; temp: number; rain: number; humidity: number }[];
  isReal?: boolean;
  city?: string;
  source?: string;
  provider?: string;
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

export interface VoiceParseResult {
  originalText: string;
  detectedLanguage: string;
  normalizedEnglish: string;
  localizedInterpretation: string;
  extractedFields: Partial<FarmInput>;
  observationsEnglish: string[];
  observationsLocalized: string[];
  confidence: number;
  assumptions: string[];
}

export interface AnalysisResult {
  bestCrop: CropScore;
  alternatives: CropScore[];
  mixedCropping: { crop1: CropData; crop2: CropData; reason: string };
  riskLevel: "low" | "medium" | "high";
  riskFactors: string[];
  sustainabilityScore: number;
  irrigationAdvice: string;
  bilingualResponse: {
    englishSummary: string;
    localizedSummary: string;
    englishActions: string[];
    localizedActions: string[];
    englishVoice: string;
    localizedVoice: string;
  };
  voiceInput: {
    originalText: string;
    normalizedEnglish: string;
    detectedLanguage: string;
    observations: string[];
    labels: {
      englishSummary: string;
      localizedSummary: string;
    };
  };
  metadata: {
    weatherSource: string;
    weatherProvider: string;
    modelMode: string;
  };
}

export interface AnalysisApiResponse {
  input: FarmInput;
  weather: WeatherData;
  result: AnalysisResult;
  voiceParse: VoiceParseResult;
}
