'use strict';

require('dotenv').config();
const express = require('express');
const axios = require('axios');

const PORT = '9300';
const HOST = '0.0.0.0';
const API_KEY = process.env.OPEN_WEATHER_API_KEY || 'api_key_required';
const API_LOCATION_ID = process.env.OPEN_WEATHER_LOCATION_ID || 'location_id_required';
const API_ENDPOINT = `https://api.openweathermap.org/data/2.5/weather`;
const API_STRING = `${API_ENDPOINT}?id=${API_LOCATION_ID}&units=metric&appid=${API_KEY}`;
const app = express();


// Fetches data from OpenWeather API
async function fetchWeatherData() {
  const response = await axios.get(API_STRING);
  console.log(response);
  return response.data;
}


// Formats a single sensor reading
function formatOpenMetricsSensor(sensor) {
  let output = '';
  output += `#HELP ${sensor.name} ${sensor.description}\n`;
  output += `#TYPE ${sensor.name} ${sensor.type}\n`;
  output += `${sensor.name}{location="${sensor.source}"} ${sensor.value}\n`;
  return output;
};


// Formats OpenWeather data to Open Metrics for Prometheus
function formatOpenMetrics(data) {
  let output = '';
  let sensor = {};

  // Winddirection
  sensor = {
    name: 'sensor_wind_direction',
    description: 'Winddirection',
    type: 'guage',
    source: 'OpenWeather',
    value: data.wind.deg
  };
  output += formatOpenMetricsSensor(sensor);

  // Windspeed
  sensor = {
    name: 'sensor_wind_speed',
    description: 'Windspeed',
    type: 'guage',
    source: 'OpenWeather',
    value: data.wind.speed
  };
  output += formatOpenMetricsSensor(sensor);
  
   // WindGust
   sensor = {
    name: 'sensor_wind_gust',
    description: 'Windgust',
    type: 'guage',
    source: 'OpenWeather',
    value: data.wind.gust
  };
  output += formatOpenMetricsSensor(sensor);


  // Air Tempearture
  sensor = {
    name: 'sensor_air_temperature',
    description: 'Air temperature in degrees Celsius (˚C)',
    type: 'guage',
    source: 'OpenWeather',
    value: data.main.temp
  };
  output += formatOpenMetricsSensor(sensor);
  
  // Air Relative humidity
  sensor = {
    name: 'sensor_air_relative_humidity',
    description: 'Air relative humidity in percentage (%H)',
    type: 'guage',
    source: 'OpenWeather',
    value: data.main.humidity
  };
  output += formatOpenMetricsSensor(sensor);
  
  // Air Pressure
  sensor = {
    name: 'sensor_air_pressure',
    description: 'Air pressure in hectopascals (hPa)',
    type: 'guage',
    source: 'OpenWeather',
    value: data.main.pressure
  };
  output += formatOpenMetricsSensor(sensor);
  
  return output;
}

//convert wind degrees to direction
function degToCompass(num) { 
  while( num < 0 ) num += 360 ;
  while( num >= 360 ) num -= 360 ; 
  let val= Math.round( (num -11.25 ) / 22.5 ) ;
  let arr=["N","NNE","NE","ENE","E","ESE", "SE", 
        "SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"] ;
  return arr[ Math.abs(val) ] ;
}


// Converts readings from OpenWeather API to a sipler JSON Output
function formatJsonMetrics(data) {
  const sensorData = {
    air_temperature: data.main.temp,
    air_relative_humidity: data.main.humidity,
    air_pressure: data.main.pressure,
    wind_direction: degToCompass(data.wind.deg),
    wind_speed: data.wind.speed,
    wind_gust:data.wind.gust
  };
  return sensorData;
}


// Handles requests to home page
app.get('/', (req, res, next) => {
  res.send('OpenWeatherMap.org Exporter for Prometheus');
});


// Returns Open Metrics formatted data for Prometheus
app.get('/metrics', async (req, res, next) => {
  try {
    const data = await fetchWeatherData();
    const metrics = formatOpenMetrics(data)
    res.status(200).send(metrics);
  } catch (err) {
    return next(err);
  }
});


// Returns JSON formated data
app.get('/sensors', async (req, res, next) => {
  try {
    const data = await fetchWeatherData();
    const metrics = formatJsonMetrics(data)
    res.status(200).send(metrics);
  } catch (err) {
    return next(err);
}});


// Handles 404 errors
app.use((req, res, next) => {
  res.status(404).send('404 Not found');
})


// Handles thrown errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('500 Server error');
})


// Start listening for requests
app.listen(PORT, HOST);
console.log(`OpenWeather Exporter listening on http://${HOST}:${PORT}`);