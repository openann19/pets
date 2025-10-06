import { useWeatherStore } from '../useWeatherStore';

// Mock fetch
global.fetch = jest.fn();

describe('useWeatherStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useWeatherStore.getState().reset();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useWeatherStore.getState();
      expect(state.data).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.location.latitude).toBeNull();
      expect(state.location.longitude).toBeNull();
    });
  });

  describe('setWeatherData', () => {
    const mockWeatherData = {
      weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
      main: {
        temp: 25.5,
        feels_like: 27.2,
        temp_min: 23.1,
        temp_max: 28.9,
        pressure: 1013,
        humidity: 65
      },
      name: 'New York',
      sys: { country: 'US', sunrise: 1640995200, sunset: 1641031200 },
      wind: { speed: 3.2, deg: 180 },
      clouds: { all: 10 },
      visibility: 10000,
      timeOfDay: 'day' as const,
      season: 'winter' as const,
      lastUpdated: '2023-01-01T00:00:00Z'
    };

    it('should set weather data', () => {
      const { setWeatherData } = useWeatherStore.getState();
      setWeatherData(mockWeatherData);

      const state = useWeatherStore.getState();
      // Check that the data is set correctly, ignoring the timestamp
      expect(state.data).toMatchObject({
        weather: mockWeatherData.weather,
        main: mockWeatherData.main,
        name: mockWeatherData.name,
        sys: mockWeatherData.sys,
        wind: mockWeatherData.wind,
        clouds: mockWeatherData.clouds,
        visibility: mockWeatherData.visibility,
        timeOfDay: mockWeatherData.timeOfDay,
        season: mockWeatherData.season,
      });
      expect(state.data?.lastUpdated).toBeDefined();
      expect(state.weather).toEqual(state.data); // Alias should match
    });
  });

  describe('setIsLoading', () => {
    it('should set loading state', () => {
      const { setIsLoading } = useWeatherStore.getState();
      setIsLoading(true);

      expect(useWeatherStore.getState().isLoading).toBe(true);

      setIsLoading(false);
      expect(useWeatherStore.getState().isLoading).toBe(false);
    });
  });

  describe('setError', () => {
    it('should set error message', () => {
      const { setError } = useWeatherStore.getState();
      setError('Network error');

      expect(useWeatherStore.getState().error).toBe('Network error');

      setError(null);
      expect(useWeatherStore.getState().error).toBeNull();
    });
  });

  describe('setLocation', () => {
    it('should set location coordinates', () => {
      const { setLocation } = useWeatherStore.getState();
      setLocation(40.7128, -74.0060);

      const state = useWeatherStore.getState();
      expect(state.location.latitude).toBe(40.7128);
      expect(state.location.longitude).toBe(-74.0060);
    });
  });

  describe('calculateTimeOfDay', () => {
    it('should calculate time of day correctly', () => {
      const { calculateTimeOfDay, setWeatherData } = useWeatherStore.getState();
      
      // Set weather data with sunrise/sunset
      const mockData = {
        weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
        main: { temp: 25.5 },
        name: 'Test',
        sys: { 
          country: 'US', 
          sunrise: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
          sunset: Math.floor(Date.now() / 1000) + 3600   // 1 hour from now
        },
        wind: { speed: 3.2, deg: 180 },
        clouds: { all: 10 },
        visibility: 10000,
        timeOfDay: 'day' as const,
        season: 'winter' as const,
        lastUpdated: '2023-01-01T00:00:00Z'
      };

      setWeatherData(mockData);
      calculateTimeOfDay();

      const state = useWeatherStore.getState();
      expect(state.data?.timeOfDay).toBe('day');
    });
  });
});
