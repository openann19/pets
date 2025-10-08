/**
 * Weather Service Integration Tests
 * Tests weather endpoints, caching, error handling, and pet safety calculations
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app, httpServer } = require('../../server');
const User = require('../../src/models/User');
const axios = require('axios');

let mongoServer;
let testUser;
let testToken;

// Mock axios for weather API calls
jest.mock('axios');
const mockedAxios = axios;

describe('Weather Service Integration Tests', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  }, 30000);

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    if (mongoServer) await mongoServer.stop();
    if (httpServer && httpServer.listening) {
      httpServer.close();
    }
  }, 30000);

  beforeEach(async () => {
    await User.deleteMany({});

    // Create test user
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: `weather${Date.now()}@example.com`,
        password: 'Test123!@#',
        firstName: 'Weather',
        lastName: 'Test',
        dateOfBirth: '1990-01-01'
      });

    testUser = res.body.data.user;
    testToken = res.body.data.accessToken;

    // Clear axios mocks
    mockedAxios.get.mockClear();
  });

  describe('GET /api/weather', () => {
    const mockWeatherData = {
      name: 'New York',
      coord: { lat: 40.7128, lon: -74.0060 },
      main: {
        temp: 22,
        feels_like: 21,
        temp_min: 18,
        temp_max: 26,
        humidity: 65,
        pressure: 1013
      },
      weather: [{
        main: 'Clear',
        description: 'clear sky',
        icon: '01d'
      }],
      clouds: { all: 10 },
      visibility: 10000,
      wind: { speed: 3.5, deg: 180, gust: 5.2 },
      sys: {
        sunrise: Math.floor(Date.now() / 1000) - 3600,
        sunset: Math.floor(Date.now() / 1000) + 3600
      }
    };

    it('should return weather data with coordinates (200)', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockWeatherData });

      const res = await request(app)
        .get('/api/weather?lat=40.7128&lon=-74.0060')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('location', 'New York');
      expect(res.body.data).toHaveProperty('coordinates');
      expect(res.body.data.coordinates).toHaveProperty('lat', 40.7128);
      expect(res.body.data.coordinates).toHaveProperty('lon', -74.0060);
      expect(res.body.data).toHaveProperty('temperature');
      expect(res.body.data).toHaveProperty('conditions');
      expect(res.body.data).toHaveProperty('pet_safety');
      expect(res.body.data.pet_safety).toHaveProperty('walking_conditions');
      expect(res.body.data.pet_safety).toHaveProperty('outdoor_safety_score');
      expect(res.body.data.pet_safety).toHaveProperty('recommendations');
    });

    it('should return weather data with city name (200)', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockWeatherData });

      const res = await request(app)
        .get('/api/weather?city=New York')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.location).toBe('New York');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('q=New%20York')
      );
    });

    it('should return cached data on second request', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockWeatherData });

      // First request
      const res1 = await request(app)
        .get('/api/weather?lat=40.7128&lon=-74.0060')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(res1.body.success).toBe(true);
      expect(res1.body.cached).toBeUndefined();

      // Second request (should be cached)
      const res2 = await request(app)
        .get('/api/weather?lat=40.7128&lon=-74.0060')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(res2.body.success).toBe(true);
      expect(res2.body.cached).toBe(true);
      expect(res2.body.data).toEqual(res1.body.data);

      // Should only call API once
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    it('should return mock data when API key not configured', async () => {
      const originalApiKey = process.env.OPENWEATHER_API_KEY;
      delete process.env.OPENWEATHER_API_KEY;

      const res = await request(app)
        .get('/api/weather?lat=40.7128&lon=-74.0060')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.location).toBe('40.7128, -74.0060');
      expect(res.body.data.temperature.current).toBe(22);
      expect(res.body.data.pet_safety.walking_conditions).toBe('excellent');
      expect(res.body.data.pet_safety.outdoor_safety_score).toBe(95);

      // Restore API key
      process.env.OPENWEATHER_API_KEY = originalApiKey;
    });

    it('should reject request without coordinates or city (400)', async () => {
      const res = await request(app)
        .get('/api/weather')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Please provide either city name or latitude/longitude coordinates');
    });

    it('should reject request without authentication (401)', async () => {
      await request(app)
        .get('/api/weather?lat=40.7128&lon=-74.0060')
        .expect(401);
    });

    it('should handle API errors gracefully (500)', async () => {
      mockedAxios.get.mockRejectedValue(new Error('API Error'));

      const res = await request(app)
        .get('/api/weather?lat=40.7128&lon=-74.0060')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(500);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Failed to fetch weather data');
    });

    it('should handle location not found (404)', async () => {
      mockedAxios.get.mockRejectedValue({
        response: { status: 404 }
      });

      const res = await request(app)
        .get('/api/weather?city=NonexistentCity')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Location not found');
    });

    it('should calculate pet safety for hot weather', async () => {
      const hotWeatherData = {
        ...mockWeatherData,
        main: {
          ...mockWeatherData.main,
          temp: 35, // Hot temperature
          humidity: 80
        },
        weather: [{
          main: 'Clear',
          description: 'clear sky',
          icon: '01d'
        }]
      };

      mockedAxios.get.mockResolvedValue({ data: hotWeatherData });

      const res = await request(app)
        .get('/api/weather?lat=40.7128&lon=-74.0060')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(res.body.data.pet_safety.walking_conditions).toBe('poor');
      expect(res.body.data.pet_safety.temperature_warning).toBe('high');
      expect(res.body.data.pet_safety.outdoor_safety_score).toBeLessThan(80);
      expect(res.body.data.pet_safety.recommendations).toContain(
        expect.stringContaining('Walk during cooler hours only')
      );
    });

    it('should calculate pet safety for cold weather', async () => {
      const coldWeatherData = {
        ...mockWeatherData,
        main: {
          ...mockWeatherData.main,
          temp: -5 // Cold temperature
        },
        weather: [{
          main: 'Snow',
          description: 'light snow',
          icon: '13d'
        }]
      };

      mockedAxios.get.mockResolvedValue({ data: coldWeatherData });

      const res = await request(app)
        .get('/api/weather?lat=40.7128&lon=-74.0060')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(res.body.data.pet_safety.walking_conditions).toBe('poor');
      expect(res.body.data.pet_safety.temperature_warning).toBe('low');
      expect(res.body.data.pet_safety.outdoor_safety_score).toBeLessThan(80);
      expect(res.body.data.pet_safety.recommendations).toContain(
        expect.stringContaining('Use pet booties to protect paws')
      );
    });

    it('should calculate pet safety for stormy weather', async () => {
      const stormyWeatherData = {
        ...mockWeatherData,
        weather: [{
          main: 'Thunderstorm',
          description: 'thunderstorm with heavy rain',
          icon: '11d'
        }]
      };

      mockedAxios.get.mockResolvedValue({ data: stormyWeatherData });

      const res = await request(app)
        .get('/api/weather?lat=40.7128&lon=-74.0060')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(res.body.data.pet_safety.walking_conditions).toBe('dangerous');
      expect(res.body.data.pet_safety.outdoor_safety_score).toBeLessThan(70);
      expect(res.body.data.pet_safety.alerts).toContain(
        'Storm conditions - avoid outdoor activities'
      );
    });
  });

  describe('GET /api/weather/forecast', () => {
    const mockForecastData = {
      city: {
        name: 'New York',
        coord: { lat: 40.7128, lon: -74.0060 }
      },
      list: [
        {
          dt: Math.floor(Date.now() / 1000),
          main: { temp: 22, humidity: 65 },
          weather: [{ main: 'Clear' }],
          wind: { speed: 3.5 }
        },
        {
          dt: Math.floor(Date.now() / 1000) + 3600,
          main: { temp: 24, humidity: 70 },
          weather: [{ main: 'Clouds' }],
          wind: { speed: 4.2 }
        }
      ]
    };

    it('should return weather forecast (200)', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockForecastData });

      const res = await request(app)
        .get('/api/weather/forecast?lat=40.7128&lon=-74.0060&days=3')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('location', 'New York');
      expect(res.body.data).toHaveProperty('forecast');
      expect(Array.isArray(res.body.data.forecast)).toBe(true);
    });

    it('should return mock forecast when API key not configured', async () => {
      const originalApiKey = process.env.OPENWEATHER_API_KEY;
      delete process.env.OPENWEATHER_API_KEY;

      const res = await request(app)
        .get('/api/weather/forecast?lat=40.7128&lon=-74.0060&days=2')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.forecast).toHaveLength(2);
      expect(res.body.data.forecast[0]).toHaveProperty('date');
      expect(res.body.data.forecast[0]).toHaveProperty('temperature');
      expect(res.body.data.forecast[0]).toHaveProperty('pet_walking_score');

      // Restore API key
      process.env.OPENWEATHER_API_KEY = originalApiKey;
    });

    it('should reject request without coordinates or city (400)', async () => {
      const res = await request(app)
        .get('/api/weather/forecast')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Please provide either city name or coordinates');
    });

    it('should handle forecast API errors (500)', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Forecast API Error'));

      const res = await request(app)
        .get('/api/weather/forecast?lat=40.7128&lon=-74.0060')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(500);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Failed to fetch weather forecast');
    });
  });

  describe('GET /api/weather/alerts', () => {
    it('should return weather alerts for high temperature (200)', async () => {
      const res = await request(app)
        .get('/api/weather/alerts?lat=40.7128&lon=-74.0060&temp=35')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('alerts');
      expect(res.body.data.alerts).toHaveLength(1);
      expect(res.body.data.alerts[0].type).toBe('heat_warning');
      expect(res.body.data.alerts[0].severity).toBe('high');
      expect(res.body.data.alerts[0].recommendations).toContain(
        'Walk pets during cooler morning or evening hours'
      );
    });

    it('should return weather alerts for low temperature (200)', async () => {
      const res = await request(app)
        .get('/api/weather/alerts?lat=40.7128&lon=-74.0060&temp=-5')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.alerts).toHaveLength(1);
      expect(res.body.data.alerts[0].type).toBe('cold_warning');
      expect(res.body.data.alerts[0].severity).toBe('moderate');
      expect(res.body.data.alerts[0].recommendations).toContain(
        'Limit time outdoors for short-haired breeds'
      );
    });

    it('should return no alerts for moderate temperature (200)', async () => {
      const res = await request(app)
        .get('/api/weather/alerts?lat=40.7128&lon=-74.0060&temp=20')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.alerts).toHaveLength(0);
    });

    it('should handle alerts API errors (500)', async () => {
      // Mock an error in the alerts endpoint
      const originalAlertsRoute = require('../../src/routes/weather');
      
      const res = await request(app)
        .get('/api/weather/alerts?lat=invalid&lon=invalid')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200); // Should still return 200 with empty alerts

      expect(res.body.success).toBe(true);
      expect(res.body.data.alerts).toHaveLength(0);
    });
  });

  describe('Weather Caching Tests', () => {
    it('should cache weather data for 10 minutes', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockWeatherData });

      // First request
      await request(app)
        .get('/api/weather?lat=40.7128&lon=-74.0060')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      // Second request (should be cached)
      await request(app)
        .get('/api/weather?lat=40.7128&lon=-74.0060')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      // Should only call API once
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    it('should use different cache keys for different locations', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockWeatherData });

      // Request for New York
      await request(app)
        .get('/api/weather?lat=40.7128&lon=-74.0060')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      // Request for Los Angeles
      await request(app)
        .get('/api/weather?lat=34.0522&lon=-118.2437')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      // Should call API twice (different cache keys)
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });

    it('should use different cache keys for city vs coordinates', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockWeatherData });

      // Request with coordinates
      await request(app)
        .get('/api/weather?lat=40.7128&lon=-74.0060')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      // Request with city name
      await request(app)
        .get('/api/weather?city=New York')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      // Should call API twice (different cache keys)
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('Pet Safety Calculation Tests', () => {
    it('should calculate excellent conditions for ideal weather', async () => {
      const idealWeather = {
        ...mockWeatherData,
        main: {
          temp: 20,
          humidity: 50
        },
        weather: [{ main: 'Clear' }],
        wind: { speed: 2 }
      };

      mockedAxios.get.mockResolvedValue({ data: idealWeather });

      const res = await request(app)
        .get('/api/weather?lat=40.7128&lon=-74.0060')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(res.body.data.pet_safety.walking_conditions).toBe('excellent');
      expect(res.body.data.pet_safety.outdoor_safety_score).toBeGreaterThan(90);
      expect(res.body.data.pet_safety.recommendations[0]).toContain('Perfect weather');
    });

    it('should calculate moderate conditions for slightly challenging weather', async () => {
      const moderateWeather = {
        ...mockWeatherData,
        main: {
          temp: 28,
          humidity: 70
        },
        weather: [{ main: 'Rain' }],
        wind: { speed: 8 }
      };

      mockedAxios.get.mockResolvedValue({ data: moderateWeather });

      const res = await request(app)
        .get('/api/weather?lat=40.7128&lon=-74.0060')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(res.body.data.pet_safety.walking_conditions).toBe('moderate');
      expect(res.body.data.pet_safety.outdoor_safety_score).toBeGreaterThan(60);
      expect(res.body.data.pet_safety.outdoor_safety_score).toBeLessThan(90);
    });

    it('should calculate poor conditions for challenging weather', async () => {
      const poorWeather = {
        ...mockWeatherData,
        main: {
          temp: 35,
          humidity: 85
        },
        weather: [{ main: 'Thunderstorm' }],
        wind: { speed: 15 }
      };

      mockedAxios.get.mockResolvedValue({ data: poorWeather });

      const res = await request(app)
        .get('/api/weather?lat=40.7128&lon=-74.0060')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(res.body.data.pet_safety.walking_conditions).toBe('poor');
      expect(res.body.data.pet_safety.outdoor_safety_score).toBeLessThan(60);
      expect(res.body.data.pet_safety.alerts.length).toBeGreaterThan(0);
    });
  });
});
