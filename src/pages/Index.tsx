import { useState, useRef, useCallback } from 'react';
import { Language } from '@/lib/translations';
import { FarmInput, WeatherData, AnalysisResult, runAnalysis, generateWeatherData } from '@/lib/agentEngine';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { HeaderBar } from '@/components/HeaderBar';
import { HeroSection } from '@/components/HeroSection';
import { InputPanel } from '@/components/InputPanel';
import { WeatherCard } from '@/components/WeatherCard';
import { RecommendationDashboard } from '@/components/RecommendationDashboard';
import { ChartsSection } from '@/components/ChartsSection';
import { ReportGenerator } from '@/components/ReportGenerator';
import { DocumentationModal } from '@/components/DocumentationModal';
import { AgentAnimation } from '@/components/AgentAnimation';

const langSpeechCodes: Record<Language, string> = { en: 'en-US', te: 'te-IN', hi: 'hi-IN' };

const Index = () => {
  const [lang, setLang] = useState<Language>('en');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [farmInput, setFarmInput] = useState<FarmInput | null>(null);
  const [docsOpen, setDocsOpen] = useState(false);

  const inputRef = useRef<HTMLDivElement>(null);
  const { speak, stop, isSpeaking } = useSpeechSynthesis();

  const scrollToInput = () => {
    inputRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = useCallback((input: FarmInput) => {
    setFarmInput(input);
    setIsAnalyzing(true);
    setResult(null);

    const weatherData = generateWeatherData();
    setWeather(weatherData);

    // Simulate agent analysis delay
    setTimeout(() => {
      const analysisResult = runAnalysis(input, weatherData);
      setResult(analysisResult);
      setIsAnalyzing(false);
    }, 3000);
  }, []);

  const handleSpeak = useCallback((text: string) => {
    speak(text, langSpeechCodes[lang]);
  }, [speak, lang]);

  return (
    <div className="min-h-screen bg-background">
      <HeaderBar lang={lang} setLang={setLang} isSpeaking={isSpeaking} onStopSpeaking={stop} />

      <HeroSection lang={lang} onGetStarted={scrollToInput} onViewDocs={() => setDocsOpen(true)} />

      <main className="container mx-auto px-4 md:px-6 py-12 space-y-12">
        <div ref={inputRef} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <InputPanel lang={lang} onSubmit={handleSubmit} isAnalyzing={isAnalyzing} />
          </div>
          <div>
            {weather && <WeatherCard lang={lang} weather={weather} />}
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
              onSpeak={handleSpeak}
            />

            <ChartsSection lang={lang} result={result} weather={weather} />

            <div className="flex justify-center">
              <ReportGenerator lang={lang} result={result} input={farmInput} weather={weather} />
            </div>
          </>
        )}
      </main>

      <DocumentationModal lang={lang} open={docsOpen} onOpenChange={setDocsOpen} />

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p className="font-display">AgriVision AI — Smart Farm Advisory & Decision Intelligence System</p>
        <p className="mt-1">Powered by Multi-Agent AI Architecture • College Project</p>
      </footer>
    </div>
  );
};

export default Index;
