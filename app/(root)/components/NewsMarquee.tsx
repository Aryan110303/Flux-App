import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';

interface NewsItem {
    title: string;
    url: string;
}

const NewsMarquee = () => {
    const [news, setNews] = useState<NewsItem[]>([]);
    const scrollX = useRef(new Animated.Value(0)).current;
    const [contentWidth, setContentWidth] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

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
            
            if (data.feed) {
                const formattedNews = data.feed.map((item: any) => ({
                    title: item.title,
                    url: item.url
                }));
                setNews(formattedNews);
            }
        } catch (error) {
            console.error('Error fetching news:', error);
        }
    };

    useEffect(() => {
        if (news.length > 0 && contentWidth > 0 && !isAnimating) {
            setIsAnimating(true);
            scrollX.setValue(0);
            
            const animation = Animated.loop(
                Animated.sequence([
                    Animated.timing(scrollX, {
                        toValue: -contentWidth,
                        duration: contentWidth * 30,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scrollX, {
                        toValue: 0,
                        duration: 0,
                        useNativeDriver: true,
                    })
                ])
            );
            
            animation.start();
        }
    }, [news, contentWidth]);

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