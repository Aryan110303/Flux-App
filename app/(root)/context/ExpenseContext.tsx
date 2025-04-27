import React, { createContext, useContext, useState, useEffect } from "react";
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
  resetStorage: () => void;
  reloadExpenses: () => Promise<void>;
};

// Development mode flag - set this to true during development
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

// Flag to control whether to clear storage on app start in development
const CLEAR_ON_START = false; // Set this to true only when you want to clear data

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
export const ExpenseProvider: React.FC<{ children: React.ReactNode, userId?: string }> = ({
  children,
  userId,
}) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [storageKey, setStorageKey] = useState(STORAGE_KEY);
  const [isLoading, setIsLoading] = useState(true);
  const [previousUserId, setPreviousUserId] = useState<string | undefined>(undefined);

  // Load expenses when userId changes
  useEffect(() => {
    const loadExpenses = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      const newStorageKey = `${STORAGE_KEY}_${userId}`;
      console.log('[ExpenseContext] Loading expenses with key:', newStorageKey);
      setStorageKey(newStorageKey);

      try {
        const storedExpenses = await AsyncStorage.getItem(newStorageKey);
        console.log('[ExpenseContext] Found stored expenses:', storedExpenses);
        
        if (storedExpenses) {
          const parsedExpenses = JSON.parse(storedExpenses);
          console.log('[ExpenseContext] Loading expenses for userId:', userId);
          
          const migratedExpenses = parsedExpenses.map((exp: any) => ({
            ...exp,
            type: exp.type || 'expense',
            date: exp.date || new Date().toISOString(),
            category: exp.category || 'uncategorized'
          }));
          setExpenses(migratedExpenses);
        } else {
          console.log('[ExpenseContext] No expenses found for userId:', userId);
          setExpenses([]);
        }
      } catch (error) {
        console.error('[ExpenseContext] Error loading expenses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    setIsLoading(true);
    loadExpenses();
  }, [userId]);

  // Save expenses whenever they change
  useEffect(() => {
    if (isLoading || !userId) return;

    const saveExpenses = async () => {
      try {
        const newStorageKey = `${STORAGE_KEY}_${userId}`;
        console.log('[ExpenseContext] Saving expenses with key:', newStorageKey);
        await AsyncStorage.setItem(newStorageKey, JSON.stringify(expenses));
        console.log('[ExpenseContext] Saved expenses for userId:', userId);
      } catch (error) {
        console.error('[ExpenseContext] Error saving expenses:', error);
      }
    };

    saveExpenses();
  }, [expenses, userId, isLoading]);

  const addExpense = (expense: Expense) => {
    setExpenses(prev => [expense, ...prev]);
  };

  const deleteExpense = (id: number) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  const updateExpense = (id: number, updatedExpense: Expense) => {
    setExpenses(prev => prev.map(expense => 
      expense.id === id ? updatedExpense : expense
    ));
  };

  const clearExpenses = async () => {
    if (!userId) return;
    setExpenses([]);
    try {
      await AsyncStorage.removeItem(storageKey);
      console.log('[ExpenseContext] Cleared expenses for userId:', userId);
    } catch (error) {
      console.error('[ExpenseContext] Error clearing expenses:', error);
    }
  };

  const reloadExpenses = async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const storedExpenses = await AsyncStorage.getItem(storageKey);
      if (storedExpenses) {
        const parsedExpenses = JSON.parse(storedExpenses);
        const migratedExpenses = parsedExpenses.map((exp: any) => ({
          ...exp,
          type: exp.type || 'expense',
          date: exp.date || new Date().toISOString(),
          category: exp.category || 'uncategorized'
        }));
        setExpenses(migratedExpenses);
      }
    } catch (error) {
      console.error('[ExpenseContext] Error reloading expenses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    expenses,
    addExpense,
    deleteExpense,
    updateExpense,
    clearExpenses,
    resetStorage: clearExpenses,
    reloadExpenses,
  };

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
};

export default ExpenseProvider;
