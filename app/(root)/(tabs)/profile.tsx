import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, SafeAreaView, StyleSheet, Dimensions, Platform, StatusBar, ActivityIndicator, Alert, Linking } from 'react-native';
import { useGlobalContext } from '@/lib/global-provider';
import { settings } from '@/constants/data';
import MySavings from '../components/MySavings';
import Payments from '../components/Payments';
import DownloadData from '../components/DownloadData';
import Calendar from '../components/Calendar';
import InviteFriends from '../components/InviteFriends';
import About from '../components/About';
import { logout, client, account, storage } from '@/lib/appwrite';
import Trends from '@/app/(root)/components/Trends';
import { useUserContext } from '../context/UserContext';
import { useExpenses } from '../context/ExpenseContext';
import * as ImagePicker from 'expo-image-picker';
import { updateUser } from '@/lib/appwrite';
import { ID, Storage } from 'react-native-appwrite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');  

export const config = {
  bucketid: process.env.EXPO_PUBLIC_STORAGE_BUCKET_ID,
}


const Profile = () => {
  const { user, setUser, logout: globalLogout } = useGlobalContext();
  const { savings, setUserContext } = useUserContext();
  const { expenses } = useExpenses();
  const [activeScreen, setActiveScreen] = useState<string | null>(null);
  const [showTrends, setShowTrends] = useState(false);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);

  // Calculate total expenditure from expenses
  const calculateTotalExpenditure = () => {
    return expenses.reduce((total, expense) => {
      const amount = parseFloat(expense.amount);
      return expense.type === 'expense' ? total + amount : total;
    }, 0);
  };

  const handleCloseScreen = () => {
    setActiveScreen(null);
  };

  const pickImage = async () => {
    try {
      setIsUpdatingAvatar(true);
      
      // Add debug logging for bucket ID
      console.log('[Profile] Using bucket ID:', config.bucketid);
      
      if (!config.bucketid) {
        throw new Error('Storage bucket ID is not configured. Please check your .env.local file.');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        const image = result.assets[0];
        const imageUrl = image.uri;
        try {
          console.log('[Profile] Attempting to upload file to storage...');
          const file = await storage.createFile(
            config.bucketid,
            'unique()',
            {
              uri: imageUrl,
              name: 'profile.jpg',
              type: 'image/jpeg',
              size: image.fileSize || 0
            }
          );

          if (file) {
            console.log('[Profile] File uploaded successfully:', file.$id);
            const fileUrl = storage.getFileView(config.bucketid, file.$id);
            console.log('[Profile] Generated file URL:', fileUrl);

            try {
              console.log('[Profile] Attempting to update user with new avatar...');
              const updatedUser = await updateUser({
                ...user,
                avatar: fileUrl.href || fileUrl.toString(), // Use href if available
              });
              
              if (updatedUser) {
                console.log('[Profile] User updated successfully');
                setUser(updatedUser);
                setUserContext(updatedUser);
                Alert.alert('Success', 'Profile picture updated successfully!');
              } else {
                throw new Error('Failed to update user profile');
              }
            } catch (userUpdateError: any) {
              console.error('[Profile] Error updating user:', userUpdateError);
              console.error('[Profile] Error details:', {
                message: userUpdateError?.message,
                response: userUpdateError?.response,
                code: userUpdateError?.code
              });
              
              // Delete the uploaded file since we couldn't update the user
              try {
                await storage.deleteFile(config.bucketid, file.$id);
                console.log('[Profile] Cleaned up uploaded file due to user update failure');
              } catch (deleteError) {
                console.error('[Profile] Error cleaning up file:', deleteError);
              }

              Alert.alert(
                'Update Failed',
                'Failed to update profile picture. Please try again.'
              );
            }
          }
        } catch (uploadError: any) {
          console.error('[Profile] Error uploading to bucket:', uploadError);
          console.error('[Profile] Upload error details:', {
            message: uploadError?.message,
            response: uploadError?.response,
            code: uploadError?.code
          });
          Alert.alert(
            'Upload Failed',
            'Failed to upload profile picture. Please ensure the storage bucket ID is correctly configured.'
          );
        }
      }
    } catch (error: any) {
      console.error('[Profile] Error:', error?.message || 'Unknown error');
      Alert.alert('Error', error?.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUpdatingAvatar(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      await globalLogout();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'my-savings':
        return (
          <SafeAreaView style={{ flex: 1, backgroundColor: '#1f2630' }}>
            <MySavings onClose={handleCloseScreen} />
          </SafeAreaView>
        );
      case 'payments':
        return <Payments onClose={handleCloseScreen} />;
      case 'download-data':
        return <DownloadData onClose={handleCloseScreen} />;
      case 'calendar':
        return <Calendar onClose={handleCloseScreen} />;
      case 'invite-friends':
        return <InviteFriends onClose={handleCloseScreen} />;
      case 'about':
        return <About onClose={handleCloseScreen} />;
      default:
        return null;
    }
  };

  const SettingsItem = ({ icon, title, route, onPress }: { icon: string; title: string; route: string; onPress: () => void }) => (
    <TouchableOpacity
      onPress={onPress}
      style={styles.settingsItem}
      activeOpacity={0.7}
    >
      <View style={styles.settingsIconContainer}>
        <Text style={styles.settingsIcon}>{icon}</Text>
      </View>
      <Text style={styles.settingsText}>{title}</Text>
      <Text style={styles.settingsArrow}>›</Text>
    </TouchableOpacity>
  );

  if (activeScreen) {
    return renderScreen();
  }

  return (
    <SafeAreaView style={styles.container}>
      {showTrends ? (
        <Trends onClose={() => setShowTrends(false)} />
      ) : (
        <View style={styles.safeArea}>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Profile</Text>
              <TouchableOpacity 
                onPress={handleLogout}
                style={styles.logoutButton}
                activeOpacity={0.7}
              >
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>

            {/* User Info Card */}
            <View style={styles.userCard}>
              <View style={styles.avatarContainer}>
                {user?.avatar ? (
                  <Image
                    source={{ uri: user.avatar }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={[styles.avatar, styles.avatarFallback]}>
                    <Text style={styles.avatarFallbackText}>
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </Text>
                  </View>
                )}
                <TouchableOpacity 
                  style={styles.editAvatarButton} 
                  activeOpacity={0.7}
                  onPress={pickImage}
                  disabled={isUpdatingAvatar}
                >
                  {isUpdatingAvatar ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.editAvatarText}>✎</Text>
                  )}
                </TouchableOpacity>
              </View>
              <Text style={styles.userName}>{user?.name || 'User Name'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
              
              {/* Stats Row */}
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>₹{calculateTotalExpenditure().toLocaleString()}</Text>
                  <Text style={styles.statLabel}>Total Expense</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>₹{savings.toLocaleString()}</Text>
                  <Text style={styles.statLabel}>Savings</Text>
                </View>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity 
                style={styles.quickActionButton} 
                activeOpacity={0.7}
                onPress={() => setActiveScreen('my-savings')}
              >
                <View style={styles.quickActionIcon}>
                  <Text style={styles.quickActionIconText}>💰</Text>
                </View>
                <Text style={styles.quickActionText}>My Savings</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickActionButton} 
                activeOpacity={0.7}
                onPress={() => setActiveScreen('payments')}
              >
                <View style={styles.quickActionIcon}>
                  <Text style={styles.quickActionIconText}>💳</Text>
                </View>
                <Text style={styles.quickActionText}>Payments</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickActionButton} 
                activeOpacity={0.7}
                onPress={() => setShowTrends(true)}
              >
                <View style={styles.quickActionIcon}>
                  <Text style={styles.quickActionIconText}>📈</Text>
                </View>
                <Text style={styles.quickActionText}>Trends</Text>
              </TouchableOpacity>
            </View>

            {/* Settings Section */}
            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>Settings</Text>
              <View style={styles.settingsList}>
                {settings.map((item) => (
                  <SettingsItem
                    key={item.id}
                    icon={item.icon}
                    title={item.title}
                    route={item.route}
                    onPress={() => setActiveScreen(item.route)}
                  />
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2630',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  userCard: {
    backgroundColor: 'rgba(123, 128, 255, 0.1)',
    margin: 20,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(123, 128, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#7b80ff',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#7b80ff',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1F2630',
  },
  editAvatarText: {
    color: '#fff',
    fontSize: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
    fontFamily: 'Barlow',
  },
  statLabel: {
    fontFamily: 'Rubik',
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginBottom: 30,
    fontFamily: 'Rubik',
  },
  quickActionButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(123, 128, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(123, 128, 255, 0.2)',
    width: '30%',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(123, 128, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionIconText: {
    fontSize: 24,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  settingsSection: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
    fontFamily: 'Rubik',
  },
  settingsList: {
    backgroundColor: 'rgba(123, 128, 255, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(123, 128, 255, 0.2)',
    overflow: 'hidden',
    fontFamily: 'Rubik',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  settingsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(123, 128, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingsIcon: {
    fontSize: 20,
    color: '#7b80ff',
  },
  settingsText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  settingsArrow: {
    fontSize: 24,
    color: 'rgba(255,255,255,0.5)',
    marginLeft: 8,
  },
  avatarFallback: {
    backgroundColor: '#2d3748',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'Barlow-SemiBold',
  },
});

const convertImageToBase64 = async (uri: string): Promise<string> => {
  const response = await fetch(uri);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error('Failed to convert image to base64'));
      }
    };
    reader.readAsDataURL(blob);
  });
};

export default Profile;