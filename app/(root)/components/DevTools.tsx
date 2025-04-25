import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, PanResponder, Dimensions } from 'react-native';
import { useExpenses } from '../context/ExpenseContext';
import { useUserContext } from '../context/UserContext';

const DevTools = () => {
  const { resetStorage: resetExpenses } = useExpenses();
  const { resetStorage: resetUserData } = useUserContext();
  const { width, height } = Dimensions.get('window');
  const buttonSize = 24;
  
  // Set initial position to bottom-right corner with some padding
  const [position, setPosition] = useState({ 
    x: width - buttonSize - 20, 
    y: height - buttonSize - 20 
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const { moveX, moveY } = gestureState;
        
        // Calculate new position while keeping the button within screen bounds
        const newX = Math.max(0, Math.min(moveX - buttonSize/2, width - buttonSize));
        const newY = Math.max(0, Math.min(moveY - buttonSize/2, height - buttonSize));
        
        setPosition({ x: newX, y: newY });
      },
    })
  ).current;

  const handleReset = async () => {
    try {
      // Reset both contexts
      await Promise.all([
        resetExpenses(),
        resetUserData()
      ]);
      console.log('All data has been reset');
    } catch (error) {
      console.error('Error resetting data:', error);
    }
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        {
          transform: [
            { translateX: position.x },
            { translateY: position.y }
          ]
        }
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity style={styles.button} onPress={handleReset}>
        <Text style={styles.buttonText}>R</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1000,
  },
  button: {
    backgroundColor: '#ff4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default DevTools; 