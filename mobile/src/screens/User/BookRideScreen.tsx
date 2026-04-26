import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert, Platform,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import { vehicleService, bookingService } from '../../services/apiService';

interface Vehicle {
  id: number;
  name: string;
  seat_type: string;
  pricing_type: string;
  price: number;
  description: string;
}

export default function BookRideScreen({ navigation }: any) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedSeatType, setSelectedSeatType] = useState<'5' | '7' | ''>('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState('');
  
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 2 * 60 * 60 * 1000)); // Default 2 hours later
  const [openStart, setOpenStart] = useState(false);
  const [openEnd, setOpenEnd] = useState(false);

  const [passengers, setPassengers] = useState('1');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [vehicleLoading, setVehicleLoading] = useState(false);

  useEffect(() => {
    if (selectedSeatType) {
      fetchVehicles(selectedSeatType);
    }
  }, [selectedSeatType]);

  const fetchVehicles = async (seatType: string) => {
    setVehicleLoading(true);
    try {
      const res = await vehicleService.getAll(seatType);
      setVehicles(res.data.vehicles ?? []);
      setSelectedVehicle(null);
    } catch {
      Alert.alert('Error', 'Failed to load vehicles');
    } finally {
      setVehicleLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedVehicle || !pickup || !drop || !passengers) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();

    if (endDate <= startDate) {
      Alert.alert('Error', 'End time must be after start time');
      return;
    }

    setLoading(true);
    try {
      await bookingService.create({
        vehicle_id: selectedVehicle.id,
        pickup_location: pickup,
        drop_location: drop,
        start_time: startISO,
        end_time: endISO,
        passengers: parseInt(passengers, 10),
        notes,
      });
      Alert.alert('🎉 Success', 'Booking submitted! Admin will confirm shortly.', [
        { text: 'View Bookings', onPress: () => navigation.navigate('Bookings') },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error ?? 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const pricingLabel = (type: string) => {
    const map: any = { per_trip: '/trip', per_day: '/day', per_km: '/km' };
    return map[type] ?? '';
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Book a Ride</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Step 1: Seat Type */}
      <View style={styles.section}>
        <Text style={styles.stepLabel}>STEP 1 — Select Seat Type</Text>
        <View style={styles.seatRow}>
          {(['5', '7'] as const).map((st) => (
            <TouchableOpacity
              key={st}
              style={[styles.seatBtn, selectedSeatType === st && styles.seatBtnActive]}
              onPress={() => setSelectedSeatType(st)}
              activeOpacity={0.8}
            >
              <Text style={styles.seatIcon}>{st === '5' ? '🚗' : '🚐'}</Text>
              <Text style={[styles.seatText, selectedSeatType === st && styles.seatTextActive]}>
                {st} Seater
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Step 2: Vehicle Selection */}
      {selectedSeatType ? (
        <View style={styles.section}>
          <Text style={styles.stepLabel}>STEP 2 — Select Vehicle</Text>
          {vehicleLoading ? (
            <ActivityIndicator color="#F59E0B" />
          ) : vehicles.length === 0 ? (
            <Text style={styles.noVehicles}>No vehicles available</Text>
          ) : (
            vehicles.map((v) => (
              <TouchableOpacity
                key={v.id}
                style={[styles.vehicleCard, selectedVehicle?.id === v.id && styles.vehicleCardActive]}
                onPress={() => setSelectedVehicle(v)}
                activeOpacity={0.8}
              >
                <View style={styles.vehicleInfo}>
                  <Text style={styles.vehicleName}>{v.name}</Text>
                  <Text style={styles.vehicleDesc} numberOfLines={1}>{v.description}</Text>
                </View>
                <View style={styles.vehiclePrice}>
                  <Text style={styles.priceAmt}>₹{v.price}</Text>
                  <Text style={styles.priceType}>{pricingLabel(v.pricing_type)}</Text>
                </View>
                {selectedVehicle?.id === v.id && (
                  <View style={styles.checkmark}>
                    <Text style={{ fontSize: 16 }}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>
      ) : null}

      {/* Step 3: Trip Details */}
      {selectedVehicle ? (
        <View style={styles.section}>
          <Text style={styles.stepLabel}>STEP 3 — Trip Details</Text>

          <Text style={styles.label}>Pickup Location *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter pickup address or Google Maps link"
            placeholderTextColor="#475569"
            value={pickup}
            onChangeText={setPickup}
            multiline
          />

          <Text style={styles.label}>Drop Location *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter drop address or Google Maps link"
            placeholderTextColor="#475569"
            value={drop}
            onChangeText={setDrop}
            multiline
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Start Date & Time *</Text>
              <TouchableOpacity style={styles.datePickerBtn} onPress={() => setOpenStart(true)}>
                <Text style={styles.datePickerText}>
                  {startDate.toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>End Date & Time *</Text>
              <TouchableOpacity style={styles.datePickerBtn} onPress={() => setOpenEnd(true)}>
                <Text style={styles.datePickerText}>
                  {endDate.toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <DatePicker
            modal
            open={openStart}
            date={startDate}
            mode="datetime"
            onConfirm={(date) => {
              setOpenStart(false);
              setStartDate(date);
              // auto push end date if needed
              if (date >= endDate) {
                setEndDate(new Date(date.getTime() + 2 * 60 * 60 * 1000));
              }
            }}
            onCancel={() => {
              setOpenStart(false);
            }}
          />

          <DatePicker
            modal
            open={openEnd}
            date={endDate}
            mode="datetime"
            minimumDate={startDate}
            onConfirm={(date) => {
              setOpenEnd(false);
              setEndDate(date);
            }}
            onCancel={() => {
              setOpenEnd(false);
            }}
          />

          <Text style={styles.label}>Passengers *</Text>
          <TextInput
            style={styles.input}
            placeholder={`Max ${selectedVehicle.seat_type}`}
            placeholderTextColor="#475569"
            value={passengers}
            onChangeText={setPassengers}
            keyboardType="number-pad"
            maxLength={1}
          />

          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Any special requirements..."
            placeholderTextColor="#475569"
            value={notes}
            onChangeText={setNotes}
            multiline
          />

          {/* Price Summary */}
          <View style={styles.priceSummary}>
            <Text style={styles.priceSummaryTitle}>Estimated Price</Text>
            <Text style={styles.priceSummaryAmount}>
              ₹{selectedVehicle.price}
              <Text style={styles.priceSummaryType}> {pricingLabel(selectedVehicle.pricing_type)}</Text>
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#0F172A" />
            ) : (
              <Text style={styles.submitBtnText}>🚖 Submit Booking</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 20,
  },
  back: { color: '#F59E0B', fontSize: 16, fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '800', color: '#F8FAFC' },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  stepLabel: { fontSize: 11, fontWeight: '800', color: '#F59E0B', letterSpacing: 1, marginBottom: 14 },
  seatRow: { flexDirection: 'row', gap: 12 },
  seatBtn: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  seatBtnActive: { borderColor: '#F59E0B', backgroundColor: '#451A03' },
  seatIcon: { fontSize: 36, marginBottom: 8 },
  seatText: { color: '#94A3B8', fontWeight: '700', fontSize: 16 },
  seatTextActive: { color: '#F59E0B' },
  noVehicles: { color: '#64748B', textAlign: 'center', marginTop: 12 },
  vehicleCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  vehicleCardActive: { borderColor: '#F59E0B' },
  vehicleInfo: { flex: 1 },
  vehicleName: { fontSize: 16, fontWeight: '700', color: '#F8FAFC' },
  vehicleDesc: { fontSize: 12, color: '#64748B', marginTop: 2 },
  vehiclePrice: { alignItems: 'flex-end', marginRight: 8 },
  priceAmt: { fontSize: 20, fontWeight: '800', color: '#F59E0B' },
  priceType: { fontSize: 11, color: '#94A3B8' },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 12, fontWeight: '600', color: '#94A3B8', marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#334155',
  },
  datePickerBtn: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#334155',
  },
  datePickerText: {
    fontSize: 14,
    color: '#F8FAFC',
  },
  row: { flexDirection: 'row' },
  priceSummary: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  priceSummaryTitle: { color: '#94A3B8', fontSize: 14, fontWeight: '600' },
  priceSummaryAmount: { fontSize: 24, fontWeight: '800', color: '#F59E0B' },
  priceSummaryType: { fontSize: 14, color: '#94A3B8' },
  submitBtn: {
    backgroundColor: '#F59E0B',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  btnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#0F172A', fontSize: 17, fontWeight: '800' },
});
