import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Development mode flag - set this to true during development
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

// Flag to control whether to clear storage on app start in development
const CLEAR_ON_START = false; // Set this to true only when you want to clear data

const STORAGE_KEY = 'user_data';

export type RecurrenceType = 'none' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface UserContextType {
  salaryYearly: number;
  setSalaryYearly: (salary: number) => void;
  salaryMonthly: string;
  setSalaryMonthly: (salary: string | ((prev: string) => string)) => void;
  savings: number;
  setSavings: (savings: number) => void;
  existingSavings: number;
  setExistingSavings: (amount: number) => void;
  goal: string | null;
  setGoal: (goal: string | null) => void;
  goalAmount: number;
  setGoalAmount: (amount: number) => void;
  isSalaryInputComplete: boolean;
  setIsSalaryInputComplete: (isComplete: boolean) => void;
  isRecurring: boolean;
  setIsRecurring: (isRecurring: boolean) => void;
  recurrenceFrequency: RecurrenceType;
  setRecurrenceFrequency: (frequency: RecurrenceType) => void;
  lastSalaryReceived: Date | null;
  setLastSalaryReceived: (date: Date | null) => void;
  addSalaryToSavings: () => void;
  resetStorage: () => void;
}

const UserContext = createContext<UserContextType | null>(null);

interface UserProviderProps {
  children: React.ReactNode;
  userId?: string;
}

export const UserProvider: React.FC<UserProviderProps> = ({
  children,
  userId,
}) => {
  const [salaryYearly, setSalaryYearly] = useState(0);
  const [salaryMonthly, setSalaryMonthly] = useState("0");
  const [goal, setGoal] = useState<string | null>(null);
  const [savings, setSavings] = useState(0);
  const [existingSavings, setExistingSavings] = useState(0);
  const [goalAmount, setGoalAmount] = useState(0);
  const [isSalaryInputComplete, setIsSalaryInputComplete] = useState(false);
  const [isRecurring, setIsRecurring] = useState(true);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<RecurrenceType>('monthly');
  const [lastSalaryReceived, setLastSalaryReceived] = useState<Date | null>(null);
  const [userStorageKey, setUserStorageKey] = useState(STORAGE_KEY);
  const [isLoading, setIsLoading] = useState(true);
  const [previousUserId, setPreviousUserId] = useState<string | undefined>(undefined);

  // Load user data when userId changes
  useEffect(() => {
    const loadUserData = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      const newStorageKey = `${STORAGE_KEY}_${userId}`;
      setUserStorageKey(newStorageKey);

      // Only update previousUserId if it has changed
      if (previousUserId !== userId) {
        setPreviousUserId(userId);
      }

      try {
        const storedData = await AsyncStorage.getItem(newStorageKey);
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          console.log('[UserContext] Loading user data for userId:', userId);
          updateStateFromData(parsedData);
        } else {
          console.log('[UserContext] No user data found for userId:', userId);
          // Initialize with default values
          setSalaryYearly(0);
          setSalaryMonthly("0");
          setGoal(null);
          setSavings(0);
          setExistingSavings(0);
          setGoalAmount(0);
          setIsSalaryInputComplete(false);
          setIsRecurring(true);
          setRecurrenceFrequency('monthly');
          setLastSalaryReceived(null);
        }
      } catch (error) {
        console.error('[UserContext] Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    setIsLoading(true);
    loadUserData();
  }, [userId, previousUserId]);

  // Helper function to update state from parsed data
  const updateStateFromData = (parsedData: any) => {
    setSalaryYearly(parsedData.salaryYearly || 0);
    setSalaryMonthly(parsedData.salaryMonthly || "0");
    setGoal(parsedData.goal || null);
    setSavings(parsedData.savings || 0);
    setExistingSavings(parsedData.existingSavings || 0);
    setGoalAmount(parsedData.goalAmount || 0);
    setIsSalaryInputComplete(parsedData.isSalaryInputComplete || false);
    setIsRecurring(parsedData.isRecurring ?? true);
    setRecurrenceFrequency(parsedData.recurrenceFrequency || 'monthly');
    setLastSalaryReceived(parsedData.lastSalaryReceived ? new Date(parsedData.lastSalaryReceived) : null);
  };

  // Save user data whenever it changes
  useEffect(() => {
    if (isLoading || !userId) return; // Don't save while loading or if no userId

    const saveUserData = async () => {
      try {
        const userData = {
          salaryYearly,
          salaryMonthly,
          goal,
          savings,
          existingSavings,
          goalAmount,
          isSalaryInputComplete,
          isRecurring,
          recurrenceFrequency,
          lastSalaryReceived: lastSalaryReceived?.toISOString() || null,
        };
        
        await AsyncStorage.setItem(userStorageKey, JSON.stringify(userData));
        console.log('[UserContext] Saved user data for userId:', userId);
      } catch (error) {
        console.error('[UserContext] Error saving user data:', error);
      }
    };

    saveUserData();
  }, [
    userId,
    salaryYearly,
    salaryMonthly,
    goal,
    savings,
    existingSavings,
    goalAmount,
    isSalaryInputComplete,
    isRecurring,
    recurrenceFrequency,
    lastSalaryReceived,
    userStorageKey,
    isLoading,
  ]);

  // Function to add monthly salary to savings
  const addSalaryToSavings = () => {
    if (salaryMonthly) {
      const monthlySalaryAmount = parseFloat(salaryMonthly.replace(/,/g, ''));
      if (!isNaN(monthlySalaryAmount)) {
        setSavings(prevSavings => prevSavings + monthlySalaryAmount);
        setLastSalaryReceived(new Date());
      }
    }
  };

  // Function to reset all user data
  const resetStorage = async () => {
    if (IS_DEVELOPMENT) {
      try {
        // Reset all state values
        setSalaryYearly(0);
        setSalaryMonthly("0");
        setGoal(null);
        setSavings(0);
        setExistingSavings(0);
        setGoalAmount(0);
        setIsSalaryInputComplete(false);
        setIsRecurring(true);
        setRecurrenceFrequency('monthly');
        setLastSalaryReceived(null);
        
        // Clear AsyncStorage
        await AsyncStorage.removeItem(userStorageKey);
        console.log('Cleared all user data from storage');
      } catch (error) {
        console.error('Failed to clear user data from storage:', error);
      }
    }
  };

  return (
    <UserContext.Provider 
      value={{ 
        salaryYearly, 
        setSalaryYearly, 
        goal, 
        setGoal, 
        savings, 
        setSavings, 
        existingSavings,
        setExistingSavings,
        goalAmount, 
        setGoalAmount, 
        salaryMonthly, 
        setSalaryMonthly,
        isSalaryInputComplete,
        setIsSalaryInputComplete,
        isRecurring,
        setIsRecurring,
        recurrenceFrequency,
        setRecurrenceFrequency,
        lastSalaryReceived,
        setLastSalaryReceived,
        addSalaryToSavings,
        resetStorage
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};

export default UserProvider;
