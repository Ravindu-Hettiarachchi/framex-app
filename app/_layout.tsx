import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { View, Text, Image, Animated } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

import { useColorScheme } from '@/hooks/use-color-scheme';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [appReady, setAppReady] = useState(false);
  const fadeAnim = new Animated.Value(1);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load any assets or fonts here if needed
        await new Promise(resolve => setTimeout(resolve, 2000)); // Artificial delay for branding
      } catch (e) {
        console.warn(e);
      } finally {
        setAppReady(true);
        SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!appReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0B0B0F', justifyContent: 'center', alignItems: 'center' }}>
        <Image 
          source={require('../assets/images/icon.png')}
          style={{ width: 120, height: 120, borderRadius: 24, marginBottom: 20 }}
        />
        <Text style={{ color: '#F5F1E8', fontSize: 28, fontWeight: '700', letterSpacing: 2 }}>
          FRAMEX
        </Text>
        <Text style={{ color: '#C6A96B', fontSize: 12, marginTop: 8, letterSpacing: 4 }}>
          PHOTOGRAPHY
        </Text>
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0B0B0F' } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="admin-bookings" />
        <Stack.Screen name="admin-packages" />
        <Stack.Screen name="admin-payments" />
        <Stack.Screen name="payment" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal', headerShown: true }} />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
