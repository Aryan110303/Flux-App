import React, { createContext, useContext, useState } from 'react';

export type PaymentStatus = 'unpaid' | 'partially_paid' | 'paid';

export type Debt = {
  id: number;
  name: string;
  amount: string;
  category: string;
  dueDate?: string;
  frequency?: string;
  notes?: string;
  type: 'owe' | 'owed';
  status: PaymentStatus;
  paidAmount?: string;
};

type DebtContextType = {
  debts: Debt[];
  addDebt: (debt: Omit<Debt, 'id'>) => void;
  deleteDebt: (id: number) => void;
  updateDebtStatus: (id: number, status: PaymentStatus, paidAmount?: string) => void;
  updateDebt: (id: number, debt: Partial<Omit<Debt, 'id'>>) => void;
};

const DebtContext = createContext<DebtContextType | undefined>(undefined);

export const useDebts = () => {
  const context = useContext(DebtContext);
  if (!context) {
    throw new Error('useDebts must be used within a DebtProvider');
  }
  return context;
};

export const DebtProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [debts, setDebts] = useState<Debt[]>([]);

  const addDebt = (debt: Omit<Debt, 'id'>) => {
    setDebts(prev => [...prev, { ...debt, id: Date.now(), status: 'unpaid' }]);
  };

  const deleteDebt = (id: number) => {
    setDebts(prev => prev.filter(debt => debt.id !== id));
  };

  const updateDebtStatus = (id: number, status: PaymentStatus, paidAmount?: string) => {
    setDebts(prev =>
      prev.map(debt => {
        if (debt.id === id) {
          // For partially paid status, add the new payment to the existing paid amount
          let newPaidAmount = paidAmount;
          let newStatus = status;
          
          if (status === 'partially_paid' && paidAmount) {
            // If there's an existing paidAmount, add to it
            if (debt.paidAmount && debt.status === 'partially_paid') {
              const totalPaid = parseFloat(debt.paidAmount) + parseFloat(paidAmount);
              newPaidAmount = totalPaid.toString();
              
              // If the total paid amount equals or exceeds the debt amount, mark as paid
              if (totalPaid >= parseFloat(debt.amount)) {
                newStatus = 'paid';
                // Set paidAmount to the full debt amount when paid
                newPaidAmount = debt.amount;
              }
            }
          } else if (status === 'unpaid') {
            // Reset paid amount when marked as unpaid
            newPaidAmount = undefined;
          } else if (status === 'paid') {
            // When marked as paid, set paidAmount to the full debt amount
            newPaidAmount = debt.amount;
          }
          
          return { ...debt, status: newStatus, paidAmount: newPaidAmount };
        }
        return debt;
      })
    );
  };

  const updateDebt = (id: number, updatedDebt: Partial<Omit<Debt, 'id'>>) => {
    setDebts(prev =>
      prev.map(debt =>
        debt.id === id
          ? { ...debt, ...updatedDebt }
          : debt
      )
    );
  };

  return (
    <DebtContext.Provider value={{ debts, addDebt, deleteDebt, updateDebtStatus, updateDebt }}>
      {children}
    </DebtContext.Provider>
  );
};

export default DebtProvider; 