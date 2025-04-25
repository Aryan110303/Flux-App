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

export async function login() {
    try {
        const redirectUri = Linking.createURL('/');
        const response = await account.createOAuth2Token(
            OAuthProvider.Google,
            redirectUri
        )
        if(!response) throw new Error('Failed to Login');
        
        const browserResult = await openAuthSessionAsync(
            response.toString(),
            redirectUri
        )
        
        if(browserResult.type != 'success') throw new Error('Failed to Login');

        const url = new URL(browserResult.url)

        const secret = url.searchParams.get('secret')?.toString()
        const userId = url.searchParams.get('userId')?.toString()

        if(!secret || !userId) throw new Error('Failed to Login');
        
        const session = await account.createSession(userId, secret)
        
        if(!session) throw new Error('Failed to create a Session');

        return true;


    }catch(error){
        console.error(error)
        return false
    }
    
}

export const logout = async () => {
    try {
        // Get current user ID before starting logout process
        const currentUser = await getCurrentUser();
        const currentUserId = currentUser?.$id;

        if (currentUserId) {
            // Save current expenses before logout
            const expensesKey = `expenses_data_${currentUserId}`;
            const currentExpenses = await AsyncStorage.getItem(expensesKey);
            if (currentExpenses) {
                // Save to a temporary key that won't be cleared
                await AsyncStorage.setItem(`temp_expenses_${currentUserId}`, currentExpenses);
                console.log('[Appwrite] Preserved expenses for user:', currentUserId);
            }

            // Save profile picture before logout
            const profileKey = `profile_${currentUserId}`;
            const currentProfile = await AsyncStorage.getItem(profileKey);
            if (currentProfile) {
                // Save to a temporary key that won't be cleared
                await AsyncStorage.setItem(`temp_profile_${currentUserId}`, currentProfile);
                console.log('[Appwrite] Preserved profile picture for user:', currentUserId);
            }
        }

        try {
            await account.deleteSession('current');
        } catch (error) {
            // If there's no active session, this is expected
        }

        client.setJWT('');

        // Clear only session-related data from AsyncStorage
        await AsyncStorage.multiRemove([
            'appwrite_user',
            'appwrite_session',
            'appwrite_fallback',
            'user_data'
        ]);

        console.log('[Appwrite] Logout completed - preserved user data for user:', currentUserId);
        router.replace('/sign-in');
    } catch (error) {
        console.error('[Appwrite] Error during logout:', error);
        throw error;
    }
};

export async function getCurrentUser(){
    try{
        const response = await account.get()
        if(response.$id){
            // First try to get from temporary storage (if restored from logout)
            const tempKey = `temp_profile_${response.$id}`;
            const tempAvatar = await AsyncStorage.getItem(tempKey);
            
            if (tempAvatar) {
                // If we found temporary avatar, restore it to the main storage
                const storageKey = `profile_${response.$id}`;
                await AsyncStorage.setItem(storageKey, tempAvatar);
                await AsyncStorage.removeItem(tempKey);
                console.log('[Appwrite] Restored profile picture from temporary storage for user:', response.$id);
                return {
                    ...response,
                    avatar: tempAvatar
                };
            }
            
            // Try to get the stored avatar URI
            const storageKey = `profile_${response.$id}`;
            const storedAvatar = await AsyncStorage.getItem(storageKey);
            
            if (storedAvatar) {
                console.log('[Appwrite] Found stored profile picture for user:', response.$id);
                return {
                    ...response,
                    avatar: storedAvatar
                };
            }
            
            // If no stored avatar, try to get from user preferences
            const userPrefs = await account.getPrefs();
            if (userPrefs && userPrefs.avatar) {
                console.log('[Appwrite] Found profile picture in user preferences for user:', response.$id);
                // Store in AsyncStorage for future use
                await AsyncStorage.setItem(storageKey, userPrefs.avatar);
                return {
                    ...response,
                    avatar: userPrefs.avatar
                };
            }
            
            // If still no avatar, generate initials
            console.log('[Appwrite] No profile picture found, generating initials for user:', response.$id);
            const userAvatar = avatar.getInitials(response.name).toString();
            return {
                ...response,
                avatar: userAvatar
            };
        }
        return null;
    }catch(error){
        console.error('[Appwrite] Error getting current user:', error);
        return null;
    }
}

export async function updateUser(userData: any) {
    try {
        // Store the avatar URI in user preferences
        const prefs = {
            ...userData,
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
                ...response,
                avatar: userData.avatar
            };
        }
        return null;
    } catch(error) {
        console.error('[Appwrite] Error updating user:', error);
        return null;
    }
}