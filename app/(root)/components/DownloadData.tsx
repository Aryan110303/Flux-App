import { View, Text, TouchableOpacity, Image, ScrollView, SafeAreaView, Alert, ActivityIndicator, StyleSheet, Platform, StatusBar } from 'react-native';
import React, { useState } from 'react';
import icons from '@/constants/icons';
import { useExpenses } from '../context/ExpenseContext';
import { useUserContext } from '../context/UserContext';

interface DownloadDataProps {
  onClose: () => void;
}

const DownloadData = ({ onClose }: DownloadDataProps) => {
  const { expenses } = useExpenses();
  const { savings, salaryYearly, salaryMonthly, goal, goalAmount } = useUserContext();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'pdf' | 'csv'>('pdf');

  // Check if there's data to download
  const hasDataToDownload = expenses.length > 0 || savings > 0 || salaryYearly > 0 || goal;

  const handleDownload = async (format: 'pdf' | 'csv') => {
    setIsDownloading(true);
    setDownloadFormat(format);
    
    // Simulate download process
    setTimeout(() => {
      setIsDownloading(false);
      Alert.alert(
        'Download Complete', 
        `Your financial data has been downloaded in ${format.toUpperCase()} format.`
      );
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
    <ScrollView className=''>

      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Image source={icons.backArrow} style={styles.backIcon} tintColor="#7b80ff" />
          <Text style={styles.headerTitle}>Download Data</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Financial Summary Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Financial Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Savings</Text>
            <Text style={styles.summaryValue}>₹{savings.toLocaleString()}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Annual Salary</Text>
            <Text style={styles.summaryValue}>₹{salaryYearly.toLocaleString()}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Monthly Salary</Text>
            <Text style={styles.summaryValue}>₹{salaryMonthly.toLocaleString()}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Financial Goals</Text>
            <Text style={styles.summaryValue}>{goal || 'None'}</Text>
          </View>
          
          {goalAmount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Goal Amount</Text>
              <Text style={styles.summaryValue}>₹{goalAmount.toLocaleString()}</Text>
            </View>
          )}
        </View>

        {/* Download Options */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Download Format</Text>
          
          <View style={styles.formatSelector}>
            <TouchableOpacity 
              style={[
                styles.formatButton,
                styles.formatButtonLeft,
                downloadFormat === 'pdf' && styles.formatButtonActive
              ]}
              onPress={() => setDownloadFormat('pdf')}
            >
              <Text style={[
                styles.formatButtonText,
                downloadFormat === 'pdf' && styles.formatButtonTextActive
              ]}>PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.formatButton,
                styles.formatButtonRight,
                downloadFormat === 'csv' && styles.formatButtonActive
              ]}
              onPress={() => setDownloadFormat('csv')}
            >
              <Text style={[
                styles.formatButtonText,
                downloadFormat === 'csv' && styles.formatButtonTextActive
              ]}>CSV</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            onPress={() => handleDownload(downloadFormat)}
            disabled={isDownloading || !hasDataToDownload}
            style={[
              styles.downloadButton,
              (isDownloading || !hasDataToDownload) && styles.downloadButtonDisabled
            ]}
          >
            {isDownloading ? (
              <>
                <ActivityIndicator size="small" color="#ffffff" style={styles.downloadIcon} />
                <Text style={styles.downloadButtonText}>Downloading...</Text>
              </>
            ) : (
              <>
                <Image source={icons.download} style={styles.downloadIcon} tintColor="#ffffff" />
                <Text style={styles.downloadButtonText}>Download {downloadFormat.toUpperCase()}</Text>
              </>
            )}
          </TouchableOpacity>
          
          {!hasDataToDownload && (
            <Text style={styles.noDataText}>
              Add some expenses or financial data to enable downloads
            </Text>
          )}
        </View>

        {/* Data Included */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Data Included</Text>
          
          <View style={styles.dataList}>
            <View style={styles.dataItem}>
              <View style={styles.dataIconContainer}>
                <Image source={icons.expense} style={styles.dataIcon} tintColor="#ffffff" />
              </View>
              <Text style={styles.dataText}>Expenses</Text>
            </View>
            
            <View style={styles.dataItem}>
              <View style={styles.dataIconContainer}>
                <Image source={icons.wallet} style={styles.dataIcon} tintColor="#ffffff" />
              </View>
              <Text style={styles.dataText}>Income</Text>
            </View>
            
            <View style={styles.dataItem}>
              <View style={styles.dataIconContainer}>
                <Image source={icons.goal} style={styles.dataIcon} tintColor="#ffffff" />
              </View>
              <Text style={styles.dataText}>Financial Goals</Text>
            </View>
            
            <View style={styles.dataItem}>
              <View style={styles.dataIconContainer}>
                <Image source={icons.chart} style={styles.dataIcon} tintColor="#ffffff" />
              </View>
              <Text style={styles.dataText}>Analytics</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScrollView>
      {/* Header */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f2630',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginTop: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backIcon: {
    width: 24,
    height: 24,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#7b80ff',
  },
  card: {
    backgroundColor: '#3E4D67',
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#9aa0a6',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  formatSelector: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  formatButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#2A3547',
  },
  formatButtonLeft: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  formatButtonRight: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  formatButtonActive: {
    backgroundColor: '#7b80ff',
  },
  formatButtonText: {
    textAlign: 'center',
    color: '#9aa0a6',
    fontSize: 16,
  },
  formatButtonTextActive: {
    color: '#fff',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7b80ff',
    padding: 16,
    borderRadius: 12,
  },
  downloadButtonDisabled: {
    backgroundColor: '#2A3547',
  },
  downloadIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  noDataText: {
    textAlign: 'center',
    color: '#9aa0a6',
    marginTop: 12,
    fontSize: 14,
  },
  dataList: {
    gap: 16,
  },
  dataItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dataIconContainer: {
    backgroundColor: '#7b80ff',
    padding: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  dataIcon: {
    width: 16,
    height: 16,
  },
  dataText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
});

export default DownloadData; 