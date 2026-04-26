import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { adminService, vehicleService } from '../../services/apiService';
import { useTranslation } from 'react-i18next';

export default function AdminVehiclesScreen() {
  const { t } = useTranslation();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [seatType, setSeatType] = useState<'5' | '7'>('5');
  const [price, setPrice] = useState('');
  const [pricingType, setPricingType] = useState('per_km');
  const [description, setDescription] = useState('');

  const loadVehicles = async () => {
    try {
      setIsLoading(true);
      const res = await adminService.getVehicles();
      setVehicles(res.data.vehicles || []);
    } catch (err) {
      console.error('Failed to load vehicles:', err);
      // fallback just in case
      try {
        const res2 = await vehicleService.getAll();
        setVehicles(res2.data.vehicles || []);
      } catch (err2) {
        Alert.alert(t('error'), t('loadingError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleAddVehicle = async () => {
    if (!name || !price) {
      Alert.alert(t('error'), t('fillNamePrice'));
      return;
    }

    try {
      setIsSubmitting(true);
      await adminService.createVehicle({
        name,
        seat_type: seatType,
        pricing_type: pricingType,
        price: parseFloat(price),
        description
      });
      
      Alert.alert(t('success'), t('carAddedSuccess'));
      setModalVisible(false);
      resetForm();
      loadVehicles();
    } catch (err: any) {
      console.error('Add vehicle error:', err);
      Alert.alert(t('error'), err.response?.data?.error || t('error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setSeatType('5');
    setPrice('');
    setPricingType('per_km');
    setDescription('');
  };

  const renderVehicleItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.carName}>{item.name}</Text>
        <View style={styles.seatBadge}>
          <Text style={styles.seatText}>{item.seat_type} {t('seater')}</Text>
        </View>
      </View>
      <Text style={styles.carDesc}>{item.description || 'No description provided'}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.price}>₹{item.price}</Text>
        <Text style={styles.pricingType}>/{item.pricing_type}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('carFleet')}</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtnText}>+ {t('addCar')}</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ flex: 1 }} color="#F59E0B" size="large" />
      ) : vehicles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t('noCarsAdded')}</Text>
        </View>
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderVehicleItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('addNewCar')}</Text>
              <TouchableOpacity onPress={() => { setModalVisible(false); resetForm(); }}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>{t('carModelName')}</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Innova Crysta, Swift Dzire"
                placeholderTextColor="#64748B"
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.label}>{t('seatCapacity')}</Text>
              <View style={styles.row}>
                <TouchableOpacity 
                  style={[styles.radioBtn, seatType === '5' && styles.radioActive]}
                  onPress={() => setSeatType('5')}
                >
                  <Text style={[styles.radioText, seatType === '5' && styles.radioTextActive]}>5 {t('seater')}</Text>
                </TouchableOpacity>
                <View style={{ width: 12 }} />
                <TouchableOpacity 
                  style={[styles.radioBtn, seatType === '7' && styles.radioActive]}
                  onPress={() => setSeatType('7')}
                >
                  <Text style={[styles.radioText, seatType === '7' && styles.radioTextActive]}>7 {t('seater')}</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>{t('basePrice')} (₹)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 15"
                placeholderTextColor="#64748B"
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />

              <Text style={styles.label}>{t('pricingType')}</Text>
              <View style={styles.row}>
                <TouchableOpacity 
                  style={[styles.radioBtn, pricingType === 'per_km' && styles.radioActive]}
                  onPress={() => setPricingType('per_km')}
                >
                  <Text style={[styles.radioText, pricingType === 'per_km' && styles.radioTextActive]}>{t('perKm')}</Text>
                </TouchableOpacity>
                <View style={{ width: 12 }} />
                <TouchableOpacity 
                  style={[styles.radioBtn, pricingType === 'flat_rate' && styles.radioActive]}
                  onPress={() => setPricingType('flat_rate')}
                >
                  <Text style={[styles.radioText, pricingType === 'flat_rate' && styles.radioTextActive]}>{t('flatRate')}</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>{t('description')} (Optional)</Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                placeholder="e.g. AC, Premium, Extra Luggage"
                placeholderTextColor="#64748B"
                multiline
                value={description}
                onChangeText={setDescription}
              />

              <TouchableOpacity 
                style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]}
                onPress={handleAddVehicle}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#0F172A" />
                ) : (
                  <Text style={styles.submitBtnText}>{t('saveCarDetails')}</Text>
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
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  carName: { fontSize: 18, fontWeight: '700', color: '#F8FAFC' },
  seatBadge: { backgroundColor: '#334155', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  seatText: { color: '#94A3B8', fontSize: 12, fontWeight: '600' },
  carDesc: { color: '#94A3B8', fontSize: 14, marginBottom: 12, lineHeight: 20 },
  cardFooter: { flexDirection: 'row', alignItems: 'baseline' },
  price: { fontSize: 20, fontWeight: '800', color: '#F59E0B' },
  pricingType: { fontSize: 14, color: '#64748B', marginLeft: 4 },
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
  row: { flexDirection: 'row' },
  radioBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  radioActive: { borderColor: '#F59E0B', backgroundColor: 'rgba(245, 158, 11, 0.1)' },
  radioText: { color: '#94A3B8', fontWeight: '600' },
  radioTextActive: { color: '#F59E0B' },
  submitBtn: {
    backgroundColor: '#F59E0B',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 32,
  },
  submitBtnText: { color: '#0F172A', fontSize: 16, fontWeight: '800' },
});
