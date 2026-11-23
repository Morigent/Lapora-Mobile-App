import {
  Caveat_400Regular,
  Caveat_700Bold,
} from '@expo-google-fonts/caveat';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import {
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/authStore';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colors, isDark } = useTheme();
  const scheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const profile = useAuthStore((state) => state.profile);
  const hydrated = useAuthStore((state) => state.hydrated);
  const hydrate = useAuthStore((state) => state.hydrate);

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_800ExtraBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_500Medium,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Caveat_400Regular,
    Caveat_700Bold,
  });

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (fontsLoaded && hydrated) SplashScreen.hideAsync();
  }, [fontsLoaded, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const inAuth = segments[0] === '(auth)';
    if (!profile && !inAuth) router.replace('/(auth)/login');
    else if (profile && inAuth) router.replace('/(tabs)/home');
  }, [profile, hydrated, segments, router]);

  if (!fontsLoaded || !hydrated) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <View style={[styles.root, { backgroundColor: colors.paper }]}>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.paper },
              animation: scheme === 'dark' ? 'fade' : 'slide_from_right',
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
            <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
            <Stack.Screen name="report/camera" options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="report/preview" />
            <Stack.Screen name="report/confirm-location" />
            <Stack.Screen name="report/accuracy" />
            <Stack.Screen name="report/details" />
            <Stack.Screen name="report/uploading" options={{ gestureEnabled: false, animation: 'fade' }} />
            <Stack.Screen name="report/failed" />
            <Stack.Screen name="report/gps-failed" />
            <Stack.Screen name="report/success" options={{ gestureEnabled: false, animation: 'fade' }} />
            <Stack.Screen name="report/[id]" />
            <Stack.Screen name="+not-found" />
          </Stack>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
