import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import * as Notifications from 'expo-notifications';
import { NotificationType } from '@/lib/NotificationService';
import { SafeAreaView } from 'react-native-safe-area-context';
import icons from '@/constants/icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  timestamp: Date;
  isRead: boolean;
}

interface NotificationHandlerProps {
  onClose: () => void;
}

const NotificationHandler: React.FC<NotificationHandlerProps> = ({ onClose }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    // Set up notification handler
    const subscription = Notifications.addNotificationReceivedListener(handleNotification);
    
    // Load existing notifications
    loadNotifications();

    return () => {
      subscription.remove();
    };
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

  const handleNotification = (notification: Notifications.Notification) => {
    const newNotification: NotificationItem = {
      id: Math.random().toString(),
      title: notification.request.content.title || '',
      body: notification.request.content.body || '',
      type: notification.request.content.data?.type || NotificationType.BUDGET_ALERT,
      timestamp: new Date(),
      isRead: false,
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      // Store updated notifications
      AsyncStorage.setItem('notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      );
      AsyncStorage.setItem('notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const clearAll = () => {
    setNotifications([]);
    AsyncStorage.setItem('notifications', '[]');
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.BUDGET_ALERT:
        return '🚨';
      case NotificationType.BILL_REMINDER:
        return '📅';
      case NotificationType.SAVINGS_MILESTONE:
        return '🎉';
      case NotificationType.INVESTMENT_ALERT:
        return '📈';
      case NotificationType.EXPENSE_INSIGHT:
        return '📊';
      case NotificationType.ACHIEVEMENT:
        return '🏆';
      default:
        return '📌';
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Image source={icons.backArrow} style={styles.backIcon} tintColor="#7b80ff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {notifications.length > 0 && (
          <TouchableOpacity onPress={clearAll} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No notifications yet</Text>
          <Text style={styles.emptySubtext}>We'll notify you about important updates and reminders</Text>
        </View>
      ) : (
        <ScrollView style={styles.notificationList}>
          {notifications.map(notification => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationItem,
                notification.isRead && styles.notificationItemRead
              ]}
              onPress={() => markAsRead(notification.id)}
            >
              <Text style={styles.notificationIcon}>
                {getNotificationIcon(notification.type)}
              </Text>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>{notification.title}</Text>
                <Text style={styles.notificationBody}>{notification.body}</Text>
                <Text style={styles.notificationTime}>
                  {formatTimestamp(notification.timestamp)}
                </Text>
              </View>
              {!notification.isRead && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2630',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(123, 128, 255, 0.2)',
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Rubik-Medium',
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    color: '#7b80ff',
    fontSize: 14,
    fontFamily: 'Rubik',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Rubik-Medium',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    fontFamily: 'Rubik',
  },
  notificationList: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(123, 128, 255, 0.1)',
    backgroundColor: 'rgba(123, 128, 255, 0.05)',
  },
  notificationItemRead: {
    backgroundColor: 'transparent',
  },
  notificationIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Rubik-Medium',
    marginBottom: 4,
  },
  notificationBody: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Rubik',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'Rubik',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7b80ff',
    marginLeft: 8,
    alignSelf: 'center',
  },
});

export default NotificationHandler; 