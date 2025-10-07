const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');
const { authenticateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Cache weather data for 10 minutes to reduce API calls
const weatherCache = new NodeCache({ stdTTL: 600 });

/**
 * Get weather data for a specific location
 * @route GET /api/weather
 * @query lat - Latitude
 * @query lon - Longitude  
 * @query city - City name (alternative to lat/lon)
 * @returns Weather data including temperature, conditions, and pet safety info
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { lat, lon, city } = req.query;
    
    // Validate input
    if (!city && (!lat || !lon)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either city name or latitude/longitude coordinates'
      });
    }

    // Check if OpenWeather API key is configured
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      logger.warn('OpenWeather API key not configured, returning mock data');
      
      // Return realistic mock data when API key not configured
      return res.json({
        success: true,
        data: {
          location: city || `${lat}, ${lon}`,
          temperature: {
            current: 22,
            feels_like: 21,
            min: 18,
            max: 26,
            unit: 'celsius'
          },
          conditions: {
            main: 'Clear',
            description: 'clear sky',
            icon: '01d',
            clouds: 10,
            visibility: 10000
          },
          wind: {
            speed: 3.5,
            direction: 180,
            gust: 5.2
          },
          humidity: 65,
          pressure: 1013,
          uv_index: 5,
          sunrise: new Date().setHours(6, 30),
          sunset: new Date().setHours(19, 0),
          pet_safety: {
            walking_conditions: 'excellent',
            temperature_warning: null,
            outdoor_safety_score: 95,
            recommendations: [
              'Perfect weather for pet walks',
              'Remember to bring water for longer walks',
              'UV protection recommended during midday'
            ],
            alerts: []
          },
          timestamp: new Date().toISOString()
        }
      });
    }

    // Create cache key
    const cacheKey = city || `${lat}-${lon}`;
    
    // Check cache first
    const cachedData = weatherCache.get(cacheKey);
    if (cachedData) {
      logger.debug(`Weather data retrieved from cache for ${cacheKey}`);
      return res.json({
        success: true,
        data: cachedData,
        cached: true
      });
    }

    // Build API URL
    let apiUrl;
    if (city) {
      apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
    } else {
      apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    }

    // Fetch weather data
    const response = await axios.get(apiUrl);
    const weatherData = response.data;

    // Process and enhance weather data for pet owners
    const processedData = {
      location: weatherData.name,
      coordinates: {
        lat: weatherData.coord.lat,
        lon: weatherData.coord.lon
      },
      temperature: {
        current: Math.round(weatherData.main.temp),
        feels_like: Math.round(weatherData.main.feels_like),
        min: Math.round(weatherData.main.temp_min),
        max: Math.round(weatherData.main.temp_max),
        unit: 'celsius'
      },
      conditions: {
        main: weatherData.weather[0].main,
        description: weatherData.weather[0].description,
        icon: weatherData.weather[0].icon,
        clouds: weatherData.clouds.all,
        visibility: weatherData.visibility
      },
      wind: {
        speed: weatherData.wind.speed,
        direction: weatherData.wind.deg,
        gust: weatherData.wind.gust || null
      },
      humidity: weatherData.main.humidity,
      pressure: weatherData.main.pressure,
      sunrise: weatherData.sys.sunrise * 1000,
      sunset: weatherData.sys.sunset * 1000,
      pet_safety: calculatePetSafety(weatherData),
      timestamp: new Date().toISOString()
    };

    // Cache the processed data
    weatherCache.set(cacheKey, processedData);

    res.json({
      success: true,
      data: processedData
    });

  } catch (error) {
    logger.error('Weather API error:', error);
    
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch weather data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Get weather forecast for planning pet activities
 * @route GET /api/weather/forecast
 * @query lat - Latitude
 * @query lon - Longitude
 * @query days - Number of days (1-5, default 3)
 */
router.get('/forecast', authenticateToken, async (req, res) => {
  try {
    const { lat, lon, city, days = 3 } = req.query;
    
    if (!city && (!lat || !lon)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either city name or coordinates'
      });
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      // Return mock forecast data
      const mockForecast = [];
      for (let i = 0; i < parseInt(days); i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        
        mockForecast.push({
          date: date.toISOString().split('T')[0],
          temperature: {
            min: 15 + Math.random() * 5,
            max: 25 + Math.random() * 5
          },
          conditions: 'Partly cloudy',
          pet_walking_score: 85 + Math.random() * 15,
          recommendations: ['Good day for outdoor activities']
        });
      }

      return res.json({
        success: true,
        data: {
          location: city || `${lat}, ${lon}`,
          forecast: mockForecast
        }
      });
    }

    // Implement actual forecast API call here
    let apiUrl;
    if (city) {
      apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&cnt=${days * 8}`;
    } else {
      apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&cnt=${days * 8}`;
    }

    const response = await axios.get(apiUrl);
    
    // Process forecast data
    const forecastData = processForecastData(response.data, days);

    res.json({
      success: true,
      data: forecastData
    });

  } catch (error) {
    logger.error('Weather forecast error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weather forecast'
    });
  }
});

/**
 * Get weather alerts for pet safety
 * @route GET /api/weather/alerts
 */
router.get('/alerts', authenticateToken, async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    // This would integrate with weather alert services
    const alerts = [];
    
    // Check for extreme temperatures
    const temp = req.query.temp || 20;
    if (temp > 30) {
      alerts.push({
        type: 'heat_warning',
        severity: 'high',
        message: 'High temperature warning - limit outdoor pet activities',
        recommendations: [
          'Walk pets during cooler morning or evening hours',
          'Ensure constant access to fresh water',
          'Never leave pets in vehicles',
          'Check pavement temperature before walks'
        ]
      });
    } else if (temp < 0) {
      alerts.push({
        type: 'cold_warning',
        severity: 'moderate',
        message: 'Cold weather advisory for pets',
        recommendations: [
          'Limit time outdoors for short-haired breeds',
          'Consider pet clothing for extra warmth',
          'Check paws for ice buildup',
          'Provide warm shelter'
        ]
      });
    }

    res.json({
      success: true,
      data: {
        alerts,
        last_updated: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Weather alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weather alerts'
    });
  }
});

// Helper function to calculate pet safety based on weather conditions
function calculatePetSafety(weatherData) {
  const temp = weatherData.main.temp;
  const conditions = weatherData.weather[0].main.toLowerCase();
  const windSpeed = weatherData.wind.speed;
  const humidity = weatherData.main.humidity;
  
  let safetyScore = 100;
  const recommendations = [];
  const alerts = [];
  let walkingConditions = 'excellent';

  // Temperature analysis
  if (temp > 30) {
    safetyScore -= 30;
    walkingConditions = 'poor';
    alerts.push('High temperature - risk of heatstroke');
    recommendations.push('Walk during cooler hours only');
    recommendations.push('Bring water and take frequent breaks');
  } else if (temp > 25) {
    safetyScore -= 10;
    walkingConditions = 'moderate';
    recommendations.push('Monitor pet for signs of overheating');
  } else if (temp < 0) {
    safetyScore -= 25;
    walkingConditions = 'poor';
    alerts.push('Freezing temperatures - limit outdoor exposure');
    recommendations.push('Use pet booties to protect paws');
  } else if (temp < 10) {
    safetyScore -= 10;
    walkingConditions = 'moderate';
    recommendations.push('Consider a coat for short-haired breeds');
  }

  // Weather conditions
  if (conditions.includes('rain') || conditions.includes('drizzle')) {
    safetyScore -= 15;
    recommendations.push('Dry pet thoroughly after walk');
    if (walkingConditions === 'excellent') walkingConditions = 'good';
  }
  
  if (conditions.includes('storm') || conditions.includes('thunder')) {
    safetyScore -= 40;
    walkingConditions = 'dangerous';
    alerts.push('Storm conditions - avoid outdoor activities');
  }
  
  if (conditions.includes('snow')) {
    safetyScore -= 20;
    recommendations.push('Check paws for ice and salt');
    if (walkingConditions === 'excellent') walkingConditions = 'moderate';
  }

  // Wind analysis
  if (windSpeed > 10) {
    safetyScore -= 10;
    recommendations.push('Strong winds - keep smaller pets secure');
  }

  // Humidity analysis
  if (humidity > 80 && temp > 20) {
    safetyScore -= 10;
    recommendations.push('High humidity - ensure proper hydration');
  }

  // Ensure safety score stays within bounds
  safetyScore = Math.max(0, Math.min(100, safetyScore));

  // Add general recommendations
  if (safetyScore > 80) {
    recommendations.unshift('Perfect weather for pet activities!');
  } else if (safetyScore > 60) {
    recommendations.unshift('Good conditions with some precautions');
  } else if (safetyScore > 40) {
    recommendations.unshift('Exercise caution during outdoor activities');
  } else {
    recommendations.unshift('Limit outdoor exposure to essentials only');
  }

  return {
    walking_conditions: walkingConditions,
    temperature_warning: temp > 30 ? 'high' : temp < 0 ? 'low' : null,
    outdoor_safety_score: safetyScore,
    recommendations,
    alerts
  };
}

// Helper function to process forecast data
function processForecastData(data, days) {
  const dailyForecasts = {};
  
  // Group forecasts by day
  data.list.forEach(item => {
    const date = new Date(item.dt * 1000).toISOString().split('T')[0];
    
    if (!dailyForecasts[date]) {
      dailyForecasts[date] = {
        date,
        temperatures: [],
        conditions: [],
        humidity: [],
        wind: []
      };
    }
    
    dailyForecasts[date].temperatures.push(item.main.temp);
    dailyForecasts[date].conditions.push(item.weather[0].main);
    dailyForecasts[date].humidity.push(item.main.humidity);
    dailyForecasts[date].wind.push(item.wind.speed);
  });

  // Calculate daily summaries
  const forecast = Object.values(dailyForecasts).slice(0, days).map(day => {
    const avgTemp = day.temperatures.reduce((a, b) => a + b, 0) / day.temperatures.length;
    const minTemp = Math.min(...day.temperatures);
    const maxTemp = Math.max(...day.temperatures);
    const avgHumidity = day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length;
    const maxWind = Math.max(...day.wind);
    
    // Most common condition
    const conditionCounts = {};
    day.conditions.forEach(c => {
      conditionCounts[c] = (conditionCounts[c] || 0) + 1;
    });
    const mainCondition = Object.entries(conditionCounts)
      .sort((a, b) => b[1] - a[1])[0][0];

    // Calculate pet walking score for the day
    let walkingScore = 100;
    if (avgTemp > 28 || avgTemp < 5) walkingScore -= 30;
    else if (avgTemp > 25 || avgTemp < 10) walkingScore -= 15;
    
    if (mainCondition.toLowerCase().includes('rain')) walkingScore -= 20;
    if (mainCondition.toLowerCase().includes('storm')) walkingScore -= 50;
    if (maxWind > 10) walkingScore -= 15;
    
    walkingScore = Math.max(0, Math.min(100, walkingScore));

    const recommendations = [];
    if (walkingScore > 80) {
      recommendations.push('Excellent day for outdoor pet activities');
    } else if (walkingScore > 60) {
      recommendations.push('Good conditions with some weather considerations');
    } else if (walkingScore > 40) {
      recommendations.push('Plan shorter walks or indoor activities');
    } else {
      recommendations.push('Consider postponing non-essential outdoor activities');
    }

    return {
      date: day.date,
      temperature: {
        min: Math.round(minTemp),
        max: Math.round(maxTemp),
        avg: Math.round(avgTemp)
      },
      conditions: mainCondition,
      humidity: Math.round(avgHumidity),
      wind_speed: Math.round(maxWind * 10) / 10,
      pet_walking_score: walkingScore,
      recommendations
    };
  });

  return {
    location: data.city.name,
    coordinates: data.city.coord,
    forecast
  };
}

module.exports = router;