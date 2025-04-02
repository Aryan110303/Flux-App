import { View, Text, TouchableOpacity, Image, ScrollView, SafeAreaView } from 'react-native';
import React, { useState } from 'react';
import icons from '@/constants/icons';
import { useExpenses } from '../context/ExpenseContext';

interface CalendarProps {
  onClose: () => void;
}

const Calendar = ({ onClose }: CalendarProps) => {
  const { expenses } = useExpenses();
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Get current month and year
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  
  // Get first day of the month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  
  // Get last day of the month
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  
  // Get number of days in the month
  const daysInMonth = lastDayOfMonth.getDate();
  
  // Get day of week for first day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = firstDayOfMonth.getDay();
  
  // Generate calendar days
  const calendarDays = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }
  
  // Group expenses by day
  const expensesByDay = expenses.reduce((groups, expense) => {
    const date = new Date(expense.date);
    if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
      const day = date.getDate();
      if (!groups[day]) {
        groups[day] = [];
      }
      groups[day].push(expense);
    }
    return groups;
  }, {} as { [key: number]: typeof expenses });
  
  // Calculate total expenses for a day
  const getDayTotal = (day: number) => {
    if (!expensesByDay[day]) return 0;
    return expensesByDay[day].reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  };
  
  // Navigate to previous month
  const goToPreviousMonth = () => {
    setSelectedDate(new Date(currentYear, currentMonth - 1, 1));
  };
  
  // Navigate to next month
  const goToNextMonth = () => {
    setSelectedDate(new Date(currentYear, currentMonth + 1, 1));
  };
  
  // Format month and year for display
  const monthYearString = selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  
  // Day names for the header
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <SafeAreaView className="flex-1 bg-[#1f2630]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 mt-8">
        <TouchableOpacity onPress={onClose} className="flex-row items-center">
          <Image source={icons.backArrow} className="size-6 mr-4" tintColor="#7b80ff" />
          <Text className="text-primary font-rubik-medium text-lg">Calendar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6">
        {/* Month Navigation */}
        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity onPress={goToPreviousMonth}>
            <Image source={icons.backArrow} className="size-6" tintColor="#7b80ff" />
          </TouchableOpacity>
          <Text className="text-white font-rubik-bold text-xl">{monthYearString}</Text>
          <TouchableOpacity onPress={goToNextMonth}>
            <Image source={icons.rightArrow} className="size-6" tintColor="#7b80ff" />
          </TouchableOpacity>
        </View>

        {/* Calendar Grid */}
        <View className="bg-[#3E4D67] p-4 rounded-xl mb-6">
          {/* Day Names Header */}
          <View className="flex-row justify-between mb-2">
            {dayNames.map((day, index) => (
              <Text key={index} className="text-[#9aa0a6] font-rubik text-center w-10">
                {day}
              </Text>
            ))}
          </View>
          
          {/* Calendar Days */}
          <View className="flex-row flex-wrap">
            {calendarDays.map((day, index) => (
              <View 
                key={index} 
                className={`w-10 h-10 items-center justify-center mb-2 ${day ? 'bg-[#2A3547] rounded-full' : ''}`}
              >
                {day && (
                  <>
                    <Text className="text-white font-rubik text-sm">{day}</Text>
                    {expensesByDay[day] && expensesByDay[day].length > 0 && (
                      <View className="absolute bottom-1 w-1 h-1 bg-[#7b80ff] rounded-full" />
                    )}
                  </>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Selected Day Expenses */}
        {expensesByDay[selectedDate.getDate()] && expensesByDay[selectedDate.getDate()].length > 0 ? (
          <View className="bg-[#3E4D67] p-6 rounded-xl mb-6">
            <Text className="text-white font-rubik-bold text-lg mb-4">
              {selectedDate.getDate()} {selectedDate.toLocaleString('default', { month: 'long' })} Expenses
            </Text>
            
            {expensesByDay[selectedDate.getDate()].map((expense) => (
              <View 
                key={expense.id} 
                className="flex-row justify-between items-center py-3 border-b border-[#4a5a7a]"
              >
                <View>
                  <Text className="text-white font-rubik-medium">{expense.title}</Text>
                  <Text className="text-[#9aa0a6] font-rubik text-sm">
                    {new Date(expense.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <Text className="text-white font-rubik-bold">₹{expense.amount}</Text>
              </View>
            ))}
            
            <View className="flex-row justify-between items-center pt-3">
              <Text className="text-white font-rubik-bold">Total</Text>
              <Text className="text-[#7b80ff] font-rubik-bold">
                ₹{getDayTotal(selectedDate.getDate()).toLocaleString()}
              </Text>
            </View>
          </View>
        ) : (
          <View className="bg-[#3E4D67] p-6 rounded-xl mb-6 items-center">
            <Text className="text-[#9aa0a6] font-rubik text-center">
              No expenses for {selectedDate.getDate()} {selectedDate.toLocaleString('default', { month: 'long' })}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Calendar; 