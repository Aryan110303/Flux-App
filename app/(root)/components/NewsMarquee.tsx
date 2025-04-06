import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';

interface NewsItem {
    title: string;
    url: string;
}

// Fallback news items in case the API doesn't return enough
const FALLBACK_NEWS = [
    { title: "Markets show strong performance as global economy stabilizes", url: "#" },
    { title: "RBI announces new policy measures to boost economic growth", url: "#" },
    { title: "Tech stocks lead market rally amid positive earnings reports", url: "#" },
    { title: "Oil prices stabilize as global production meets demand", url: "#" },
    { title: "Gold sees uptick as investors seek safe-haven assets", url: "#" },
    { title: "Banking sector shows resilience amid economic challenges", url: "#" },
    { title: "Rupee strengthens against dollar on positive economic outlook", url: "#" },
    { title: "Government announces new fiscal measures to support small businesses", url: "#" },
    { title: "Mutual funds see record inflows as retail investment grows", url: "#" },
    { title: "Real estate sector recovers with increasing demand for housing", url: "#" },
    { title: "Electric vehicle stocks surge on government incentives", url: "#" },
    { title: "Pharma sector outperforms broader market on strong earnings", url: "#" },
    { title: "Renewable energy investments hit all-time high in India", url: "#" },
    { title: "Inflation data shows signs of cooling as commodity prices ease", url: "#" },
    { title: "India's manufacturing PMI hits 15-month high on strong demand", url: "#" }
];

const MINIMUM_NEWS_COUNT = 15; // Minimum number of news items to display

const NewsMarquee = () => {
    const [news, setNews] = useState<NewsItem[]>([]);
    const scrollX = useRef(new Animated.Value(0)).current;
    const [contentWidth, setContentWidth] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const screenWidth = Dimensions.get('window').width;

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            // Using Alpha Vantage API for stock market news
            const response = await fetch(
                'https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=financial_markets&apikey=QZ7O8SEU388PCR60'
            );
            const data = await response.json();
            
            let newsItems: NewsItem[] = [];
            
            if (data.feed && data.feed.length > 0) {
                newsItems = data.feed.map((item: any) => ({
                    title: item.title,
                    url: item.url
                }));
                
                // If we have less than the minimum, supplement with fallback news
                if (newsItems.length < MINIMUM_NEWS_COUNT) {
                    const neededItems = MINIMUM_NEWS_COUNT - newsItems.length;
                    newsItems = [...newsItems, ...FALLBACK_NEWS.slice(0, neededItems)];
                }
            } else {
                // If API fails, use fallback news
                newsItems = [...FALLBACK_NEWS];
            }
            
            // Duplicate the news items to create a seamless loop
            setNews([...newsItems, ...newsItems]);
        } catch (error) {
            console.error('Error fetching news:', error);
            setNews([...FALLBACK_NEWS, ...FALLBACK_NEWS]); // Duplicate for seamless loop
        }
    };

    useEffect(() => {
        if (news.length > 0 && contentWidth > 0 && !isAnimating) {
            setIsAnimating(true);
            
            // Reset position to start
            scrollX.setValue(0);
            
            // Create infinite horizontal scrolling animation
            // We only animate to -contentWidth/2 (half the content) since we duplicated the news array
            Animated.timing(scrollX, {
                toValue: -contentWidth / 2,
                duration: contentWidth * 20, // Slightly faster for better experience
                useNativeDriver: true,
                isInteraction: false,
            }).start(({ finished }) => {
                if (finished) {
                    // When animation completes, immediately reset to start without animation
                    scrollX.setValue(0);
                    // Restart the animation for continuous effect
                    setIsAnimating(false);
                }
            });
        }
    }, [news, contentWidth, isAnimating]);

    if (!news.length) return null;

    return (
        <View style={styles.container}>
            <Animated.View 
                style={[
                    styles.marqueeContainer, 
                    { transform: [{ translateX: scrollX }] }
                ]}
                onLayout={(event) => {
                    setContentWidth(event.nativeEvent.layout.width);
                }}
            >
                {news.map((item, index) => (
                    <React.Fragment key={index}>
                        <Text style={styles.newsText} numberOfLines={1}>
                            {item.title}
                        </Text>
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
        fontSize: 10,
        fontFamily: 'Rubik',
        marginRight: 10,
        flexShrink: 0,
        maxWidth: 300,
    },
    separator: {
        color: '#fff',
        fontSize: 10,
        fontFamily: 'Rubik',
        marginRight: 10,
        opacity: 0.7,
    },
});

export default NewsMarquee; 