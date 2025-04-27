import {Account, Avatars, Client, OAuthProvider} from "react-native-appwrite"
import * as Linking from 'expo-linking'
import {openAuthSessionAsync} from 'expo-web-browser'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Alert } from 'react-native'
import { router } from 'expo-router'
import { useGlobalContext } from './global-provider'
import { useExpenses } from '../app/(root)/context/ExpenseContext'

export const config=  {
    platform: 'com.flux.fluxApp',
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
}

export const client = new Client()

client
    .setEndpoint(config.endpoint!)
    .setProject(config.projectId!)
    .setPlatform(config.platform!)


export const avatar = new Avatars(client)
export const account = new Account(client)

export async function checkSession() {
    try {
        const session = await account.getSession('current');
        if (session) {
            // Set the session in the client
            client.setJWT(session.providerAccessToken);
            
            const user = await account.get();
            if (user) {
                console.log('[Appwrite] Found valid session for user:', user.$id);
                return true;
            }
        }
        return false;
    } catch (error) {
        console.log('[Appwrite] No active session');
        return false;
    }
}

export async function login() {
    try {
        // Clear only session-related data before login
        const keysToClear = [
            'appwrite_session',
            'appwrite_user',
            'appwrite_prefs',
            'appwrite_account',
            'appwrite_team',
            'appwrite_membership'
        ];

        for (const key of keysToClear) {
            try {
                await AsyncStorage.removeItem(key);
            } catch (error) {
                console.log(`[Appwrite] Error clearing ${key}:`, error);
            }
        }

        // Reset client state
        client.setJWT('');

        // Proceed with OAuth login
        const redirectUri = Linking.createURL('/');
        const response = await account.createOAuth2Token(
            OAuthProvider.Google,
            redirectUri
        );
        
        if(!response) throw new Error('Failed to create OAuth token');
        
        const browserResult = await openAuthSessionAsync(
            response.toString(),
            redirectUri
        );
        
        if(browserResult.type !== 'success') throw new Error('Failed to complete OAuth flow');

        const url = new URL(browserResult.url);
        const secret = url.searchParams.get('secret')?.toString();
        const userId = url.searchParams.get('userId')?.toString();

        if(!secret || !userId) throw new Error('Missing OAuth credentials');
        
        // Create new session
        const session = await account.createSession(userId, secret);
        if(!session) throw new Error('Failed to create session');

        // Set the JWT token immediately after session creation
        client.setJWT(session.providerAccessToken);

        // Wait a moment for the session to be fully established
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Verify the session is valid by getting the user
        try {
            const user = await account.get();
            if (!user) {
                throw new Error('Failed to verify session');
            }
            console.log('[Appwrite] Successfully verified session for user:', userId);
            return true;
        } catch (error) {
            console.error('[Appwrite] Error verifying session:', error);
            return false;
        }
    } catch(error) {
        console.error('[Appwrite] Login error:', error);
        return false;
    }
}

export const logout = async () => {
    try {
        console.log('[Appwrite] Starting logout process');
        
        // Get current user ID before starting logout
        const currentUser = await getCurrentUser();
        const currentUserId = currentUser?.$id;
        
        // Clear the client state first
        client.setJWT('');
        
        try {
            // Try to delete the current session
            await account.deleteSession('current');
            console.log('[Appwrite] Session deleted successfully');
        } catch (error) {
            console.log('[Appwrite] No current session to delete');
        }

        // Clear only session-related data from AsyncStorage
        const keysToClear = [
            'appwrite_session',
            'appwrite_user',
            'appwrite_prefs',
            'appwrite_account',
            'appwrite_team',
            'appwrite_membership'
        ];

        for (const key of keysToClear) {
            try {
                await AsyncStorage.removeItem(key);
            } catch (error) {
                console.log(`[Appwrite] Error clearing ${key}:`, error);
            }
        }

        console.log('[Appwrite] Logout completed');
    } catch (error) {
        console.error('[Appwrite] Error during logout:', error);
        throw error;
    }
};

export async function getCurrentUser() {
    try {
        // First try to get the current session
        const session = await account.getSession('current');
        if (!session) {
            console.log('[Appwrite] No active session');
            return null;
        }

        // Set the JWT token
        client.setJWT(session.providerAccessToken);

        // Try to get the user with retry logic
        let retries = 3;
        while (retries > 0) {
            try {
                const user = await account.get();
                if (user?.$id) {
                    return user;
                }
            } catch (error) {
                console.log(`[Appwrite] Retry ${4-retries}/3 getting user`);
                retries--;
                if (retries === 0) throw error;
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        return null;
    } catch (error) {
        console.error('[Appwrite] Error getting current user:', error);
        // Don't clear AsyncStorage on error, just return null
        return null;
    }
}

export async function updateUser(userData: any) {
    try {
        if (!userData?.$id) {
            throw new Error('Invalid user data: missing user ID');
        }

        // Get current preferences
        const currentPrefs = await account.getPrefs();
        
        // Merge current preferences with new avatar
        const prefs = {
            ...currentPrefs,
            avatar: userData.avatar
        };

        // Update user preferences
        const response = await account.updatePrefs(prefs);
        
        if(response.$id) {
            // Store the avatar URI in AsyncStorage for persistence
            const storageKey = `profile_${response.$id}`;
            await AsyncStorage.setItem(storageKey, userData.avatar);
            console.log('[Appwrite] Updated profile picture for user:', response.$id);

            return {
                ...userData,
                avatar: userData.avatar
            };
        }
        return null;
    } catch(error) {
        console.error('[Appwrite] Error updating user:', error);
        return null;
    }
}