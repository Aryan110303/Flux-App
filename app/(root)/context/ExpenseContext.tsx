import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define TypeScript types
type Expense = {
  category: string;
  date: string | number | Date;
  id: number;
  title: string;
  amount: string;
  type: 'expense' | 'income'; // 'expense' for spending, 'income' for additional money received
};

type ExpenseContextType = {
  expenses: Expense[];
  addExpense: (expense: Expense) => void;
  deleteExpense: (id: number) => void;
  updateExpense: (id: number, updatedExpense: Expense) => void;
  clearExpenses: () => void;
};

const STORAGE_KEY = 'expenses_data';

// Create context with default values
export const ExpenseContext = createContext<ExpenseContextType | undefined>(
  undefined
);

// Custom hook for using the context
export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error("useExpenses must be used within an ExpenseProvider");
  }
  return context;
};

// Provider component
export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  
  // Load expenses from storage on mount
  useEffect(() => {
    const loadExpenses = async () => {
      try {
        // For development, uncomment this line to clear expenses on each app start
        // await AsyncStorage.removeItem(STORAGE_KEY);
        
        const storedExpenses = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedExpenses) {
          // Handle migration for existing expenses that don't have a type field
          const parsedExpenses = JSON.parse(storedExpenses);
          const migratedExpenses = parsedExpenses.map((exp: any) => ({
            ...exp,
            type: exp.type || 'expense' // Set default type for existing expenses
          }));
          setExpenses(migratedExpenses);
          console.log('Loaded expenses from storage:', migratedExpenses);
        }
      } catch (error) {
        console.error('Failed to load expenses from storage:', error);
      }
    };
    
    loadExpenses();
  }, []);
  
  // Save expenses to storage whenever they change
  useEffect(() => {
    const saveExpenses = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
        console.log('Saved expenses to storage:', expenses);
      } catch (error) {
        console.error('Failed to save expenses to storage:', error);
      }
    };
    
    if (expenses.length > 0) {
      saveExpenses();
    }
  }, [expenses]);

  // Function to add an expense
  const addExpense = useCallback((expense: Expense) => {
    console.log('Adding expense to context:', expense);
    setExpenses((prev) => {
      const newExpenses = [expense, ...prev];
      console.log('Updated expenses array:', newExpenses);
      return newExpenses;
    });
  }, []);

  // Function to delete an expense
  const deleteExpense = useCallback((id: number) => {
    console.log('Deleting expense with id:', id);
    setExpenses((prev) => {
      const newExpenses = prev.filter((expense) => expense.id !== id);
      console.log('Updated expenses array after delete:', newExpenses);
      return newExpenses;
    });
  }, []);

  // Function to update an expense
  const updateExpense = useCallback((id: number, updatedExpense: Expense) => {
    console.log('Updating expense:', updatedExpense);
    setExpenses((prev) => {
      const newExpenses = prev.map((expense) => 
        expense.id === id ? updatedExpense : expense
      );
      console.log('Updated expenses array after update:', newExpenses);
      return newExpenses;
    });
  }, []);

  // Function to clear all expenses
  const clearExpenses = useCallback(async () => {
    console.log('Clearing all expenses');
    setExpenses([]);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      console.log('Expenses cleared from storage');
    } catch (error) {
      console.error('Failed to clear expenses from storage:', error);
    }
  }, []);

  const value = {
    expenses,
    addExpense,
    deleteExpense,
    updateExpense,
    clearExpenses,
  };

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
};

export default ExpenseProvider;
