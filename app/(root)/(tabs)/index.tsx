import { View, Text, TouchableOpacity, Image, SafeAreaView, ImageSourcePropType, ScrollView, Platform } from "react-native";
import React, { useState, useRef, useEffect } from "react";
import icons from "@/constants/icons";
import images from "@/constants/images";
import {Dropdown} from 'react-native-element-dropdown';
import { StyleSheet } from 'react-native';
import { useUserContext } from "../context/UserContext";
import Start from "../components/Start";
import ExpenseList from "../components/ExpenseList";
import Expense from "../components/Expense";
import GoalBar from "../components/GoalBar";
import GoalInput from "../components/GoalInput";
import InputNumberAnnual from "../components/InputAnnual";
import InputNumberMonthly from "../components/InputMonthly";
import ExpenseModal from "../components/ExpenseModal";
import { ExpenseProvider, useExpenses } from "../context/ExpenseContext";
import NewsMarquee from "../components/NewsMarquee";
import { router, useNavigation } from "expo-router";
import { useGlobalContext } from "@/lib/global-provider";
import Debts from "../components/debts";
import MySavings from "../components/MySavings";
import NotificationHandler from '../components/NotificationHandler';
import NotificationService from '@/lib/NotificationService';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

interface ServiceProps{
  icon: ImageSourcePropType,
  title: string,
  onPress?: () => void
  textStyle?: string 
  sideText: string
}

const ServiceButton = ({icon, title, onPress, textStyle, sideText}: ServiceProps) => {
  const handlePress = () => {
    console.log(`Button pressed: ${title}`);
    if (onPress) {
      onPress();
    }
  };
  
  const isCompactButton = title === "Debts" || title === "Savings";
  
  return (
    <View className={`${isCompactButton ? "w-[150px]" : "px-6 w-[9.5rem]"} flex flex-row flex-wrap`}>
      <View className="flex items-center justify-center w-full">
        <TouchableOpacity
          onPress={handlePress}
          className={`flex justify-center ${isCompactButton ? "pl-4 items-center" : "pl-6"} ${textStyle} ${isCompactButton ? "w-[140px] h-[45px]" : "w-[11rem] h-[6rem]"} rounded-xl border border-[#fff8] ${isCompactButton ? "bg-[#3E4D67]" : ""}`}
      style={{
        shadowColor: "#fff",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      }}
    >
          <View className={`flex flex-row items-center ${isCompactButton ? "gap-2" : "gap-4"}`}>
            <Image source={icon} className={`${isCompactButton ? "size-5" : "size-9"}`} tintColor={"#7b80ff"} />
            <Text className={`text-primary ${isCompactButton ? "text-[11px] max-w-[70px]" : "text-xs max-w-[4.5rem]"} text-center font-rubik`}>{sideText}</Text>
          </View>
        </TouchableOpacity>
        <Text className="text-[#fff] font-rubik text-xs mt-2 text-center w-full">{title}</Text>
    </View>
  </View>
)
}


const styles = StyleSheet.create({
  dropdown: {
    margin: 1,
    height: 40,
    width: 120,
    backgroundColor: '#7b80ff',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 4,
    justifyContent: 'center',
  },
  dropdownContainer: {
    backgroundColor: '#3E4D67',
    borderRadius: 8,
    padding: 8,
    width: 120,
    borderWidth: 1,
    borderColor: '#7b80ff30',
  },
  dropdownItem: {
    backgroundColor: '#1f2630',
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
  },
  amountText: {
    color: '#fff',
    fontSize: 36,
    letterSpacing: 0.1,
    fontFamily: 'Barlow-SemiBold',
  },
  convertedAmount: {
    color: '#fff',
    fontSize: 20,
    opacity: 0.4,
    fontFamily: 'Barlow-Regular',
  },
  recurrenceTag: {
    backgroundColor: '#7b80ff',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  recurrenceText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'Rubik',
  },
})

const currencies = [
  { label: 'INR', value: 'INR' },
  { label: 'USD', value: 'USD' },
]

const SavingsCalculator = () => {
  const { expenses } = useExpenses();
  const { salaryMonthly, setSavings, existingSavings, isSalaryInputComplete } = useUserContext();

  useEffect(() => {
    console.log('Savings calculation triggered (inside calculator)');
    console.log('Salary Monthly:', salaryMonthly);
    console.log('Expenses:', expenses);
    console.log('Is salary complete:', isSalaryInputComplete);
    console.log('Existing Savings:', existingSavings);

    if (isSalaryInputComplete && expenses && salaryMonthly) {
      // Initialize values for expenses and income
      let totalExpenses = 0;
      let totalIncome = 0;

      // Calculate separately for expenses and income
      expenses.forEach(expense => {
        const amount = parseFloat(expense.amount.replace(/,/g, '')); // Remove commas if present
        if (expense.type === 'income') {
          totalIncome += amount;
        } else {
          totalExpenses += amount;
        }
      });

      // Convert salaryMonthly to number
      const monthlySalary = parseFloat(salaryMonthly.toString().replace(/,/g, ''));
      
      console.log('Monthly Salary (number):', monthlySalary);
      console.log('Total Expenses:', totalExpenses);
      console.log('Total Additional Income:', totalIncome);
      
      // Calculate savings: Salary + additional income - expenses
      // Note: This is just monthly savings, not touching existing savings
      const monthlySavings = monthlySalary + totalIncome - totalExpenses;
      console.log('Calculating new savings:', monthlySavings);
      
      setSavings(Math.max(0, monthlySavings));
    }
  }, [expenses, salaryMonthly, isSalaryInputComplete, setSavings, existingSavings]);

  return null;
};

export default function Home() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<"Expenditures" | "Insurance">("Expenditures");
  const [currency, setCurrency] = useState('INR');
  const [changeAmount, setChangeAmount] = useState("0");
  const [showDebts, setShowDebts] = useState(false);
  const [showAllExpenses, setShowAllExpenses] = useState(false);
  const [showSavings, setShowSavings] = useState(false);

  const [isModalVisibleYearly, setIsModalVisibleYearly] = useState(false)
  const [isModalVisibleMonthly, setIsModalVisibleMonthly] = useState(false)
  const [isGoalInputVisible, setIsGoalInputVisible] = useState(false)
  const [isExpModalVisible, setIsExpModalVisible] = useState(false)

  const {savings, setSavings, salaryYearly, salaryMonthly, goal, goalAmount, isSalaryInputComplete, isRecurring, recurrenceFrequency} = useUserContext()
  const { expenses, clearExpenses, deleteExpense } = useExpenses();
  const {user} = useGlobalContext();
  const exchangeRate = 86.69;

  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Initialize notification service
    const notificationService = NotificationService.getInstance();
    
    // Load unread count
    loadUnreadCount();

    // Listen for new notifications
    const subscription = Notifications.addNotificationReceivedListener(() => {
      loadUnreadCount();
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const loadUnreadCount = async () => {
    try {
      const storedNotifications = await AsyncStorage.getItem('notifications');
      if (storedNotifications) {
        const notifications = JSON.parse(storedNotifications);
        const unread = notifications.filter((n: any) => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  useEffect(() => {
    if (currency === 'USD') {
      // When showing USD, convert savings to USD
      setChangeAmount((savings/exchangeRate).toFixed(2));
    } else {
      // When showing INR, convert savings to USD for the secondary display
      setChangeAmount((savings/exchangeRate).toFixed(2));
    }
  }, [savings, currency]);

  // Calculate total balance (for showing actual financial position)
  const totalBalance = expenses ? expenses.reduce((sum, expense) => {
    return sum + parseFloat(expense.amount);
  }, 0) : "-- --";

  const [expenseToEdit, setExpenseToEdit] = useState<{
    id: number;
    title: string;
    amount: string;
    category: string;
    date?: string;
    type?: 'expense' | 'income';
  } | undefined>(undefined);

  const handleAdd = () => {
    // Always show annual input first
    console.log("handleAdd called - opening annual salary input");
    setIsModalVisibleYearly(true);
  }

  const handleCloseAnnualModal = () => {
    console.log("Manually closing annual modal");
    setIsModalVisibleYearly(false);
  }

  const handleCloseMonthlyModal = () => {
    console.log("Closing monthly modal");
    setIsModalVisibleMonthly(false);
  }

  const handleCloseExpenseModal = () => {
    setIsExpModalVisible(false);
    setExpenseToEdit(undefined);
  };

  const handleOpenExpenseModal = (expense?: { 
    id: number; 
    title: string; 
    amount: string; 
    category?: string;
    date?: string | number | Date; 
    type?: 'expense' | 'income' 
  }) => {
    if (expense) {
      setExpenseToEdit({
        id: expense.id,
        title: expense.title,
        amount: expense.amount,
        category: expense.category || 'uncategorized',
        date: expense.date ? new Date(expense.date).toISOString() : undefined,
        type: expense.type
      });
    } else {
      setExpenseToEdit(undefined);
    }
    setIsExpModalVisible(true);
  };

  // Function to handle the sequence of showing annual then monthly modals
  const handleSalaryInputSequence = () => {
    // First close the annual modal
    setIsModalVisibleYearly(false);
    // Then set a timer to show the monthly modal
    setTimeout(() => {
      setIsModalVisibleMonthly(true);
    }, 500);
  }

  const renderContent = () => {
    switch (activeTab) {
      case "Expenditures":
        return (
          <View className="flex-1">
            <ScrollView className="flex-1 px-6">
              {expenses && expenses.length > 0 ? (
                expenses.map((expense) => (
                  <TouchableOpacity
                    key={expense.id}
                    className="bg-[#3E4D67] p-4 rounded-xl mb-4"
                    onPress={() => handleOpenExpenseModal(expense)}
                  >
                    <View className="flex-row justify-between items-center">
                      <View>
                        <Text className="text-primary font-rubik-medium text-lg">{expense.title}</Text>
                        <Text className="text-[#ccc] font-rubik text-sm mt-1">
                          {new Date(expense.date).toLocaleDateString()} • {new Date(expense.date).toLocaleTimeString()}
                        </Text>
                      </View>
                      <Text className="text-primary font-rubik-bold text-lg">₹{expense.amount}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View className="flex-1 items-center justify-center py-12">
                  <Text className="text-[#ccc] font-rubik text-center">No expenses added yet</Text>
                </View>
              )}
            </ScrollView>
            <ExpenseModal 
              isVisible={isExpModalVisible}
              onClose={handleCloseExpenseModal}
              expenseToEdit={expenseToEdit}
            />
          </View>
        );
      case "Insurance":
        return (
          <View className="flex-1 items-center justify-center">
            <Text className="text-[#ccc] font-rubik">Insurance coming soon</Text>
          </View>
        );
      default:
        return null;
    }
  };

  // Add a useEffect to handle the expenses display when returning from All Expenses
  useEffect(() => {
    console.log('Expenses in main screen:', expenses);
    console.log('Show All Expenses:', showAllExpenses);
    // This effect will run whenever showAllExpenses changes
    // When returning from All Expenses screen (showAllExpenses becomes false)
    // It will ensure the expenses list is up to date
    if (!showAllExpenses) {
      // @ts-ignore
      navigation.getParent()?.setOptions({
        tabBarStyle: {
          backgroundColor: '#1f2630',
          position: 'absolute',
          borderTopColor: '#0061FF1A',
          borderTopWidth: 0.2,
          minHeight: 70,
          height: 70,
          opacity: 1,
          ...(Platform.OS === 'ios' && {
            borderTopColor: 'transparent',
          }),
        }
      });
    }
  }, [showAllExpenses, expenses, navigation]);

  // Add a useEffect to track changes to showDebts
  useEffect(() => {
    console.log('showDebts changed:', showDebts);
  }, [showDebts]);

  // Clear expenses on initial load for testing
  useEffect(() => {
    clearExpenses();
    console.log('Expenses cleared on initial load');
  }, []);

  // Add effect to hide/show tab bar for all modal screens
  useEffect(() => {
    const shouldHideNav = showAllExpenses || isModalVisibleYearly || isModalVisibleMonthly || isExpModalVisible || isGoalInputVisible;
    
    // @ts-ignore
    navigation.getParent()?.setOptions({
      tabBarStyle: shouldHideNav ? {
        display: "none",
        height: 0,
        opacity: 0,
      } : {
        backgroundColor: '#1f2630',
        position: 'absolute',
        borderTopColor: '#0061FF1A',
        borderTopWidth: 0.2,
        minHeight: 70,
        height: 70,
        opacity: 1,
        ...(Platform.OS === 'ios' && {
          borderTopColor: 'transparent',
        }),
      }
    });

    return () => {
      // @ts-ignore
      navigation.getParent()?.setOptions({
        tabBarStyle: {
          backgroundColor: '#1f2630',
          position: 'absolute',
          borderTopColor: '#0061FF1A',
          borderTopWidth: 0.2,
          minHeight: 70,
          height: 70,
          opacity: 1,
          ...(Platform.OS === 'ios' && {
            borderTopColor: 'transparent',
          }),
        }
      });
    };
  }, [showAllExpenses, isModalVisibleYearly, isModalVisibleMonthly, isExpModalVisible, isGoalInputVisible, navigation]);

  return (
    showAllExpenses ? (
      <View className="bg-main h-full">
        {isSalaryInputComplete ? (
          <>
            <ExpenseList 
              isModalVisible={isExpModalVisible}
              onCloseModal={() => {
                router.setParams({ showAllExpenses: 'false' });
                setShowAllExpenses(false);
              }}
              onOpenModal={(expense) => {
                console.log('Opening expense modal with:', expense);
                if (expense) {
                  setExpenseToEdit({
                    id: expense.id,
                    title: expense.title,
                    amount: expense.amount,
                    category: 'uncategorized',
                    date: new Date().toISOString()
                  });
                } else {
                  setExpenseToEdit(undefined);
                }
                setIsExpModalVisible(true);
              }}
              showHeader={true}
              limit={undefined}
            />
            <ExpenseModal 
              isVisible={isExpModalVisible}
              onClose={handleCloseExpenseModal}
              expenseToEdit={expenseToEdit}
            />
          </>
        ) : (
          <View className="flex-1">
            {/* Header with back button */}
            <View className="flex-row items-center px-6 py-4 mt-8">
              <TouchableOpacity 
                onPress={() => {
                  router.setParams({ showAllExpenses: 'false' });
                  setShowAllExpenses(false);
                }} 
                className="flex-row items-center"
              >
                <Image source={icons.backArrow} className="size-6 mr-4" tintColor="#7b80ff" />
                <Text className="text-primary font-rubik-medium text-lg">All Expenses</Text>
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View className="flex-1 items-center justify-center px-6">
              <Image source={icons.expense} className="size-20 mb-4" tintColor={"#7b80ff"}/>
              <Text className="text-primary text-xl font-rubik-semibold mb-2 text-center">Add Your Salary First</Text>
              <Text className="text-primary text-base font-rubik opacity-60 mb-8 text-center">Please add your salary details before tracking expenses</Text>
              <TouchableOpacity 
                onPress={() => {
                  setShowAllExpenses(false);
                  setIsModalVisibleYearly(true);
                }}
                className="bg-[#7b80ff] px-8 py-4 rounded-full flex-row items-center"
              >
                <Image source={icons.add} className="size-6 mr-2" tintColor={"#fff"}/>
                <Text className="text-white font-rubik-semibold">Add Salary Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    ) : (
      <SafeAreaView className="bg-main h-full">
        <SavingsCalculator />
        <InputNumberAnnual 
          isVisible={isModalVisibleYearly} 
          onClose={handleCloseAnnualModal} 
          onSave={handleSalaryInputSequence}
        />
        <InputNumberMonthly 
          isVisible={isModalVisibleMonthly} 
          onClose={handleCloseMonthlyModal}
          onComplete={() => {
            // Initialize savings with monthly salary when it's first entered
            const initialSavings = parseFloat(salaryMonthly.toString().replace(/,/g, ''));
            setSavings(initialSavings);
            
            // Clear existing expenses when setting a new salary
            clearExpenses();
          }}
        />
        <GoalInput 
          isVisible={isGoalInputVisible} 
          onClose={() => setIsGoalInputVisible(false)}
        />
        <ExpenseModal 
          isVisible={isExpModalVisible}
          onClose={handleCloseExpenseModal}
          expenseToEdit={expenseToEdit}
        />
        {showDebts && (
          <Debts onClose={() => {
            console.log('Closing Debts view');
            setShowDebts(false);
          }} />
        )}
        {showSavings && (
          <MySavings
            onClose={() => {
              console.log('Closing Savings view');
              setShowSavings(false);
            }}
          />
        )}
        {!showDebts && !showSavings && (
          <ScrollView 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={{ paddingBottom: 120 }}
            className="h-full"
          >
            <View className="px-1">
              <View className={`flex flex-row items-center justify-between px-5 ${Platform.OS === 'ios' ? 'mt-12' : 'mt-12'}`}>
                <View className="flex flex-row items-center">
                  <TouchableOpacity onPress={() => router.push("/profile")}>
                    {user?.avatar ? (
                      <Image
                        source={{ uri: user.avatar }}
                        className="rounded-full size-12"
                      />
                    ) : (
                      <View
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 24,
                          backgroundColor: '#2d3748',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Text
                          style={{
                            color: '#fff',
                            fontSize: 24,
                            fontWeight: 'bold',
                            fontFamily: 'Barlow-SemiBold',
                          }}
                        >
                          {user?.name?.[0]?.toUpperCase() || 'U'}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  <View className="flex flex-col ml-2 items-start justify-center">
                    <Text className="text-xs text-[#fff] font-rubik">Welcome</Text>
                    <Text className="text-[#fff] text-base font-rubik-medium">{user?.name || 'User'}</Text>
                  </View>
                </View>
                <View className="flex-1 mx-2">
                  <NewsMarquee />
                </View>
                <TouchableOpacity 
                  onPress={() => router.push("/notifications")}
                  className="relative"
                >
                  <Ionicons name="notifications" size={24} color="#7b80ff" />
                  {unreadCount > 0 && (
                    <View className="absolute -top-1 -right-1 bg-[#7b80ff] rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                      <Text className="text-white text-[10px] font-rubik">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View className="px-5">
              <View className="mt-8">
                <Text className="text-[#fff] font-rubik-bold text-md">Monthly Savings</Text>
                <View className="flex flex-row justify-between mt-1">
                  <View>
                    <Text style={styles.amountText}>
                      {currency === 'USD' ? `$${changeAmount}` : `₹${savings}`}
                    </Text>
                    <Text style={styles.convertedAmount}>
                      {currency === 'USD' ? `≈₹${savings}` : `≈$${changeAmount}`}
                    </Text>
                    {isRecurring && (
                      <View style={styles.recurrenceTag}>
                        <Text style={styles.recurrenceText}>
                          {recurrenceFrequency.charAt(0).toUpperCase() + recurrenceFrequency.slice(1)}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Dropdown
                    data={currencies}
                    labelField="label"
                    valueField="value"
                    value={currency}
                    onChange={(item) => {
                      setCurrency(item.value);
                    }}
                    selectedTextStyle={{ color: "#fff", fontSize: 16, fontFamily: "Rubik-Medium" }}
                    itemTextStyle={{ color: "#fff", fontSize: 16, fontFamily: "Rubik" }}
                    iconStyle={{ tintColor: "#fff", width: 20, height: 20 }}
                    containerStyle={styles.dropdownContainer} 
                    itemContainerStyle={styles.dropdownItem}
                    style={styles.dropdown}
                    activeColor="#343f52"
                    placeholder="Select"
                  />
                </View>
              </View>
            </View>

            <View>
              {goal!=null ? <GoalBar/>:""}
            </View>

            {/* Feature Cards Row */}
            <View className="px-6 mt-6">
              <View className="flex flex-row items-center justify-around">
                <ServiceButton 
                  icon={icons.wallet} 
                  title="Debts" 
                  onPress={() => {
                    console.log('Debts button pressed via ServiceButton');
                    setShowDebts(true);
                  }}
                  sideText="Track loans & IOUs"
                  textStyle="mx-auto"
                />
                <ServiceButton 
                  icon={icons.wallet} 
                  title="Savings" 
                  onPress={() => {
                    console.log('Savings button pressed via ServiceButton');
                    setShowSavings(true);
                  }}
                  sideText="Existing Savings"
                  textStyle="mx-auto"
                />
              </View>
            </View>

            <View className="px-6">
              <View className="flex flex-row items-center justify-around mt-8">
                <ServiceButton 
                  icon={salaryYearly>0? icons.info:icons.add} 
                  title={salaryYearly > 0 ? "View Salary":"Add Salary"} 
                  onPress={handleAdd} 
                  sideText={salaryYearly>0? `Entered Annual Inc. ₹${salaryYearly}`:"Enter Your Salary"}
                />
                <ServiceButton 
                  icon={icons.expense} 
                  title="All Transactions" 
                  onPress={() => {
                    router.setParams({ showAllExpenses: 'true' });
                    setShowAllExpenses(true);
                  }} 
                  sideText="View All Transaction"
                />
              </View>
              <View className="flex flex-row items-center justify-around mt-8">
                <ServiceButton 
                  icon={icons.goal} 
                  title={goal != null?"Edit Your Goal":"Set some Goal"} 
                  onPress={()=>{setIsGoalInputVisible(true)}} 
                  sideText={goal != null? `Goal: ${goal}`:"Set a Goal"}
                />
                <ServiceButton 
                  icon={icons.invest} 
                  title="Investment" 
                  onPress={() => router.push("/(root)/(tabs)/invest")} 
                  sideText="Investing Q&A"
                />
              </View>
            </View>

            {/* Separator line */}
            <View className="border-t border-[#343f52] mx-6 mt-10 mb-0" />

            {/* Recent Expenditures Tab */}
            <View className="px-6">
              {/* Tabs with Add Button */}
              <View className="flex-row bg-[#1f2630] overflow-hidden items-center">
                <View className="flex-row gap-6">
                  <TouchableOpacity className="py-2" onPress={() => setActiveTab("Expenditures")}>
                    <Text className={`font-rubik-medium text-base ${activeTab === "Expenditures" ? "text-[#7b80ff]" : "text-[#9aa0a6]"}`} >
                      Recent Transactions
                    </Text>
                    {activeTab === "Expenditures" && (
                      <View className="border-b-2 border-[#7b80ff] mt-1" />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity className="py-2" onPress={() => setActiveTab("Insurance")}>
                    <Text className={`font-rubik-medium text-base ${activeTab === "Insurance" ? "text-[#7b80ff]" : "text-[#9aa0a6]"}`}>
                      Insurance
                    </Text>
                    {activeTab === "Insurance" && (
                      <View className="border-b-2 border-[#7b80ff] mt-1" />
                    )}
                  </TouchableOpacity>
                </View>
                
                {/* Add button - only show when salary is added */}
                {isSalaryInputComplete && activeTab === "Expenditures" && (
                  <TouchableOpacity 
                    onPress={() => {
                      setExpenseToEdit(undefined);
                      setIsExpModalVisible(true);
                    }}
                    className="px-3 py-1 ml-auto"
                  >
                    <Image source={icons.add} className="size-5" tintColor="#7b80ff" />
                  </TouchableOpacity>
                )}
              </View>

              {/* View All button - show only when there are expenses */}
              {isSalaryInputComplete && activeTab === "Expenditures" && expenses && expenses.length > 0 && (
                <TouchableOpacity 
                  onPress={() => {
                    router.setParams({ showAllExpenses: 'true' });
                    setShowAllExpenses(true);
                  }}
                  className="flex-row items-center justify-end py-2 px-3"
                >
                  <Text className="text-[#7b80ff] text-sm font-rubik">View All</Text>
                </TouchableOpacity>
              )}
              
              <View className="bg-[#1f2630] rounded-xl mb-6" style={{minHeight: 200}}>
                {activeTab === "Expenditures" ? (
                  isSalaryInputComplete ? (
                    expenses && expenses.length > 0 ? (
                      <ScrollView className="flex-1 px-2 pt-2">
                        {[...expenses]
                          .sort((a, b) => {
                            // Sort by date (newest first)
                            const dateA = new Date(a.date || a.id).getTime();
                            const dateB = new Date(b.date || b.id).getTime();
                            return dateB - dateA;
                          })
                          .slice(0, 4)
                          .map((expense) => (
                          <TouchableOpacity 
                            key={expense.id} 
                            onPress={() => {
                              router.setParams({ showAllExpenses: 'true' });
                              setShowAllExpenses(true);
                            }}
                            className="bg-[#3E4D67] py-3 px-4 rounded-xl mb-3 flex-row justify-between items-center"
                          >
                            <View className="flex-row items-center">
                              <Image source={icons.expense} className="size-5 mr-3" tintColor="#7b80ff"/>
                              <View>
                                <Text className="text-white text-base font-rubik-semibold">{expense.title}</Text>
                                <Text className="text-[#ccc] font-rubik text-xs mt-0.5">
                                  {new Date(expense.date).toLocaleDateString()}
                                </Text>
                              </View>
                            </View>
                            <Text className={expense.type === 'income' 
                              ? "text-[#4CAF50] font-rubik-bold text-base" 
                              : "text-[#FF5252] font-rubik-bold text-base"}>
                              {expense.type === 'income' ? '+' : '-'}₹{expense.amount}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    ) : (
                      <View className="flex-1 items-center justify-center py-12">
                        <Text className="text-[#ccc] font-rubik text-center">No expenses added yet</Text>
                      </View>
                    )
                  ) : (
                    <View className="flex-1 items-center justify-center py-12">
                      <Image source={icons.expense} className="size-20 mb-4" tintColor={"#7b80ff"}/>
                      <Text className="text-primary text-xl font-rubik-semibold mb-2 text-center">Add Your Salary First</Text>
                      <Text className="text-primary text-base font-rubik opacity-60 mb-8 text-center">Please add your salary details before tracking expenses</Text>
                      <TouchableOpacity 
                        onPress={() => {
                          setShowAllExpenses(false);
                          setIsModalVisibleYearly(true);
                        }}
                        className="bg-[#7b80ff] px-8 py-4 rounded-full flex-row items-center"
                      >
                        <Image source={icons.add} className="size-6 mr-2" tintColor={"#fff"}/>
                        <Text className="text-white font-rubik-semibold">Add Salary Details</Text>
                      </TouchableOpacity>
                    </View>
                  )
                ) : renderContent()}
              </View>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    )
  )
}