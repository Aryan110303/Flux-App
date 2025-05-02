import React, { useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

const NEWS_ITEMS = [
  "Track your expenses and save more",
  "Set financial goals and achieve them",
  "Monitor your spending patterns",
  "Stay on top of your budget",
  "Make smarter financial decisions"
];

const NewsMarquee = () => {
  const translateX = useRef(new Animated.Value(0)).current;
  const [contentWidth, setContentWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  // Start animation when both widths are known
  React.useEffect(() => {
    if (contentWidth > 0 && containerWidth > 0) {
      translateX.setValue(0);
      Animated.loop(
        Animated.timing(translateX, {
          toValue: -contentWidth,
          duration: 40000,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [contentWidth, containerWidth]);

  return (
    <View
      style={styles.container}
      onLayout={e => setContainerWidth(e.nativeEvent.layout.width)}
    >
      {/* Hidden view to measure the full content width */}
      <View
        style={styles.hiddenContent}
        onLayout={e => setContentWidth(e.nativeEvent.layout.width)}
      >
        {NEWS_ITEMS.concat(NEWS_ITEMS).map((item, index) => (
          <React.Fragment key={index}>
            <Text style={styles.newsText}>{item}</Text>
            <Text style={styles.separator}>•</Text>
          </React.Fragment>
        ))}
      </View>
      {/* Animated marquee */}
      {contentWidth > 0 && (
        <Animated.View
          style={[
            styles.marqueeContainer,
            { width: contentWidth, transform: [{ translateX }] }
          ]}
        >
          {NEWS_ITEMS.concat(NEWS_ITEMS).map((item, index) => (
            <React.Fragment key={index}>
              <Text style={styles.newsText}>{item}</Text>
              <Text style={styles.separator}>•</Text>
            </React.Fragment>
          ))}
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '90%',
    overflow: 'hidden',
    height: 20,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
  },
  marqueeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    top: 0,
    height: 20,
  },
  hiddenContent: {
    position: 'absolute',
    opacity: 0,
    flexDirection: 'row',
    alignItems: 'center',
    left: 0,
    top: 0,
    height: 20,
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