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
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('day');
  
  // Calculate spending by category
  const getSpendingByCategory = () => {
    const categoryTotals: Record<string, number> = {};
    const now = new Date();
    let startDate: Date;
    
    switch (timeframe) {
      case 'day':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - now.getDay()));
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }
    
    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      if (expenseDate >= startDate) {
        const category = expense.category || 'Other';
        const amount = parseFloat(expense.amount);
        
        if (categoryTotals[category]) {
          categoryTotals[category] += amount;
        } else {
          categoryTotals[category] = amount;
        }
      }
    });
    
    return categoryTotals;
  };
  
  // Calculate total spending
  const getTotalSpending = () => {
    const now = new Date();
    let startDate: Date;
    
    switch (timeframe) {
      case 'day':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - now.getDay()));
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }
    
    return expenses.reduce((total, expense) => {
      const expenseDate = new Date(expense.date);
      if (expenseDate >= startDate) {
        return total + parseFloat(expense.amount);
      }
      return total;
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
  
  // Prepare data for line chart
  const getLineChartData = () => {
    const now = new Date();
    let labels: string[] = [];
    let data: number[] = [];
    
    switch (timeframe) {
      case 'day':
        // Show hourly data for the day with AM/PM format, but only every 3 hours
        labels = Array.from({ length: 24 }, (_, i) => {
          if (i % 3 === 0) { // Only show every 3 hours
            const hour = i % 12 || 12; // Convert 0 to 12, 1-11 stay the same
            const period = i < 12 ? 'AM' : 'PM';
            return `${hour}${period}`;
          }
          return '';
        });
        data = Array(24).fill(0);
        const today = new Date(now.setHours(0, 0, 0, 0));
        expenses.forEach(expense => {
          const expenseDate = new Date(expense.date);
          if (expenseDate >= today && 
              expenseDate.getDate() === today.getDate() && 
              expenseDate.getMonth() === today.getMonth() && 
              expenseDate.getFullYear() === today.getFullYear()) {
            const hour = expenseDate.getHours();
            data[hour] += parseFloat(expense.amount);
          }
        });
        break;
        
      case 'week':
        // Show daily data for the week
        labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        data = Array(7).fill(0);
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        expenses.forEach(expense => {
          const expenseDate = new Date(expense.date);
          if (expenseDate >= weekStart) {
            const day = expenseDate.getDay();
            data[day] += parseFloat(expense.amount);
          }
        });
        break;
        
      case 'month':
        // Show daily data for the month
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        labels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`);
        data = Array(daysInMonth).fill(0);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        expenses.forEach(expense => {
          const expenseDate = new Date(expense.date);
          if (expenseDate >= monthStart && expenseDate.getMonth() === now.getMonth()) {
            const day = expenseDate.getDate() - 1;
            data[day] += parseFloat(expense.amount);
          }
        });
        break;
    }
    
    return {
      labels,
      datasets: [{ data }],
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
      <View className="px-6 py-4">
        <View className="flex-row justify-between gap-2">
          <TouchableOpacity 
            className={`py-2 px-3 rounded-full flex-1 items-center ${timeframe === "day" ? "bg-[#3E4D67]" : "bg-[#2A3441]"}`}
            onPress={() => setTimeframe("day")}
          >
            <Text 
              className={`font-rubik text-sm ${timeframe === "day" ? "text-white" : "text-[#9aa0a6]"}`}
            >
              Day
            </Text>
          </TouchableOpacity>
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
                  propsForLabels: {
                    fontSize: 11,
                    rotation: 0,
                    dx: timeframe === 'day' ? 5 : 0,
                  },
                  propsForDots: {
                    r: 3,
                  },
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
                withDots={true}
                withInnerLines={true}
                withOuterLines={true}
                withVerticalLines={false}
                withHorizontalLines={true}
                segments={4}
                fromZero={true}
                formatYLabel={(value) => `₹${Math.round(Number(value))}`}
              />
            </View>
            
            {/* Category Breakdown */}
            {timeframe !== 'week' && (
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
            )}

            {/* Daily Breakdown for Week */}
            {timeframe === 'week' && (
              <View className="bg-[#3E4D67] p-6 rounded-xl mb-6">
                <Text className="text-white font-rubik-bold text-lg mb-4">Daily Breakdown</Text>
                
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => {
                  const dayExpenses = expenses.filter(expense => {
                    const expenseDate = new Date(expense.date);
                    return expenseDate.getDay() === index;
                  });
                  
                  const dayTotal = dayExpenses.reduce((total, expense) => {
                    return total + parseFloat(expense.amount);
                  }, 0);
                  
                  return (
                    <View key={index} className="flex-row justify-between items-center py-3 border-b border-[#4a5a7a]">
                      <Text className="text-white font-rubik-medium">{day}</Text>
                      <Text className="text-white font-rubik">₹{dayTotal.toLocaleString()}</Text>
                    </View>
                  );
                })}
              </View>
            )}
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