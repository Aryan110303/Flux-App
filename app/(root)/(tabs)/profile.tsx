import { View, Text, ScrollView, Image, TouchableOpacity, ImageSourcePropType, Alert } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import icons from '@/constants/icons'
import { settings } from '@/constants/data'
import { useGlobalContext } from '@/lib/global-provider'
import { logout } from '@/lib/appwrite'

interface SettingsItemProps{
  title: string;
  icon: ImageSourcePropType;
  onPress?: () => void;
  textStyle?:string;
  showArrow?:boolean;
}

const SettingsItem = ({icon, title, onPress, textStyle, showArrow = true}: SettingsItemProps) =>(
  <TouchableOpacity onPress={onPress} className='flex flex-row items-center justify-between py-3'>
    <View className='flex flex-row items-center gap-3'>
      <Image source={icon} className='size-6' tintColor={'#7b80ff'}/>
      <Text className={`font-rubik-medium text-[#fff] text-lg ${textStyle}`}>{title}</Text>
    </View>
      {showArrow && <Image source={icons.rightArrow} className='size-5' tintColor={'#7b80ff'}/>}
  </TouchableOpacity>
)

const Profile = () => {

  const {user, refetch} = useGlobalContext();

  const handleLogOut = async () => {
    const response = await logout();

    if(response){
      Alert.alert('You have been logged out successfully')
      refetch();
    }else{
      Alert.alert('Failed to log out')
    }
  }


  return (
    <SafeAreaView className='h-full bg-main'>
      <ScrollView
        showsVerticalScrollIndicator={false} contentContainerClassName='pb-32 px-7'>
          <View className='flex flex-row items-center justify-between mt-5'>
            <Text className='text-xl font-rubik-bold text-[#fff]'>Profile</Text>
            <Image tintColor={'#7b80ff'} source={icons.bell} className='size-5'/>
          </View>
          <View className='flex flex-row justify-center mt-5'>
            <View className='flex flex-col items-center relative mt-5'>
              <Image source={{uri: user?.avatar}} className='size-44 relative rounded-full'/>
              <TouchableOpacity className='absolute bottom-11 right-2'>
                <Image source={icons.edit} className='size-9'/>
              </TouchableOpacity>
              <Text className='text-2xl font-rubik-bold mt-2 text-[#fff]'>{user?.name}</Text>
            </View>
          </View>
          <View className='flex flex-col mt-10'>
            <SettingsItem icon={icons.calendar} title='My Savings'/>
            <SettingsItem icon={icons.wallet} title='Payments'/>
          </View>
          <View className='flex flex-col mt-5 border-t pt-5 border-[#fff]'>
            {settings.map((item, index)=>(
              <SettingsItem key={index} {...item}/>
            ))}
          </View>
          <View className='flex flex-col mt-5 border-t border-primary pt-5 border-primary-200'>
            <SettingsItem icon={icons.logout} title='LogOut' textStyle='text-[#F75555]' showArrow={false} onPress={handleLogOut}/>
          </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Profile