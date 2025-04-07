import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, SafeAreaView, StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';
import { useGlobalContext } from '@/lib/global-provider';
import { settings } from '@/constants/data';
import MySavings from '../components/MySavings';
import Payments from '../components/Payments';
import DownloadData from '../components/DownloadData';
import Calendar from '../components/Calendar';
import InviteFriends from '../components/InviteFriends';
import About from '../components/About';
import { logout } from '@/lib/appwrite';
import Trends from '@/app/(root)/components/Trends';

const { width } = Dimensions.get('window');

const Profile = () => {
  const { user } = useGlobalContext();
  const [activeScreen, setActiveScreen] = useState<string | null>(null);
  const [showTrends, setShowTrends] = useState(false);

  const handleCloseScreen = () => {
    setActiveScreen(null);
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'my-savings':
        return <MySavings onClose={handleCloseScreen} />;
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
                onPress={logout}
                style={styles.logoutButton}
                activeOpacity={0.7}
              >
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>

            {/* User Info Card */}
            <View style={styles.userCard}>
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: user?.avatar || 'https://via.placeholder.com/100' }}
                  style={styles.avatar}
                />
                <TouchableOpacity style={styles.editAvatarButton} activeOpacity={0.7}>
                  <Text style={styles.editAvatarText}>✎</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.userName}>{user?.name || 'User Name'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
              
              {/* Stats Row */}
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>$12,450</Text>
                  <Text style={styles.statLabel}>Balance</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>$2,150</Text>
                  <Text style={styles.statLabel}>Savings</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>$850</Text>
                  <Text style={styles.statLabel}>Invested</Text>
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
              <TouchableOpacity style={styles.quickActionButton} activeOpacity={0.7}>
                <View style={styles.quickActionIcon}>
                  <Text style={styles.quickActionIconText}>⚙️</Text>
                </View>
                <Text style={styles.quickActionText}>Settings</Text>
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
});

export default Profile;