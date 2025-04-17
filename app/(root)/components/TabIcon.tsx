import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface TabIconProps {
  name: string;
  color: string;
  size: number;
}

export default function TabIcon({ name, color, size }: TabIconProps) {
  return (
    <View style={styles.container}>
      <Ionicons name={name as any} size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 