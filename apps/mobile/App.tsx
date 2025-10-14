import { Ionicons } from '@expo/vector-icons';
import { logger, useAuthStore } from '@pawfectmatch/core';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { LinkingOptions } from '@react-navigation/native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import React, { Suspense, lazy, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import EnhancedTabBar from './src/components/EnhancedTabBar';
import CallManager from './src/components/calling/CallManager';
import { NotificationProvider } from './src/contexts/NotificationContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import type { OnboardingStackParamList, RootStackParamList, TabParamList } from './src/navigation/types';

// Create a React Query client
const queryClient = new QueryClient();

// Define navigation types
interface AuthStackParamList {
  Login: undefined;
  Register: undefined;
  [key: string]: undefined;
}

// @ts-ignore - React Navigation v7 has complex typing issues with Expo
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
// @ts-ignore - React Navigation v7 has complex typing issues with Expo
const OnboardingStack = createNativeStackNavigator<OnboardingStackParamList>();
// @ts-ignore - React Navigation v7 has complex typing issues with Expo
const MainTabs = createBottomTabNavigator<TabParamList>();
// @ts-ignore - React Navigation v7 has complex typing issues with Expo
const RootStack = createNativeStackNavigator<RootStackParamList>();

const MainTabNavigator = () => {
  const { colors } = useTheme();

  return (
    // @ts-ignore - React Navigation v7 JSX typing conflicts with Expo
    <MainTabs.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

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
          } else if (route.name === 'Premium') {
            iconName = focused ? 'star' : 'star-outline';
          } else {
            iconName = 'home-outline';
          }

          // @ts-ignore - Expo Ionicons type conflicts with React Navigation v7
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
      tabBar={(props) => <EnhancedTabBar {...props} />}
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
      <MainTabs.Screen
        name="Premium"
        component={PremiumScreen}
        options={{ tabBarLabel: 'Premium' }}
      />
    </MainTabs.Navigator>
  );
}

const RootNavigator = () => {
  const { user } = useAuthStore();

  return (
    // @ts-ignore - React Navigation v7 JSX typing conflicts with Expo
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="MainTabs" component={MainTabNavigator} />
      <RootStack.Screen
        name="Chat"
        component={ChatScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="PrivacySettings"
        component={PrivacySettingsScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="BlockedUsers"
        component={BlockedUsersScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="SafetyCenter"
        component={SafetyCenterScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="NotificationPreferences"
        component={NotificationPreferencesScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="HelpSupport"
        component={HelpSupportScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="AboutTermsPrivacy"
        component={AboutTermsPrivacyScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="DeactivateAccount"
        component={DeactivateAccountScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="AdvancedFilters"
        component={AdvancedFiltersScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="ModerationTools"
        component={ModerationToolsScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="AdoptionApplication"
        component={AdoptionApplicationScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="CreateListing"
        component={CreateListingScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="Premium"
        component={PremiumScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="SubscriptionManager"
        component={SubscriptionManagerScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="SubscriptionSuccess"
        component={SubscriptionSuccessScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="AIBio"
        component={AIBioScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="AIPhotoAnalyzer"
        component={AIPhotoAnalyzerScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="AICompatibility"
        component={AICompatibilityScreen}
        options={{ headerShown: false }}
      />
      {user?.role === 'admin' && (
        <RootStack.Screen
          name="AdminDashboard"
          component={AdminNavigator}
          options={{ headerShown: false }}
        />
      )}
    </RootStack.Navigator>
  );
}

// Configure deep linking
// @ts-ignore - React Navigation linking typing conflicts with Expo
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['pawfectmatch://', 'https://pawfectmatch.com'],
  config: {
    screens: {
      MainTabs: 'main',
      Chat: 'chat/:matchId',
      Premium: 'premium',
      SubscriptionManager: 'subscription/manage',
      SubscriptionSuccess: 'subscription/success',
      AIBio: 'ai/bio',
      AIPhotoAnalyzer: 'ai/photo-analyzer',
      AICompatibility: 'ai/compatibility',
      AdminDashboard: 'admin',
    }
  },
  // Custom function to parse deep links that don't match route configuration
  async getInitialURL() {
    const url = await Linking.getInitialURL();
    if (url != null) {
      // Handle special deep links that don't match route configuration
      if (url.startsWith('pawfectmatch://subscription/success')) {
        const sessionId = url.includes('?') ?
          new URLSearchParams(url.split('?')[1]).get('session_id') :
          undefined;

        return `subscription/success?sessionId=${sessionId || ''}`;
      }
    }
    return url;
  },
  // Listen for URL changes
  subscribe(listener) {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      listener(url);
    });
    return () => { subscription.remove(); };
  },
};

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        // Pre-load fonts, make any API calls you need to do here
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        logger.warn('App preparation failed', { error: e });
      } finally {
        // Tell the application to render
        setIsReady(true);
      }
    };

    prepare();
  }, []);

  if (!isReady) {
    return null; // or a splash screen
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <NotificationProvider>
            <NavigationContainer linking={linking}>
              <RootNavigator />
              <CallManager />
            </NavigationContainer>
            <StatusBar style="auto" />
          </NotificationProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}