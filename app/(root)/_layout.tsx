import { useGlobalContext } from "@/lib/global-provider";
import { Redirect, Slot } from "expo-router";
import { ActivityIndicator, SafeAreaView } from "react-native";


export default function AppLayout(){

    const {loading, isLoggedIn} = useGlobalContext();
    
    if(loading){
        return(
            <SafeAreaView className="bg-main h-full flex justify-center items-center">
                <ActivityIndicator className='text-accent' size='large'/>
            </SafeAreaView>
        )
    }
    if(!isLoggedIn) return <Redirect href='/sign-in'/>

    return <Slot/>


}