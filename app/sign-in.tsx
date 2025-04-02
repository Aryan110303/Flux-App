import { View, Text, ScrollView, Image, TouchableOpacity, Alert } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import images from '@/constants/images'
import icons from '@/constants/icons'
import { login } from '@/lib/appwrite'
import { useGlobalContext } from '@/lib/global-provider'
import { Redirect } from 'expo-router'

const SignIn = () => {

  const {refetch, loading, isLoggedIn} = useGlobalContext();

  if(!loading && isLoggedIn) return <Redirect href='/'/>

    const handleLogin = async() => {
      const result = await login()
      if(result){
        refetch();
      }else{
        Alert.alert('Error','Failed to Login')
      }
        
    }

  return (
    <SafeAreaView className='bg-white h-full'>
      <ScrollView contentContainerClassName='h-full'>
        <Image source={images.onboarding} className='w-full h-4/6' resizeMode='contain'/>
        <View className=' px-10'>
            <Text className='text-base font-rubik text-center uppercase text-black-200'>
                Welcome to Flux
            </Text>
            <Text className='text-3xl font-rubik-bold text-center mt-2 text-black-300'>
                Let's Get You Closer To {"\n"}
                <Text className="text-primary-300">Your Goals</Text>
            </Text>
            <Text className='text-lg text-center font-rubik mt-12 text-black-200'>
                Login to Flux with Google
            </Text>
            <TouchableOpacity onPress={handleLogin} className='bg-white py-4 w-full shadow-md shadow-zinc-300 mt-5 rounded-full'>
                <View className='flex flex-row items-center justify-center'>
                    <Image
                        source={icons.google}
                        className='w-4 h-4'
                        resizeMode='contain'
                    />
                    <Text className='text-lg text-black-300 ml-2 font-rubik-medium'>Continue with Google</Text>
                </View>
            </TouchableOpacity>
      </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignIn