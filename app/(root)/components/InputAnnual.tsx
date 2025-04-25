import images from '@/constants/images';
import icons from '@/constants/icons';
import React, {useState, useRef, useEffect} from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, Animated, Dimensions, Modal, SafeAreaView } from "react-native";
import { useUserContext } from '../context/UserContext';
import { useNavigation } from 'expo-router';
import { useGlobalContext } from "@/lib/global-provider";

interface NumberType{
    isVisible: boolean
    onClose: () => void 
    onSave: () => void
}

const InputNumberAnnual = ({ isVisible, onClose, onSave }: NumberType) => {
  const navigation = useNavigation();
  const { salaryYearly, setSalaryYearly } = useUserContext();
  const { user } = useGlobalContext();
  const [localSalary, setLocalSalary] = useState(salaryYearly.toString());
  const translateY = useRef(new Animated.Value(800)).current;
  const { height, width } = Dimensions.get('window');

  useEffect(() => {
    if (isVisible) {
      // Hide the tab bar when the modal is visible
      // @ts-ignore
      navigation.getParent()?.setOptions({
        tabBarStyle: { 
          display: 'none',
          height: 0,
          opacity: 0,
        }
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
          display: 'flex',
          backgroundColor: '#1f2630',
          position: 'absolute',
          borderTopColor: '#0061FF1A',
          borderTopWidth: 0.2,
          minHeight: 70,
          height: 70,
          opacity: 1,
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
          display: 'flex',
          backgroundColor: '#1f2630',
          position: 'absolute',
          borderTopColor: '#0061FF1A',
          borderTopWidth: 0.2,
          minHeight: 70,
          height: 70,
          opacity: 1,
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
    setSalaryYearly(salaryNum);
    console.log("Calling onSave to trigger transition to monthly modal");
    onSave();
  }

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
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Image source={icons.backArrow} style={styles.backIcon} tintColor="#7b80ff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{salaryYearly > 0 ? "Edit Salary" : "Add Salary"}</Text>
            <TouchableOpacity style={styles.avatarContainer}>
              {user?.avatar ? (
                <Image 
                  source={{ uri: user.avatar }} 
                  style={styles.avatar}
                  defaultSource={images.avatar}
                />
              ) : (
                <Image source={images.avatar} style={styles.avatar} />
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.salaryText}>₹ {localSalary}</Text>
          <Text style={styles.subtitle}>Add Your Annual Salary</Text>

          <View style={styles.keypad}>
            {["1", "2", "3", "4", "5", "6", "7", "8", "9",".", "0", "⌫"].map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.key}
                onPress={() => (item === "⌫" ? handleDelete() : handlePress(item))}
              >
                <Text style={styles.keyText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity 
            onPress={handleSave} 
            style={styles.saveButton}
          >
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default InputNumberAnnual;

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
    color: "#fff",
    fontWeight: "bold",
    fontFamily: "Rubik",
    fontSize: 16,
  },
});