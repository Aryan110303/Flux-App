import React, { createContext, useContext, useState } from "react";

export type RecurrenceType = 'none' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface UserContextType {
  salaryYearly: number;
  setSalaryYearly: (salary: number) => void;
  salaryMonthly: string;
  setSalaryMonthly: (salary: string | ((prev: string) => string)) => void;
  savings: number;
  setSavings: (savings: number) => void;
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
}

const UserContext = createContext<UserContextType | null>(null);

interface SalaryType {
  children: React.ReactNode;
}

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [salaryYearly, setSalaryYearly] = useState(0);
  const [salaryMonthly, setSalaryMonthly] = useState("0");
  const [goal, setGoal] = useState<string | null>(null);
  const [savings, setSavings] = useState(0);
  const [goalAmount, setGoalAmount] = useState(0);
  const [isSalaryInputComplete, setIsSalaryInputComplete] = useState(false);
  const [isRecurring, setIsRecurring] = useState(true); // Default to true as most incomes are recurring
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<RecurrenceType>('monthly'); // Default to monthly

  return (
    <UserContext.Provider 
      value={{ 
        salaryYearly, 
        setSalaryYearly, 
        goal, 
        setGoal, 
        savings, 
        setSavings, 
        goalAmount, 
        setGoalAmount, 
        salaryMonthly, 
        setSalaryMonthly,
        isSalaryInputComplete,
        setIsSalaryInputComplete,
        isRecurring,
        setIsRecurring,
        recurrenceFrequency,
        setRecurrenceFrequency
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};
