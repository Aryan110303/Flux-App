import { View, Text, TouchableOpacity, Image, ScrollView, SafeAreaView } from 'react-native';
import React, { useState } from 'react';
import icons from '@/constants/icons';
import { useUserContext } from '../context/UserContext';

interface MySavingsProps {
  onClose: () => void;
}

const MySavings = ({ onClose }: MySavingsProps) => {
  const { savings, salaryYearly, salaryMonthly } = useUserContext();
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');

  // Calculate monthly savings rate
  const monthlyIncome = Number(salaryMonthly) || (salaryYearly ? Number(salaryYearly) / 12 : 0);
  const savingsRate = monthlyIncome > 0 ? (Number(savings) / monthlyIncome) * 100 : 0;

  return (
    <SafeAreaView className="flex-1 bg-[#1f2630]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 mt-8">
        <TouchableOpacity onPress={onClose} className="flex-row items-center">
          <Image source={icons.backArrow} className="size-6 mr-4" tintColor="#7b80ff" />
          <Text className="text-primary font-rubik-medium text-lg">My Savings</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View className="px-6 py-4">
        <View className="flex-row justify-between gap-4">
          <TouchableOpacity 
            className={`py-3 px-4 rounded-full flex-1 items-center ${activeTab === "overview" ? "bg-[#7b80ff]" : "bg-[#3E4D67]"}`}
            onPress={() => setActiveTab("overview")}
          >
            <Text 
              className={`font-rubik-medium text-base ${activeTab === "overview" ? "text-white" : "text-[#9aa0a6]"}`}
            >
              Overview
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`py-3 px-4 rounded-full flex-1 items-center ${activeTab === "history" ? "bg-[#7b80ff]" : "bg-[#3E4D67]"}`}
            onPress={() => setActiveTab("history")}
          >
            <Text 
              className={`font-rubik-medium text-base ${activeTab === "history" ? "text-white" : "text-[#9aa0a6]"}`}
            >
              History
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-6">
        {activeTab === 'overview' ? (
          <View>
            {/* Savings Card */}
            <View className="bg-[#3E4D67] p-6 rounded-xl mb-6">
              <Text className="text-[#9aa0a6] font-rubik text-base mb-2">Total Savings</Text>
              <Text className="text-white font-rubik-bold text-3xl mb-4">₹{savings.toLocaleString()}</Text>
              
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-[#9aa0a6] font-rubik">Monthly Income</Text>
                <Text className="text-white font-rubik-medium">₹{monthlyIncome.toLocaleString()}</Text>
              </View>
              
              <View className="flex-row justify-between items-center">
                <Text className="text-[#9aa0a6] font-rubik">Savings Rate</Text>
                <Text className="text-white font-rubik-medium">{savingsRate.toFixed(1)}%</Text>
              </View>
            </View>

            {/* Savings Tips */}
            <View className="bg-[#3E4D67] p-6 rounded-xl mb-6">
              <Text className="text-white font-rubik-bold text-lg mb-4">Savings Tips</Text>
              
              <View className="flex-row items-start mb-4">
                <Image source={icons.info} className="size-5 mr-3 mt-1" tintColor="#7b80ff" />
                <View className="flex-1">
                  <Text className="text-white font-rubik-medium mb-1">50/30/20 Rule</Text>
                  <Text className="text-[#9aa0a6] font-rubik text-sm">
                    Allocate 50% of your income to needs, 30% to wants, and 20% to savings.
                  </Text>
                </View>
              </View>
              
              <View className="flex-row items-start mb-4">
                <Image source={icons.info} className="size-5 mr-3 mt-1" tintColor="#7b80ff" />
                <View className="flex-1">
                  <Text className="text-white font-rubik-medium mb-1">Emergency Fund</Text>
                  <Text className="text-[#9aa0a6] font-rubik text-sm">
                    Aim to save 3-6 months of expenses for emergencies.
                  </Text>
                </View>
              </View>
              
              <View className="flex-row items-start">
                <Image source={icons.info} className="size-5 mr-3 mt-1" tintColor="#7b80ff" />
                <View className="flex-1">
                  <Text className="text-white font-rubik-medium mb-1">Automate Savings</Text>
                  <Text className="text-[#9aa0a6] font-rubik text-sm">
                    Set up automatic transfers to your savings account on payday.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View>
            {/* Savings History */}
            <View className="bg-[#3E4D67] p-6 rounded-xl mb-6">
              <Text className="text-white font-rubik-bold text-lg mb-4">Savings History</Text>
              
              {/* This would be populated with actual data */}
              <View className="flex-row justify-between items-center py-3 border-b border-[#4a5a7a]">
                <View>
                  <Text className="text-white font-rubik-medium">Monthly Salary</Text>
                  <Text className="text-[#9aa0a6] font-rubik text-sm">Added on 1st of month</Text>
                </View>
                <Text className="text-white font-rubik-bold">+₹{monthlyIncome.toLocaleString()}</Text>
              </View>
              
              <View className="flex-row justify-between items-center py-3 border-b border-[#4a5a7a]">
                <View>
                  <Text className="text-white font-rubik-medium">Emergency Fund</Text>
                  <Text className="text-[#9aa0a6] font-rubik text-sm">Added on 15th of month</Text>
                </View>
                <Text className="text-white font-rubik-bold">+₹{(monthlyIncome * 0.2).toLocaleString()}</Text>
              </View>
              
              <View className="flex-row justify-between items-center py-3">
                <View>
                  <Text className="text-white font-rubik-medium">Investment Returns</Text>
                  <Text className="text-[#9aa0a6] font-rubik text-sm">Added on 20th of month</Text>
                </View>
                <Text className="text-white font-rubik-bold">+₹{(monthlyIncome * 0.05).toLocaleString()}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default MySavings; 