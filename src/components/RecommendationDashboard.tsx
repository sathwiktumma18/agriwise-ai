import { motion } from 'framer-motion';
import { Trophy, Volume2, Shield, Lightbulb, TrendingUp, Droplets } from 'lucide-react';
import { Language, t } from '@/lib/translations';
import { AnalysisResult, FarmInput, WeatherData } from '@/lib/agentEngine';

interface RecommendationDashboardProps {
  lang: Language;
  result: AnalysisResult;
  input: FarmInput;
  weather: WeatherData;
  onSpeak: (text: string) => void;
}

export function RecommendationDashboard({ lang, result, input, weather, onSpeak }: RecommendationDashboardProps) {
  const { bestCrop, alternatives, mixedCropping, riskLevel, riskFactors, sustainabilityScore, irrigationAdvice } = result;
  const cropName = lang === 'te' ? bestCrop.crop.nameTE : lang === 'hi' ? bestCrop.crop.nameHI : bestCrop.crop.name;

  const riskColors = {
    low: { bg: 'hsla(145, 58%, 38%, 0.1)', text: 'hsl(145, 58%, 32%)', border: 'hsla(145, 58%, 38%, 0.3)' },
    medium: { bg: 'hsla(38, 92%, 50%, 0.1)', text: 'hsl(38, 72%, 45%)', border: 'hsla(38, 92%, 50%, 0.3)' },
    high: { bg: 'hsla(0, 72%, 50%, 0.1)', text: 'hsl(0, 72%, 45%)', border: 'hsla(0, 72%, 50%, 0.3)' },
  };

  const speakText = `${t('bestCrop', lang)}: ${cropName}. ${t('confidence', lang)}: ${bestCrop.confidence}%. ${bestCrop.reasoning}`;

  return (
    <div className="space-y-6">
      {/* Best Crop Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl p-6 md:p-8 relative overflow-hidden"
        style={{
          background: 'var(--gradient-primary)',
          boxShadow: 'var(--shadow-glow-primary)',
        }}
      >
        <div className="absolute top-4 right-4">
          <button
            onClick={() => onSpeak(speakText)}
            className="p-2 rounded-lg transition-colors"
            style={{ background: 'hsla(0, 0%, 100%, 0.15)' }}
          >
            <Volume2 className="w-5 h-5" style={{ color: 'hsl(0, 0%, 100%)' }} />
          </button>
        </div>

        <div className="flex items-start gap-4">
          <div className="text-5xl">{bestCrop.crop.icon}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-5 h-5" style={{ color: 'hsl(42, 90%, 70%)' }} />
              <span className="text-sm font-medium" style={{ color: 'hsla(0, 0%, 100%, 0.8)' }}>
                {t('bestCrop', lang)}
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold font-display mb-2" style={{ color: 'hsl(0, 0%, 100%)' }}>
              {cropName}
            </h3>
            <div className="flex items-center gap-4 mb-3">
              <div className="px-3 py-1 rounded-full text-sm font-bold"
                style={{ background: 'hsla(0, 0%, 100%, 0.2)', color: 'hsl(0, 0%, 100%)' }}>
                {t('confidence', lang)}: {bestCrop.confidence}%
              </div>
              <div className="px-3 py-1 rounded-full text-sm font-bold"
                style={{ background: 'hsla(0, 0%, 100%, 0.2)', color: 'hsl(0, 0%, 100%)' }}>
                {t('score', lang)}: {Math.round(bestCrop.totalScore)}
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'hsla(0, 0%, 100%, 0.85)' }}>
              {bestCrop.reasoning}
            </p>
          </div>
        </div>

        {/* Agent breakdown */}
        <div className="mt-6 grid grid-cols-5 gap-2">
          {bestCrop.agentResults.map((agent) => (
            <div key={agent.agentName} className="text-center p-2 rounded-lg" style={{ background: 'hsla(0, 0%, 100%, 0.1)' }}>
              <div className="text-lg mb-1">{agent.icon}</div>
              <div className="text-xs font-bold" style={{ color: 'hsl(0, 0%, 100%)' }}>
                {Math.round(agent.score)}%
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Alternatives */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl p-6"
      >
        <h3 className="text-lg font-bold font-display text-foreground mb-4">
          {t('alternatives', lang)}
        </h3>
        <div className="space-y-3">
          {alternatives.map((alt, i) => {
            const altName = lang === 'te' ? alt.crop.nameTE : lang === 'hi' ? alt.crop.nameHI : alt.crop.name;
            return (
              <motion.div
                key={alt.crop.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-background/50"
              >
                <span className="text-2xl">{alt.crop.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-foreground">{altName}</div>
                  <div className="w-full bg-muted rounded-full h-2 mt-1">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${alt.confidence}%` }}
                      transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                      className="h-2 rounded-full"
                      style={{ background: 'var(--gradient-primary)' }}
                    />
                  </div>
                </div>
                <span className="text-sm font-bold text-primary">{alt.confidence}%</span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Mixed Cropping */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card rounded-2xl p-6"
      >
        <h3 className="text-lg font-bold font-display text-foreground mb-4">
          {t('mixedCropping', lang)}
        </h3>
        <div className="flex items-center gap-4 justify-center mb-4">
          <div className="text-center p-4 rounded-xl bg-primary/5 border border-primary/10 flex-1">
            <div className="text-3xl mb-2">{mixedCropping.crop1.icon}</div>
            <div className="font-semibold text-foreground text-sm">
              {lang === 'te' ? mixedCropping.crop1.nameTE : lang === 'hi' ? mixedCropping.crop1.nameHI : mixedCropping.crop1.name}
            </div>
          </div>
          <div className="text-2xl font-bold text-primary">+</div>
          <div className="text-center p-4 rounded-xl bg-accent/5 border border-accent/10 flex-1">
            <div className="text-3xl mb-2">{mixedCropping.crop2.icon}</div>
            <div className="font-semibold text-foreground text-sm">
              {lang === 'te' ? mixedCropping.crop2.nameTE : lang === 'hi' ? mixedCropping.crop2.nameHI : mixedCropping.crop2.name}
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground text-center">{mixedCropping.reason}</p>
      </motion.div>

      {/* Bottom row: Risk + Sustainability + Irrigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl p-5"
          style={{
            background: riskColors[riskLevel].bg,
            border: `1px solid ${riskColors[riskLevel].border}`,
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5" style={{ color: riskColors[riskLevel].text }} />
            <h4 className="font-bold font-display text-sm text-foreground">{t('riskAssessment', lang)}</h4>
          </div>
          <div className="text-2xl font-bold font-display mb-2" style={{ color: riskColors[riskLevel].text }}>
            {t(riskLevel, lang).toUpperCase()}
          </div>
          {riskFactors.length > 0 && (
            <ul className="space-y-1">
              {riskFactors.map((f, i) => (
                <li key={i} className="text-xs text-muted-foreground">• {f}</li>
              ))}
            </ul>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h4 className="font-bold font-display text-sm text-foreground">{t('sustainabilityScore', lang)}</h4>
          </div>
          <div className="text-3xl font-bold font-display text-primary mb-2">{sustainabilityScore}%</div>
          <div className="w-full bg-muted rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${sustainabilityScore}%` }}
              transition={{ duration: 1.5, delay: 0.8 }}
              className="h-3 rounded-full"
              style={{ background: 'var(--gradient-primary)' }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Droplets className="w-5 h-5 text-water" />
            <h4 className="font-bold font-display text-sm text-foreground">{t('irrigationAdvice', lang)}</h4>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{irrigationAdvice}</p>
        </motion.div>
      </div>
    </div>
  );
}
