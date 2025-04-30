import { Stack } from "expo-router";
import "./global.css";
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { GlobalProvider, useGlobalContext } from "@/lib/global-provider";
import { StatusBar } from "expo-status-bar";
import { UserProvider } from './(root)/context/UserContext';
import { ExpenseProvider } from './(root)/context/ExpenseContext'
import { ToastProvider } from './(root)/context/ToastContext'
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, View } from "react-native";
import { DebtProvider } from './(root)/context/DebtContext'
import DevTools from './(root)/components/DevTools'
import { Slot, useRouter, useSegments } from 'expo-router';
import { checkSession, getCurrentUser } from '../lib/appwrite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Onboarding from './(root)/components/Onboarding';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { user, setUser } = useGlobalContext();
  const segments = useSegments();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const hasSession = await checkSession();
        if (hasSession) {
          const currentUser = await getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const inAuthGroup = segments[0] === 'sign-in';
    if (!isLoading) {
      if (!user && !inAuthGroup) {
        router.replace('/sign-in');
      } else if (user && inAuthGroup) {
        router.replace('/');
      }
    }
  }, [user, segments, isLoading]);

  useEffect(() => {
    // Check onboarding status for the current user
    if (user && user.$id) {
      AsyncStorage.getItem(`onboardingCompleted_${user.$id}`).then(val => {
        setIsOnboardingCompleted(val === 'true');
      });
    } else {
      setIsOnboardingCompleted(null);
    }
  }, [user]);

  const handleOnboardingComplete = async () => {
    if (user && user.$id) {
      await AsyncStorage.setItem(`onboardingCompleted_${user.$id}`, 'true');
      setIsOnboardingCompleted(true);
    }
  };

  // Show onboarding only if user is signed in and onboarding is not completed for this user
  if (user && isOnboardingCompleted === false) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <ToastProvider>
      <UserProvider userId={user?.$id}>
        <ExpenseProvider userId={user?.$id}>
          <DebtProvider>
            <StatusBar style="light" backgroundColor="#1f2630" />
            <Stack screenOptions={{headerShown: false}} />
            <DevTools />
          </DebtProvider>
        </ExpenseProvider>
      </UserProvider>
    </ToastProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Barlow-Regular': require('../assets/fonts/BarlowCondensed-Regular.ttf'),
    'Barlow-SemiBold': require('../assets/fonts/BarlowCondensed-SemiBold.ttf'),
    'Barlow-Bold': require('../assets/fonts/BarlowCondensed-Medium.ttf'),
  });

  useEffect(() => {
    async function prepare() {
      try {
        // Keep the splash screen visible while we prepare the app
        await SplashScreen.preventAutoHideAsync();
        // Wait for fonts to load
        if (fontsLoaded) {
          // Hide the splash screen
          await SplashScreen.hideAsync();
        }
      } catch (e) {
        console.warn(e);
      }
    }
    prepare();
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <GlobalProvider>
        <AppContent />
      </GlobalProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
