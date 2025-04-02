import { View, Text, Image, ImageSourcePropType } from 'react-native'
import React from 'react'

interface TabIconProps {
  focused: boolean;
  icon: ImageSourcePropType;
  title: string;
}

const TabIcon = ({ focused, icon, title }: TabIconProps) => (
  <View className='flex-1 mt-3 flex flex-col items-center'>
    <Image 
      source={icon} 
      tintColor={focused ? '#7b80ff' : '#666876'} 
      resizeMode='contain' 
      className='size-6'
    />
    <Text 
      className={`${
        focused ? 'font-rubik-medium text-[#7B80FF]' : 'font-rubik text-black-200'
      } text-xs w-full text-center mt-1`}
    >
      {title}
    </Text>
  </View>
)

export default TabIcon 