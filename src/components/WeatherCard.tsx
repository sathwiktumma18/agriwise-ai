import { motion } from 'framer-motion';
import { Cloud, Droplets, Thermometer, CloudRain } from 'lucide-react';
import { Language, t } from '@/lib/translations';
import { WeatherData } from '@/lib/agentEngine';

interface WeatherCardProps {
  lang: Language;
  weather: WeatherData;
}

export function WeatherCard({ lang, weather }: WeatherCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-2xl p-6 overflow-hidden relative"
      style={{
        background: 'var(--gradient-weather)',
        boxShadow: '0 8px 32px -8px hsla(200, 65%, 45%, 0.3)',
      }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <Cloud className="w-full h-full" style={{ color: 'hsl(0, 0%, 100%)' }} />
      </div>

      <h3 className="text-lg font-bold font-display mb-4" style={{ color: 'hsl(0, 0%, 100%)' }}>
        {t('weather', lang)}
      </h3>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <Thermometer className="w-6 h-6 mx-auto mb-1" style={{ color: 'hsla(0, 0%, 100%, 0.9)' }} />
          <div className="text-2xl font-bold font-display" style={{ color: 'hsl(0, 0%, 100%)' }}>
            {weather.temperature}°C
          </div>
          <div className="text-xs" style={{ color: 'hsla(0, 0%, 100%, 0.7)' }}>
            {t('temperature', lang)}
          </div>
        </div>
        <div className="text-center">
          <Droplets className="w-6 h-6 mx-auto mb-1" style={{ color: 'hsla(0, 0%, 100%, 0.9)' }} />
          <div className="text-2xl font-bold font-display" style={{ color: 'hsl(0, 0%, 100%)' }}>
            {weather.humidity}%
          </div>
          <div className="text-xs" style={{ color: 'hsla(0, 0%, 100%, 0.7)' }}>
            {t('humidity', lang)}
          </div>
        </div>
        <div className="text-center">
          <CloudRain className="w-6 h-6 mx-auto mb-1" style={{ color: 'hsla(0, 0%, 100%, 0.9)' }} />
          <div className="text-2xl font-bold font-display" style={{ color: 'hsl(0, 0%, 100%)' }}>
            {weather.rainfall}mm
          </div>
          <div className="text-xs" style={{ color: 'hsla(0, 0%, 100%, 0.7)' }}>
            {t('rainfall', lang)}
          </div>
        </div>
      </div>

      <div className="mt-4 text-center text-sm font-medium" style={{ color: 'hsla(0, 0%, 100%, 0.85)' }}>
        {weather.condition}
      </div>
    </motion.div>
  );
}
