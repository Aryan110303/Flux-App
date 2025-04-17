import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Notification categories
export enum NotificationType {
  BUDGET_ALERT = 'BUDGET_ALERT',
  BILL_REMINDER = 'BILL_REMINDER',
  SAVINGS_MILESTONE = 'SAVINGS_MILESTONE',
  INVESTMENT_ALERT = 'INVESTMENT_ALERT',
  EXPENSE_INSIGHT = 'EXPENSE_INSIGHT',
  ACHIEVEMENT = 'ACHIEVEMENT'
}

// Notification priority levels
export enum NotificationPriority {
  HIGH = 'high',
  DEFAULT = 'default',
  LOW = 'low'
}

// Notification interface
interface NotificationData {
  type: NotificationType;
  title: string;
  body: string;
  priority: NotificationPriority;
  data?: any;
}

class NotificationService {
  private static instance: NotificationService;

  private constructor() {
    this.initialize();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async initialize() {
    // Request permissions
    await this.requestPermissions();

    // Configure notification behavior
    await Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Set notification categories with actions
    if (Platform.OS === 'ios') {
      await Notifications.setNotificationCategoryAsync('actions', [
        {
          identifier: 'view',
          buttonTitle: 'View',
          options: {
            opensAppToForeground: true,
          },
        },
      ]);
    }
  }

  private async requestPermissions() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      await AsyncStorage.setItem('notificationsDisabled', 'true');
      return false;
    }
    
    await AsyncStorage.setItem('notificationsDisabled', 'false');
    return true;
  }

  // Schedule budget alerts
  async scheduleBudgetAlert(currentSpending: number, budgetLimit: number) {
    const percentage = (currentSpending / budgetLimit) * 100;
    
    if (percentage >= 80 && percentage < 90) {
      await this.scheduleNotification({
        type: NotificationType.BUDGET_ALERT,
        title: 'Budget Alert 🚨',
        body: `You've used ${percentage.toFixed(0)}% of your monthly budget. Time to slow down!`,
        priority: NotificationPriority.HIGH
      });
    }
  }

  // Schedule bill reminders
  async scheduleBillReminder(billName: string, dueDate: Date, amount: number) {
    const threeDaysBefore = new Date(dueDate);
    threeDaysBefore.setDate(dueDate.getDate() - 3);
    
    await this.scheduleNotification({
      type: NotificationType.BILL_REMINDER,
      title: 'Upcoming Bill Payment 📅',
      body: `Your ${billName} bill of ₹${amount} is due in 3 days`,
      priority: NotificationPriority.HIGH
    }, threeDaysBefore);
  }

  // Notify savings milestones
  async notifySavingsMilestone(savedAmount: number, goalAmount: number) {
    const percentage = (savedAmount / goalAmount) * 100;
    
    if (percentage === 50 || percentage === 75 || percentage === 100) {
      await this.scheduleNotification({
        type: NotificationType.SAVINGS_MILESTONE,
        title: 'Savings Milestone! 🎉',
        body: `Amazing! You've saved ${percentage}% of your goal amount!`,
        priority: NotificationPriority.DEFAULT
      });
    }
  }

  // Send expense insights
  async sendExpenseInsight(category: string, currentAmount: number, previousAmount: number) {
    const percentageChange = ((currentAmount - previousAmount) / previousAmount) * 100;
    
    if (Math.abs(percentageChange) >= 50) {
      await this.scheduleNotification({
        type: NotificationType.EXPENSE_INSIGHT,
        title: 'Spending Pattern Alert 📊',
        body: `Your ${category} spending is ${percentageChange > 0 ? 'up' : 'down'} by ${Math.abs(percentageChange).toFixed(0)}% compared to last month`,
        priority: NotificationPriority.DEFAULT
      });
    }
  }

  // Schedule achievement notifications
  async notifyAchievement(achievement: string) {
    await this.scheduleNotification({
      type: NotificationType.ACHIEVEMENT,
      title: 'New Achievement! 🏆',
      body: achievement,
      priority: NotificationPriority.DEFAULT
    });
  }

  // Core notification scheduling method
  private async scheduleNotification(
    notification: NotificationData,
    scheduledDate?: Date
  ) {
    try {
      const isDisabled = await AsyncStorage.getItem('notificationsDisabled');
      if (isDisabled === 'true') return;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: { type: notification.type, ...notification.data },
          sound: true,
          priority: notification.priority,
        },
        trigger: scheduledDate ? {
          seconds: Math.floor((scheduledDate.getTime() - Date.now()) / 1000),
          repeats: false
        } as any : null,
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  // Cancel all pending notifications
  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}

export default NotificationService; 