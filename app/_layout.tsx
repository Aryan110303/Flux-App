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
import { StyleSheet, View, Platform } from "react-native";
import { DebtProvider } from './(root)/context/DebtContext'
import DevTools from './(root)/components/DevTools'
import { Slot, useRouter, useSegments } from 'expo-router';
import { checkSession, getCurrentUser, logout } from '../lib/appwrite';
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
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const hasSession = await checkSession();
        if (hasSession) {
          const currentUser = await getCurrentUser();
          if (currentUser) {
            console.log('[Layout] Session found, user authenticated:', currentUser.$id);
            
            // Check if this is a new user by looking for any previous data
            const onboardingFlag = await AsyncStorage.getItem(`onboardingCompleted_${currentUser.$id}`);
            const hasUserData = await AsyncStorage.getItem(`user_data_${currentUser.$id}`);
            
            // Set as new user if we've never seen this user ID before
            const newUser = onboardingFlag === null && hasUserData === null;
            setIsNewUser(newUser);
            console.log('[Layout] User is new?', newUser);
            
            setUser(currentUser);
          } else {
            console.log('[Layout] Session found but no user, clearing session');
            await logout();
          }
        } else {
          console.log('[Layout] No active session found');
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
    const checkOnboarding = async () => {
      if (user && user.$id) {
        try {
          const val = await AsyncStorage.getItem(`onboardingCompleted_${user.$id}`);
          console.log('[Layout] Onboarding status for user:', user.$id, 'is', val);
          
          // Only show onboarding if it's a new user (as determined in checkAuth)
          // or if the onboarding flag is explicitly set to "false"
          if (isNewUser) {
            setIsOnboardingCompleted(false);
          } else {
            // For existing users, only show onboarding if explicitly marked as not completed
            setIsOnboardingCompleted(val === "false" ? false : true);
          }
        } catch (error) {
          console.error('Error checking onboarding status:', error);
          // Default to completed in case of error
          setIsOnboardingCompleted(true);
        }
      } else {
        setIsOnboardingCompleted(null);
      }
    };
    
    checkOnboarding();
  }, [user, isNewUser]);

  const handleOnboardingComplete = async () => {
    if (user && user.$id) {
      try {
        // Mark onboarding as completed
        await AsyncStorage.setItem(`onboardingCompleted_${user.$id}`, 'true');
        // Also set a flag to indicate we've seen this user before
        await AsyncStorage.setItem(`user_data_${user.$id}`, 'exists');
        
        console.log('[Layout] Onboarding marked as completed for user:', user.$id);
        setIsOnboardingCompleted(true);
        setIsNewUser(false);
      } catch (error) {
        console.error('Error saving onboarding status:', error);
      }
    }
  };

  // Show onboarding only if:
  // 1. User is signed in, AND
  // 2. Either it's a new user OR onboarding is explicitly set to false
  if (user && (isNewUser || isOnboardingCompleted === false)) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <ToastProvider>
      <UserProvider userId={user?.$id}>
        <ExpenseProvider userId={user?.$id}>
          <DebtProvider userId={user?.$id}>
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
        // Keep the splash screen visible while we fetch resources
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
  tabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 20 : 16,
    left: 20,
    right: 20,
    elevation: 0,
    backgroundColor: '#1F2937',
    borderRadius: 15,
    height: 70,
  },
});