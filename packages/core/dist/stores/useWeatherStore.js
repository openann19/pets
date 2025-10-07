import { create } from 'zustand';
/**
 * Weather store for managing ambient weather effects
 */
export const useWeatherStore = create((set, get) => ({
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
    setWeatherData: (data) => set((state) => {
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
    setIsLoading: (isLoading) => set((state) => ({
        ...state,
        isLoading,
    })),
    // Set error
    setError: (error) => set((state) => ({
        ...state,
        error,
    })),
    // Set user location
    setLocation: (latitude, longitude) => set((state) => ({
        ...state,
        location: { latitude, longitude },
    })),
    // Calculate and update time of day based on current time and sunrise/sunset
    calculateTimeOfDay: () => set((state) => {
        const current = get().data;
        if (current?.sys == null || state.data == null)
            return state;
        const now = Date.now() / 1000; // seconds
        const sunrise = current.sys.sunrise ?? 0;
        const sunset = current.sys.sunset ?? 0;
        const dawnStart = sunrise - 30 * 60;
        const duskEnd = sunset + 30 * 60;
        const { timeOfDay: currentTimeOfDay } = state.data;
        let timeOfDay = currentTimeOfDay;
        if (now >= dawnStart && now < sunrise)
            timeOfDay = 'dawn';
        else if (now >= sunrise && now < sunset)
            timeOfDay = 'day';
        else if (now >= sunset && now < duskEnd)
            timeOfDay = 'dusk';
        else
            timeOfDay = 'night';
        const month = new Date().getMonth();
        let season = 'winter';
        if (month >= 2 && month <= 4)
            season = 'spring';
        else if (month >= 5 && month <= 7)
            season = 'summer';
        else if (month >= 8 && month <= 10)
            season = 'fall';
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
