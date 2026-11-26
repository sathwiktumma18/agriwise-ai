import { startTransition, useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { analyzeFarm } from "@/lib/api";
import type { AnalysisResult, FarmInput, VoiceParseResult, WeatherData } from "@/lib/agentEngine";
import { Language } from "@/lib/translations";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { AgentAnimation } from "@/components/AgentAnimation";
import { ChartsSection } from "@/components/ChartsSection";
import { DocumentationModal } from "@/components/DocumentationModal";
import { HeaderBar } from "@/components/HeaderBar";
import { HeroSection } from "@/components/HeroSection";
import { InputPanel } from "@/components/InputPanel";
import { RecommendationDashboard } from "@/components/RecommendationDashboard";
import { ReportGenerator } from "@/components/ReportGenerator";
import { WeatherCard } from "@/components/WeatherCard";

const langSpeechCodes: Record<Language, string> = { en: "en-US", te: "te-IN", hi: "hi-IN" };

const Index = () => {
  const [lang, setLang] = useState<Language>("en");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [farmInput, setFarmInput] = useState<FarmInput | null>(null);
  const [voiceParse, setVoiceParse] = useState<VoiceParseResult | null>(null);
  const [docsOpen, setDocsOpen] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);

  const { speak, stop, isSpeaking } = useSpeechSynthesis();

  const scrollToInput = () => {
    inputRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = useCallback(
    async (input: FarmInput) => {
      setIsAnalyzing(true);
      setResult(null);

      try {
        const response = await analyzeFarm(input, lang);
        startTransition(() => {
          setFarmInput(response.input);
          setWeather(response.weather);
          setResult(response.result);
          setVoiceParse(response.voiceParse);
        });
        toast.success(`Recommendation ready: ${response.result.bestCrop.crop.name}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Analysis request failed.";
        toast.error(message);
      } finally {
        setIsAnalyzing(false);
      }
    },
    [lang],
  );

  const handleSpeak = useCallback(
    (text: string, languageOverride?: Language) => {
      const activeLanguage = languageOverride ?? lang;
      speak(text, langSpeechCodes[activeLanguage]);
    },
    [lang, speak],
  );

  return (
    <div className="min-h-screen bg-background">
      <HeaderBar lang={lang} setLang={setLang} isSpeaking={isSpeaking} onStopSpeaking={stop} />

      <HeroSection lang={lang} onGetStarted={scrollToInput} onViewDocs={() => setDocsOpen(true)} />

      <main className="container mx-auto space-y-12 px-4 py-12 md:px-6">
        <div ref={inputRef} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <InputPanel lang={lang} onSubmit={handleSubmit} isAnalyzing={isAnalyzing} />
          </div>
          <div>
            {weather && (
              <WeatherCard lang={lang} weather={weather} isReal={weather.isReal} city={weather.city} />
            )}
          </div>
        </div>

        {isAnalyzing && <AgentAnimation lang={lang} />}

        {result && farmInput && weather && (
          <>
            <RecommendationDashboard
              lang={lang}
              result={result}
              input={farmInput}
              weather={weather}
              voiceParse={voiceParse}
              onSpeak={handleSpeak}
            />

            <ChartsSection lang={lang} result={result} weather={weather} />

            <div className="flex justify-center">
              <ReportGenerator lang={lang} result={result} input={farmInput} weather={weather} voiceParse={voiceParse} />
            </div>
          </>
        )}
      </main>

      <DocumentationModal lang={lang} open={docsOpen} onOpenChange={setDocsOpen} />

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p className="font-display">AGENTIC AI POWERED FARM ADVISOR SYSTEM</p>
        <p className="mt-1">Powered by multilingual voice understanding, ML ranking, and live weather intelligence.</p>
      </footer>
    </div>
  );
};

export default Index;
