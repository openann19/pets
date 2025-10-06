import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@pawfectmatch/core';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CallManager from './src/components/calling/CallManager';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import ThemeToggle from './src/components/ThemeToggle';

// Main Screens
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import SwipeScreen from './src/screens/SwipeScreen';
import MatchesScreen from './src/screens/MatchesScreen';
import ChatScreen from './src/screens/ChatScreen';
import MapScreen from './src/screens/MapScreen';

// Onboarding Screens
import UserIntentScreen from './src/screens/onboarding/UserIntentScreen';
import PetProfileSetupScreen from './src/screens/onboarding/PetProfileSetupScreen';
import PreferencesSetupScreen from './src/screens/onboarding/PreferencesSetupScreen';
import WelcomeScreen from './src/screens/onboarding/WelcomeScreen';

// Adoption Screens
import AdoptionManagerScreen from './src/screens/adoption/AdoptionManagerScreen';
import AdoptionApplicationScreen from './src/screens/adoption/AdoptionApplicationScreen';

// Create a React Query client
const queryClient = new QueryClient();

// Define navigation types
type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

type OnboardingStackParamList = {
  UserIntent: undefined;
  PetProfileSetup: { userIntent: string };
  PreferencesSetup: { userIntent: string };
  Welcome: undefined;
};

type MainTabParamList = {
  Home: undefined;
  Swipe: undefined;
  Map: undefined;
  Matches: undefined;
  Profile: undefined;
  AdoptionManager: undefined;
};

type RootStackParamList = {
  MainTabs: undefined;
  Chat: { matchId: string; petName: string };
  AdoptionApplication: { petId: string; petName: string };
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const OnboardingStack = createNativeStackNavigator<OnboardingStackParamList>();
const MainTabs = createBottomTabNavigator<MainTabParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function OnboardingNavigator() {
  return (
    <OnboardingStack.Navigator screenOptions={{ headerShown: false }}>
      <OnboardingStack.Screen name="UserIntent" component={UserIntentScreen} />
      <OnboardingStack.Screen name="PetProfileSetup" component={PetProfileSetupScreen} />
      <OnboardingStack.Screen name="PreferencesSetup" component={PreferencesSetupScreen} />
      <OnboardingStack.Screen name="Welcome" component={WelcomeScreen} />
    </OnboardingStack.Navigator>
  );
}

function MainTabNavigator() {
  const { colors, isDark } = useTheme();
  
  return (
    <MainTabs.Navigator
      screenOptions={({ route }: { route: { name: string } }) => ({
        tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Swipe') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Matches') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'AdoptionManager') {
            iconName = focused ? 'list' : 'list-outline';
          } else {
            iconName = 'home-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray500,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.gray200,
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerShown: false,
      })}
    >
      <MainTabs.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <MainTabs.Screen 
        name="Swipe" 
        component={SwipeScreen}
        options={{ tabBarLabel: 'Discover' }}
      />
      <MainTabs.Screen 
        name="Map" 
        component={MapScreen}
        options={{ tabBarLabel: 'Map' }}
      />
      <MainTabs.Screen 
        name="Matches" 
        component={MatchesScreen}
        options={{ tabBarLabel: 'Matches' }}
      />
      <MainTabs.Screen 
        name="Profile" 
        component={HomeScreen} // Placeholder - replace with ProfileScreen
        options={{ tabBarLabel: 'Profile' }}
      />
      <MainTabs.Screen 
        name="AdoptionManager" 
        component={AdoptionManagerScreen}
        options={{ tabBarLabel: 'Manage' }}
      />
    </MainTabs.Navigator>
  );
}

function RootNavigator() {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="MainTabs" component={MainTabNavigator} />
      <RootStack.Screen 
        name="Chat" 
        component={ChatScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen 
        name="AdoptionApplication" 
        component={AdoptionApplicationScreen}
        options={{ headerShown: false }}
      />
    </RootStack.Navigator>
  );
}

export default function App() {
  const { isAuthenticated, user } = useAuthStore();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    // Initialize auth state from storage is handled by Zustand persist
    // No need to explicitly initialize
    
    // Check onboarding status
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const onboardingComplete = await AsyncStorage.getItem('onboarding_complete');
      setHasCompletedOnboarding(onboardingComplete === 'true');
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setHasCompletedOnboarding(false);
    }
  };

  // Show loading while checking onboarding status
  if (hasCompletedOnboarding === null) {
    return null; // Or a loading screen
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SafeAreaProvider>
          <CallManager>
            <NavigationContainer>
              {isAuthenticated && user ? (
                hasCompletedOnboarding ? (
                  <RootNavigator />
                ) : (
                  <OnboardingNavigator />
                )
              ) : (
                <AuthNavigator />
              )}
            </NavigationContainer>
            <StatusBar style="auto" />
          </CallManager>
        </SafeAreaProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
