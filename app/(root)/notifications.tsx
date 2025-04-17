import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons';

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: string;
  timestamp: number;
  isRead: boolean;
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const storedNotifications = await AsyncStorage.getItem('notifications');
      if (storedNotifications) {
        setNotifications(JSON.parse(storedNotifications));
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const markAsRead = async (id: string) => {
    try {
      const updatedNotifications = notifications.map(notification => 
        notification.id === id ? { ...notification, isRead: true } : notification
      );
      await AsyncStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      setNotifications(updatedNotifications);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await AsyncStorage.removeItem('notifications');
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'budget':
        return 'wallet';
      case 'bills':
        return 'receipt';
      case 'savings':
        return 'save';
      case 'investment':
        return 'trending-up';
      case 'expense':
        return 'cash';
      case 'achievement':
        return 'trophy';
      default:
        return 'notifications';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ago`;
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <View className="flex-1 bg-[#1F2630]">
      <View className="flex-row items-center gap-4 px-5 pt-12 pb-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#7b80ff" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-rubik-medium">Notifications</Text>
        {notifications.length > 0 && (
          <TouchableOpacity onPress={clearAllNotifications}>
            <Text className="text-[#7b80ff] font-rubik">Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        className="flex-1 px-5"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {notifications.length === 0 ? (
          <View className="flex-1 items-center justify-center mt-10">
            <Ionicons name="notifications-off" size={48} color="#6b7280" />
            <Text className="text-[#6b7280] font-rubik mt-4">No notifications yet</Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              onPress={() => markAsRead(notification.id)}
              className={`flex-row items-start p-4 mb-2 rounded-lg ${
                notification.isRead ? 'bg-[#2A313C]' : 'bg-[#7b80ff20]'
              }`}
            >
              <View className="bg-[#7b80ff20] p-2 rounded-full mr-3">
                <Ionicons
                  name={getNotificationIcon(notification.type)}
                  size={20}
                  color="#7b80ff"
                />
              </View>
              <View className="flex-1">
                <Text className="text-white font-rubik-medium">{notification.title}</Text>
                <Text className="text-[#6b7280] font-rubik text-sm mt-1">
                  {notification.body}
                </Text>
                <Text className="text-[#6b7280] font-rubik text-xs mt-2">
                  {formatTimestamp(notification.timestamp)}
                </Text>
              </View>
              {!notification.isRead && (
                <View className="w-2 h-2 rounded-full bg-[#7b80ff] mt-1" />
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
} 