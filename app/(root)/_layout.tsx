import { useGlobalContext } from "@/lib/global-provider";
import { Redirect, Slot } from "expo-router";
import { ActivityIndicator, SafeAreaView } from "react-native";
import { useEffect, useState } from "react";

export default function AppLayout() {
    const { loading, isLoggedIn } = useGlobalContext();
    const [isRedirecting, setIsRedirecting] = useState(false);
    
    useEffect(() => {
        if (!loading && !isLoggedIn && !isRedirecting) {
            setIsRedirecting(true);
        }
    }, [loading, isLoggedIn]);
    
    if (loading) {
        return (
            <SafeAreaView className="bg-main h-full flex justify-center items-center">
                <ActivityIndicator className='text-accent' size='large'/>
            </SafeAreaView>
        );
    }
    
    if (!isLoggedIn && isRedirecting) {
        return <Redirect href='/sign-in'/>;
    }

    return <Slot/>;
}