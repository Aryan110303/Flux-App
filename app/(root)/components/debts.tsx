import { View, Text, TouchableOpacity, Image, SafeAreaView, ScrollView, StyleSheet } from "react-native";
import React, { useState } from "react";
import icons from "@/constants/icons";
import { router } from "expo-router";
import { useDebts, Debt, PaymentStatus } from "../context/DebtContext";
import DebtModal from "./DebtModal";
import StatusUpdateModal from "./StatusUpdateModal";
import { useToast } from "../context/ToastContext";

interface DebtsProps {
  onClose?: () => void;
}

export default function Debts({ onClose }: DebtsProps) {
  const [isDebtModalVisible, setIsDebtModalVisible] = useState(false);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | undefined>(undefined);
  const [selectedDebt, setSelectedDebt] = useState<Debt | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<"owe" | "owed">("owe");
  const { debts, addDebt, deleteDebt, updateDebtStatus } = useDebts();
  const { showToast } = useToast();

  const handleCloseDebtModal = () => {
    setIsDebtModalVisible(false);
    setEditingDebt(undefined);
  };

  const handleCloseStatusModal = () => {
    setIsStatusModalVisible(false);
    setSelectedDebt(undefined);
  };

  const handleOpenDebtModal = (debt?: Debt) => {
    setEditingDebt(debt);
    setIsDebtModalVisible(true);
  };

  const handleAddDebt = () => {
    // Don't set editingDebt for new debts, just set the type
    setEditingDebt(undefined);
    setIsDebtModalVisible(true);
  };

  const handleDeleteDebt = (debt: { id: number; name: string }) => {
    deleteDebt(debt.id);
    showToast('Debt deleted successfully');
  };

  const handleUpdateStatus = (debt: Debt) => {
    setSelectedDebt(debt);
    setIsStatusModalVisible(true);
  };

  // Filter debts based on active tab
  const filteredDebts = debts.filter(debt => debt.type === activeTab);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return '#4CAF50';
      case 'partially_paid':
        return '#FFC107';
      case 'unpaid':
      default:
        return '#F44336';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'partially_paid':
        return 'Partial';
      case 'unpaid':
      default:
        return 'Unpaid';
    }
  };

  const renderDebtItem = ({ item }: { item: any }) => (
    <View style={styles.debtItem}>
      <View style={styles.debtHeader}>
        <Text style={styles.personName}>{item.name}</Text>
        <View style={styles.amountContainer}>
          <Text style={styles.amount}>Due: ₹{
            item.status === 'paid' 
              ? '0' 
              : (item.status === 'partially_paid' && item.paidAmount)
                ? Math.max(0, parseFloat(item.amount) - parseFloat(item.paidAmount)).toFixed(2)
                : item.amount
          }</Text>
          {item.status === 'partially_paid' && item.paidAmount && (
            <>
              <Text style={styles.originalAmount}>Original: ₹{item.amount}</Text>
              <Text style={styles.paidAmount}>Paid: ₹{item.paidAmount}</Text>
            </>
          )}
        </View>
      </View>
      <View style={styles.debtDetails}>
        <Text style={styles.category}>Category: {item.category}</Text>
        <View style={styles.detailsRight}>
          {item.frequency && (
            <Text style={styles.frequency}>{item.frequency}</Text>
          )}
          {item.dueDate && (
            <Text style={styles.dueDate}>Due: {item.dueDate}</Text>
          )}
        </View>
      </View>
      {item.notes && (
        <Text style={styles.notes} numberOfLines={2}>{item.notes}</Text>
      )}
      <View style={styles.debtFooter}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleUpdateStatus(item)}
          >
            <Text style={styles.actionButtonText}>Update Status</Text>
          </TouchableOpacity>
          {item.status !== 'paid' && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleOpenDebtModal(item)}
            >
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteDebt(item)}
          >
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#1f2630]">
      <View className="flex-row items-center justify-between px-6 py-4 mt-8">
        <TouchableOpacity 
          onPress={onClose} 
          className="flex-row items-center"
        >
          <Image source={icons.backArrow} className="size-6 mr-4" tintColor="#7b80ff" />
          <Text className="text-primary font-rubik-medium text-lg">Debts</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleAddDebt}>
          <Image source={icons.add} className="size-6" tintColor="#7b80ff" />
        </TouchableOpacity>
      </View>
      
      {/* Tabs */}
      <View className="px-6 py-4">
        <View className="flex-row justify-between gap-4">
          <TouchableOpacity 
            className={`py-3 px-4 rounded-full flex-1 items-center ${activeTab === "owe" ? "bg-[#7b80ff]" : "bg-[#3E4D67]"}`}
            onPress={() => setActiveTab("owe")}
          >
            <Text 
              className={`font-rubik-medium text-base ${activeTab === "owe" ? "text-white" : "text-[#9aa0a6]"}`}
            >
              I owe
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`py-3 px-4 rounded-full flex-1 items-center ${activeTab === "owed" ? "bg-[#7b80ff]" : "bg-[#3E4D67]"}`}
            onPress={() => setActiveTab("owed")}
          >
            <Text 
              className={`font-rubik-medium text-base ${activeTab === "owed" ? "text-white" : "text-[#9aa0a6]"}`}
            >
              Owed to me
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-6">
        {filteredDebts && filteredDebts.length > 0 ? (
          filteredDebts.map((debt) => (
            <View key={debt.id}>
              {renderDebtItem({ item: debt })}
            </View>
          ))
        ) : (
          <View className="flex-1 items-center justify-center py-12">
            <Text className="text-[#ccc] font-rubik text-center">
              {activeTab === "owe" 
                ? "No debts that you owe yet" 
                : "No debts owed to you yet"}
            </Text>
            <TouchableOpacity 
              className="bg-[#7b80ff] px-6 py-3 rounded-full flex-row items-center mt-4"
              onPress={handleAddDebt}
            >
              <Image source={icons.add} className="size-5 mr-2" tintColor={"#fff"}/>
              <Text className="text-white font-rubik-semibold">
                {activeTab === "owe" 
                  ? "Add Debts" 
                  : "Add Credit"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <DebtModal 
        isVisible={isDebtModalVisible}
        onClose={handleCloseDebtModal}
        editingDebt={editingDebt}
        onSave={addDebt}
        type={editingDebt?.type || activeTab}
      />

      <StatusUpdateModal 
        isVisible={isStatusModalVisible}
        onClose={handleCloseStatusModal}
        debt={selectedDebt}
        onUpdateStatus={updateDebtStatus}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  debtItem: {
    backgroundColor: '#3E4D67',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  debtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  personName: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Rubik-Medium',
    flex: 1,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    color: '#7b80ff',
    fontSize: 16,
    fontFamily: 'Rubik-Bold',
  },
  originalAmount: {
    color: '#ccc',
    fontSize: 12,
    fontFamily: 'Rubik',
    marginTop: 2,
  },
  paidAmount: {
    color: '#ccc',
    fontSize: 12,
    fontFamily: 'Rubik',
    marginTop: 2,
  },
  debtDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  category: {
    color: '#ccc',
    fontSize: 14,
    fontFamily: 'Rubik',
  },
  detailsRight: {
    alignItems: 'flex-end',
  },
  frequency: {
    color: '#ccc',
    fontSize: 12,
    fontFamily: 'Rubik',
    marginBottom: 2,
  },
  dueDate: {
    color: '#ccc',
    fontSize: 12,
    fontFamily: 'Rubik',
  },
  notes: {
    color: '#ccc',
    fontSize: 12,
    fontFamily: 'Rubik',
    marginTop: 8,
  },
  debtFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
    minWidth: 55,
    height: 24,
    justifyContent: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: 'Rubik-Medium',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#2A3441',
  },
  actionButtonText: {
    color: '#7b80ff',
    fontSize: 11,
    fontFamily: 'Rubik-Medium',
  },
  deleteButton: {
    backgroundColor: '#3E1F1F',
  },
  deleteButtonText: {
    color: '#FF6B6B',
  },
}); 