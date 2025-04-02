import { Stack } from "expo-router";
import "./global.css";
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { GlobalProvider } from "@/lib/global-provider";
import { StatusBar } from "expo-status-bar";
import { UserProvider } from './(root)/context/UserContext'
import { ExpenseProvider } from './(root)/context/ExpenseContext'
import { ToastProvider } from './(root)/context/ToastContext'
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";
import { DebtProvider } from './(root)/context/DebtContext'

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  const [fontsLoaded] = useFonts({
    "Rubik": require("../assets/fonts/Rubik-Regular.ttf"),
    "Rubik-Medium": require("../assets/fonts/Rubik-Medium.ttf"),
    "Rubik-Bold": require("../assets/fonts/Rubik-Bold.ttf"),
    "Rubik-Semibold": require("../assets/fonts/Rubik-SemiBold.ttf"),
    "Barlow": require("../assets/fonts/BarlowCondensed-Regular.ttf"),
    "Barlow-Semibold": require("../assets/fonts/BarlowCondensed-SemiBold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      setIsReady(true);
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!isReady) {
    return null;
  }

  return(
    <GestureHandlerRootView style={styles.container}>
      <ToastProvider>
        <UserProvider>
          <ExpenseProvider>
            <DebtProvider>
              <GlobalProvider>
                <StatusBar style="light" backgroundColor="#1f2630" />
                <Stack screenOptions={{headerShown: false}} />
              </GlobalProvider>
            </DebtProvider>
          </ExpenseProvider>
        </UserProvider>
      </ToastProvider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f2630',
  },
});
