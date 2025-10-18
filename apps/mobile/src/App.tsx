import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from './theme/ThemeProvider';
import { HomeScreen } from './screens/HomeScreen';

export default function App(): React.ReactElement {
  return (
    <ThemeProvider>
      <StatusBar style="dark" />
      <HomeScreen />
    </ThemeProvider>
  );
}
