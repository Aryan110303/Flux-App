import { View, Text, TouchableOpacity, Image, ScrollView, SafeAreaView, Share, Alert } from 'react-native';
import React from 'react';
import icons from '@/constants/icons';

interface InviteFriendsProps {
  onClose: () => void;
}

const InviteFriends = ({ onClose }: InviteFriendsProps) => {
  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: 'Join me on MoneyApp - Your personal finance companion! Track expenses, manage savings, and achieve your financial goals. Download now: https://moneyapp.com/download',
        title: 'Invite to MoneyApp',
      });
      
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
          Alert.alert('Success', 'Invitation sent successfully!');
        } else {
          // shared
          Alert.alert('Success', 'Invitation sent successfully!');
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share invitation');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#1f2630]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 mt-8">
        <TouchableOpacity onPress={onClose} className="flex-row items-center">
          <Image source={icons.backArrow} className="size-6 mr-4" tintColor="#7b80ff" />
          <Text className="text-primary font-rubik-medium text-lg">Invite Friends</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6">
        {/* Invite Card */}
        <View className="bg-[#3E4D67] p-6 rounded-xl mb-6">
          <Text className="text-white font-rubik-bold text-xl mb-2">Share MoneyApp</Text>
          <Text className="text-[#9aa0a6] font-rubik mb-6">
            Invite your friends to join MoneyApp and help them take control of their finances!
          </Text>
          
          <TouchableOpacity 
            onPress={handleShare}
            className="bg-[#7b80ff] p-4 rounded-xl flex-row items-center justify-center"
          >
            <Image source={icons.share} className="size-5 mr-2" tintColor="#ffffff" />
            <Text className="text-white font-rubik-bold">Share Invitation</Text>
          </TouchableOpacity>
        </View>

        {/* Benefits Section */}
        <View className="bg-[#3E4D67] p-6 rounded-xl mb-6">
          <Text className="text-white font-rubik-bold text-lg mb-4">Why Invite Friends?</Text>
          
          <View className="space-y-4">
            <View className="flex-row items-start">
              <View className="bg-[#7b80ff] p-2 rounded-full mr-3">
                <Image source={icons.rewards} className="size-4" tintColor="#ffffff" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-rubik-medium">Earn Rewards</Text>
                <Text className="text-[#9aa0a6] font-rubik text-sm">
                  Get exclusive rewards for each friend who joins using your invitation
                </Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <View className="bg-[#7b80ff] p-2 rounded-full mr-3">
                <Image source={icons.group} className="size-4" tintColor="#ffffff" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-rubik-medium">Build Community</Text>
                <Text className="text-[#9aa0a6] font-rubik text-sm">
                  Create a network of friends to share financial tips and experiences
                </Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <View className="bg-[#7b80ff] p-2 rounded-full mr-3">
                <Image source={icons.chart} className="size-4" tintColor="#ffffff" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-rubik-medium">Compare Progress</Text>
                <Text className="text-[#9aa0a6] font-rubik text-sm">
                  Track and compare your financial progress with friends
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Referral Stats */}
        <View className="bg-[#3E4D67] p-6 rounded-xl mb-6">
          <Text className="text-white font-rubik-bold text-lg mb-4">Your Referrals</Text>
          
          <View className="flex-row justify-between mb-4">
            <View className="items-center">
              <Text className="text-[#7b80ff] font-rubik-bold text-2xl">0</Text>
              <Text className="text-[#9aa0a6] font-rubik text-sm">Friends Invited</Text>
            </View>
            
            <View className="items-center">
              <Text className="text-[#7b80ff] font-rubik-bold text-2xl">₹0</Text>
              <Text className="text-[#9aa0a6] font-rubik text-sm">Rewards Earned</Text>
            </View>
          </View>

          <Text className="text-[#9aa0a6] font-rubik text-sm text-center">
            Start inviting friends to earn rewards and build your network!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default InviteFriends; 