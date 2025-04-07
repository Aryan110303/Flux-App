import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { useExpenses } from '../context/ExpenseContext';
import { useUserContext } from '../context/UserContext';
import icons from '@/constants/icons';
import { LineChart, PieChart } from 'react-native-chart-kit';

interface TrendsProps {
  onClose: () => void;
}

const { width } = Dimensions.get('window');

const Trends = ({ onClose }: TrendsProps) => {
  const { expenses } = useExpenses();
  const { salaryMonthly } = useUserContext();
  const [activeTab, setActiveTab] = useState<'spending' | 'savings'>('spending');
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');
  
  // Calculate spending by category
  const getSpendingByCategory = () => {
    const categoryTotals: Record<string, number> = {};
    
    expenses.forEach(expense => {
      const category = expense.category || 'Other';
      const amount = parseFloat(expense.amount);
      
      if (categoryTotals[category]) {
        categoryTotals[category] += amount;
      } else {
        categoryTotals[category] = amount;
      }
    });
    
    return categoryTotals;
  };
  
  // Calculate total spending
  const getTotalSpending = () => {
    return expenses.reduce((total, expense) => {
      return total + parseFloat(expense.amount);
    }, 0);
  };
  
  // Calculate savings rate
  const getSavingsRate = () => {
    const monthlySalary = Number(salaryMonthly);
    if (!monthlySalary || monthlySalary <= 0) return 0;
    
    const totalSpending = getTotalSpending();
    const savings = monthlySalary - totalSpending;
    return (savings / monthlySalary) * 100;
  };
  
  // Get highest spending category
  const getHighestSpendingCategory = () => {
    const categoryTotals = getSpendingByCategory();
    let highestCategory = '';
    let highestAmount = 0;
    
    Object.entries(categoryTotals).forEach(([category, amount]) => {
      if (amount > highestAmount) {
        highestAmount = amount;
        highestCategory = category;
      }
    });
    
    return { category: highestCategory, amount: highestAmount };
  };
  
  // Get best saving month (mock data for now)
  const getBestSavingMonth = () => {
    return { month: 'March', amount: 2500 };
  };
  
  // Prepare data for pie chart
  const getPieChartData = () => {
    const categoryTotals = getSpendingByCategory();
    const colors = ['#7b80ff', '#ff7b7b', '#7bff7b', '#ff7bff', '#7bffff', '#ffff7b'];
    
    return Object.entries(categoryTotals).map(([category, amount], index) => ({
      name: category,
      amount,
      color: colors[index % colors.length],
      legendFontColor: '#fff',
      legendFontSize: 12,
    }));
  };
  
  // Prepare data for line chart (mock data for now)
  const getLineChartData = () => {
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          data: [2000, 2500, 1800, 2200, 3000, 2800],
        },
      ],
    };
  };
  
  const totalSpending = getTotalSpending();
  const savingsRate = getSavingsRate();
  const highestCategory = getHighestSpendingCategory();
  const bestSavingMonth = getBestSavingMonth();
  const pieChartData = getPieChartData();
  const lineChartData = getLineChartData();
  
  return (
    <SafeAreaView className="flex-1 bg-[#1f2630]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 mt-8">
        <TouchableOpacity onPress={onClose} className="flex-row items-center">
          <Image source={icons.backArrow} className="size-6 mr-4" tintColor="#7b80ff" />
          <Text className="text-primary font-rubik-medium text-lg">Financial Trends</Text>
        </TouchableOpacity>
      </View>
      
      {/* Tabs */}
      <View className="px-6 py-4">
        <View className="flex-row justify-between gap-4">
          <TouchableOpacity 
            className={`py-3 px-4 rounded-full flex-1 items-center ${activeTab === "spending" ? "bg-[#7b80ff]" : "bg-[#3E4D67]"}`}
            onPress={() => setActiveTab("spending")}
          >
            <Text 
              className={`font-rubik-medium text-base ${activeTab === "spending" ? "text-white" : "text-[#9aa0a6]"}`}
            >
              Spending
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`py-3 px-4 rounded-full flex-1 items-center ${activeTab === "savings" ? "bg-[#7b80ff]" : "bg-[#3E4D67]"}`}
            onPress={() => setActiveTab("savings")}
          >
            <Text 
              className={`font-rubik-medium text-base ${activeTab === "savings" ? "text-white" : "text-[#9aa0a6]"}`}
            >
              Savings
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Timeframe Selector */}
      <View className="px-6 py-2">
        <View className="flex-row justify-between gap-2">
          <TouchableOpacity 
            className={`py-2 px-3 rounded-full flex-1 items-center ${timeframe === "week" ? "bg-[#3E4D67]" : "bg-[#2A3441]"}`}
            onPress={() => setTimeframe("week")}
          >
            <Text 
              className={`font-rubik text-sm ${timeframe === "week" ? "text-white" : "text-[#9aa0a6]"}`}
            >
              Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`py-2 px-3 rounded-full flex-1 items-center ${timeframe === "month" ? "bg-[#3E4D67]" : "bg-[#2A3441]"}`}
            onPress={() => setTimeframe("month")}
          >
            <Text 
              className={`font-rubik text-sm ${timeframe === "month" ? "text-white" : "text-[#9aa0a6]"}`}
            >
              Month
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`py-2 px-3 rounded-full flex-1 items-center ${timeframe === "year" ? "bg-[#3E4D67]" : "bg-[#2A3441]"}`}
            onPress={() => setTimeframe("year")}
          >
            <Text 
              className={`font-rubik text-sm ${timeframe === "year" ? "text-white" : "text-[#9aa0a6]"}`}
            >
              Year
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView 
        className="flex-1 px-6" 
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'spending' ? (
          <>
            {/* Spending Overview */}
            <View className="bg-[#3E4D67] p-6 rounded-xl mb-6">
              <Text className="text-white font-rubik-bold text-lg mb-4">Spending Overview</Text>
              
              <View className="flex-row justify-between mb-4">
                <View>
                  <Text className="text-[#9aa0a6] font-rubik text-sm">Total Spending</Text>
                  <Text className="text-white font-rubik-bold text-xl">₹{totalSpending.toLocaleString()}</Text>
                </View>
                <View>
                  <Text className="text-[#9aa0a6] font-rubik text-sm">Highest Category</Text>
                  <Text className="text-white font-rubik-bold text-xl">{highestCategory.category}</Text>
                </View>
              </View>
              
              {/* Pie Chart */}
              {pieChartData.length > 0 ? (
                <View className="items-center">
                  <PieChart
                    data={pieChartData}
                    width={width - 60}
                    height={220}
                    chartConfig={{
                      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    }}
                    accessor="amount"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute
                  />
                </View>
              ) : (
                <View className="items-center py-10">
                  <Text className="text-[#9aa0a6] font-rubik text-center">No spending data available</Text>
                </View>
              )}
            </View>
            
            {/* Spending Trends */}
            <View className="bg-[#3E4D67] p-6 rounded-xl mb-6">
              <Text className="text-white font-rubik-bold text-lg mb-4">Spending Trends</Text>
              
              {/* Line Chart */}
              <LineChart
                data={lineChartData}
                width={width - 60}
                height={220}
                chartConfig={{
                  backgroundColor: '#3E4D67',
                  backgroundGradientFrom: '#3E4D67',
                  backgroundGradientTo: '#3E4D67',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(123, 128, 255, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
              />
            </View>
            
            {/* Category Breakdown */}
            <View className="bg-[#3E4D67] p-6 rounded-xl mb-6">
              <Text className="text-white font-rubik-bold text-lg mb-4">Category Breakdown</Text>
              
              {Object.entries(getSpendingByCategory()).map(([category, amount], index) => (
                <View key={index} className="flex-row justify-between items-center py-3 border-b border-[#4a5a7a]">
                  <View className="flex-row items-center">
                    <View 
                      style={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: 6, 
                        backgroundColor: pieChartData[index % pieChartData.length]?.color || '#7b80ff',
                        marginRight: 10
                      }} 
                    />
                    <Text className="text-white font-rubik-medium">{category}</Text>
                  </View>
                  <Text className="text-white font-rubik">₹{amount.toLocaleString()}</Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <>
            {/* Savings Overview */}
            <View className="bg-[#3E4D67] p-6 rounded-xl mb-6">
              <Text className="text-white font-rubik-bold text-lg mb-4">Savings Overview</Text>
              
              <View className="flex-row justify-between mb-4">
                <View>
                  <Text className="text-[#9aa0a6] font-rubik text-sm">Savings Rate</Text>
                  <Text className="text-white font-rubik-bold text-xl">{savingsRate.toFixed(1)}%</Text>
                </View>
                <View>
                  <Text className="text-[#9aa0a6] font-rubik text-sm">Best Month</Text>
                  <Text className="text-white font-rubik-bold text-xl">{bestSavingMonth.month}</Text>
                </View>
              </View>
              
              {/* Savings Progress */}
              <View className="mt-4">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-white font-rubik-medium">Monthly Savings Progress</Text>
                  <Text className="text-white font-rubik">{savingsRate.toFixed(1)}%</Text>
                </View>
                <View className="h-4 bg-[#2A3441] rounded-full overflow-hidden">
                  <View 
                    className="h-full bg-[#7b80ff] rounded-full" 
                    style={{ width: `${Math.min(savingsRate, 100)}%` }}
                  />
                </View>
              </View>
            </View>
            
            {/* Savings Tips */}
            <View className="bg-[#3E4D67] p-6 rounded-xl mb-6">
              <Text className="text-white font-rubik-bold text-lg mb-4">Savings Tips</Text>
              
              <View className="space-y-4">
                <View className="flex-row items-start">
                  <View className="bg-[#7b80ff] p-2 rounded-full mr-3">
                    <Image source={icons.chart} className="size-4" tintColor="#ffffff" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-rubik-medium">Increase Savings Rate</Text>
                    <Text className="text-[#9aa0a6] font-rubik text-sm">
                      Try to save at least 20% of your monthly income
                    </Text>
                  </View>
                </View>
                
                <View className="flex-row items-start">
                  <View className="bg-[#7b80ff] p-2 rounded-full mr-3">
                    <Image source={icons.wallet} className="size-4" tintColor="#ffffff" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-rubik-medium">Emergency Fund</Text>
                    <Text className="text-[#9aa0a6] font-rubik text-sm">
                      Build an emergency fund covering 3-6 months of expenses
                    </Text>
                  </View>
                </View>
                
                <View className="flex-row items-start">
                  <View className="bg-[#7b80ff] p-2 rounded-full mr-3">
                    <Image source={icons.invest} className="size-4" tintColor="#ffffff" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-rubik-medium">Investment Strategy</Text>
                    <Text className="text-[#9aa0a6] font-rubik text-sm">
                      Consider investing your savings in diversified mutual funds
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Trends; 