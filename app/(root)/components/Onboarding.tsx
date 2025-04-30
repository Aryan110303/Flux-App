import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import images from '@/constants/images'

const STEPS = [
  {
    title: 'Track Your Expenses',
    description: 'Easily record and monitor your daily spending to stay on top of your finances.',
    icon: images.onboarding,
  },
  {
    title: 'Set Financial Goals',
    description: 'Define your savings targets and let the app help you achieve them.',
    icon: images.onboarding,
  },
  {
    title: 'Get Smart Insights',
    description: 'Receive personalized tips and insights to improve your money habits.',
    icon: images.onboarding,
  },
];

const COLORS = {
  primary: '#fff',
  accent: '#7b80ff',
  main: '#1f2630',
};

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = React.useState(0);
  const isLast = step === STEPS.length - 1;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image source={STEPS[step].icon} style={styles.icon} resizeMode="contain" />
        <Text style={styles.title}>{STEPS[step].title}</Text>
        <Text style={styles.description}>{STEPS[step].description}</Text>
        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View key={i} style={[styles.dot, step === i && styles.activeDot]} />
          ))}
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            if (isLast) onComplete();
            else setStep(s => s + 1);
          }}
        >
          <Text style={styles.buttonText}>{isLast ? 'Get Started' : 'Next'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: COLORS.primary,
    borderRadius: 32,
    padding: 44,
    alignItems: 'center',
    width: '95%',
    shadowColor: COLORS.accent,
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  icon: {
    width: 180,
    height: 180,
    marginBottom: 32,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: COLORS.main,
    marginBottom: 18,
    textAlign: 'center',
  },
  description: {
    fontSize: 20,
    color: '#444',
    marginBottom: 32,
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 6,
  },
  activeDot: {
    backgroundColor: COLORS.accent,
  },
  button: {
    backgroundColor: COLORS.accent,
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 16,
  },
  buttonText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 