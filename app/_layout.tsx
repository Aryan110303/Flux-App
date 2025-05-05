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
import { StyleSheet, View, Platform, Text, Alert } from "react-native"; // Added Alert
import { DebtProvider } from './(root)/context/DebtContext'
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react'; // Add this import
import { checkSession } from "@/lib/appwrite";
import { getCurrentUser } from "@/lib/appwrite";

// Add this debug function at the top
const logError = (error: any, componentStack: string) => {
  const errorMessage = `Error: ${error}\nComponent Stack: ${componentStack}`;
  console.error(errorMessage);
  // This will show the error on screen in production
  Alert.alert('App Error', errorMessage);
};

// New ErrorBoundary implementation
class ErrorBoundary extends React.Component<{ children: React.ReactNode }> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    logError(error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong!</Text>
          <Text style={styles.errorDetails}>
            {this.state.error && String(this.state.error)}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const { user, setUser } = useGlobalContext();
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      try {
        console.log('[Production] App initializing...');
        // Test AsyncStorage
        await AsyncStorage.setItem('test-key', 'test-value');
        await AsyncStorage.getItem('test-key');
        console.log('[Production] AsyncStorage working');
        
        // Your existing initialization code...
        const checkAuth = async () => {
          try {
            const hasSession = await checkSession();
            if (hasSession) {
              const currentUser = await getCurrentUser();
              if (currentUser) {
                console.log('[Production] User authenticated:', currentUser.$id);
                setUser(currentUser);
              }
            }
          } catch (error) {
            logError(error, 'Authentication check failed');
          } finally {
            setIsLoading(false);
          }
        };
        
        await checkAuth();
      } catch (error) {
        logError(error, 'App initialization failed');
        setIsLoading(false);
      }
    };

    initApp();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading app...</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <ToastProvider>
        <UserProvider>
          <ExpenseProvider>
            <DebtProvider>
              <StatusBar style="light" backgroundColor="#1f2630" />
              <Stack screenOptions={{headerShown: false}} />
            </DebtProvider>
          </ExpenseProvider>
        </UserProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Barlow-Regular': require('../assets/fonts/BarlowCondensed-Regular.ttf'),
    'Barlow-SemiBold': require('../assets/fonts/BarlowCondensed-SemiBold.ttf'),
    'Barlow-Bold': require('../assets/fonts/BarlowCondensed-Medium.ttf'),
  });

  useEffect(() => {
    const prepare = async () => {
      try {
        console.log('[Production] Loading fonts...');
        await SplashScreen.preventAutoHideAsync();
        if (fontsLoaded) {
          console.log('[Production] Fonts loaded successfully');
          await SplashScreen.hideAsync();
        }
      } catch (e) {
        logError(e, 'Font loading failed');
      }
    };
    prepare();
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading resources...</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.container}>
        <GlobalProvider>
          <AppContent />
        </GlobalProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

// Add these new styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    marginBottom: 10,
  },
  errorDetails: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});