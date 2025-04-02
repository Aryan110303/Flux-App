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
      id: number;
      title: string;
      amount: string;
      date?: string;
    };
  }
  
  const ExpenseModal = ({ isVisible, onClose, expenseToEdit }: ExpType) => {
    const translateY = useRef(new Animated.Value(800)).current;
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const { addExpense, updateExpense } = useExpenses();
    const { showToast } = useToast();
    const { isSalaryInputComplete } = useUserContext();
    const [title, setTitle] = useState(expenseToEdit?.title || '');
    const [amount, setAmount] = useState(expenseToEdit?.amount || '');

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
        } else {
          setTitle("");
          setAmount("");
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
        };
        updateExpense(expenseToEdit.id, updatedExpense);
        showToast('Expenditure updated successfully!', 'success');
      } else {
        const newExpense = {
          id: Date.now(),
          title: title.trim(),
          amount: amount.trim().replace(/,/g, ''),
          date: new Date().toISOString(),
        };
        addExpense(newExpense);
        showToast('Expenditure saved successfully!', 'success');
      }
      onClose();
    };
  
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
          >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              <View style={styles.header}>
                <TouchableOpacity className="size-5">
                    <Image source={icons.info}/>
                </TouchableOpacity>
                <TouchableOpacity onPress={onClose}>
                    <Image source={icons.cross}/>
                </TouchableOpacity>
              </View>
  
              <View style={styles.mainBox}>
                <Text className="text-primary font-rubik-semibold text-xl">
                  {expenseToEdit ? "Edit Expenditure" : "Add an Expenditure"}
                </Text>
                <Text className="text-primary font-rubik ">
                  {expenseToEdit 
                    ? "Update the details of your expense to track your budget efficiently."
                    : "Enter details about your recent expense to track your budget efficiently."}
                </Text>
                <Text className="text-primary text-xl font-rubik mt-12">Title</Text>
                <TextInput
                  style={styles.input}
                  placeholder="E.g Groceries"
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
  
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Text className="text-primary">{expenseToEdit ? "Update" : "Save"}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>
      </Modal>
    );
  };
  
  export default ExpenseModal;
  
  const styles = StyleSheet.create({
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modal: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: "60%",
      width: "100%",
      backgroundColor: "#1f2630",
      alignItems: "center",
      justifyContent: "center",
    },
    scrollContainer: {
      flexGrow: 1,
      alignItems: "center",
    },
    header: {
      marginTop: 24,
      flexDirection: "row",
      alignContent: "center",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      paddingHorizontal: 25,
    },
    mainBox: {
        marginTop: 25,
        width: "100%",
        paddingHorizontal: 25,
    },
    input: {
      height: 50,
      width: 300,
      borderColor: "#7b80ff",
      backgroundColor: 'rgba(123, 128, 255, 0.1)',  // Light gradient effect
      borderWidth: 2,
      borderRadius: 10,
      paddingHorizontal: 12,
      marginTop: 10,
      fontSize: 16,
      color: "#e0cfd9",
    //   backgroundColor: "#1f2630",
    },
    saveButton: {
      backgroundColor: "#7b80ff",
      padding: 15,
      borderRadius: 8,
      marginTop: 40,
      alignItems: "center",
    },
  });
  