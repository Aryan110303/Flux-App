import { View, Text, ScrollView, Image, TouchableOpacity, ImageSourcePropType, Alert } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import icons from '@/constants/icons'
import { settings } from '@/constants/data'
import { useGlobalContext } from '@/lib/global-provider'
import { logout } from '@/lib/appwrite'
import MySavings from '../components/MySavings'
import Payments from '../components/Payments'
import DownloadData from '../components/DownloadData'
import Calendar from '../components/Calendar'
import InviteFriends from '../components/InviteFriends'
import About from '../components/About'

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
  const [activeScreen, setActiveScreen] = useState<string | null>(null);

  const handleLogOut = async () => {
    const response = await logout();

    if(response){
      Alert.alert('You have been logged out successfully')
      refetch();
    }else{
      Alert.alert('Failed to log out')
    }
  }

  const handleCloseScreen = () => {
    setActiveScreen(null);
  }

  const renderScreen = () => {
    switch (activeScreen) {
      case 'savings':
        return <MySavings onClose={handleCloseScreen} />;
      case 'payments':
        return <Payments onClose={handleCloseScreen} />;
      case 'download':
        return <DownloadData onClose={handleCloseScreen} />;
      case 'calendar':
        return <Calendar onClose={handleCloseScreen} />;
      case 'invite':
        return <InviteFriends onClose={handleCloseScreen} />;
      case 'about':
        return <About onClose={handleCloseScreen} />;
      default:
        return null;
    }
  }

  if (activeScreen) {
    return renderScreen();
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
            <SettingsItem 
              icon={icons.calendar} 
              title='My Savings' 
              onPress={() => setActiveScreen('savings')}
            />
            <SettingsItem 
              icon={icons.wallet} 
              title='Payments' 
              onPress={() => setActiveScreen('payments')}
            />
          </View>
          <View className='flex flex-col mt-5 border-t pt-5 border-[#fff]'>
            {settings.map((item, index) => (
              <SettingsItem 
                key={index} 
                icon={item.icon} 
                title={item.title} 
                onPress={() => setActiveScreen(item.route.replace('/', ''))}
              />
            ))}
          </View>
          <View className='flex flex-col mt-5 border-t border-primary pt-5 border-primary-200'>
            <SettingsItem 
              icon={icons.logout} 
              title='LogOut' 
              textStyle='text-[#F75555]' 
              showArrow={false} 
              onPress={handleLogOut}
            />
          </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Profile