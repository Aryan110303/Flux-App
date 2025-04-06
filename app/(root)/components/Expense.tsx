import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import icons from '@/constants/icons';

interface ExpenseProps {
    isModalVisible: boolean;
    onCloseModal: () => void;
    onOpenModal: () => void;
    onClose: () => void;
    onEdit: (expense: { id: number; title: string; amount: string; date?: string | number | Date; type?: 'expense' | 'income' }) => void;
}

const Expense = ({ isModalVisible, onCloseModal, onOpenModal }: ExpenseProps) => {
    return (
        <View className="flex-1 items-center justify-center">
            <View className="items-center">
                <Image source={icons.expense} className="size-20 mb-4" tintColor={"#7b80ff"}/>
                <Text className="text-primary text-xl font-rubik-semibold mb-2">No Expenditures Yet</Text>
                <Text className="text-primary text-base font-rubik opacity-60 mb-8">Start tracking your expenses to manage your budget better</Text>
                <TouchableOpacity 
                    onPress={onOpenModal}
                    className="bg-[#7b80ff] px-8 py-4 rounded-full flex-row items-center"
                >
                    <Image source={icons.add} className="size-6 mr-2" tintColor={"#fff"}/>
                    <Text className="text-white font-rubik-semibold">Add an Expenditure</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Expense;