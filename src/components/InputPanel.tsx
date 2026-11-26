import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Mic, MicOff, MapPin, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Language, t } from "@/lib/translations";
import { indianStates, seasons, soilTypes, waterSources } from "@/lib/cropDatabase";
import { FarmInput, VoiceParseResult } from "@/lib/agentEngine";
import { parseVoiceInput } from "@/lib/api";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InputPanelProps {
  lang: Language;
  onSubmit: (input: FarmInput) => void;
  isAnalyzing: boolean;
}

const langCodes: Record<Language, string> = { en: "en-US", te: "te-IN", hi: "hi-IN" };

export function InputPanel({ lang, onSubmit, isAnalyzing }: InputPanelProps) {
  const [soilType, setSoilType] = useState("");
  const [waterSource, setWaterSource] = useState("");
  const [farmArea, setFarmArea] = useState("");
  const [season, setSeason] = useState("");
  const [location, setLocation] = useState("");
  const [state, setState] = useState("");
  const [voiceText, setVoiceText] = useState("");
  const [voiceParse, setVoiceParse] = useState<VoiceParseResult | null>(null);
  const [isParsingVoice, setIsParsingVoice] = useState(false);

  const { isListening, transcript, startListening, stopListening, error } = useSpeechRecognition();
  const hasVoiceInput = Boolean((voiceText || transcript).trim());
  const hasManualCoreInput = Boolean(soilType && waterSource && season);
  const canAnalyze = hasVoiceInput || hasManualCoreInput;

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const voiceHighlights = useMemo(() => {
    if (!voiceParse) {
      return [];
    }
    const fields = voiceParse.extractedFields;
    return [
      fields.soilType ? `${t("soilType", lang)}: ${fields.soilType}` : null,
      fields.waterSource ? `${t("waterSource", lang)}: ${fields.waterSource}` : null,
      fields.season ? `${t("season", lang)}: ${fields.season}` : null,
      fields.farmArea ? `${t("farmArea", lang)}: ${fields.farmArea}` : null,
      fields.location ? `${t("location", lang)}: ${fields.location}` : null,
      fields.state ? `${t("state", lang)}: ${fields.state}` : null,
    ].filter(Boolean) as string[];
  }, [lang, voiceParse]);

  const applyVoiceParse = (parsed: VoiceParseResult) => {
    setVoiceParse(parsed);
    setVoiceText(parsed.originalText);
    const extracted = parsed.extractedFields;
    if (extracted.soilType) {
      setSoilType((current) => current || extracted.soilType || "");
    }
    if (extracted.waterSource) {
      setWaterSource((current) => current || extracted.waterSource || "");
    }
    if (extracted.season) {
      setSeason((current) => current || extracted.season || "");
    }
    if (extracted.farmArea) {
      setFarmArea((current) => current || String(extracted.farmArea));
    }
    if (extracted.location) {
      setLocation((current) => current || extracted.location || "");
    }
    if (extracted.state) {
      setState((current) => current || extracted.state || "");
    }
  };

  const handleParsedTranscript = async (finalTranscript: string) => {
    setIsParsingVoice(true);
    setVoiceText(finalTranscript);
    try {
      const parsed = await parseVoiceInput(finalTranscript, lang);
      applyVoiceParse(parsed);
      toast.success("Voice input understood and applied to the form.");
    } catch (parseError) {
      const message = parseError instanceof Error ? parseError.message : "Voice parsing failed.";
      toast.error(message);
    } finally {
      setIsParsingVoice(false);
    }
  };

  const handleVoice = () => {
    if (isListening) {
      stopListening();
      return;
    }

    startListening(langCodes[lang], handleParsedTranscript);
  };

  const handleSubmit = () => {
    if (!canAnalyze) {
      toast.error("Use voice input or provide soil type, water source, and season before analysis.");
      return;
    }

    onSubmit({
      soilType,
      waterSource,
      farmArea: parseFloat(farmArea) || 5,
      season,
      location: location || "Hyderabad",
      state: state || "Telangana",
      voiceText,
      voiceTextEnglish: voiceParse?.normalizedEnglish || "",
      voiceDetectedLanguage: voiceParse?.detectedLanguage || lang,
      voiceObservations: voiceParse?.observationsEnglish || [],
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-card rounded-2xl p-6 md:p-8"
    >
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold font-display text-foreground">{t("farmInput", lang)}</h2>
        <button
          onClick={handleVoice}
          className={`rounded-xl p-3 transition-all duration-300 ${isListening ? "pulse-ring" : ""}`}
          style={{
            background: isListening ? "hsl(var(--destructive))" : "var(--gradient-primary)",
            color: "hsl(0, 0%, 100%)",
            boxShadow: isListening ? "0 0 20px hsla(0, 72%, 50%, 0.4)" : "var(--shadow-glow-primary)",
          }}
          type="button"
        >
          {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>
      </div>

      {(voiceText || transcript) && (
        <div className="mb-4 rounded-lg border border-primary/10 bg-primary/5 p-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-4 w-4 text-primary" />
            <div className="space-y-2">
              <div>"{transcript || voiceText}"</div>
              {isParsingVoice ? (
                <div className="flex items-center gap-2 text-primary">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("voiceUnderstanding", lang)}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {voiceParse && (
        <div className="mb-5 rounded-xl border border-border/60 bg-background/70 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-foreground">{t("voiceUnderstanding", lang)}</h3>
            <span className="text-xs font-medium text-primary">
              {t("voiceConfidence", lang)}: {voiceParse.confidence}%
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("englishSummary", lang)}
              </div>
              <p className="text-sm text-foreground">{voiceParse.normalizedEnglish}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("localizedSummary", lang)}
              </div>
              <p className="text-sm text-foreground">{voiceParse.localizedInterpretation}</p>
            </div>
          </div>
          {voiceHighlights.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {voiceHighlights.map((item) => (
                <span key={item} className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary">
                  {item}
                </span>
              ))}
            </div>
          )}
          {voiceParse.assumptions.length > 0 && (
            <div className="mt-3 text-xs text-muted-foreground">
              {voiceParse.assumptions.join(" ")}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">{t("soilType", lang)}</Label>
          <Select value={soilType} onValueChange={setSoilType}>
            <SelectTrigger className="border-border bg-background">
              <SelectValue placeholder={t("selectSoil", lang)} />
            </SelectTrigger>
            <SelectContent>
              {soilTypes.map((entry) => (
                <SelectItem key={entry.id} value={entry.id}>
                  {lang === "te" ? entry.labelTE : lang === "hi" ? entry.labelHI : entry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">{t("waterSource", lang)}</Label>
          <Select value={waterSource} onValueChange={setWaterSource}>
            <SelectTrigger className="border-border bg-background">
              <SelectValue placeholder={t("selectWater", lang)} />
            </SelectTrigger>
            <SelectContent>
              {waterSources.map((entry) => (
                <SelectItem key={entry.id} value={entry.id}>
                  {lang === "te" ? entry.labelTE : lang === "hi" ? entry.labelHI : entry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">{t("season", lang)}</Label>
          <Select value={season} onValueChange={setSeason}>
            <SelectTrigger className="border-border bg-background">
              <SelectValue placeholder={t("selectSeason", lang)} />
            </SelectTrigger>
            <SelectContent>
              {seasons.map((entry) => (
                <SelectItem key={entry.id} value={entry.id}>
                  {lang === "te" ? entry.labelTE : lang === "hi" ? entry.labelHI : entry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">{t("farmArea", lang)}</Label>
          <Input
            type="number"
            value={farmArea}
            onChange={(event) => setFarmArea(event.target.value)}
            placeholder={t("enterArea", lang)}
            className="border-border bg-background"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">{t("state", lang)}</Label>
          <Select value={state} onValueChange={setState}>
            <SelectTrigger className="border-border bg-background">
              <SelectValue placeholder={t("selectState", lang)} />
            </SelectTrigger>
            <SelectContent>
              {indianStates.map((entry) => (
                <SelectItem key={entry} value={entry}>
                  {entry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">{t("location", lang)}</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder={t("enterLocation", lang)}
              className="border-border bg-background pl-10"
            />
          </div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSubmit}
        disabled={isAnalyzing || !canAnalyze || isParsingVoice}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-4 text-lg font-semibold font-display transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          background: "var(--gradient-primary)",
          color: "hsl(0, 0%, 100%)",
          boxShadow: "var(--shadow-glow-primary)",
        }}
        type="button"
      >
        {isAnalyzing || isParsingVoice ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            {isParsingVoice ? t("voiceUnderstanding", lang) : t("analyzing", lang)}
          </>
        ) : (
          <>
            <Send className="h-5 w-5" />
            {t("analyze", lang)}
          </>
        )}
      </motion.button>
    </motion.div>
  );
}
