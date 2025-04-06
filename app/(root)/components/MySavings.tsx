import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
  Image
} from 'react-native';
import { useUserContext } from '../context/UserContext';
import icons from '@/constants/icons';

// Define colors
const COLORS = {
  main: '#1f2630',
  primary: '#FFFFFF',
  accent: '#7b80ff',
  success: '#4CAF50',
  growing: '#36D399',
  progress: '#00D4AC',
  progressBg: '#E5E5E5',
};

interface MySavingsProps {
  onClose: () => void;
}

const MySavings = ({ onClose }: MySavingsProps) => {
  const { savings, existingSavings, setExistingSavings, salaryMonthly } = useUserContext();
  const [savingsAmount, setSavingsAmount] = useState('');
  const [showDashboard, setShowDashboard] = useState(false);
  
  // Calculate emergency fund goal (24 months of expenses instead of 6)
  const monthlyIncome = parseFloat(salaryMonthly?.toString() || '0');
  const emergencyGoal = monthlyIncome * 24;
  const totalSavings = (existingSavings || 0) + (savings || 0);
  const emergencyProgress = totalSavings && emergencyGoal ? Math.min(Math.round((totalSavings / emergencyGoal) * 100), 100) : 0;

  // Initialize with stored value, but don't show dashboard automatically
  useEffect(() => {
    if (existingSavings !== undefined && existingSavings > 0) {
      setSavingsAmount(existingSavings.toString());
      // Don't automatically show dashboard: setShowDashboard(true);
    }
  }, [existingSavings]);

  const handleSaveSavings = () => {
    const amount = parseFloat(savingsAmount.replace(/,/g, ''));
    
    if (isNaN(amount)) {
      Alert.alert('Invalid Amount', 'Please enter a valid savings amount.');
      return;
    }
    
    setExistingSavings(amount);
    setShowDashboard(true);
  };

  const formatAmount = (text: string) => {
    // Remove any non-digit characters except decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    let formatted = parts[0];
    if (parts.length > 1) {
      formatted += '.' + parts[1];
    }
    
    // Add commas for thousands
    formatted = formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    return formatted;
  };

  const handleAmountChange = (text: string) => {
    const formatted = formatAmount(text);
    setSavingsAmount(formatted);
  };

  // Render the savings dashboard after saving
  if (showDashboard) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <Image 
              source={icons.backArrow} 
              style={{ width: 24, height: 24, tintColor: COLORS.primary }}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Existing Savings</Text>
          <TouchableOpacity 
            style={styles.updateButton}
            onPress={() => setShowDashboard(false)}
          >
            <Text style={styles.updateButtonText}>Update</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.scrollView}>
          <View style={styles.savingsCard}>
            <View style={styles.savingsIconRow}>
              <Image 
                source={icons.wallet}
                style={{ width: 24, height: 24, tintColor: '#36D4A9' }}
              />
              <Text style={styles.savingsTitle}>Existing Savings</Text>
            </View>
            
            <Text style={styles.savingsDescription}>Your total accumulated savings</Text>
            
            <Text style={styles.savingsAmount}>
              ₹{parseFloat(savingsAmount.replace(/,/g, '')).toLocaleString('en-IN', {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2
              })}
            </Text>
            
            <View style={styles.statusRow}>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Growing</Text>
              </View>
            </View>
            
            <View style={styles.emergencyContainer}>
              <View style={styles.emergencyRow}>
                <Image 
                  source={icons.shield}
                  style={{ width: 20, height: 20, tintColor: COLORS.primary }}
                />
                <Text style={styles.emergencyText}>Emergency Fund</Text>
                <Text style={styles.emergencyPercentage}>{emergencyProgress}%</Text>
              </View>
              
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBg}>
                  <View 
                    style={[
                      styles.progressBarFill,
                      { width: `${emergencyProgress}%` }
                    ]} 
                  />
                </View>
              </View>
              
              <Text style={styles.emergencyGoal}>
                Goal: ₹{emergencyGoal.toLocaleString('en-IN', {
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 2
                })} (2 years of expenses)
              </Text>
            </View>
            
            <View style={styles.tipsContainer}>
              <View style={styles.tipsHeader}>
                <Image
                  source={icons.chart}
                  style={{ width: 20, height: 20, tintColor: COLORS.primary }}
                />
                <Text style={styles.tipsTitle}>Personalized Tips</Text>
                <TouchableOpacity style={styles.infoButton}>
                  <Image
                    source={icons.info}
                    style={{ width: 20, height: 20, tintColor: COLORS.primary }}
                  />
                </TouchableOpacity>
              </View>
              
              <View style={styles.tipInfoBox}>
                <Text style={styles.tipInfoText}>
                  These recommendations are based on your current savings amount and general financial best practices for Indian investors.
                </Text>
              </View>
              
              <View style={styles.tipItem}>
                <View style={styles.tipBullet} />
                <Text style={styles.tipText}>
                  Consider investing in index funds or diversified mutual funds
                </Text>
              </View>
              
              <View style={styles.tipItem}>
                <View style={styles.tipBullet} />
                <Text style={styles.tipText}>
                  Explore tax-efficient investment options like PPF or ELSS
                </Text>
              </View>
              
              <View style={styles.tipItem}>
                <View style={styles.tipBullet} />
                <Text style={styles.tipText}>
                  Consider meeting with a financial advisor for personalized strategy
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Initial savings input screen
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Image 
            source={icons.backArrow} 
            style={{ width: 24, height: 24, tintColor: COLORS.primary }}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Existing Savings</Text>
      </View>
      
      <View style={styles.savingsInputContainer}>
        <View style={styles.savingsInputCard}>
          <Text style={styles.savingsInputLabel}>
            Enter your Existing Savings, if any.
          </Text>
          
          <View style={styles.inputField}>
            <TextInput
              style={styles.amountInputField}
              placeholder="Enter Amount"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              keyboardType="numeric"
              value={savingsAmount}
              onChangeText={handleAmountChange}
            />
          </View>
          
          <TouchableOpacity 
            style={styles.saveButtonLarge}
            onPress={handleSaveSavings}
          >
            <Text style={styles.saveButtonLargeText}>Save</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.savingsHelperText}>
          *Any Existing savings will help us estimate your goals better
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f2630',
    marginTop: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  updateButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
    paddingBottom: 50,
  },
  savingsCard: {
    margin: 16,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  savingsIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  savingsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  savingsDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 16,
  },
  savingsAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  statusBadge: {
    backgroundColor: 'rgba(54, 211, 153, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  statusText: {
    color: COLORS.growing,
    fontWeight: '600',
    fontSize: 14,
  },
  emergencyContainer: {
    marginBottom: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    padding: 16,
  },
  emergencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  emergencyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    marginLeft: 8,
  },
  emergencyPercentage: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  progressBarContainer: {
    marginBottom: 8,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: COLORS.progressBg,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.progress,
    borderRadius: 4,
  },
  emergencyGoal: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  tipsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    padding: 16,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    marginLeft: 8,
  },
  infoButton: {
    padding: 4,
  },
  tipInfoBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  tipInfoText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  tipBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
    marginRight: 12,
  },
  tipText: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
    lineHeight: 22,
  },
  // Savings input screen styles
  savingsInputContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  savingsInputCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 24,
    alignItems: 'center',
  },
  savingsInputLabel: {
    fontSize: 16,
    color: COLORS.primary,
    marginBottom: 24,
    textAlign: 'center',
  },
  inputField: {
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(123, 128, 255, 0.4)',
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  amountInputField: {
    width: '100%',
    color: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  saveButtonLarge: {
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonLargeText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  savingsHelperText: {
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 12,
  },
  // Other styles
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  }
});

export default MySavings; 