import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useAppwrite } from "./useAppwrite";
import { getCurrentUser } from "./appwrite";
import { Models } from "react-native-appwrite";
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User extends Models.User<Models.Preferences> {
    avatar?: string;
}

interface GlobalContextType{
    isLoggedIn : boolean;
    user: User | null;
    loading: boolean;
    refetch: (newParams?: Record<string, string | number> | undefined) => Promise<void>;
    setUser: (user: User | null) => void;
    logout: () => Promise<void>;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);
const STORAGE_KEY = 'user_data';

export const GlobalProvider = ({children}:{children: ReactNode}) => {
    const [userState, setUserState] = useState<User | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    const {
        data:user,
        loading,
        refetch: appwriteRefetch
    } = useAppwrite({
        fn: getCurrentUser,
    })

    useEffect(() => {
        if(user) {
            setUserState(user);
            console.log('[GlobalProvider] User authenticated:', user.email);
        } else if (isInitialized) {
            setUserState(null);
        }
    }, [user, isInitialized]);

    useEffect(() => {
        if (!loading && !isInitialized) {
            setIsInitialized(true);
        }
    }, [loading]);

    const isLoggedIn = !!userState;

    const refetch = async (newParams?: Record<string, string | number>) => {
        try {
            if (newParams) {
                await appwriteRefetch(newParams);
            } else {
                await appwriteRefetch({});
            }
        } catch (error) {
            console.error('[GlobalProvider] Error refetching user data:', error);
        }
    };

    const logout = async () => {
        try {
            console.log('[GlobalProvider] Starting logout process');
            
            // Get current user ID before starting logout
            const currentUserId = userState?.$id;
            
            // Set logout state
            await AsyncStorage.setItem('isLoggingOut', 'true');
            
            // Save user data and expenses to temporary storage
            if (currentUserId) {
                try {
                    // Save user data
                    const userData = await AsyncStorage.getItem(`${STORAGE_KEY}_${currentUserId}`);
                    if (userData) {
                        await AsyncStorage.setItem(`temp_user_${currentUserId}`, userData);
                    }
                    
                    // Save expenses
                    const expensesData = await AsyncStorage.getItem(`expenses_${currentUserId}`);
                    if (expensesData) {
                        await AsyncStorage.setItem(`temp_expenses_${currentUserId}`, expensesData);
                    }
                    
                    console.log('[GlobalProvider] Saved user data and expenses to temporary storage');
                } catch (error) {
                    console.error('[GlobalProvider] Error saving data to temporary storage:', error);
                }
            }
            
            // Clear the user state
            setUserState(null);
            
            // Call Appwrite logout
            const { logout: appwriteLogout, client } = await import('./appwrite');
            await appwriteLogout();
            
            // Clear client state
            client.setJWT('');
            
            console.log('[GlobalProvider] Logout completed successfully');
        } catch (error) {
            console.error('[GlobalProvider] Error during logout:', error);
            setUserState(null);
        } finally {
            // Clear logout state after a delay
            setTimeout(async () => {
                await AsyncStorage.removeItem('isLoggingOut');
            }, 2000);
        }
    };

    return(
        <GlobalContext.Provider value={{
            isLoggedIn, 
            user: userState,  
            loading: loading || !isInitialized, 
            refetch,
            setUser: setUserState,
            logout
        }}>
            {children}
        </GlobalContext.Provider>
    )
}

export const useGlobalContext = (): GlobalContextType => {
    const context = useContext(GlobalContext)
    if (!context) {
        throw new Error('useGlobalContext must be used within a GlobalProvider')
    }
    return context;
}