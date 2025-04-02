import React, {useState, useRef, useEffect} from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Alert, Animated, TextInput, TouchableWithoutFeedback, Keyboard } from "react-native";
import { useUserContext } from '../context/UserContext';
import ToastManager, { Toast } from "toastify-react-native";

interface NumberType{
    isVisible: boolean
    onClose: () => void 
}

const GoalInput = ({ isVisible, onClose }: NumberType) => {
  const { goal, setGoal, goalAmount, setGoalAmount } = useUserContext();
  const [localGoal, setLocalGoal] = useState(goal || "");
  const [localGoalAmount, setLocalGoalAmount] = useState(goalAmount.toString());
  const translateY = useRef(new Animated.Value(800)).current;

  const showToast = () => {
    Toast.success("Goal saved successfully!");
  }

  const handleSave = () => {
    if(!localGoal || !localGoalAmount || parseFloat(localGoalAmount) <= 0){
      Alert.alert('Error', 'Please fill in all fields with valid values');
      return;
    }
    setGoal(localGoal);
    setGoalAmount(parseFloat(localGoalAmount));
    showToast();
    onClose();
  }

  useEffect(() => {
    if (isVisible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: 800,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <Animated.View style={[
      styles.overlay,
      { transform: [{ translateY }] },
    ]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.overlay}>
          {/* Header with Back Button */}
          <View style={styles.header} className='gap-36'>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.backText}>←</Text>
            </TouchableOpacity>
            <Text className='text-primary text-xl font-rubik pt-4'>My Goals</Text>
          </View>
          <View className='absolute top-40 left-8 w-[22rem]'>
            <Text className='text-white text-2xl font-rubik-semibold'>What's your Goal?</Text>
            <Text className='text-white font-rubik py-4 opacity-60'>Goal can help you track your progress as you save for something.</Text>
            <TextInput
              style={styles.input}
              placeholder="E.g Save for a Flat"
              placeholderTextColor="#a8a8a8"
              value={localGoal}
              onChangeText={setLocalGoal}
              blurOnSubmit={true}
              returnKeyType="done"
            />
            <TextInput
              style={styles.input2}
              placeholder="Amount"
              placeholderTextColor="#a8a8a8"
              value={localGoalAmount}
              keyboardType='numeric'
              onChangeText={setLocalGoalAmount}
              blurOnSubmit={true}
              returnKeyType="done"
            />
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <Text className='text-primary font-rubik'>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Animated.View>
  );
};

export default GoalInput;

const styles = StyleSheet.create({
    overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    height: "100%",
    width: "100%",
    backgroundColor: "#1f2630",
    alignItems: "center",
    zIndex: 100,
  },
  header: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    height: 50,
    borderColor: '#7b80ff',
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#e0cfd9',
    backgroundColor: 'rgba(123, 128, 255, 0.1)',
  },
  input2: {
    height: 50,
    borderColor: '#7b80ff',
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    marginTop: 28,
    color: '#e0cfd9',
    backgroundColor: 'rgba(123, 128, 255, 0.1)',
  },
  backText: {
    fontSize: 24,
    color: "#fff",
  },
  headerTitle: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    fontFamily: "rubik",
  },
  profileIcon: {
    fontSize: 18,
    color: "#fff",
  },
  subtitle: {
    color: "#aaa",
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: "#7b80ff",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    width: "50%",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#7b80ff",
  },
  saveText: {
    color: "#e0cfd9",
    fontWeight: "bold",
    fontFamily: "Rubik",
  },
});