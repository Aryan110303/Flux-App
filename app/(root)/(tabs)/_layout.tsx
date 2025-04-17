import { Tabs } from 'expo-router'
import React, { useState, useEffect } from 'react'
import icons from '@/constants/icons'
import TabIcon from '../components/TabIcon'
import { useGlobalSearchParams } from 'expo-router'
import { Platform, StyleSheet } from 'react-native'

export default function TabsLayout() {
  const { showAllExpenses } = useGlobalSearchParams();
  const [showAllExpensesState, setShowAllExpensesState] = useState(false);
  
  useEffect(() => {
    setShowAllExpensesState(showAllExpenses === 'true');
  }, [showAllExpenses]);

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: '#1F2630',
          borderTopWidth: 0,
          height: showAllExpensesState ? 0 : 60,
          display: showAllExpensesState ? 'none' : 'flex',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          shadowOpacity: 0,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          overflow: 'hidden',
          ...(Platform.OS === 'ios' && {
            borderTopColor: 'transparent',
          }),
        },
        tabBarActiveTintColor: '#7b80ff',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.5)',
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="invest"
        options={{
          title: 'Invest',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="trending-up" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          title: 'News',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="newspaper" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="person" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  )
}