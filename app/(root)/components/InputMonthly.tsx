import images from '@/constants/images';
import icons from '@/constants/icons';
import React, {useState, useRef, useEffect} from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, Switch, ScrollView, Dimensions, Modal, SafeAreaView } from "react-native";
import { useUserContext, RecurrenceType } from '../context/UserContext';
import { useNavigation } from 'expo-router';

interface NumberType {
  isVisible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const InputNumberMonthly = ({ isVisible, onClose, onComplete }: NumberType) => {
  const { 
    salaryMonthly, 
    setSalaryMonthly, 
    setIsSalaryInputComplete,
    isRecurring,
    setIsRecurring,
    recurrenceFrequency,
    setRecurrenceFrequency
  } = useUserContext();
  
  const [currentView, setCurrentView] = useState<'keypad' | 'recurrence'>('keypad');
  const navigation = useNavigation();
  const { height, width } = Dimensions.get('window');

  useEffect(() => {
    if (isVisible) {
      // When the monthly modal becomes visible, reset the view to keypad
      setCurrentView('keypad');
      console.log("Monthly modal is now visible, view set to keypad");
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const handlePress = (value: string) => {
    setSalaryMonthly((prev: string) => (prev === "0" ? value : prev + value));
  };

  const handleDelete = () => {
    setSalaryMonthly((prev: string) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
  };

  const handleSave = () => {
    if (salaryMonthly === "0" || salaryMonthly === "") {
      Alert.alert("Invalid Salary", "Please enter a valid salary amount.");
      return;
    }
    
    if (currentView === 'keypad') {
      console.log("Moving from keypad to recurrence view");
      setCurrentView('recurrence');
    } else {
      console.log("Monthly Salary saved:", salaryMonthly);
      console.log("Is recurring:", isRecurring);
      console.log("Recurrence frequency:", recurrenceFrequency);
      setIsSalaryInputComplete(true);
      console.log("Salary input marked as complete");
      onComplete();
      console.log("onComplete callback executed, closing monthly modal");
      onClose();
    }
  };

  const handleFrequencySelect = (frequency: RecurrenceType) => {
    setRecurrenceFrequency(frequency);
  };

  const renderKeypadView = () => (
    <View style={styles.contentContainer}>
      {/* Salary Display */}
      <Text style={styles.salaryText}>₹ {salaryMonthly}</Text>
      <Text style={styles.subtitle}>Add Your Monthly Income</Text>

      {/* Number Pad */}
      <View style={styles.keypad}>
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"].map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.key}
            onPress={() => (item === "⌫" ? handleDelete() : handlePress(item))}
          >
            <Text style={styles.keyText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Continue Button */}
      <TouchableOpacity 
        onPress={handleSave} 
        style={styles.continueButton}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRecurrenceView = () => (
    <View style={styles.contentContainer}>
      <Text style={styles.frequencyTitle}>Income Details</Text>
      <Text style={styles.salaryConfirm}>₹ {salaryMonthly}</Text>
      
      {/* Recurring Toggle */}
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>Is this a recurring income?</Text>
        <Switch
          value={isRecurring}
          onValueChange={setIsRecurring}
          trackColor={{ false: "#3E4D67", true: "#7b80ff" }}
          thumbColor="#fff"
          ios_backgroundColor="#3E4D67"
        />
      </View>

      {/* Frequency Options - only show if isRecurring is true */}
      {isRecurring && (
        <View style={styles.frequencyContainer}>
          <Text style={styles.frequencyLabel}>How often do you receive it?</Text>
          <ScrollView style={styles.frequencyOptions} showsVerticalScrollIndicator={false}>
            {[
              { value: 'weekly', label: 'Weekly', description: 'Every week' },
              { value: 'monthly', label: 'Monthly', description: 'Every month' },
              { value: 'quarterly', label: 'Quarterly', description: 'Every 3 months' },
              { value: 'yearly', label: 'Yearly', description: 'Once a year' },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.frequencyOption,
                  recurrenceFrequency === option.value && styles.selectedFrequency,
                ]}
                onPress={() => handleFrequencySelect(option.value as RecurrenceType)}
              >
                <View style={styles.frequencyContent}>
                  <Text 
                    style={[
                      styles.frequencyText,
                      recurrenceFrequency === option.value && styles.selectedFrequencyText,
                    ]}
                  >
                    {option.label}
                  </Text>
                  <Text style={styles.frequencyDescription}>
                    {option.description}
                  </Text>
                </View>
                {recurrenceFrequency === option.value && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Back and Save Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity 
          onPress={() => setCurrentView('keypad')} 
          style={[styles.actionButton, styles.backButtonAction]}
        >
          <Text style={[styles.actionButtonText, {color: "#7b80ff"}]}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={handleSave} 
          style={[styles.actionButton, styles.saveButtonAction]}
        >
          <Text style={styles.actionButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={false}
      statusBarTranslucent={true}
    >
      <SafeAreaView style={[styles.container, { width, height }]}>
        <View
          style={[
            styles.overlay,
            {
              width,
              height,
            }
          ]}
        >
          {/* Header with Back Button */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Image source={icons.backArrow} style={styles.backIcon} tintColor="#7b80ff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {currentView === 'keypad' 
                ? (salaryMonthly > "0" ? "Edit Income" : "Add Income") 
                : "Income Settings"}
            </Text>
            <TouchableOpacity style={styles.avatarContainer}>
              <Image source={images.avatar} style={styles.avatar} />
            </TouchableOpacity>
          </View>

          {/* Content View - Keypad or Recurrence */}
          {currentView === 'keypad' ? renderKeypadView() : renderRecurrenceView()}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default InputNumberMonthly;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f2630',
  },
  overlay: {
    flex: 1,
    backgroundColor: '#1f2630',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    fontFamily: "Rubik",
  },
  avatarContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  contentContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: 20,
  },
  salaryText: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 100,
    fontFamily: "Rubik-Bold",
  },
  subtitle: {
    color: "#aaa",
    marginBottom: 20,
    fontFamily: "Rubik",
  },
  keypad: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    width: "80%",
  },
  key: {
    backgroundColor: "#444",
    padding: 20,
    margin: 8,
    borderRadius: 10,
    minWidth: 70,
    alignItems: "center",
  },
  keyText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "Barlow",
  },
  continueButton: {
    backgroundColor: "#7b80ff",
    padding: 15,
    borderRadius: 8,
    marginTop: 30,
    width: "50%",
    alignItems: "center",
    justifyContent: "center",
  },
  continueButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontFamily: "Rubik",
    fontSize: 16,
  },
  frequencyTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 100,
    fontFamily: "Rubik-Bold",
  },
  salaryConfirm: {
    color: "#7b80ff",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 30,
    fontFamily: "Rubik-Bold",
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "90%",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#3E4D67",
  },
  toggleLabel: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Rubik",
  },
  frequencyContainer: {
    width: "90%",
    marginTop: 20,
  },
  frequencyLabel: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 10,
    fontFamily: "Rubik",
  },
  frequencyOptions: {
    maxHeight: 220,
  },
  frequencyOption: {
    backgroundColor: "#3E4D67",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedFrequency: {
    backgroundColor: "#343f52",
    borderWidth: 1,
    borderColor: "#7b80ff",
  },
  frequencyContent: {
    flex: 1,
  },
  frequencyText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Rubik",
    marginBottom: 4,
  },
  frequencyDescription: {
    color: "#aaa",
    fontSize: 12,
    fontFamily: "Rubik",
  },
  selectedFrequencyText: {
    fontWeight: "bold",
    color: "#7b80ff",
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#7b80ff",
    justifyContent: "center",
    alignItems: "center",
  },
  checkmarkText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginTop: 30,
    gap: 12,
  },
  actionButton: {
    padding: 15,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonAction: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#7b80ff",
  },
  saveButtonAction: {
    backgroundColor: "#7b80ff",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontFamily: "Rubik",
    fontSize: 16,
  },
});