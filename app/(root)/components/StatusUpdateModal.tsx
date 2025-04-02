import { View, Text, Modal, TouchableOpacity, TextInput, StyleSheet, TouchableWithoutFeedback, Keyboard } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Debt, PaymentStatus } from '../context/DebtContext';
import { useToast } from '../context/ToastContext';

interface StatusUpdateModalProps {
  isVisible: boolean;
  onClose: () => void;
  debt: Debt | undefined;
  onUpdateStatus: (id: number, status: PaymentStatus, paidAmount?: string) => void;
}

const StatusUpdateModal = ({ isVisible, onClose, debt, onUpdateStatus }: StatusUpdateModalProps) => {
  const [paidAmount, setPaidAmount] = useState('');
  const [error, setError] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    if (debt?.paidAmount) {
      setPaidAmount(debt.paidAmount);
    } else {
      setPaidAmount('');
    }
    setError('');
  }, [debt, isVisible]);

  const handleMarkAsPaid = () => {
    if (!debt) return;
    onUpdateStatus(debt.id, 'paid');
    showToast('Debt marked as paid');
    onClose();
  };

  const handleMarkAsUnpaid = () => {
    if (!debt) return;
    onUpdateStatus(debt.id, 'unpaid');
    showToast('Debt marked as unpaid');
    onClose();
  };

  const handlePartialPayment = () => {
    if (!debt) return;
    
    if (!paidAmount.trim()) {
      setError('Please enter the amount paid');
      return;
    }

    const amountPaid = parseFloat(paidAmount);
    const totalAmount = parseFloat(debt.amount);
    const currentlyPaid = debt.paidAmount ? parseFloat(debt.paidAmount) : 0;
    const totalPaidAfterThis = currentlyPaid + amountPaid;
    
    if (isNaN(amountPaid) || amountPaid <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    // If this payment would fully pay off the debt, mark it as paid
    if (totalPaidAfterThis >= totalAmount) {
      onUpdateStatus(debt.id, 'paid');
      showToast('Debt marked as fully paid');
    } else {
      onUpdateStatus(debt.id, 'partially_paid', paidAmount);
      showToast('Debt marked as partially paid');
    }
    
    onClose();
  };

  if (!debt) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Payment Status</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.debtDetails}>
              <Text style={styles.debtName}>{debt.name}</Text>
              <Text style={styles.debtAmount}>Total Amount: ₹{debt.amount}</Text>
              {debt.status === 'partially_paid' && debt.paidAmount && (
                <>
                  <Text style={styles.paidAmount}>Already Paid: ₹{debt.paidAmount}</Text>
                  <Text style={styles.dueAmount}>
                    Remaining: ₹{(parseFloat(debt.amount) - parseFloat(debt.paidAmount)).toFixed(2)}
                  </Text>
                </>
              )}
              <Text style={styles.debtStatus}>
                Current Status:{' '}<Text style={{ color: getStatusColor(debt.status) }}>{getStatusText(debt.status)}</Text>
              </Text>
            </View>

            <View style={styles.buttonsContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.paidButton]}
                onPress={handleMarkAsPaid}
              >
                <Text style={styles.buttonText}>Mark as Paid</Text>
              </TouchableOpacity>

              <View style={styles.partialContainer}>
                <Text style={styles.label}>
                  {debt.status === 'partially_paid' 
                    ? 'Additional Payment Amount' 
                    : 'Partial Payment Amount'}
                </Text>
                <TextInput
                  style={[styles.input, error ? styles.inputError : null]}
                  value={paidAmount}
                  onChangeText={setPaidAmount}
                  placeholder="Enter amount paid"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                
                <TouchableOpacity 
                  style={[styles.button, styles.partialButton]}
                  onPress={handlePartialPayment}
                >
                  <Text style={styles.buttonText}>Mark as Partially Paid</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={[styles.button, styles.unpaidButton]}
                onPress={handleMarkAsUnpaid}
              >
                <Text style={styles.buttonText}>Mark as Unpaid</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'paid':
      return '#4CAF50';
    case 'partially_paid':
      return '#FFC107';
    case 'unpaid':
    default:
      return '#F44336';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'paid':
      return 'Paid';
    case 'partially_paid':
      return 'Partially Paid';
    case 'unpaid':
    default:
      return 'Unpaid';
  }
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1f2630',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Rubik-Bold',
  },
  closeButton: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  debtDetails: {
    backgroundColor: '#343f52',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  debtName: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Rubik-Medium',
    marginBottom: 8,
  },
  debtAmount: {
    fontSize: 16,
    color: '#7b80ff',
    fontFamily: 'Rubik-Bold',
    marginBottom: 8,
  },
  paidAmount: {
    fontSize: 14,
    color: '#7b80ff',
    fontFamily: 'Rubik',
    marginBottom: 8,
  },
  dueAmount: {
    fontSize: 14,
    color: '#7b80ff',
    fontFamily: 'Rubik',
  },
  debtStatus: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Rubik',
  },
  buttonsContainer: {
    gap: 16,
  },
  button: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  paidButton: {
    backgroundColor: '#4CAF50',
  },
  partialButton: {
    backgroundColor: '#FFC107',
  },
  unpaidButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Rubik-Medium',
  },
  partialContainer: {
    backgroundColor: '#343f52',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Rubik',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#1f2630',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontFamily: 'Rubik',
    marginBottom: 8,
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#ff4d4f',
  },
  errorText: {
    color: '#ff4d4f',
    fontSize: 12,
    marginBottom: 8,
    fontFamily: 'Rubik',
  },
});

export default StatusUpdateModal; 