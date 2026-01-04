
export const getLiveWeather = async (lat: number, lng: number) => {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`
    );
    const data = await response.json();
    
    if (!data.current) return null;

    // Map WMO weather codes to our types
    const code = data.current.weather_code;
    let category = 'Cloud';
    let type = 'general';

    if (code >= 95) { category = 'Storm'; type = 'severe'; }
    else if (code >= 61) { category = 'Rain'; type = 'warning'; }
    else if (code >= 71) { category = 'Snow'; type = 'warning'; }
    else if (code === 0) { category = 'Heat'; type = 'general'; }

    return {
      temp: `${Math.round(data.current.temperature_2m)}°C`,
      humidity: `${data.current.relative_humidity_2m}%`,
      wind: `${Math.round(data.current.wind_speed_10m)} km/h`,
      category,
      type
    };
  } catch (error) {
    console.error("Weather fetch failed", error);
    return null;
  }
};
