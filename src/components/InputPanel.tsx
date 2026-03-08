import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, MapPin, Send } from 'lucide-react';
import { Language, t } from '@/lib/translations';
import { soilTypes, waterSources, seasons, indianStates } from '@/lib/cropDatabase';
import { FarmInput } from '@/lib/agentEngine';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface InputPanelProps {
  lang: Language;
  onSubmit: (input: FarmInput) => void;
  isAnalyzing: boolean;
}

const langCodes: Record<Language, string> = { en: 'en-US', te: 'te-IN', hi: 'hi-IN' };

export function InputPanel({ lang, onSubmit, isAnalyzing }: InputPanelProps) {
  const [soilType, setSoilType] = useState('');
  const [waterSource, setWaterSource] = useState('');
  const [farmArea, setFarmArea] = useState('');
  const [season, setSeason] = useState('');
  const [location, setLocation] = useState('');
  const [state, setState] = useState('');

  const { isListening, transcript, startListening, stopListening } = useSpeechRecognition();

  const handleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening(langCodes[lang]);
    }
  };

  const handleSubmit = () => {
    if (!soilType || !waterSource || !season) return;
    onSubmit({
      soilType,
      waterSource,
      farmArea: parseFloat(farmArea) || 5,
      season,
      location: location || 'Unknown',
      state: state || 'Telangana',
    });
  };

  const getLabel = (items: { id: string; label: string; labelTE?: string; labelHI?: string }[], id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return '';
    if (lang === 'te') return item.labelTE || item.label;
    if (lang === 'hi') return item.labelHI || item.label;
    return item.label;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-card rounded-2xl p-6 md:p-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold font-display text-foreground">{t('farmInput', lang)}</h2>
        <button
          onClick={handleVoice}
          className={`p-3 rounded-xl transition-all duration-300 ${isListening ? 'pulse-ring' : ''}`}
          style={{
            background: isListening ? 'hsl(var(--destructive))' : 'var(--gradient-primary)',
            color: 'hsl(0, 0%, 100%)',
            boxShadow: isListening ? '0 0 20px hsla(0, 72%, 50%, 0.4)' : 'var(--shadow-glow-primary)',
          }}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
      </div>

      {transcript && (
        <div className="mb-4 p-3 rounded-lg bg-primary/5 border border-primary/10 text-sm text-muted-foreground">
          🎤 "{transcript}"
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">{t('soilType', lang)}</Label>
          <Select value={soilType} onValueChange={setSoilType}>
            <SelectTrigger className="bg-background border-border">
              <SelectValue placeholder={t('selectSoil', lang)} />
            </SelectTrigger>
            <SelectContent>
              {soilTypes.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {lang === 'te' ? s.labelTE : lang === 'hi' ? s.labelHI : s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">{t('waterSource', lang)}</Label>
          <Select value={waterSource} onValueChange={setWaterSource}>
            <SelectTrigger className="bg-background border-border">
              <SelectValue placeholder={t('selectWater', lang)} />
            </SelectTrigger>
            <SelectContent>
              {waterSources.map((w) => (
                <SelectItem key={w.id} value={w.id}>
                  {lang === 'te' ? w.labelTE : lang === 'hi' ? w.labelHI : w.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">{t('season', lang)}</Label>
          <Select value={season} onValueChange={setSeason}>
            <SelectTrigger className="bg-background border-border">
              <SelectValue placeholder={t('selectSeason', lang)} />
            </SelectTrigger>
            <SelectContent>
              {seasons.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {lang === 'te' ? s.labelTE : lang === 'hi' ? s.labelHI : s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">{t('farmArea', lang)}</Label>
          <Input
            type="number"
            value={farmArea}
            onChange={(e) => setFarmArea(e.target.value)}
            placeholder={t('enterArea', lang)}
            className="bg-background border-border"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">{t('state', lang)}</Label>
          <Select value={state} onValueChange={setState}>
            <SelectTrigger className="bg-background border-border">
              <SelectValue placeholder={t('selectState', lang)} />
            </SelectTrigger>
            <SelectContent>
              {indianStates.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">{t('location', lang)}</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t('enterLocation', lang)}
              className="pl-10 bg-background border-border"
            />
          </div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSubmit}
        disabled={isAnalyzing || !soilType || !waterSource || !season}
        className="mt-6 w-full py-4 rounded-xl text-lg font-semibold font-display transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{
          background: 'var(--gradient-primary)',
          color: 'hsl(0, 0%, 100%)',
          boxShadow: 'var(--shadow-glow-primary)',
        }}
      >
        {isAnalyzing ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-t-transparent rounded-full"
              style={{ borderColor: 'hsla(0,0%,100%,0.5)', borderTopColor: 'transparent' }}
            />
            {t('analyzing', lang)}
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            {t('analyze', lang)}
          </>
        )}
      </motion.button>
    </motion.div>
  );
}
