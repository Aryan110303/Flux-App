import { View, Text, Modal, TouchableOpacity, TextInput, StyleSheet, TouchableWithoutFeedback, Keyboard, ScrollView, Platform } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Dropdown } from 'react-native-element-dropdown';
import { useToast } from '../context/ToastContext';
import { Debt } from '../context/DebtContext';

interface DebtModalProps {
  isVisible: boolean;
  onClose: () => void;
  type: 'owe' | 'owed';
  onSave: (debt: Omit<Debt, 'id'>) => void;
  editingDebt?: Debt | null;
}

const categories = [
  { label: 'Personal Loan', value: 'personal' },
  { label: 'Credit Card', value: 'credit_card' },
  { label: 'Business', value: 'business' },
  { label: 'Other', value: 'other' },
];

const frequencies = [
  { label: 'One-time', value: 'one_time' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
];

const DebtModal = ({ isVisible, onClose, type, onSave, editingDebt }: DebtModalProps) => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState<string>('');
  const [frequency, setFrequency] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({
    name: false,
    amount: false,
    category: false,
  });

  useEffect(() => {
    if (editingDebt) {
      setName(editingDebt.name);
      setAmount(editingDebt.amount);
      setCategory(editingDebt.category);
      setDueDate(editingDebt.dueDate || '');
      setFrequency(editingDebt.frequency || '');
      setNotes(editingDebt.notes || '');
    } else {
      resetForm();
    }
  }, [editingDebt]);

  const resetForm = () => {
    setName('');
    setAmount('');
    setCategory('');
    setDueDate('');
    setFrequency('');
    setNotes('');
    setErrors({
      name: false,
      amount: false,
      category: false,
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = () => {
    const newErrors = {
      name: !name.trim(),
      amount: !amount.trim() || isNaN(Number(amount)) || Number(amount) <= 0,
      category: !category.trim(),
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleSave = () => {
    if (!validateForm()) {
      showToast("Please fill in all required fields");
      return;
    }

    onSave({
      name: name.trim(),
      amount: amount.trim(),
      category: category.trim(),
      dueDate: dueDate.trim() || undefined,
      frequency: frequency.trim() || undefined,
      notes: notes.trim() || undefined,
      type,
      status: editingDebt?.status || 'unpaid',
      paidAmount: editingDebt?.paidAmount || undefined
    });
    handleClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingDebt ? 'Edit' : 'Add'} {type === 'owe' ? 'Debt' : 'Credit'}
              </Text>
              <TouchableOpacity onPress={handleClose}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Name*</Text>
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter name"
                  placeholderTextColor="#666"
                />
                {errors.name && <Text style={styles.errorText}>Name is required</Text>}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Amount*</Text>
                <TextInput
                  style={[styles.input, errors.amount && styles.inputError]}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="Enter amount"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />
                {errors.amount && <Text style={styles.errorText}>Valid amount is required</Text>}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Category*</Text>
                <Dropdown
                  style={[styles.dropdown, errors.category && styles.inputError]}
                  data={categories}
                  labelField="label"
                  valueField="value"
                  value={category}
                  onChange={item => {
                    setCategory(item.value);
                    setErrors(prev => ({ ...prev, category: false }));
                  }}
                  placeholder="Select category"
                  placeholderStyle={styles.dropdownPlaceholder}
                  selectedTextStyle={styles.dropdownSelectedText}
                  itemTextStyle={styles.dropdownItemText}
                  containerStyle={styles.dropdownContainer}
                />
                {errors.category && <Text style={styles.errorText}>Category is required</Text>}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Due Date (Optional)</Text>
                <TextInput
                  style={styles.input}
                  value={dueDate}
                  onChangeText={setDueDate}
                  placeholder="Enter due date"
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Frequency (Optional)</Text>
                <Dropdown
                  style={styles.dropdown}
                  data={frequencies}
                  labelField="label"
                  valueField="value"
                  value={frequency}
                  onChange={item => setFrequency(item.value)}
                  placeholder="Select frequency"
                  placeholderStyle={styles.dropdownPlaceholder}
                  selectedTextStyle={styles.dropdownSelectedText}
                  itemTextStyle={styles.dropdownItemText}
                  containerStyle={styles.dropdownContainer}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Notes</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Enter notes (optional)"
                  placeholderTextColor="#666"
                  multiline
                  numberOfLines={4}
                />
              </View>
            </ScrollView>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={handleClose}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.buttonText}>{editingDebt ? 'Update' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
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
    maxHeight: '90%',
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
  form: {
    maxHeight: '80%',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    color: '#fff',
    marginBottom: 8,
    fontSize: 14,
    fontFamily: 'Rubik',
  },
  input: {
    backgroundColor: '#343f52',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontFamily: 'Rubik',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dropdown: {
    backgroundColor: '#343f52',
    borderRadius: 8,
    padding: 12,
  },
  dropdownPlaceholder: {
    color: '#666',
    fontFamily: 'Rubik',
  },
  dropdownSelectedText: {
    color: '#fff',
    fontFamily: 'Rubik',
  },
  dropdownItemText: {
    color: '#fff',
    fontFamily: 'Rubik',
  },
  dropdownContainer: {
    backgroundColor: '#343f52',
    borderRadius: 8,
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#343f52',
  },
  saveButton: {
    backgroundColor: '#7b80ff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Rubik-Medium',
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#ff4d4f',
  },
  errorText: {
    color: '#ff4d4f',
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'Rubik',
  },
})

export default DebtModal 