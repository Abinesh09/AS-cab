import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { adminService } from '../../services/apiService';

export default function AdminDriversScreen() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseNo, setLicenseNo] = useState('');

  const loadDrivers = async () => {
    try {
      setIsLoading(true);
      const res = await adminService.getDrivers();
      setDrivers(res.data.drivers || []);
    } catch (err) {
      console.error('Failed to load drivers:', err);
      Alert.alert('Error', 'Failed to load drivers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  const handleAddDriver = async () => {
    if (!name || !phone) {
      Alert.alert('Error', 'Please fill name and phone number');
      return;
    }

    try {
      setIsSubmitting(true);
      await adminService.createDriver({
        name,
        phone,
        license_no: licenseNo,
      });
      
      Alert.alert('Success', 'Driver added successfully. Default login OTP is 000000');
      setModalVisible(false);
      resetForm();
      loadDrivers();
    } catch (err: any) {
      console.error('Add driver error:', err);
      Alert.alert('Error', err.response?.data?.error || 'Failed to add driver');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setLicenseNo('');
  };

  const renderDriverItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name?.charAt(0)?.toUpperCase()}</Text>
        </View>
        <View style={styles.driverInfo}>
          <Text style={styles.driverName}>{item.name}</Text>
          <Text style={styles.driverPhone}>+91 {item.phone}</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.licenseLabel}>License:</Text>
        <Text style={styles.licenseValue}>{item.license_no || 'Not provided'}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Driver Fleet</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtnText}>+ Add Driver</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ flex: 1 }} color="#F59E0B" size="large" />
      ) : drivers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No drivers added yet.</Text>
        </View>
      ) : (
        <FlatList
          data={drivers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderDriverItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Add Driver Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Driver</Text>
              <TouchableOpacity onPress={() => { setModalVisible(false); resetForm(); }}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Ramesh Kumar"
                placeholderTextColor="#64748B"
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.label}>Mobile Number</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 9876543210"
                placeholderTextColor="#64748B"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />

              <Text style={styles.label}>License Number (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. TN00 20240000000"
                placeholderTextColor="#64748B"
                value={licenseNo}
                onChangeText={setLicenseNo}
                autoCapitalize="characters"
              />

              <TouchableOpacity 
                style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]}
                onPress={handleAddDriver}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#0F172A" />
                ) : (
                  <Text style={styles.submitBtnText}>Create Driver Account</Text>
                )}
              </TouchableOpacity>
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#F8FAFC' },
  addBtn: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addBtnText: { color: '#0F172A', fontWeight: '700', fontSize: 14 },
  listContent: { padding: 20 },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatar: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center',
    marginRight: 16,
  },
  avatarText: { color: '#F59E0B', fontSize: 24, fontWeight: '800' },
  driverInfo: { flex: 1 },
  driverName: { fontSize: 18, fontWeight: '700', color: '#F8FAFC' },
  driverPhone: { fontSize: 14, color: '#94A3B8', marginTop: 4 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 12 },
  licenseLabel: { fontSize: 13, color: '#64748B', marginRight: 8 },
  licenseValue: { fontSize: 13, color: '#F8FAFC', fontWeight: '600', letterSpacing: 1 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#64748B', fontSize: 16 },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#F8FAFC' },
  closeBtn: { fontSize: 24, color: '#94A3B8', padding: 4 },
  label: { color: '#F8FAFC', fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 16 },
  input: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 16,
    color: '#F8FAFC',
    fontSize: 16,
  },
  submitBtn: {
    backgroundColor: '#F59E0B',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 32,
  },
  submitBtnText: { color: '#0F172A', fontSize: 16, fontWeight: '800' },
});
