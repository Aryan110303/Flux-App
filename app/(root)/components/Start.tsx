import icons from '@/constants/icons'
import React from 'react'
import {View, Text, TouchableOpacity, Image, ScrollView} from 'react-native'


interface StartTypes{
    isVisible: boolean
    onClick: () => void
}


const Start = ({isVisible, onClick}: StartTypes) => {
    if(!isVisible) return null

    const handleClick =() => {
        onClick()
    }
  return (
    <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
      <View className="flex-1 w-full flex items-center justify-center">
        <View className="items-center px-6">
          <Image source={icons.expense} className="size-16 mb-4" tintColor={"#7b80ff"}/>
          <Text className="text-primary text-xl font-rubik-semibold mb-2 text-center">Add Your Salary First</Text>
          <Text className="text-primary text-base font-rubik opacity-60 mb-6 text-center">Please add your salary details before tracking expenses</Text>
          <TouchableOpacity 
            onPress={handleClick}
            className="bg-[#7b80ff] px-6 py-3 rounded-full flex-row items-center"
          >
            <Image source={icons.add} className="size-5 mr-2" tintColor={"#fff"}/>
            <Text className="text-white font-rubik-semibold">Add Salary Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}

export default Start