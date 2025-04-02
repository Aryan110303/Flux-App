import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import icons from '@/constants/icons';
import { Image } from 'react-native';

interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'info';
    duration?: number;
    onClose: () => void;
    icon?: any;
}

const CustomToast = ({ 
    message, 
    type = 'success', 
    duration = 3000, 
    onClose,
    icon 
}: ToastProps) => {
    const translateY = useRef(new Animated.Value(-100)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Slide in
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start();

        // Auto dismiss after duration
        const timer = setTimeout(() => {
            dismiss();
        }, duration);

        return () => clearTimeout(timer);
    }, []);

    const dismiss = () => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: -100,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start(() => {
            onClose();
        });
    };

    const getBackgroundColor = () => {
        switch (type) {
            case 'success':
                return '#4CAF50';
            case 'error':
                return '#F44336';
            case 'info':
                return '#2196F3';
            default:
                return '#4CAF50';
        }
    };

    return (
        <View style={styles.wrapper}>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <Animated.View 
                    style={[
                        styles.container,
                        {
                            transform: [{ translateY }],
                            opacity,
                            backgroundColor: getBackgroundColor(),
                        }
                    ]}
                >
                    <View style={styles.content}>
                        {icon ? (
                            <Image source={icon} style={styles.icon} tintColor="#fff" />
                        ) : (
                            <View style={styles.iconContainer}>
                                {type === 'success' && <Text style={styles.iconText}>✓</Text>}
                                {type === 'error' && <Text style={styles.iconText}>✕</Text>}
                                {type === 'info' && <Text style={styles.iconText}>ℹ</Text>}
                            </View>
                        )}
                        <Text style={styles.message}>{message}</Text>
                        <TouchableOpacity onPress={dismiss} style={styles.closeButton}>
                            <Image source={icons.cross} style={styles.closeIcon} tintColor="#fff" />
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
    },
    safeArea: {
        backgroundColor: 'transparent',
        paddingTop: Platform.OS === 'android' ? 25 : 0,
    },
    container: {
        margin: 20,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    icon: {
        width: 24,
        height: 24,
        marginRight: 12,
    },
    iconText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    message: {
        flex: 1,
        color: '#fff',
        fontSize: 14,
        fontFamily: 'Rubik',
        marginRight: 8,
    },
    closeButton: {
        padding: 4,
    },
    closeIcon: {
        width: 16,
        height: 16,
    },
});

export default CustomToast; 