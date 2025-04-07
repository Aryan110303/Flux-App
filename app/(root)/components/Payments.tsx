import { View, Text, TouchableOpacity, Image, ScrollView, SafeAreaView, TextInput, Alert, StyleSheet, Dimensions, Animated } from 'react-native';
import React, { useState } from 'react';
import icons from '@/constants/icons';
import images from '@/constants/images';
import { useExpenses } from '../context/ExpenseContext';

interface PaymentsProps {
  onClose: () => void;
}

const Payments = ({ onClose }: PaymentsProps) => {
  const { expenses } = useExpenses();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history' | 'recurring'>('upcoming');
  const [showAddRecurring, setShowAddRecurring] = useState(false);
  const [recurringTitle, setRecurringTitle] = useState('');
  const [recurringAmount, setRecurringAmount] = useState('');
  const [recurringFrequency, setRecurringFrequency] = useState('monthly');
  const [recurringDay, setRecurringDay] = useState('1');

  // Calculate total expenses
  let totalExpenses = 0;
  let totalIncome = 0;
  
  // Calculate expenses and income separately
  expenses.forEach(expense => {
    const amount = parseFloat(expense.amount);
    if (expense.type === 'income') {
      totalIncome += amount;
    } else {
      totalExpenses += amount;
    }
  });

  // Net expenses (what's actually spent)
  const netExpenses = totalExpenses - totalIncome;

  // Group expenses by month
  const expensesByMonth = expenses.reduce((groups, expense) => {
    const date = new Date(expense.date);
    const monthKey = `${date.toLocaleString('default', { month: 'long' })}, ${date.getFullYear()}`;
    
    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    
    groups[monthKey].push(expense);
    return groups;
  }, {} as { [key: string]: typeof expenses });

  // Mock recurring payments data
  const recurringPayments = [
    { id: 1, title: 'Rent', amount: '15000', frequency: 'monthly', day: '1' },
    { id: 2, title: 'Electricity Bill', amount: '2500', frequency: 'monthly', day: '5' },
    { id: 3, title: 'Internet', amount: '1200', frequency: 'monthly', day: '10' },
  ];

  const handleAddRecurring = () => {
    if (!recurringTitle || !recurringAmount) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    // In a real app, you would save this to a database
    Alert.alert('Success', 'Recurring payment added successfully');
    setShowAddRecurring(false);
    setRecurringTitle('');
    setRecurringAmount('');
    setRecurringDay('1');
  };

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#1f2630',
      zIndex: 9999,
      elevation: 9999,
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#1f2630',
      zIndex: 9999,
      elevation: 9999,
    },
    header: {
      position: "absolute",
      top: 50,
      left: 20,
      right: 20,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      zIndex: 1000,
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'flex-start',
    },
    backIcon: {
      width: 24,
      height: 24,
    },
    headerTitle: {
      fontSize: 18,
      color: "#fff",
      fontWeight: "bold",
      fontFamily: "Rubik",
    },
    avatarContainer: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
    },
    scrollView: {
      flex: 1,
      marginTop: 120,
      paddingHorizontal: 20,
    },
    inputContainer: {
      marginBottom: 24,
    },
    inputLabel: {
      color: "#9aa0a6",
      fontFamily: "Rubik",
      marginBottom: 8,
    },
    input: {
      backgroundColor: "#2A3547",
      padding: 16,
      borderRadius: 8,
      color: "#fff",
      fontFamily: "Rubik",
    },
  });

  return (
    <SafeAreaView className="flex-1 bg-[#1f2630]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 mt-8">
        <TouchableOpacity onPress={onClose} className="flex-row items-center">
          <Image source={icons.backArrow} className="size-6 mr-4" tintColor="#7b80ff" />
          <Text className="text-primary font-rubik-medium text-lg">Payments</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View className="px-6 py-4">
        <View className="flex-row justify-between gap-4">
          <TouchableOpacity 
            className={`py-3 px-4 rounded-full flex-1 items-center ${activeTab === "upcoming" ? "bg-[#7b80ff]" : "bg-[#3E4D67]"}`}
            onPress={() => setActiveTab("upcoming")}
          >
            <Text 
              className={`font-rubik-medium text-base ${activeTab === "upcoming" ? "text-white" : "text-[#9aa0a6]"}`}
            >
              Upcoming
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
          <TouchableOpacity 
            className={`py-3 px-4 rounded-full flex-1 items-center ${activeTab === "recurring" ? "bg-[#7b80ff]" : "bg-[#3E4D67]"}`}
            onPress={() => setActiveTab("recurring")}
          >
            <Text 
              className={`font-rubik-medium text-base ${activeTab === "recurring" ? "text-white" : "text-[#9aa0a6]"}`}
            >
              Recurring
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-6">
        {activeTab === 'upcoming' && (
          <View>
            {/* Total Expenses Card */}
            <View className="bg-[#3E4D67] p-6 rounded-xl mb-6">
              <Text className="text-[#9aa0a6] font-rubik text-base mb-2">Total Expenses</Text>
              <Text className="text-white font-rubik-bold text-3xl mb-4">₹{netExpenses.toLocaleString()}</Text>
              
              <View className="flex-row justify-between items-center">
                <Text className="text-[#9aa0a6] font-rubik">This Month</Text>
                <Text className="text-white font-rubik-medium">₹{netExpenses.toLocaleString()}</Text>
              </View>
            </View>

            {/* Upcoming Payments */}
            <View className="bg-[#3E4D67] p-6 rounded-xl mb-6">
              <Text className="text-white font-rubik-bold text-lg mb-4">Upcoming Payments</Text>
              
              {recurringPayments.map((payment) => (
                <View 
                  key={payment.id} 
                  className="flex-row justify-between items-center py-3 border-b border-[#4a5a7a]"
                >
                  <View>
                    <Text className="text-white font-rubik-medium">{payment.title}</Text>
                    <Text className="text-[#9aa0a6] font-rubik text-sm">
                      Due on {payment.day}th of every {payment.frequency}
                    </Text>
                  </View>
                  <Text className="text-white font-rubik-bold">₹{payment.amount}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'history' && (
          <View>
            {/* Total Expenses Card */}
            <View className="bg-[#3E4D67] p-6 rounded-xl mb-6">
              <Text className="text-[#9aa0a6] font-rubik text-base mb-2">Total Expenses</Text>
              <Text className="text-white font-rubik-bold text-3xl mb-4">₹{netExpenses.toLocaleString()}</Text>
            </View>

            {/* Payment History */}
            <View className="bg-[#3E4D67] p-6 rounded-xl mb-6">
              <Text className="text-white font-rubik-bold text-lg mb-4">Payment History</Text>
              
              {Object.entries(expensesByMonth).map(([month, monthExpenses]) => (
                <View key={month} className="mb-6">
                  <Text className="text-[#9aa0a6] font-rubik-medium mb-2">{month}</Text>
                  
                  {monthExpenses.map((expense) => (
                    <View 
                      key={expense.id} 
                      className="flex-row justify-between items-center py-3 border-b border-[#4a5a7a]"
                    >
                      <View>
                        <Text className="text-white font-rubik-medium">{expense.title}</Text>
                        <Text className="text-[#9aa0a6] font-rubik text-sm">
                          {new Date(expense.date).toLocaleDateString()}
                        </Text>
                      </View>
                      <Text className="text-white font-rubik-bold">₹{expense.amount}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'recurring' && (
          <View>
            {/* Recurring Payments */}
            <View className="bg-[#3E4D67] p-6 rounded-xl mb-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-white font-rubik-bold text-lg">Recurring Payments</Text>
                <TouchableOpacity 
                  onPress={() => setShowAddRecurring(true)}
                  className="bg-[#7b80ff] p-2 rounded-full"
                >
                  <Image source={icons.add} className="size-5" tintColor="#ffffff" />
                </TouchableOpacity>
              </View>
              
              {recurringPayments.map((payment) => (
                <View 
                  key={payment.id} 
                  className="flex-row justify-between items-center py-3 border-b border-[#4a5a7a]"
                >
                  <View>
                    <Text className="text-white font-rubik-medium">{payment.title}</Text>
                    <Text className="text-[#9aa0a6] font-rubik text-sm">
                      Due on {payment.day}th of every {payment.frequency}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-white font-rubik-bold mr-4">₹{payment.amount}</Text>
                    <TouchableOpacity>
                      <Image source={icons.edit} className="size-5" tintColor="#7b80ff" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            {/* Add Recurring Payment Modal */}
            {showAddRecurring && (
              <View style={[styles.container, { width: Dimensions.get('window').width, height: Dimensions.get('window').height }]}>
                <View 
                  style={[
                    styles.overlay,
                    { 
                      width: Dimensions.get('window').width,
                      height: Dimensions.get('window').height,
                    }
                  ]}
                >
                  <View style={styles.header}>
                    <TouchableOpacity onPress={() => setShowAddRecurring(false)} style={styles.backButton}>
                      <Image source={icons.backArrow} style={styles.backIcon} tintColor="#7b80ff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Add Recurring Payment</Text>
                    <TouchableOpacity style={styles.avatarContainer}>
                      <Image source={images.avatar} style={styles.avatar} />
                    </TouchableOpacity>
                  </View>
                  
                  <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Title</Text>
                      <TextInput
                        value={recurringTitle}
                        onChangeText={setRecurringTitle}
                        placeholder="e.g., Rent, Netflix, Gym"
                        placeholderTextColor="#9aa0a6"
                        style={styles.input}
                      />
                    </View>
                    
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Amount</Text>
                      <TextInput
                        value={recurringAmount}
                        onChangeText={setRecurringAmount}
                        placeholder="Enter amount"
                        placeholderTextColor="#9aa0a6"
                        keyboardType="numeric"
                        style={styles.input}
                      />
                    </View>
                    
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Frequency</Text>
                      <View className="flex-row">
                        {['Monthly', 'Weekly', 'Bi-weekly'].map((freq) => (
                          <TouchableOpacity
                            key={freq}
                            onPress={() => setRecurringFrequency(freq)}
                            className={`flex-1 py-4 rounded-lg mr-2 ${recurringFrequency === freq ? 'bg-[#7b80ff]' : 'bg-[#2A3547]'}`}
                          >
                            <Text className={`text-center font-rubik ${recurringFrequency === freq ? 'text-white' : 'text-[#9aa0a6]'}`}>
                              {freq}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                    
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Day</Text>
                      <TextInput
                        value={recurringDay}
                        onChangeText={setRecurringDay}
                        placeholder={recurringFrequency === 'Monthly' ? 'Day of month (1-31)' : 'Day of week (1-7)'}
                        placeholderTextColor="#9aa0a6"
                        keyboardType="numeric"
                        style={styles.input}
                      />
                    </View>
                    
                    <TouchableOpacity
                      onPress={handleAddRecurring}
                      className="bg-[#7b80ff] p-4 rounded-xl mb-4"
                    >
                      <Text className="text-white font-rubik-bold text-center">Add Payment</Text>
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Payments; 