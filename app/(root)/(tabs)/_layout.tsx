import { Tabs } from 'expo-router'
import React from 'react'
import icons from '@/constants/icons'
import TabIcon from '../components/TabIcon'
import { useGlobalSearchParams } from 'expo-router'

export default function TabsLayout() {
  const { showAllExpenses } = useGlobalSearchParams();
  
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#1f2630',
          position: 'absolute',
          borderTopColor: '#0061FF1A',
          borderTopWidth: 0.2,
          minHeight: 70,
          display: showAllExpenses === 'true' ? 'none' : 'flex',
          height: showAllExpenses === 'true' ? 0 : 70,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={icons.home} focused={focused} title="Home" />
          ),
        }}
      />
      <Tabs.Screen
        name="invest"
        options={{
          title: 'Invest',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={icons.invest} focused={focused} title="Invest" />
          ),
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          title: 'News',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={icons.news} focused={focused} title="News" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={icons.person} focused={focused} title="Profile" />
          ),
        }}
      />
    </Tabs>
  )
}