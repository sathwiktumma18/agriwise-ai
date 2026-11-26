import { motion } from "framer-motion";
import { Cloud, CloudRain, Droplets, MapPin, Thermometer, Wifi } from "lucide-react";
import { WeatherData } from "@/lib/agentEngine";
import { Language, t } from "@/lib/translations";

interface WeatherCardProps {
  lang: Language;
  weather: WeatherData;
  isReal?: boolean;
  city?: string;
}

export function WeatherCard({ lang, weather, isReal = false, city }: WeatherCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative overflow-hidden rounded-2xl p-6"
      style={{
        background: "var(--gradient-weather)",
        boxShadow: "0 8px 32px -8px hsla(200, 65%, 45%, 0.3)",
      }}
    >
      <div className="absolute right-0 top-0 h-32 w-32 opacity-10">
        <Cloud className="h-full w-full" style={{ color: "hsl(0, 0%, 100%)" }} />
      </div>

      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold font-display" style={{ color: "hsl(0, 0%, 100%)" }}>
            {t("weather", lang)}
          </h3>
          {city && (
            <div className="mt-0.5 flex items-center gap-1" style={{ color: "hsla(0, 0%, 100%, 0.7)" }}>
              <MapPin className="h-3 w-3" />
              <span className="text-xs">{city}</span>
            </div>
          )}
        </div>

        {isReal ? (
          <div
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
            style={{ background: "hsla(140, 70%, 40%, 0.4)", border: "1px solid hsla(140, 70%, 50%, 0.5)" }}
          >
            <span className="relative flex h-2 w-2">
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                style={{ background: "hsl(140, 80%, 55%)" }}
              />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: "hsl(140, 80%, 60%)" }} />
            </span>
            <Wifi className="h-3 w-3" style={{ color: "hsl(140, 80%, 70%)" }} />
            <span className="text-xs font-bold tracking-wider" style={{ color: "hsl(140, 80%, 75%)" }}>
              LIVE
            </span>
          </div>
        ) : (
          <div
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
            style={{ background: "hsla(0, 0%, 100%, 0.1)", border: "1px solid hsla(0, 0%, 100%, 0.2)" }}
          >
            <span className="text-xs font-medium" style={{ color: "hsla(0, 0%, 100%, 0.6)" }}>
              Fallback
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <Thermometer className="mx-auto mb-1 h-6 w-6" style={{ color: "hsla(0, 0%, 100%, 0.9)" }} />
          <div className="text-2xl font-bold font-display" style={{ color: "hsl(0, 0%, 100%)" }}>
            {weather.temperature}°C
          </div>
          <div className="text-xs" style={{ color: "hsla(0, 0%, 100%, 0.7)" }}>
            {t("temperature", lang)}
          </div>
        </div>
        <div className="text-center">
          <Droplets className="mx-auto mb-1 h-6 w-6" style={{ color: "hsla(0, 0%, 100%, 0.9)" }} />
          <div className="text-2xl font-bold font-display" style={{ color: "hsl(0, 0%, 100%)" }}>
            {weather.humidity}%
          </div>
          <div className="text-xs" style={{ color: "hsla(0, 0%, 100%, 0.7)" }}>
            {t("humidity", lang)}
          </div>
        </div>
        <div className="text-center">
          <CloudRain className="mx-auto mb-1 h-6 w-6" style={{ color: "hsla(0, 0%, 100%, 0.9)" }} />
          <div className="text-2xl font-bold font-display" style={{ color: "hsl(0, 0%, 100%)" }}>
            {weather.rainfall}mm
          </div>
          <div className="text-xs" style={{ color: "hsla(0, 0%, 100%, 0.7)" }}>
            {t("rainfall", lang)}
          </div>
        </div>
      </div>

      <div className="mt-4 text-center text-sm font-medium" style={{ color: "hsla(0, 0%, 100%, 0.85)" }}>
        {weather.condition}
      </div>
      {weather.provider ? (
        <div className="mt-2 text-center text-xs" style={{ color: "hsla(0, 0%, 100%, 0.68)" }}>
          {weather.provider}
        </div>
      ) : null}
    </motion.div>
  );
}
