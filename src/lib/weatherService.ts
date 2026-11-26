import { WeatherData } from './agentEngine';

const API_KEY = '3f96c98fa28b9fc2fa898ec66edab296';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

interface OWMCurrentResponse {
  main: { temp: number; humidity: number };
  weather: { main: string; description: string }[];
  rain?: { '1h'?: number };
  name: string;
}

interface OWMForecastItem {
  dt_txt: string;
  main: { temp: number; humidity: number };
  rain?: { '3h'?: number };
}

interface OWMForecastResponse {
  list: OWMForecastItem[];
}

function mapCondition(owmMain: string): string {
  const map: Record<string, string> = {
    Clear: 'Clear',
    Clouds: 'Partly Cloudy',
    Rain: 'Light Rain',
    Drizzle: 'Light Rain',
    Thunderstorm: 'Thunderstorm',
    Snow: 'Snow',
    Mist: 'Cloudy',
    Haze: 'Cloudy',
    Fog: 'Cloudy',
    Smoke: 'Cloudy',
    Dust: 'Cloudy',
    Sand: 'Cloudy',
    Tornado: 'Thunderstorm',
  };
  return map[owmMain] || 'Partly Cloudy';
}

/** Picks one entry per day (closest to noon) from the 3-hour forecast list */
function buildDailyForecast(
  list: OWMForecastItem[]
): WeatherData['forecast'] {
  const dayMap = new Map<string, OWMForecastItem>();

  for (const item of list) {
    const date = item.dt_txt.split(' ')[0]; // "YYYY-MM-DD"
    const hour = parseInt(item.dt_txt.split(' ')[1].split(':')[0], 10);

    if (!dayMap.has(date)) {
      dayMap.set(date, item);
    } else {
      // Prefer entry closest to 12:00
      const existing = dayMap.get(date)!;
      const existingHour = parseInt(existing.dt_txt.split(' ')[1].split(':')[0], 10);
      if (Math.abs(hour - 12) < Math.abs(existingHour - 12)) {
        dayMap.set(date, item);
      }
    }
  }

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const entries = Array.from(dayMap.entries()).slice(0, 7);

  return entries.map(([dateStr, item]) => {
    const d = new Date(dateStr);
    return {
      day: dayLabels[d.getDay()],
      temp: Math.round(item.main.temp),
      rain: Math.round((item.rain?.['3h'] ?? 0) * 10) / 10,
      humidity: item.main.humidity,
    };
  });
}

/**
 * Fetches real-time weather from OpenWeatherMap.
 * Falls back to simulated data if the API call fails.
 */
export async function fetchRealWeather(
  location: string,
  state: string
): Promise<WeatherData & { isReal: boolean; city: string }> {
  // Build a query: prefer specific city, fall back to state capital
  const query = location && location.trim() !== ''
    ? `${location.trim()},IN`
    : `${state},IN`;

  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(
        `${BASE_URL}/weather?q=${encodeURIComponent(query)}&appid=${API_KEY}&units=metric`
      ),
      fetch(
        `${BASE_URL}/forecast?q=${encodeURIComponent(query)}&appid=${API_KEY}&units=metric`
      ),
    ]);

    if (!currentRes.ok || !forecastRes.ok) {
      throw new Error(`OpenWeatherMap API error: ${currentRes.status}`);
    }

    const current: OWMCurrentResponse = await currentRes.json();
    const forecast: OWMForecastResponse = await forecastRes.json();

    return {
      temperature: Math.round(current.main.temp),
      humidity: current.main.humidity,
      rainfall: Math.round((current.rain?.['1h'] ?? 0) * 10) / 10,
      condition: mapCondition(current.weather[0]?.main ?? 'Clear'),
      forecast: buildDailyForecast(forecast.list),
      isReal: true,
      city: current.name,
    };
  } catch (err) {
    console.warn('Weather API failed, using simulated data:', err);
    // Fallback: simulated data
    const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Clear'];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const baseTemp = 25 + Math.random() * 10;
    return {
      temperature: Math.round(baseTemp),
      humidity: Math.round(55 + Math.random() * 30),
      rainfall: Math.round(Math.random() * 15 * 10) / 10,
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      forecast: days.map((day) => ({
        day,
        temp: Math.round(baseTemp + (Math.random() * 6 - 3)),
        rain: Math.round(Math.random() * 20 * 10) / 10,
        humidity: Math.round(50 + Math.random() * 35),
      })),
      isReal: false,
      city: location || state,
    };
  }
}
