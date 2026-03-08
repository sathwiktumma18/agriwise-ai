import { motion } from 'framer-motion';
import { Language, t } from '@/lib/translations';
import { AnalysisResult, WeatherData } from '@/lib/agentEngine';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

interface ChartsSectionProps {
  lang: Language;
  result: AnalysisResult;
  weather: WeatherData;
}

export function ChartsSection({ lang, result, weather }: ChartsSectionProps) {
  const cropData = [result.bestCrop, ...result.alternatives].map((cs) => ({
    name: lang === 'te' ? cs.crop.nameTE : lang === 'hi' ? cs.crop.nameHI : cs.crop.name,
    score: Math.round(cs.totalScore),
    confidence: cs.confidence,
  }));

  const forecastData = weather.forecast.map((f) => ({
    day: f.day,
    temp: f.temp,
    rain: f.rain,
    humidity: f.humidity,
  }));

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-card rounded-2xl p-6"
      >
        <h3 className="text-lg font-bold font-display text-foreground mb-4">{t('cropScores', lang)}</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={cropData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(140, 12%, 85%)" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(150, 10%, 40%)' }} angle={-20} textAnchor="end" height={60} />
            <YAxis tick={{ fontSize: 11, fill: 'hsl(150, 10%, 40%)' }} />
            <Tooltip
              contentStyle={{
                background: 'hsl(140, 15%, 97%)',
                border: '1px solid hsl(140, 12%, 85%)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="confidence" fill="hsl(145, 58%, 32%)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-card rounded-2xl p-6"
      >
        <h3 className="text-lg font-bold font-display text-foreground mb-4">{t('weatherTrend', lang)}</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={forecastData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(140, 12%, 85%)" />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'hsl(150, 10%, 40%)' }} />
            <YAxis tick={{ fontSize: 12, fill: 'hsl(150, 10%, 40%)' }} />
            <Tooltip
              contentStyle={{
                background: 'hsl(140, 15%, 97%)',
                border: '1px solid hsl(140, 12%, 85%)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="temp" stroke="hsl(28, 85%, 52%)" strokeWidth={2} name="Temp (°C)" dot={{ fill: 'hsl(28, 85%, 52%)' }} />
            <Line type="monotone" dataKey="rain" stroke="hsl(200, 65%, 55%)" strokeWidth={2} name="Rain (mm)" dot={{ fill: 'hsl(200, 65%, 55%)' }} />
            <Line type="monotone" dataKey="humidity" stroke="hsl(145, 58%, 32%)" strokeWidth={2} name="Humidity (%)" dot={{ fill: 'hsl(145, 58%, 32%)' }} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
