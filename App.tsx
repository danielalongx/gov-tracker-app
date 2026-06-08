import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  loadPreferences,
  loadDisclaimerAccepted,
} from './src/utils/storage';
import DisclaimerScreen from './src/screens/DisclaimerScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import MainNavigator from './src/navigation/MainNavigator';
import { Colors } from './src/theme';
import { LanguageProvider } from './src/i18n/LanguageContext';

type AppState = 'loading' | 'disclaimer' | 'onboarding' | 'main';

export default function App() {
  const [appState, setAppState] = useState<AppState>('loading');

  useEffect(() => {
    Promise.all([loadDisclaimerAccepted(), loadPreferences()])
      .then(([disclaimerOk, prefs]) => {
        if (!disclaimerOk) setAppState('disclaimer');
        else if (!prefs) setAppState('onboarding');
        else setAppState('main');
      })
      .catch(() => setAppState('disclaimer'));
  }, []);

  // After disclaimer is accepted, check whether onboarding has been done too.
  const handleDisclaimerAccepted = () => {
    loadPreferences()
      .then(prefs => setAppState(prefs ? 'main' : 'onboarding'))
      .catch(() => setAppState('onboarding'));
  };

  if (appState === 'loading') {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.accentBlue} />
      </View>
    );
  }

  if (appState === 'disclaimer') {
    return (
      <LanguageProvider>
        <SafeAreaProvider>
          <DisclaimerScreen onAccept={handleDisclaimerAccepted} />
        </SafeAreaProvider>
      </LanguageProvider>
    );
  }

  if (appState === 'onboarding') {
    return (
      <LanguageProvider>
        <SafeAreaProvider>
          <OnboardingScreen onComplete={() => setAppState('main')} />
        </SafeAreaProvider>
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <MainNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
