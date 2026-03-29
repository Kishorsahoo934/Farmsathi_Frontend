import { useState, useEffect, useRef } from 'react';
import { API_BASE_URL, OPENWEATHER_KEY } from '../config/constants';
import { useToast } from '../context/ToastContext';

const WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather';

export default function WeatherBar() {
  const { showToast } = useToast();
  const [weather, setWeather] = useState(null);
  const [hidden, setHidden] = useState(false);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current || !navigator.geolocation) return;
    fetched.current = true;
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res = await fetch(`${WEATHER_URL}?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_KEY}&units=metric`);
          if (!res.ok) throw new Error('Weather fetch failed');
          const data = await res.json();
          const current = {
            temp: Math.round(data.main.temp),
            humidity: data.main.humidity,
            wind: Math.round((data.wind?.speed || 0) * 3.6),
            precip: data.rain?.['1h'] || data.rain?.['3h'] || 0,
            desc: data.weather?.[0]?.description || 'Clear',
            city: data.name || 'Your location',
            country: data.sys?.country || '',
          };
          const alerts = [];
          if (current.humidity > 80) alerts.push('🌧️ High humidity — fungal disease risk.');
          if (current.temp > 35) alerts.push('🔥 Heatwave alert — water stress likely.');
          if (current.wind > 40) alerts.push('💨 High winds — crop lodging risk.');
          if (current.precip > 5) alerts.push('🌊 Rainfall warning — waterlogging risk.');
          if (!alerts.length) alerts.push('✅ Weather stable. No immediate risk.');
          alerts.forEach((a) => showToast(a, a.startsWith('✅') ? 'success' : 'info'));
          setWeather({ ...current, alerts });
        } catch {
          // Silently fail - weather is supplementary
        }
      },
      () => { /* location denied */ }
    );
  }, [showToast]);

  if (!weather || hidden) return null;

  return (
    <div className="weather-bar">
      <div className="weather-bar-close-row">
        <button className="weather-bar-close" onClick={() => setHidden(true)}>✕</button>
      </div>
      <div className="weather-bar-header">
        <strong>{weather.city}{weather.country ? `, ${weather.country}` : ''}</strong>
        <span className="weather-desc">{weather.desc}</span>
      </div>
      <div className="weather-bar-stats">
        <span>🌡️ {weather.temp}°C</span>
        <span>💧 {weather.humidity}%</span>
        <span>💨 {weather.wind} km/h</span>
        <span>🌧️ {weather.precip} mm</span>
      </div>
      <div className="weather-bar-alert">{weather.alerts[0]}</div>
    </div>
  );
}
