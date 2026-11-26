import { motion } from "framer-motion";
import { Droplets, Shield, Sparkles, TrendingUp, Trophy, Volume2 } from "lucide-react";
import { AnalysisResult, FarmInput, VoiceParseResult, WeatherData } from "@/lib/agentEngine";
import { Language, t } from "@/lib/translations";

interface RecommendationDashboardProps {
  lang: Language;
  result: AnalysisResult;
  input: FarmInput;
  weather: WeatherData;
  voiceParse: VoiceParseResult | null;
  onSpeak: (text: string, languageOverride?: Language) => void;
}

export function RecommendationDashboard({
  lang,
  result,
  input,
  weather,
  voiceParse,
  onSpeak,
}: RecommendationDashboardProps) {
  const { bestCrop, alternatives, mixedCropping, riskLevel, riskFactors, sustainabilityScore, irrigationAdvice, bilingualResponse } =
    result;
  const cropName = lang === "te" ? bestCrop.crop.nameTE : lang === "hi" ? bestCrop.crop.nameHI : bestCrop.crop.name;

  const riskColors = {
    low: { bg: "hsla(145, 58%, 38%, 0.1)", text: "hsl(145, 58%, 32%)", border: "hsla(145, 58%, 38%, 0.3)" },
    medium: { bg: "hsla(38, 92%, 50%, 0.1)", text: "hsl(38, 72%, 45%)", border: "hsla(38, 92%, 50%, 0.3)" },
    high: { bg: "hsla(0, 72%, 50%, 0.1)", text: "hsl(0, 72%, 45%)", border: "hsla(0, 72%, 50%, 0.3)" },
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-2xl p-6 md:p-8"
        style={{
          background: "var(--gradient-primary)",
          boxShadow: "var(--shadow-glow-primary)",
        }}
      >
        <div className="absolute right-4 top-4 flex gap-2">
          <button
            onClick={() => onSpeak(bilingualResponse.englishVoice, "en")}
            className="rounded-lg p-2 transition-colors"
            style={{ background: "hsla(0, 0%, 100%, 0.15)" }}
            type="button"
          >
            <Volume2 className="h-5 w-5" style={{ color: "hsl(0, 0%, 100%)" }} />
          </button>
          <button
            onClick={() => onSpeak(bilingualResponse.localizedVoice, lang)}
            className="rounded-lg p-2 transition-colors"
            style={{ background: "hsla(0, 0%, 100%, 0.15)" }}
            type="button"
          >
            <Sparkles className="h-5 w-5" style={{ color: "hsl(0, 0%, 100%)" }} />
          </button>
        </div>

        <div className="flex items-start gap-4">
          <div className="text-5xl">{bestCrop.crop.icon}</div>
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <Trophy className="h-5 w-5" style={{ color: "hsl(42, 90%, 70%)" }} />
              <span className="text-sm font-medium" style={{ color: "hsla(0, 0%, 100%, 0.8)" }}>
                {t("bestCrop", lang)}
              </span>
            </div>
            <h3 className="mb-2 text-2xl font-bold font-display md:text-3xl" style={{ color: "hsl(0, 0%, 100%)" }}>
              {cropName}
            </h3>
            <div className="mb-3 flex items-center gap-4">
              <div className="rounded-full px-3 py-1 text-sm font-bold" style={{ background: "hsla(0, 0%, 100%, 0.2)", color: "hsl(0, 0%, 100%)" }}>
                {t("confidence", lang)}: {bestCrop.confidence}%
              </div>
              <div className="rounded-full px-3 py-1 text-sm font-bold" style={{ background: "hsla(0, 0%, 100%, 0.2)", color: "hsl(0, 0%, 100%)" }}>
                {t("score", lang)}: {Math.round(bestCrop.totalScore)}
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "hsla(0, 0%, 100%, 0.85)" }}>
              {bestCrop.reasoning}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-5 gap-2">
          {bestCrop.agentResults.map((agent) => (
            <div key={agent.agentName} className="rounded-lg p-2 text-center" style={{ background: "hsla(0, 0%, 100%, 0.1)" }}>
              <div className="mb-1 text-lg">{agent.icon}</div>
              <div className="text-xs font-bold" style={{ color: "hsl(0, 0%, 100%)" }}>
                {Math.round(agent.score)}%
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold font-display text-foreground">{t("voiceUnderstanding", lang)}</h3>
          </div>
          <div className="space-y-3">
            <div className="rounded-xl bg-background/60 p-4">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("englishSummary", lang)}</div>
              <p className="text-sm text-foreground">{voiceParse?.normalizedEnglish || result.voiceInput.normalizedEnglish || "No voice note captured."}</p>
            </div>
            <div className="rounded-xl bg-background/60 p-4">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("localizedSummary", lang)}</div>
              <p className="text-sm text-foreground">{voiceParse?.localizedInterpretation || result.voiceInput.originalText || "No localized voice summary available."}</p>
            </div>
            <div className="text-xs text-muted-foreground">
              {t("voiceApplied", lang)}. {t("modelMode", lang)}: {result.metadata.modelMode}.
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="mb-4 flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold font-display text-foreground">{t("recommendation", lang)}</h3>
          </div>
          <div className="space-y-3">
            <div className="rounded-xl bg-background/60 p-4">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("englishSummary", lang)}</div>
              <p className="text-sm text-foreground">{bilingualResponse.englishSummary}</p>
            </div>
            <div className="rounded-xl bg-background/60 p-4">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("localizedSummary", lang)}</div>
              <p className="text-sm text-foreground">{bilingualResponse.localizedSummary}</p>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-2xl p-6"
      >
        <h3 className="mb-4 text-lg font-bold font-display text-foreground">{t("alternatives", lang)}</h3>
        <div className="space-y-3">
          {alternatives.map((alt, index) => {
            const altName = lang === "te" ? alt.crop.nameTE : lang === "hi" ? alt.crop.nameHI : alt.crop.name;
            return (
              <motion.div
                key={alt.crop.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + index * 0.08 }}
                className="flex items-center gap-3 rounded-xl bg-background/50 p-3"
              >
                <span className="text-2xl">{alt.crop.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-foreground">{altName}</div>
                  <div className="mt-1 h-2 w-full rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${alt.confidence}%` }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                      className="h-2 rounded-full"
                      style={{ background: "var(--gradient-primary)" }}
                    />
                  </div>
                </div>
                <span className="text-sm font-bold text-primary">{alt.confidence}%</span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card rounded-2xl p-6"
      >
        <h3 className="mb-4 text-lg font-bold font-display text-foreground">{t("mixedCropping", lang)}</h3>
        <div className="mb-4 flex items-center justify-center gap-4">
          <div className="flex-1 rounded-xl border border-primary/10 bg-primary/5 p-4 text-center">
            <div className="mb-2 text-3xl">{mixedCropping.crop1.icon}</div>
            <div className="text-sm font-semibold text-foreground">
              {lang === "te" ? mixedCropping.crop1.nameTE : lang === "hi" ? mixedCropping.crop1.nameHI : mixedCropping.crop1.name}
            </div>
          </div>
          <div className="text-2xl font-bold text-primary">+</div>
          <div className="flex-1 rounded-xl border border-accent/10 bg-accent/5 p-4 text-center">
            <div className="mb-2 text-3xl">{mixedCropping.crop2.icon}</div>
            <div className="text-sm font-semibold text-foreground">
              {lang === "te" ? mixedCropping.crop2.nameTE : lang === "hi" ? mixedCropping.crop2.nameHI : mixedCropping.crop2.name}
            </div>
          </div>
        </div>
        <p className="text-center text-sm text-muted-foreground">{mixedCropping.reason}</p>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="rounded-2xl p-5"
          style={{
            background: riskColors[riskLevel].bg,
            border: `1px solid ${riskColors[riskLevel].border}`,
          }}
        >
          <div className="mb-3 flex items-center gap-2">
            <Shield className="h-5 w-5" style={{ color: riskColors[riskLevel].text }} />
            <h4 className="text-sm font-bold font-display text-foreground">{t("riskAssessment", lang)}</h4>
          </div>
          <div className="mb-2 text-2xl font-bold font-display" style={{ color: riskColors[riskLevel].text }}>
            {t(riskLevel, lang).toUpperCase()}
          </div>
          {riskFactors.length > 0 && (
            <ul className="space-y-1">
              {riskFactors.map((factor) => (
                <li key={factor} className="text-xs text-muted-foreground">
                  • {factor}
                </li>
              ))}
            </ul>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="glass-card rounded-2xl p-5"
        >
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h4 className="text-sm font-bold font-display text-foreground">{t("sustainabilityScore", lang)}</h4>
          </div>
          <div className="mb-2 text-3xl font-bold font-display text-primary">{sustainabilityScore}%</div>
          <div className="h-3 w-full rounded-full bg-muted">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${sustainabilityScore}%` }}
              transition={{ duration: 1.2, delay: 0.75 }}
              className="h-3 rounded-full"
              style={{ background: "var(--gradient-primary)" }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="glass-card rounded-2xl p-5"
        >
          <div className="mb-3 flex items-center gap-2">
            <Droplets className="h-5 w-5 text-water" />
            <h4 className="text-sm font-bold font-display text-foreground">{t("irrigationAdvice", lang)}</h4>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{irrigationAdvice}</p>
          <div className="mt-3 text-xs text-muted-foreground">
            {t("liveWeather", lang)}: {weather.city || input.location} • {weather.provider || weather.source || "local"}.
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="glass-card rounded-2xl p-6">
          <h3 className="mb-3 text-lg font-bold font-display text-foreground">{t("englishSummary", lang)}</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {bilingualResponse.englishActions.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
        <div className="glass-card rounded-2xl p-6">
          <h3 className="mb-3 text-lg font-bold font-display text-foreground">{t("localizedSummary", lang)}</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {bilingualResponse.localizedActions.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
