import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@pawfectmatch/core';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import CallManager from './src/components/calling/CallManager';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { isAuthDisabled } from './src/config/dev';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';

// New Screens

// Adoption Screens
import AdoptionApplicationScreen from './src/screens/adoption/AdoptionApplicationScreen';
import AdoptionManagerScreen from './src/screens/adoption/AdoptionManagerScreen';

// Main Screens
import ChatScreen from './src/screens/ChatScreen';
import CreatePetScreen from './src/screens/CreatePetScreen';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import MapScreen from './src/screens/MapScreen';
import MatchesScreen from './src/screens/MatchesScreen';
import MyPetsScreen from './src/screens/MyPetsScreen';
import PetProfileSetupScreen from './src/screens/onboarding/PetProfileSetupScreen';
import PreferencesSetupScreen from './src/screens/onboarding/PreferencesSetupScreen';
import UserIntentScreen from './src/screens/onboarding/UserIntentScreen';
import WelcomeScreen from './src/screens/onboarding/WelcomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SwipeScreen from './src/screens/SwipeScreen';

/* eslint-disable @typescript-eslint/no-explicit-any */

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
  MyPets: undefined;
  Settings: undefined;
};

type RootStackParamList = {
  MainTabs: undefined;
  Chat: { matchId: string; petName: string };
  AdoptionApplication: { petId: string; petName: string };
  CreatePet: undefined;
  MyPets: undefined;
  Settings: undefined;
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
  const { colors } = useTheme();

  const getTabBarIcon = (routeName: string, focused: boolean) => {
    let iconName: keyof typeof Ionicons.glyphMap;

    switch (routeName) {
      case 'Home':
        iconName = focused ? 'home' : 'home-outline';
        break;
      case 'Swipe':
        iconName = focused ? 'heart' : 'heart-outline';
        break;
      case 'Map':
        iconName = focused ? 'map' : 'map-outline';
        break;
      case 'Matches':
        iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
        break;
      case 'Profile':
        iconName = focused ? 'person' : 'person-outline';
        break;
      case 'AdoptionManager':
        iconName = focused ? 'list' : 'list-outline';
        break;
      default:
        iconName = 'home-outline';
    }

    return iconName;
  };

  return (
    <MainTabs.Navigator
      screenOptions={({ route }: { route: { name: keyof MainTabParamList } }) => ({
        tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => (
          <Ionicons name={getTabBarIcon(route.name, focused)} size={size} color={color} />
        ),
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
        component={ProfileScreen}
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
      <RootStack.Screen
        name="CreatePet"
        component={CreatePetScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="MyPets"
        component={MyPetsScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="Settings"
        component={SettingsScreen}
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

  const renderAppContent = () => {
    if (isAuthDisabled()) {
      // DEVELOPMENT MODE: Always show main app
      console.log('[DEV] Bypassing auth - showing main app');
      return hasCompletedOnboarding ? <RootNavigator /> : <OnboardingNavigator />;
    } else {
      // PRODUCTION MODE: Normal auth flow
      return isAuthenticated && user ? (
        hasCompletedOnboarding ? (
          <RootNavigator />
        ) : (
          <OnboardingNavigator />
        )
      ) : (
        <AuthNavigator />
      );
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SafeAreaProvider>
          <CallManager>
            <NavigationContainer>
              <ErrorBoundary>
                {renderAppContent()}
              </ErrorBoundary>
            </NavigationContainer>
            <StatusBar style="auto" />
          </CallManager>
        </SafeAreaProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
