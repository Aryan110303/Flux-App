import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet, FlatList } from 'react-native'
import React, { useState, useEffect } from 'react'
import icons from '@/constants/icons';
import { useExpenses } from '../context/ExpenseContext';

interface ExpenseListProps {
    isModalVisible: boolean;
    onCloseModal: () => void;
    onOpenModal: (expense?: { id: number; title: string; amount: string }) => void;
    showHeader?: boolean;
    useFullLayout?: boolean;
    limit?: number;
}

const ExpenseList = ({ 
    isModalVisible, 
    onCloseModal, 
    onOpenModal, 
    showHeader = false, 
    useFullLayout = false,
    limit
}: ExpenseListProps) => {
    const { expenses, deleteExpense } = useExpenses();
    const [recentExpenses, setRecentExpenses] = useState<typeof expenses>([]);

    // Add debug logging to understand what expenses are available
    console.log('ExpenseList rendering with:', {
        totalExpenses: expenses.length,
        showHeader,
        useFullLayout,
        limit
    });
    
    if (expenses.length > 0) {
        console.log('Sample expense:', expenses[0]);
    }

    useEffect(() => {
        // Get the most recent 3 expenses
        const sorted = [...expenses].sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return dateB - dateA;
        });
        setRecentExpenses(sorted.slice(0, 3));
    }, [expenses]);

    // Get the latest expenses first and limit if specified
    const sortedExpenses = [...expenses].sort((a, b) => {
        // Handle missing date values
        if (!a.date) return 1;  // Move items with no date to the end
        if (!b.date) return -1; // Move items with no date to the end
        
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        
        // If either date is invalid, compare by ID instead (which is also a timestamp)
        if (isNaN(dateA) || isNaN(dateB)) {
            return b.id - a.id; // Most recent ID first (assuming ID is timestamp-based)
        }
        
        return dateB - dateA; // Most recent first
    });

    // Group expenses by month and calculate total spend
    const groupedExpenses = sortedExpenses.reduce((groups, expense) => {
        const date = new Date(expense.date || expense.id);
        const monthKey = `${date.toLocaleString('default', { month: 'long' })}, ${date.getFullYear()}`;
        
        if (!groups[monthKey]) {
            groups[monthKey] = {
                expenses: [],
                totalSpend: 0,
                totalIncome: 0,
                netAmount: 0
            };
        }
        
        if (expense.type === 'income') {
            groups[monthKey].totalIncome += parseFloat(expense.amount) || 0;
        } else {
            groups[monthKey].totalSpend += parseFloat(expense.amount) || 0;
        }
        
        // Calculate net amount (expenses - income)
        groups[monthKey].netAmount = groups[monthKey].totalSpend - groups[monthKey].totalIncome;
        groups[monthKey].expenses.push(expense);
        
        return groups;
    }, {} as { [key: string]: { expenses: any[], totalSpend: number, totalIncome: number, netAmount: number } });
    
    const displayGroups = limit 
        ? Object.entries(groupedExpenses).slice(0, 1) 
        : Object.entries(groupedExpenses);
    
    console.log('Display expenses count:', sortedExpenses.length);

    const handleEdit = (expense: { id: number; title: string; amount: string }) => {
        onOpenModal(expense);
    };

    const formatDate = (dateString: string | number | Date) => {
        if (!dateString) return "Recently added";
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "Recently added";
            
            return `${date.toLocaleDateString()} • ${date.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit'
            })}`;
        } catch (error) {
            console.error('Error formatting date:', error);
            return "Recently added";
        }
    };

    const formatAmount = (amount: string): string => {
        // Convert to number, format with commas, then convert back to string
        return parseFloat(amount).toLocaleString('en-IN', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 0
        });
    };

    const renderExpenseItem = ({ item }: { item: (typeof expenses)[0] }) => (
        <TouchableOpacity 
            onPress={() => handleEdit(item)}
            style={styles.expenseItem}
        >
            <View style={styles.expenseDetails}>
                <Text style={styles.expenseTitle}>{item.title}</Text>
                <Text style={styles.expenseDate}>{formatDate(item.date)}</Text>
            </View>
            <Text 
                style={[
                    styles.expenseAmount, 
                    item.type === 'income' ? styles.incomeAmount : null
                ]}
            >
                {item.type === 'income' ? '+' : '-'}₹{formatAmount(item.amount)}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-[#1f2630]">
            {/* Header */}
            {showHeader && (
                <View className="flex-row items-center justify-between px-6 py-4 mt-8">
                    <TouchableOpacity onPress={onCloseModal} className="flex-row items-center">
                        <Image source={icons.backArrow} className="size-6 mr-4" tintColor="#7b80ff" />
                        <Text className="text-primary font-rubik-medium text-lg">All Transactions</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onOpenModal()}>
                        <Image source={icons.add} className="size-6" tintColor="#7b80ff" />
                    </TouchableOpacity>
                </View>
            )}

            {/* List */}
            <ScrollView className="flex-1">
                <View className={`pb-20 ${!showHeader && useFullLayout ? 'px-6' : ''}`}>
                    {/* For "All Expenses" screen - show grouped by month */}
                    {showHeader && displayGroups.length > 0 ? (
                        displayGroups.map(([monthKey, { expenses, totalSpend, totalIncome, netAmount }]) => (
                            <View key={monthKey}>
                                {/* Month Header with Total Spend */}
                                <View className="flex-row justify-between items-center px-6 py-4">
                                    <Text className="text-[#ccc] font-rubik-medium text-lg">{monthKey}</Text>
                                    <Text className={`font-rubik-bold text-lg ${netAmount > 0 ? 'text-[#FF5252]' : 'text-[#4CAF50]'}`}>
                                        ₹ {Math.abs(netAmount).toFixed(2)}
                                    </Text>
                                </View>
                                
                                {/* Expenses for this month */}
                                <View className="px-6">
                                    {expenses.map((item) => (
                                        <View 
                                            key={item.id}
                                            style={styles.monthlyExpenseItem}
                                        >
                                            <View style={{flex: 1}}>
                                                <Text style={styles.expenseTitle}>{item.title}</Text>
                                                <Text style={styles.expenseDate}>{formatDate(item.date)}</Text>
                                            </View>
                                            
                                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                                <Text 
                                                    style={[
                                                        styles.expenseAmount, 
                                                        item.type === 'income' ? styles.incomeAmount : styles.expenseAmountRed
                                                    ]}
                                                >
                                                    {item.type === 'income' ? '+' : '-'}₹{formatAmount(item.amount)}
                                                </Text>
                                                
                                                <View style={{flexDirection: 'row', marginLeft: 12}}>
                                                    <TouchableOpacity onPress={() => handleEdit(item)} style={{marginRight: 12}}>
                                                        <Image source={icons.edit} style={{width: 20, height: 20}} tintColor="#7b80ff" />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={() => deleteExpense(item.id)}>
                                                        <Image source={icons.dustbin} style={{width: 20, height: 20}} tintColor="#FF5252" />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        ))
                    ) : (
                        /* For "Recent Expenditures" or other views - show flat list */
                        sortedExpenses.length > 0 ? (
                            sortedExpenses.map((item) => (
                                <View 
                                    key={item.id} 
                                    className={`${useFullLayout 
                                        ? "bg-[#3E4D67] p-4 rounded-xl mb-4 mx-6" 
                                        : "flex-row items-center justify-between bg-[#3E4D67] py-2.5 px-5 mt-2.5 mx-5 rounded-full"}`}
                                >
                                    {useFullLayout ? (
                                        // Enhanced layout for Recent Expenditures expanded view
                                        <View>
                                            <View className="flex-row justify-between items-center">
                                                <Text className="text-white text-lg font-rubik-semibold">{item.title}</Text>
                                                <Text className="text-white font-rubik-bold text-lg">₹{item.amount}</Text>
                                            </View>
                                            <Text className="text-[#ccc] font-rubik text-sm mt-2">{formatDate(item.date)}</Text>
                                            <View className="flex-row justify-between mt-3">
                                                <TouchableOpacity 
                                                    onPress={() => handleEdit(item)}
                                                    className="bg-[#2A3547] px-3 py-1.5 rounded-full"
                                                >
                                                    <View className="flex-row items-center">
                                                        <Image source={icons.edit} className="size-4 mr-1" tintColor="#7b80ff"/>
                                                        <Text className="text-[#7b80ff] text-xs font-rubik">Edit</Text>
                                                    </View>
                                                </TouchableOpacity>
                                                <TouchableOpacity 
                                                    onPress={() => deleteExpense(item.id)}
                                                    className="bg-[#2A3547] px-3 py-1.5 rounded-full"
                                                >
                                                    <View className="flex-row items-center">
                                                        <Image source={icons.dustbin} className="size-4 mr-1" tintColor="#FF7676"/>
                                                        <Text className="text-[#FF7676] text-xs font-rubik">Delete</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ) : (
                                        // Original compact layout for Recent Expenditures
                                        <>
                                            <TouchableOpacity onPress={() => handleEdit(item)}>
                                                <Image source={icons.edit} className='size-7'/>
                                            </TouchableOpacity>
                                            <View className="items-center">
                                                <Text className="text-white text-base font-rubik-semibold">{item.title}</Text>
                                                <Text className="text-white text-sm mt-1">- {item.amount}<Text className="text-xs"> INR</Text></Text>
                                            </View>
                                            <TouchableOpacity onPress={() => deleteExpense(item.id)}>
                                                <Image source={icons.dustbin} className='size-7'/>
                                            </TouchableOpacity>
                                        </>
                                    )}
                                </View>
                            ))
                        ) : (
                            <View className="flex-1 items-center justify-center py-12">
                                <Text className="text-[#ccc] font-rubik text-center">{showHeader ? "No expenses added yet" : "No recent expenses"}</Text>
                            </View>
                        )
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    expensesList: {
        paddingHorizontal: 24,
    },
    expenseItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#343f52',
    },
    expenseDetails: {
        flex: 1,
    },
    expenseTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
        fontFamily: 'Rubik-Medium',
    },
    expenseDate: {
        color: '#9aa0a6',
        fontSize: 12,
        marginTop: 4,
        fontFamily: 'Rubik',
    },
    expenseAmount: {
        color: '#ff6b6b',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Rubik-Medium',
    },
    incomeAmount: {
        color: '#4CAF50', // Green for income
    },
    monthlyExpenseItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#343f52',
    },
    expenseAmountRed: {
        color: '#FF5252', // Red for expenses
    }
});

export default ExpenseList;