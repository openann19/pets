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
    name?: string;
    sys?: {
        country?: string;
        sunrise?: number;
        sunset?: number;
    };
    timeOfDay: 'dawn' | 'day' | 'dusk' | 'night';
    season: 'spring' | 'summer' | 'fall' | 'winter';
    lastUpdated: string;
}
export interface WeatherState {
    data: WeatherData | null;
    weather: WeatherData | null;
    isLoading: boolean;
    error: string | null;
    lastUpdated: string | null;
    location: {
        latitude: number | null;
        longitude: number | null;
    };
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
export declare const useWeatherStore: import("zustand").UseBoundStore<import("zustand").StoreApi<WeatherState>>;
//# sourceMappingURL=useWeatherStore.d.ts.map