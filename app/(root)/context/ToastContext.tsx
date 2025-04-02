import React, { createContext, useContext, useState } from 'react';
import CustomToast from '../components/CustomToast';

interface ToastContextType {
    showToast: (message: string, type?: 'success' | 'error' | 'info', duration?: number, icon?: any) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [toast, setToast] = useState<{
        message: string;
        type: 'success' | 'error' | 'info';
        duration: number;
        icon?: any;
    } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success', duration: number = 3000, icon?: any) => {
        setToast({ message, type, duration, icon });
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast && (
                <CustomToast
                    message={toast.message}
                    type={toast.type}
                    duration={toast.duration}
                    icon={toast.icon}
                    onClose={() => setToast(null)}
                />
            )}
        </ToastContext.Provider>
    );
};

export default ToastProvider;

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}; 