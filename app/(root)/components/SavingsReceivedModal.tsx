import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Animated, 
  Dimensions, 
  Alert,
  Image,
  TouchableWithoutFeedback,
  Modal
} from 'react-native';
import { useNavigation } from 'expo-router';
import { useUserContext } from '../context/UserContext';
import icons from '@/constants/icons';

interface SalaryReceivedModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const SalaryReceivedModal = ({ isVisible, onClose }: SalaryReceivedModalProps) => {
  const navigation = useNavigation();
  const { salaryMonthly, savings, existingSavings, addSalaryToSavings, lastSalaryReceived } = useUserContext();
  const translateY = useRef(new Animated.Value(800)).current;
  const { height } = Dimensions.get('window');
  
  // Format the salary with commas
  const formattedSalary = salaryMonthly 
    ? parseFloat(salaryMonthly.replace(/,/g, '')).toLocaleString('en-IN')
    : '0';

  // Calculate total savings (monthly + existing)
  const totalSavings = (savings || 0) + (existingSavings || 0);
  const formattedTotalSavings = totalSavings.toLocaleString('en-IN');

  useEffect(() => {
    if (isVisible) {
      // Hide the tab bar when the modal is visible
      // @ts-ignore
      navigation.getParent()?.setOptions({
        tabBarStyle: { display: 'none' }
      });
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Show the tab bar when the modal is hidden
      // @ts-ignore
      navigation.getParent()?.setOptions({
        tabBarStyle: {
          backgroundColor: '#1f2630',
          position: 'absolute',
          borderTopColor: '#0061FF1A',
          borderTopWidth: 0.2,
          minHeight: 70,
          height: 70,
        }
      });
      Animated.timing(translateY, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }

    return () => {
      // @ts-ignore
      navigation.getParent()?.setOptions({
        tabBarStyle: {
          backgroundColor: '#1f2630',
          position: 'absolute',
          borderTopColor: '#0061FF1A',
          borderTopWidth: 0.2,
          minHeight: 70,
          height: 70,
        }
      });
    };
  }, [isVisible, navigation]);

  const handleConfirmSalary = () => {
    addSalaryToSavings();
    Alert.alert(
      "Salary Added", 
      `₹${formattedSalary} has been added to your monthly savings!\n\nYour total savings (including existing savings) is now ₹${formattedTotalSavings}.`,
      [{ text: "OK", onPress: onClose }]
    );
  };

  const handleNotYet = () => {
    onClose();
  };

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View 
              style={[
                styles.modalContainer, 
                { transform: [{ translateY }] }
              ]}
            >
              <View style={styles.header}>
                <Text style={styles.title}>Salary Received?</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.content}>
                <Image source={icons.wallet} style={styles.icon} />
                
                <Text style={styles.description}>
                  Have you received your monthly salary of ₹{formattedSalary}?
                </Text>
                
                <Text style={styles.subDescription}>
                  Confirming will add this amount to your savings.
                </Text>
                
                {lastSalaryReceived && (
                  <Text style={styles.lastReceived}>
                    Last salary recorded: {lastSalaryReceived.toLocaleDateString()}
                  </Text>
                )}
                
                <View style={styles.buttonContainer}>
                  <TouchableOpacity 
                    style={[styles.button, styles.secondaryButton]} 
                    onPress={handleNotYet}
                  >
                    <Text style={styles.secondaryButtonText}>Not Yet</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.button, styles.primaryButton]} 
                    onPress={handleConfirmSalary}
                  >
                    <Text style={styles.primaryButtonText}>Yes, Add to Savings</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#1f2630',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#343f52',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#343f52',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Rubik-Medium',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 20,
    opacity: 0.7,
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  icon: {
    width: 60,
    height: 60,
    tintColor: '#7b80ff',
    marginBottom: 16,
  },
  description: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Rubik-Medium',
  },
  subDescription: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Rubik',
  },
  lastReceived: {
    color: '#7b80ff',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Rubik',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  primaryButton: {
    backgroundColor: '#7b80ff',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Rubik-Medium',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#7b80ff',
  },
  secondaryButtonText: {
    color: '#7b80ff',
    fontSize: 14,
    fontFamily: 'Rubik-Medium',
  },
});

export default SalaryReceivedModal; 