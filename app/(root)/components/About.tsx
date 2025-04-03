import { View, Text, TouchableOpacity, Image, ScrollView, SafeAreaView, Linking } from 'react-native';
import React from 'react';
import icons from '@/constants/icons';
import images from '@/constants/images';

interface AboutProps {
  onClose: () => void;
}

const About = ({ onClose }: AboutProps) => {
  const handleLinkPress = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#1f2630]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 mt-8">
        <TouchableOpacity onPress={onClose} className="flex-row items-center">
          <Image source={icons.backArrow} className="size-6 mr-4" tintColor="#7b80ff" />
          <Text className="text-primary font-rubik-medium text-lg">About</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1 px-6" 
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* App Info */}
        <View className="bg-[#3E4D67] p-6 rounded-xl mb-6 items-center">
          <Image source={images.icon} className="size-20 mb-4" />
          <Text className="text-white font-rubik-bold text-xl mb-2">MoneyApp</Text>
          <Text className="text-[#9aa0a6] font-rubik text-center mb-4">
            Your personal finance companion for tracking expenses, managing savings, and achieving financial goals.
          </Text>
          <Text className="text-[#7b80ff] font-rubik">Version 1.0.0</Text>
        </View>

        {/* Features */}
        <View className="bg-[#3E4D67] p-6 rounded-xl mb-6">
          <Text className="text-white font-rubik-bold text-lg mb-4">Key Features</Text>
          
          <View className="space-y-4">
            <View className="flex-row items-start">
              <View className="bg-[#7b80ff] p-2 rounded-full mr-3">
                <Image source={icons.expense} className="size-4" tintColor="#ffffff" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-rubik-medium">Expense Tracking</Text>
                <Text className="text-[#9aa0a6] font-rubik text-sm">
                  Easily track and categorize your daily expenses
                </Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <View className="bg-[#7b80ff] p-2 rounded-full mr-3">
                <Image source={icons.wallet} className="size-4" tintColor="#ffffff" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-rubik-medium">Savings Management</Text>
                <Text className="text-[#9aa0a6] font-rubik text-sm">
                  Set and track your savings goals with visual progress
                </Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <View className="bg-[#7b80ff] p-2 rounded-full mr-3">
                <Image source={icons.chart} className="size-4" tintColor="#ffffff" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-rubik-medium">Financial Analytics</Text>
                <Text className="text-[#9aa0a6] font-rubik text-sm">
                  Get insights into your spending patterns and financial health
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Links */}
        <View className="bg-[#3E4D67] p-6 rounded-xl mb-6">
          <Text className="text-white font-rubik-bold text-lg mb-4">Quick Links</Text>
          
          <TouchableOpacity 
            onPress={() => handleLinkPress('https://moneyapp.com/privacy')}
            className="flex-row items-center justify-between py-3 border-b border-[#4a5a7a]"
          >
            <Text className="text-white font-rubik-medium">Privacy Policy</Text>
            <Image source={icons.rightArrow} className="size-4" tintColor="#7b80ff" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => handleLinkPress('https://moneyapp.com/terms')}
            className="flex-row items-center justify-between py-3 border-b border-[#4a5a7a]"
          >
            <Text className="text-white font-rubik-medium">Terms of Service</Text>
            <Image source={icons.rightArrow} className="size-4" tintColor="#7b80ff" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => handleLinkPress('https://moneyapp.com/support')}
            className="flex-row items-center justify-between py-3"
          >
            <Text className="text-white font-rubik-medium">Support</Text>
            <Image source={icons.rightArrow} className="size-4" tintColor="#7b80ff" />
          </TouchableOpacity>
        </View>

        {/* Credits */}
        <View className="bg-[#3E4D67] p-6 rounded-xl mb-6">
          <Text className="text-white font-rubik-bold text-lg mb-4">Credits</Text>
          <Text className="text-[#9aa0a6] font-rubik text-center">
            Icons provided by{' '}
            <Text 
              className="text-[#7b80ff]"
              onPress={() => handleLinkPress('https://icons8.com')}
            >
              Icons8
            </Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default About; 