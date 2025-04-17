import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';

const NEWS_ITEMS = [
  "Track your expenses and save more",
  "Set financial goals and achieve them",
  "Monitor your spending patterns",
  "Stay on top of your budget",
  "Make smarter financial decisions"
];

const NewsMarquee = () => {
  const translateX = useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get('window').width;
  const contentWidth = useRef(0);

  useEffect(() => {
    const startAnimation = () => {
      // Reset to start position
      translateX.setValue(0);
      
      // Create the animation
      Animated.loop(
        Animated.timing(translateX, {
          toValue: -contentWidth.current,
          duration: 20000, // Slower duration for smoother effect
          useNativeDriver: true,
        })
      ).start();
    };

    startAnimation();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.marqueeContainer, 
          { transform: [{ translateX }] }
        ]}
        onLayout={(event) => {
          const width = event.nativeEvent.layout.width;
          contentWidth.current = width;
        }}
      >
        {/* First set of items */}
        {NEWS_ITEMS.map((item, index) => (
          <React.Fragment key={`first-${index}`}>
            <Text style={styles.newsText}>{item}</Text>
            <Text style={styles.separator}>•</Text>
          </React.Fragment>
        ))}
        {/* Duplicate set of items for seamless loop */}
        {NEWS_ITEMS.map((item, index) => (
          <React.Fragment key={`second-${index}`}>
            <Text style={styles.newsText}>{item}</Text>
            <Text style={styles.separator}>•</Text>
          </React.Fragment>
        ))}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '90%',
    overflow: 'hidden',
    height: 20,
    backgroundColor: 'transparent',
  },
  marqueeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  newsText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Rubik',
    marginRight: 10,
    flexShrink: 0,
  },
  separator: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Rubik',
    marginRight: 10,
    opacity: 0.7,
  },
});

export default NewsMarquee; 