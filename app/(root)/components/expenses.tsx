import { View, Text, TouchableOpacity, Image, SafeAreaView, ScrollView } from "react-native";
import { useState } from "react";
import icons from "@/constants/icons";
import { router } from "expo-router";
import { useExpenses } from "../context/ExpenseContext";
import ExpenseModal from "./ExpenseModal";
import { useUserContext } from "../context/UserContext";

export default function Expenses() {
  const [isExpModalVisible, setIsExpModalVisible] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<{
    id: number;
    title: string;
    amount: string;
    category: string;
    date?: string;
    type?: 'expense' | 'income';
  } | undefined>(undefined);
  const { expenses } = useExpenses();
  const { isSalaryInputComplete } = useUserContext();

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
    type?: 'expense' | 'income';
  }) => {
    setExpenseToEdit(expense ? {
      ...expense,
      category: expense.category || 'uncategorized',
      date: expense.date ? new Date(expense.date).toISOString() : undefined
    } : undefined);
    setIsExpModalVisible(true);
  };

  return (
    <SafeAreaView className="bg-[#1f2630] h-full">
      <View className="px-6">
        <View className="flex-row items-center justify-between mt-12">
          <TouchableOpacity onPress={() => router.back()}>
            <Image source={icons.backArrow} className="size-6" tintColor={"#7b80ff"} />
          </TouchableOpacity>
          <Text className="text-primary font-rubik-bold text-lg">All Expenses</Text>
          <TouchableOpacity onPress={() => setIsExpModalVisible(true)}>
            <Image source={icons.add} className="size-6" tintColor={"#7b80ff"} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 mt-6">
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
                <Text 
                  className={expense.type === 'income' 
                    ? "text-[#4CAF50] font-rubik-bold text-lg" 
                    : "text-[#FF5252] font-rubik-bold text-lg"}
                >
                  {expense.type === 'income' ? '+' : '-'}₹{expense.amount}
                </Text>
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
    </SafeAreaView>
  );
} 