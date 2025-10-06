import { useState } from 'react'
import './App.css'

function App() {
  const [city, setCity] = useState('');
  const [result, setResult] = useState('');

  const getWeather = async () => {
    if (!city.trim()) {
      setResult("Please enter a city name.");
      return;
    }
    try {
      const apiKey = "379bcafa3b0849eba0771957253006";
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(city.trim())}&aqi=no`
      );
      if (!response.ok) {
        setResult(`Weather data for "${city.trim()}" not found.`);
        return;
      }
      const data = await response.json();
      if (data && data.location && data.current) {
        setResult(`The weather in ${data.location.name} is ${data.current.temp_c}°C`);
      } else {
        setResult(`Weather data for "${city.trim()}" not found.`);
      }
    } catch (error) {
      setResult("Error fetching weather data.");
    }
  };

  return (
    <div className="weather-container">
      <h1>Weather App</h1>
      <input
        type="text"
        placeholder="Enter city name"
        value={city}
        onChange={e => setCity(e.target.value)}
        className="weather-input"
      />
      <button onClick={getWeather} className="weather-btn">
        Click here to Get Weather
      </button>
      <div className="weather-result">{result}</div>
    </div>
  );
}

export default App;
