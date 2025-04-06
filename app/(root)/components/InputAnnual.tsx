import images from '@/constants/images';
import React, {useState, useRef, useEffect} from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, Animated, Dimensions } from "react-native";
import { useUserContext } from '../context/UserContext';
import { useNavigation } from 'expo-router';

interface NumberType{
    isVisible: boolean
    onClose: () => void 
    onSave: () => void
}

const InputNumberAnnual = ({ isVisible, onClose, onSave }: NumberType) => {
  const navigation = useNavigation();
  const { salaryYearly, setSalaryYearly } = useUserContext();
  const [localSalary, setLocalSalary] = useState(salaryYearly.toString());
  const translateY = useRef(new Animated.Value(800)).current;
  const { height, width } = Dimensions.get('window');

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

    // Cleanup function to restore tab bar when component unmounts
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

  if (!isVisible) return null;

  const handlePress = (value: string) => {
    setLocalSalary((prev: string) => (prev === "0" ? value : prev + value));
  };
  
  const handleDelete = () => {
    setLocalSalary((prev: string) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
  };
  
  const handleSave = () => {
    const salaryNum = parseFloat(localSalary);
    if (isNaN(salaryNum) || salaryNum <= 0) {
      Alert.alert("Invalid Salary", "Please enter a valid salary amount.");
      return;
    }
    console.log("Annual Salary saved:", salaryNum);
    // First set the salary in context
    setSalaryYearly(salaryNum);
    
    // Call onSave to trigger the next step (showing monthly modal)
    console.log("Calling onSave to trigger transition to monthly modal");
    onSave();
    
    // No need to call onClose here as it will be handled by the parent component
  }

  return (
    <View style={[styles.container, { width, height }]}>
      <Animated.View 
        style={[
          styles.overlay,
          { 
            transform: [{ translateY }],
            width,
            height,
          }
        ]}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text className='text-primary text-xl font-rubik pt-4'>{salaryYearly > 0 ? "Salary": "Add a Salary"}</Text>
          <TouchableOpacity>
            <Image source={images.avatar} className='size-8'/>
          </TouchableOpacity>
        </View>

        <Text style={styles.salaryText}>₹ {localSalary}</Text>
        <Text style={styles.subtitle} className='font-rubik'>Add Your Annual Salary</Text>

        <View style={styles.keypad}>
          {["1", "2", "3", "4", "5", "6", "7", "8", "9",".", "0", "⌫"].map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.key}
              onPress={() => (item === "⌫" ? handleDelete() : handlePress(item))}
            >
              <Text  className='font-barlow text-primary text-2xl'>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text className='text-primary font-rubik'>Save</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default InputNumberAnnual;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1f2630',
    zIndex: 9999,
    elevation: 9999,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1f2630',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    elevation: 9999,
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
  salaryText: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 100,
  },
  subtitle: {
    color: "#aaa",
    marginBottom: 20,
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
    color: "#e0cfd9",
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: 'Barlow',
  },
  saveButton: {
    backgroundColor: "#7b80ff",
    padding: 15,
    borderRadius: 8,
    marginTop: 40,
    width: "50%",
    alignItems: "center",
  },
  saveText: {
    color: "#e0cfd9",
    fontWeight: "bold",
    fontFamily: "Rubik",
  },
});