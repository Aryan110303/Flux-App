import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProgressBar } from 'react-native-paper';
import { useUserContext } from '../context/UserContext';

const GoalBar = () => {
    const { goalAmount, savings } = useUserContext();

    // Ensure values are numbers and prevent division by zero
    const progress = goalAmount > 0 ? Math.min(1, savings / goalAmount) : 0;

    if (!goalAmount) return null; // Hide if no goal is set

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.goalText}>Save {goalAmount.toLocaleString()} for your goal</Text>
                <Text style={styles.percentage}>{Math.round(progress * 100)}%</Text>
            </View>
            <ProgressBar progress={progress} color="#7b80ff" style={styles.progressBar} />
        </View>
    );
};

export default GoalBar;

const styles = StyleSheet.create({
    container: {
        marginVertical: 20,
        paddingHorizontal: 25,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    goalText: {
        color: '#7b80ff',
        fontSize: 14,
        fontFamily: 'Rubik',
    },
    percentage: {
        color: '#e0cfd9',
        fontSize: 14,
        fontFamily: 'Barlow',
    },
    progressBar: {
        height: 8, // Adjust thickness
        borderRadius: 5,
        backgroundColor: '#e0cfd9', // Background color
    },
});
