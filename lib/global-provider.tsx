import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useAppwrite } from "./useAppwrite";
import { getCurrentUser } from "./appwrite";

interface User {
    $id: string;
    name: string;
    email: string;
    avatar: string
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
            // Store the current user ID before clearing
            const currentUserId = userState?.$id;
            console.log('[GlobalProvider] Logging out user:', currentUserId);
            
            // Clear the user state
            setUserState(null);
            
            // Refetch to ensure clean state
            await refetch();
            
            console.log('[GlobalProvider] User logged out successfully');
        } catch (error) {
            console.error('[GlobalProvider] Error during logout:', error);
            // Restore user state if logout failed
            if (user) {
                setUserState(user);
            }
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