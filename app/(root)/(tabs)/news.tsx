import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  StyleSheet, 
  ActivityIndicator, 
  RefreshControl,
  ScrollView,
  StatusBar,
  Platform
} from 'react-native';
import { useToast } from '../context/ToastContext';
import icons from '@/constants/icons';
import images from '@/constants/images';

// News item type
interface NewsItem {
  title: string;
  url: string;
  banner_image?: string;
  source: string;
  summary: string;
  time_published: string;
  topics?: string[];
  category?: string;
}

// Categories for filtering
const categories = [
  { id: 'all', label: 'All' },
  { id: 'stocks', label: 'Stocks' },
  { id: 'indian_market', label: 'Indian Market' },
  { id: 'mutual_funds', label: 'Mutual Funds' },
  { id: 'crypto', label: 'Crypto' },
];

const News = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchAttempts, setFetchAttempts] = useState(0);
  const { showToast } = useToast();
  const isFirstRender = useRef(true);

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    try {
      // Expected format from API: "20230815T000000"
      const year = dateString.substring(0, 4);
      const month = dateString.substring(4, 6);
      const day = dateString.substring(6, 8);
      const hour = dateString.substring(9, 11);
      const minute = dateString.substring(11, 13);
      
      let date = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute)
      );
      
      // If date is invalid, return the original string
      if (isNaN(date.getTime())) {
        // Try parsing as ISO format
        const isoDate = new Date(dateString);
        if (!isNaN(isoDate.getTime())) {
          date = isoDate;
        } else {
          return dateString;
        }
      }
      
      // Check if it's today
      const today = new Date();
      if (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      ) {
        return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }
      
      // Check if it's yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (
        date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear()
      ) {
        return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }
      
      // Otherwise, return the full date
      return date.toLocaleDateString([], { 
        day: '2-digit', 
        month: 'short',
        year: 'numeric',
      }) + ' · ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      // If any error occurs in parsing, return the original string
      return dateString;
    }
  };

  // Fetch news from multiple sources
  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Track attempts locally in the function
      const currentAttempts = fetchAttempts + 1;
      setFetchAttempts(currentAttempts);
      
      // If we've tried too many times, show an error
      if (currentAttempts > 3) {
        setError('Too many failed attempts. Please try again later.');
        showToast('Too many failed attempts. Please try refreshing later.', 'error');
        setLoading(false);
        return;
      }
      
      // Array to store all news items from different sources
      let allNews: NewsItem[] = [];
      
      // Source 1: Yahoo Finance (Global Finance News)
      try {
        const yahooResponse = await fetch(
          'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Ffinance.yahoo.com%2Fnews%2Frssindex'
        );
        
        const yahooData = await yahooResponse.json();
        
        if (yahooData.status === 'ok' && yahooData.items && yahooData.items.length > 0) {
          const yahooNews = yahooData.items.map((item: any) => {
            // Determine category based on content and title
            let category = 'stocks'; // Default
            const content = ((item.content || '') + (item.title || '') + (item.description || '')).toLowerCase();
            
            if (content.includes('mutual fund') || content.includes('etf')) {
              category = 'mutual_funds';
            } else if (content.includes('crypto') || content.includes('bitcoin')) {
              category = 'crypto';
            }
            
            // Parse and format the date
            let publishedDate = '';
            try {
              if (item.pubDate) {
                const date = new Date(item.pubDate);
                publishedDate = date.toISOString().replace(/-/g, '').replace(/:/g, '').split('.')[0];
              }
            } catch (e) {
              publishedDate = '';
            }
            
            // Extract thumbnail if available
            let thumbnail = null;
            try {
              if (item.thumbnail) {
                thumbnail = item.thumbnail;
              } else if (item.enclosure && item.enclosure.link) {
                thumbnail = item.enclosure.link;
              } else {
                const imgMatch = item.content?.match(/<img.*?src="(.*?)"/);
                if (imgMatch && imgMatch[1]) {
                  thumbnail = imgMatch[1];
                }
              }
            } catch (e) {
              thumbnail = null;
            }
            
            return {
              title: item.title || 'No Title',
              url: item.link || '',
              banner_image: thumbnail,
              source: 'Yahoo Finance',
              summary: item.description || 'No summary available',
              time_published: publishedDate,
              topics: [],
              category
            };
          });
          
          allNews = [...allNews, ...yahooNews];
        }
      } catch (error) {
        console.error('Error fetching Yahoo Finance news:', error);
      }
      
      // Source 2: CNBC RSS Feed
      try {
        const cnbcResponse = await fetch(
          'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.cnbc.com%2Fid%2F100003114%2Fdevice%2Frss%2Frss.html'
        );
        
        const cnbcData = await cnbcResponse.json();
        
        if (cnbcData.status === 'ok' && cnbcData.items && cnbcData.items.length > 0) {
          const cnbcNews = cnbcData.items.map((item: any) => {
            // Determine category based on content and title
            let category = 'stocks'; // Default
            const content = ((item.content || '') + (item.title || '') + (item.description || '')).toLowerCase();
            
            if (content.includes('mutual fund') || content.includes('etf')) {
              category = 'mutual_funds';
            } else if (content.includes('crypto') || content.includes('bitcoin')) {
              category = 'crypto';
            }
            
            // Parse and format the date
            let publishedDate = '';
            try {
              if (item.pubDate) {
                const date = new Date(item.pubDate);
                publishedDate = date.toISOString().replace(/-/g, '').replace(/:/g, '').split('.')[0];
              }
            } catch (e) {
              publishedDate = '';
            }
            
            return {
              title: item.title || 'No Title',
              url: item.link || '',
              banner_image: item.thumbnail || null,
              source: 'CNBC',
              summary: item.description || 'No summary available',
              time_published: publishedDate,
              topics: [],
              category
            };
          });
          
          allNews = [...allNews, ...cnbcNews];
        }
      } catch (error) {
        console.error('Error fetching CNBC news:', error);
      }
      
      // Source 3: Economic Times (Indian Markets)
      try {
        const etResponse = await fetch(
          'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Feconomictimes.indiatimes.com%2Fmarkets%2Frssfeeds%2F1977021501.cms'
        );
        
        const etData = await etResponse.json();
        
        if (etData.status === 'ok' && etData.items && etData.items.length > 0) {
          const etNews = etData.items.map((item: any) => {
            return {
              title: item.title || 'No Title',
              url: item.link || '',
              banner_image: item.thumbnail || null,
              source: 'Economic Times',
              summary: item.description || 'No summary available',
              time_published: item.pubDate || '',
              topics: [],
              category: 'indian_market'
            };
          });
          
          allNews = [...allNews, ...etNews];
        }
      } catch (error) {
        console.error('Error fetching Economic Times news:', error);
      }
      
      // Source 4: Moneycontrol (Indian Financial News)
      try {
        const mcResponse = await fetch(
          'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.moneycontrol.com%2Frss%2Fmarketnews.xml'
        );
        
        const mcData = await mcResponse.json();
        
        if (mcData.status === 'ok' && mcData.items && mcData.items.length > 0) {
          const mcNews = mcData.items.map((item: any) => {
            // Determine if it's about mutual funds
            let category = 'indian_market'; // Default for moneycontrol
            const content = ((item.content || '') + (item.title || '') + (item.description || '')).toLowerCase();
            
            if (content.includes('mutual fund') || content.includes('mf ') || content.includes(' mf') || content.includes('fund ')) {
              category = 'mutual_funds';
            }
            
            return {
              title: item.title || 'No Title',
              url: item.link || '',
              banner_image: item.thumbnail || null,
              source: 'Moneycontrol',
              summary: item.description || 'No summary available',
              time_published: item.pubDate || '',
              topics: [],
              category
            };
          });
          
          allNews = [...allNews, ...mcNews];
        }
      } catch (error) {
        console.error('Error fetching Moneycontrol news:', error);
      }
      
      if (allNews.length > 0) {
        // Sort news by date (newest first)
        allNews.sort((a, b) => {
          const dateA = new Date(a.time_published);
          const dateB = new Date(b.time_published);
          return dateB.getTime() - dateA.getTime();
        });
        
        // Log the count of news items from each source for debugging
        const sourceCounts = allNews.reduce((acc, item) => {
          acc[item.source] = (acc[item.source] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        console.log('News source distribution:', sourceCounts);
        
        setNews(allNews);
        setFilteredNews(allNews);
        setFetchAttempts(0); // Reset fetch attempts on success
      } else {
        // Handle case where all API calls failed or returned no data
        setError('No news found. Please try again later.');
        showToast('No news found. Please try refreshing later.', 'error');
        setNews([]);
        setFilteredNews([]);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      setError('Failed to load news. Please check your connection or try again later.');
      showToast('Failed to load news. Please check your connection.', 'error');
      setNews([]);
      setFilteredNews([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast, fetchAttempts]);

  // Filter news based on selected category
  const filterNewsByCategory = useCallback((category: string) => {
    setActiveCategory(category);
    
    if (category === 'all') {
      setFilteredNews(news);
    } else {
      setFilteredNews(news.filter(item => item.category === category));
    }
  }, [news]);

  // Handle refresh with manual reset of attempts
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Reset fetch attempts counter on manual refresh
    setFetchAttempts(0);
    fetchNews();
  }, [fetchNews]);

  // Initial data load with fetch attempt limiting
  useEffect(() => {
    // Use the ref that's now defined at component level
    if (isFirstRender.current) {
      // Only run this logic on first mount
      isFirstRender.current = false;
      fetchNews();
    }
  }, [fetchNews]); // Only depends on fetchNews which shouldn't change often

  // Render each news item
  const renderNewsItem = ({ item }: { item: NewsItem }) => (
    <TouchableOpacity style={styles.newsItem}>
      <View style={styles.newsContent}>
        <View style={styles.newsHeader}>
          <Image 
            source={
              item.source === 'CNBC' 
                ? { uri: 'https://www.cnbc.com/favicon.ico' }
                : item.source === 'Yahoo Finance'
                ? { uri: 'https://s.yimg.com/cv/apiv2/finance/logo_yahoo_finance.png' }
                : item.source === 'Economic Times'
                ? { uri: 'https://economictimes.indiatimes.com/favicon.ico' }
                : item.source === 'Moneycontrol'
                ? { uri: 'https://www.moneycontrol.com/favicon.ico' }
                : images.avatar // Fallback to default
            } 
            style={styles.sourceIcon} 
          />
          <Text style={styles.sourceText}>{item.source}</Text>
          <Text style={styles.timeText}>{formatDate(item.time_published)}</Text>
        </View>
        
        <Text style={styles.newsTitle}>{item.title}</Text>
        
        <Text style={styles.newsSummary} numberOfLines={2}>
          {item.summary}
        </Text>
      </View>
      
      {item.banner_image && (
        <Image 
          source={{ uri: item.banner_image }} 
          style={styles.newsImage}
          resizeMode="cover"
        />
      )}
    </TouchableOpacity>
  );

  // Render category tabs
  const renderCategoryTabs = () => (
    <View style={styles.tabsWrapper}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryTab,
              activeCategory === category.id && styles.activeCategoryTab
            ]}
            onPress={() => filterNewsByCategory(category.id)}
          >
            <Text
              style={[
                styles.categoryText,
                activeCategory === category.id && styles.activeCategoryText
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1f2630" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Financial News</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>
        
        {renderCategoryTabs()}
        
        {loading && !refreshing ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#7b80ff" />
            <Text style={styles.loaderText}>Loading latest news...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Oops!</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => {
                setFetchAttempts(0);
                onRefresh();
              }}
            >
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredNews}
            renderItem={renderNewsItem}
            keyExtractor={(item, index) => `${item.title}-${index}`}
            contentContainerStyle={styles.newsList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#7b80ff']}
                tintColor="#7b80ff"
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No news available in this category</Text>
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={onRefresh}
                >
                  <Text style={styles.retryText}>Refresh</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1f2630',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 25 : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#1f2630',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 15,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Rubik-Bold',
  },
  refreshButton: {
    backgroundColor: '#7b80ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  refreshText: {
    color: '#fff',
    fontFamily: 'Rubik',
    fontSize: 12,
  },
  tabsWrapper: {
    backgroundColor: '#263141',
    paddingVertical: 5,
    marginBottom: 10,
  },
  categoriesContainer: {
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  categoryTab: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 50, // Make perfectly round
    marginRight: 8,
    backgroundColor: '#3E4D67',
    height: 32, // Fixed height
    minWidth: 60, // Minimum width
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeCategoryTab: {
    backgroundColor: '#7b80ff',
  },
  categoryText: {
    color: '#fff',
    fontFamily: 'Rubik',
    fontSize: 12, // Smaller text
  },
  activeCategoryText: {
    fontFamily: 'Rubik-Medium',
  },
  newsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  newsItem: {
    backgroundColor: '#3E4D67',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  newsContent: {
    flex: 1,
    padding: 8,
  },
  newsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingTop: 12,
    paddingHorizontal: 12,
  },
  sourceIcon: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 6,
  },
  sourceText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Rubik',
    marginRight: 8,
  },
  timeText: {
    color: '#ccc',
    fontSize: 10,
    fontFamily: 'Rubik',
  },
  newsTitle: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Rubik-Medium',
    marginBottom: 6,
    paddingHorizontal: 12,
  },
  newsSummary: {
    color: '#ccc',
    fontSize: 12,
    fontFamily: 'Rubik',
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  newsImage: {
    width: 80,
    height: '100%',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    color: '#fff',
    fontFamily: 'Rubik',
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  errorTitle: {
    color: '#fff',
    fontFamily: 'Rubik-Bold',
    fontSize: 24,
    marginBottom: 10,
  },
  errorText: {
    color: '#ccc',
    fontFamily: 'Rubik',
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#7b80ff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontFamily: 'Rubik',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    color: '#fff',
    fontFamily: 'Rubik',
    fontSize: 16,
    marginBottom: 20,
  },
});

export default News;