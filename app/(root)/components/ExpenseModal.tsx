import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    Image, 
    Animated, 
    Modal, 
    TouchableWithoutFeedback, 
    TextInput, 
    KeyboardAvoidingView, 
    ScrollView, 
    Platform, 
    Keyboard, 
    Alert
  } from "react-native";
  import React, { useRef, useEffect, useContext, useState } from "react";
  import icons from "@/constants/icons";
  import { useExpenses } from "../context/ExpenseContext";
  import { useToast } from '../context/ToastContext';
  import { useUserContext } from "../context/UserContext";
  
  interface ExpType {
    isVisible: boolean;
    onClose: () => void;
    expenseToEdit?: {
      category: string;
      id: number;
      title: string;
      amount: string;
      date?: string;
      type?: 'expense' | 'income';
    };
  }
  
  const ExpenseModal = ({ isVisible, onClose, expenseToEdit }: ExpType) => {
    const translateY = useRef(new Animated.Value(800)).current;
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const { addExpense, updateExpense } = useExpenses();
    const { showToast } = useToast();
    const { isSalaryInputComplete, setSavings, savings } = useUserContext();
    const [title, setTitle] = useState(expenseToEdit?.title || '');
    const [amount, setAmount] = useState(expenseToEdit?.amount || '');
    const [transactionType, setTransactionType] = useState<'expense' | 'income'>(
      expenseToEdit?.type || 'expense'
    );

    // Close modal if salary is not added yet
    useEffect(() => {
      if (isVisible && !isSalaryInputComplete) {
        showToast('Please add your salary details first', 'error');
        onClose();
      }
    }, [isVisible, isSalaryInputComplete]);

    // Reset form when modal opens/closes or expenseToEdit changes
    useEffect(() => {
      if (isVisible) {
        if (expenseToEdit) {
          setTitle(expenseToEdit.title);
          setAmount(expenseToEdit.amount);
          setTransactionType(expenseToEdit.type || 'expense');
        } else {
          setTitle("");
          setAmount("");
          setTransactionType('expense');
        }
      }
    }, [isVisible, expenseToEdit]);

    useEffect(() => {
      if (isVisible) {
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(translateY, {
          toValue: 800,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    }, [isVisible]);
  
    useEffect(() => {
      const keyboardShowListener = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true));
      const keyboardHideListener = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));
  
      return () => {
        keyboardShowListener.remove();
        keyboardHideListener.remove();
      };
    }, []);
  
    const handleSave = () => {
      if (!title.trim() || !amount.trim()) {
        showToast('Please fill in all fields', 'error');
        return;
      }

      const numericAmount = parseFloat(amount.replace(/,/g, ''));
      if (isNaN(numericAmount) || numericAmount <= 0) {
        showToast('Please enter a valid amount', 'error');
        return;
      }

      if (expenseToEdit) {
        const updatedExpense = {
          id: expenseToEdit.id,
          title: title.trim(),
          amount: amount.trim().replace(/,/g, ''),
          date: expenseToEdit.date || new Date().toISOString(),
          type: transactionType,
          category: expenseToEdit.category || 'uncategorized'
        };
        updateExpense(expenseToEdit.id, updatedExpense);
        
        // If this is an income entry, add to savings
        if (transactionType === 'income') {
          // We'll let the SavingsCalculator handle this now
          showToast('Income added!', 'success');
        } else {
          showToast('Expenditure updated successfully!', 'success');
        }
      } else {
        const newExpense = {
          id: Date.now(),
          title: title.trim(),
          amount: amount.trim().replace(/,/g, ''),
          date: new Date().toISOString(),
          type: transactionType,
          category: 'uncategorized'
        };
        addExpense(newExpense);
        
        // If this is an income entry, add to savings
        if (transactionType === 'income') {
          // We'll let the SavingsCalculator handle this now
          showToast('Income added!', 'success');
        } else {
          showToast('Expenditure saved successfully!', 'success');
        }
      }
      onClose();
    };
    
    const renderTabSelector = () => (
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[
            styles.tab, 
            transactionType === 'expense' ? styles.activeTab : null
          ]}
          onPress={() => setTransactionType('expense')}
        >
          <Text style={transactionType === 'expense' ? styles.activeTabText : styles.tabText}>
            Expense
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.tab, 
            transactionType === 'income' ? styles.incomeActiveTab : null
          ]}
          onPress={() => setTransactionType('income')}
        >
          <Text style={transactionType === 'income' ? styles.activeTabText : styles.tabText}>
            Income
          </Text>
        </TouchableOpacity>
      </View>
    );
  
    return (
      <Modal transparent visible={isVisible} animationType="fade">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
  
        <Animated.View style={[styles.modal, { transform: [{ translateY }] }]}>
          {/* Cancel Button */}
  
          {/* Modal Content */}
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
          >
            <ScrollView 
              contentContainerStyle={styles.scrollContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.header}>
                <TouchableOpacity className="size-5">
                    <Image source={icons.info}/>
                </TouchableOpacity>
                <TouchableOpacity onPress={onClose}>
                    <Image source={icons.cross}/>
                </TouchableOpacity>
              </View>
  
              <Text className="text-primary font-rubik-semibold text-xl mb-2">
                {expenseToEdit ? `Edit ${transactionType === 'income' ? 'Income' : 'Expenditure'}` : `Add ${transactionType === 'income' ? 'Income' : 'an Expenditure'}`}
              </Text>
              
              {renderTabSelector()}
              
              <Text className="text-primary font-rubik mt-4">
                {transactionType === 'income' 
                  ? "Enter details about money you've received to add to your savings."
                  : "Enter details about your recent expense to track your budget efficiently."}
              </Text>
              
              <Text className="text-primary text-xl font-rubik mt-8">
                {transactionType === 'income' ? 'Source' : 'Title'}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={transactionType === 'income' ? "E.g Bonus, Gift, Side job" : "E.g Groceries"}
                placeholderTextColor="#a8a8a8"
                value={title}
                onChangeText={setTitle}
                blurOnSubmit={true}
                returnKeyType="done"
              />
  
              <Text className="text-primary text-xl font-rubik mt-6">Amount</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Amount"
                placeholderTextColor="#a8a8a8"
                value={amount}
                keyboardType="numeric"
                onChangeText={setAmount}
                blurOnSubmit={true}
                returnKeyType="done"
              />
  
              <TouchableOpacity
                style={[styles.saveButton, transactionType === 'income' ? styles.incomeSaveButton : null]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>
                  {expenseToEdit ? 'Update' : 'Save'} {transactionType === 'income' ? 'Income' : 'Expense'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>
      </Modal>
    );
  };
  
  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modal: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      padding: 20,
      backgroundColor: "#1f2630",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: "90%",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#fff",
      marginBottom: 20,
    },
    scrollContainer: {
      paddingBottom: 50,
    },
    input: {
      borderWidth: 1,
      borderColor: "#343f52",
      borderRadius: 8,
      padding: 12,
      marginTop: 8,
      marginBottom: 20,
      color: "#fff",
      backgroundColor: "#2A3341",
    },
    saveButton: {
      backgroundColor: "#7b80ff",
      padding: 16,
      borderRadius: 8,
      alignItems: "center",
      marginTop: 20,
    },
    saveButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
    tabContainer: {
      flexDirection: 'row',
      marginTop: 8,
      marginBottom: 16,
      borderRadius: 8,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: '#343f52',
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      backgroundColor: '#2A3341',
    },
    activeTab: {
      backgroundColor: '#7b80ff',
    },
    incomeActiveTab: {
      backgroundColor: '#4CAF50',
    },
    tabText: {
      color: '#fff',
      fontWeight: '500',
    },
    activeTabText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    incomeSaveButton: {
      backgroundColor: '#4CAF50',
    }
  });
  
  export default ExpenseModal;
  