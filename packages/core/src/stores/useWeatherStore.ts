import { create } from 'zustand';

export interface WeatherData {
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon?: string;
  }>;
  main: {
    temp: number;
    feels_like?: number;
    temp_min?: number;
    temp_max?: number;
    pressure?: number;
    humidity?: number;
  };
  name?: string; // City name
  sys?: {
    country?: string;
    sunrise?: number;
    sunset?: number;
  };
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night';
  season: 'spring' | 'summer' | 'fall' | 'winter';
  lastUpdated: string; // ISO timestamp
}

export interface WeatherState {
  data: WeatherData | null;
  weather: WeatherData | null; // Alias for backward compatibility
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
  location: {
    latitude: number | null;
    longitude: number | null;
  };
  
  // Actions
  setWeatherData: (data: WeatherData) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setLocation: (latitude: number, longitude: number) => void;
  calculateTimeOfDay: () => void;
  reset: () => void;
}

/**
 * Weather store for managing ambient weather effects
 */
export const useWeatherStore = create<WeatherState>((set, get) => ({
  data: null,
  weather: null, // Alias for backward compatibility
  isLoading: false,
  error: null,
  lastUpdated: null,
  location: {
    latitude: null,
    longitude: null,
  },
  
  // Set weather data
  setWeatherData: (data: WeatherData) => set((state) => {
    const updatedData = { ...data, lastUpdated: new Date().toISOString() };
    return {
      ...state,
      data: updatedData,
      weather: updatedData, // Alias for backward compatibility
      lastUpdated: updatedData.lastUpdated,
      error: null,
    };
  }),
  
  // Set loading state
  setIsLoading: (isLoading: boolean) => set((state) => ({
    ...state,
    isLoading,
  })),
  
  // Set error
  setError: (error: string | null) => set((state) => ({
    ...state,
    error,
  })),
  
  // Set user location
  setLocation: (latitude: number, longitude: number) => set((state) => ({
    ...state,
    location: { latitude, longitude },
  })),
  
  // Calculate and update time of day based on current time and sunrise/sunset
  calculateTimeOfDay: () => set((state) => {
    const current = get().data;
    if (current?.sys == null || state.data == null) return state;

    const now = Date.now() / 1000; // seconds
    const sunrise = current.sys.sunrise ?? 0;
    const sunset = current.sys.sunset ?? 0;
    
    const dawnStart = sunrise - 30 * 60;
    const duskEnd = sunset + 30 * 60;

    const { timeOfDay: currentTimeOfDay } = state.data;
    let timeOfDay: WeatherData['timeOfDay'] = currentTimeOfDay;
    if (now >= dawnStart && now < sunrise) timeOfDay = 'dawn';
    else if (now >= sunrise && now < sunset) timeOfDay = 'day';
    else if (now >= sunset && now < duskEnd) timeOfDay = 'dusk';
    else timeOfDay = 'night';

    const month = new Date().getMonth();
    let season: WeatherData['season'] = 'winter';
    if (month >= 2 && month <= 4) season = 'spring';
    else if (month >= 5 && month <= 7) season = 'summer';
    else if (month >= 8 && month <= 10) season = 'fall';

    const updatedData = { ...state.data, timeOfDay, season };
    return {
      ...state,
      data: updatedData,
      weather: updatedData, // Alias for backward compatibility
    };
  }),
  
  // Reset store to initial state
  reset: () => set({
    data: null,
    weather: null,
    isLoading: false,
    error: null,
    lastUpdated: null,
    location: {
      latitude: null,
      longitude: null,
    },
  }),
}));