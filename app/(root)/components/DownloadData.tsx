import { View, Text, TouchableOpacity, Image, ScrollView, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import icons from '@/constants/icons';
import { useExpenses } from '../context/ExpenseContext';
import { useUserContext } from '../context/UserContext';

interface DownloadDataProps {
  onClose: () => void;
}

const DownloadData = ({ onClose }: DownloadDataProps) => {
  const { expenses } = useExpenses();
  const { savings, salaryYearly, salaryMonthly, goal, goalAmount } = useUserContext();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'pdf' | 'csv'>('pdf');

  // Check if there's data to download
  const hasDataToDownload = expenses.length > 0 || savings > 0 || salaryYearly > 0 || goal;

  const handleDownload = async (format: 'pdf' | 'csv') => {
    setIsDownloading(true);
    setDownloadFormat(format);
    
    // Simulate download process
    setTimeout(() => {
      setIsDownloading(false);
      Alert.alert(
        'Download Complete', 
        `Your financial data has been downloaded in ${format.toUpperCase()} format.`
      );
    }, 2000);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#1f2630]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 mt-8">
        <TouchableOpacity onPress={onClose} className="flex-row items-center">
          <Image source={icons.backArrow} className="size-6 mr-4" tintColor="#7b80ff" />
          <Text className="text-primary font-rubik-medium text-lg">Download Data</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 pb-20">
        {/* Financial Summary Card */}
        <View className="bg-[#3E4D67] p-6 rounded-xl mb-6">
          <Text className="text-white font-rubik-bold text-xl mb-4">Financial Summary</Text>
          
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-[#9aa0a6] font-rubik">Total Savings</Text>
            <Text className="text-white font-rubik-medium">₹{savings.toLocaleString()}</Text>
          </View>
          
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-[#9aa0a6] font-rubik">Annual Salary</Text>
            <Text className="text-white font-rubik-medium">₹{salaryYearly.toLocaleString()}</Text>
          </View>
          
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-[#9aa0a6] font-rubik">Monthly Salary</Text>
            <Text className="text-white font-rubik-medium">₹{salaryMonthly.toLocaleString()}</Text>
          </View>
          
          <View className="flex-row justify-between items-center">
            <Text className="text-[#9aa0a6] font-rubik">Financial Goals</Text>
            <Text className="text-white font-rubik-medium">{goal || 'None'}</Text>
          </View>
          
          {goal && (
            <View className="flex-row justify-between items-center mt-3">
              <Text className="text-[#9aa0a6] font-rubik">Goal Amount</Text>
              <Text className="text-white font-rubik-medium">₹{goalAmount.toLocaleString()}</Text>
            </View>
          )}
        </View>

        {/* Download Options */}
        <View className="bg-[#3E4D67] p-6 rounded-xl mb-6">
          <Text className="text-white font-rubik-bold text-lg mb-4">Download Format</Text>
          
          <View className="flex-row mb-6">
            <TouchableOpacity 
              className={`flex-1 py-3 rounded-l-lg ${downloadFormat === 'pdf' ? 'bg-[#7b80ff]' : 'bg-[#2A3547]'}`}
              onPress={() => setDownloadFormat('pdf')}
            >
              <Text className={`text-center font-rubik ${downloadFormat === 'pdf' ? 'text-white' : 'text-[#9aa0a6]'}`}>PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className={`flex-1 py-3 rounded-r-lg ${downloadFormat === 'csv' ? 'bg-[#7b80ff]' : 'bg-[#2A3547]'}`}
              onPress={() => setDownloadFormat('csv')}
            >
              <Text className={`text-center font-rubik ${downloadFormat === 'csv' ? 'text-white' : 'text-[#9aa0a6]'}`}>CSV</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            onPress={() => handleDownload(downloadFormat)}
            disabled={isDownloading || !hasDataToDownload}
            className={`p-4 rounded-xl flex-row items-center justify-center ${isDownloading || !hasDataToDownload ? 'bg-[#2A3547]' : 'bg-[#7b80ff]'}`}
          >
            {isDownloading ? (
              <>
                <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 8 }} />
                <Text className="text-white font-rubik-bold">Downloading...</Text>
              </>
            ) : (
              <>
                <Image source={icons.download} className="size-5 mr-2" tintColor="#ffffff" />
                <Text className="text-white font-rubik-bold">Download {downloadFormat.toUpperCase()}</Text>
              </>
            )}
          </TouchableOpacity>
          
          {!hasDataToDownload && (
            <Text className="text-[#9aa0a6] font-rubik text-center mt-3">
              Add some expenses or financial data to enable downloads
            </Text>
          )}
        </View>

        {/* Data Included */}
        <View className="bg-[#3E4D67] p-6 rounded-xl mb-6">
          <Text className="text-white font-rubik-bold text-lg mb-6">Data Included</Text>
          
          <View className="gap-y-4">
            <View className="flex-row items-center">
              <View className="bg-[#7b80ff] p-2 rounded-full mr-3">
                <Image source={icons.expense} className="size-4" tintColor="#ffffff" />
              </View>
              <Text className="text-white font-rubik-medium">Expenses</Text>
            </View>
            
            <View className="flex-row items-center">
              <View className="bg-[#7b80ff] p-2 rounded-full mr-3">
                <Image source={icons.wallet} className="size-4" tintColor="#ffffff" />
              </View>
              <Text className="text-white font-rubik-medium">Income</Text>
            </View>
            
            <View className="flex-row items-center">
              <View className="bg-[#7b80ff] p-2 rounded-full mr-3">
                <Image source={icons.goal} className="size-4" tintColor="#ffffff" />
              </View>
              <Text className="text-white font-rubik-medium">Financial Goals</Text>
            </View>
            
            <View className="flex-row items-center">
              <View className="bg-[#7b80ff] p-2 rounded-full mr-3">
                <Image source={icons.chart} className="size-4" tintColor="#ffffff" />
              </View>
              <Text className="text-white font-rubik-medium">Analytics</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DownloadData; 