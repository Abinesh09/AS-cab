import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Linking, Alert,
} from 'react-native';
import { bookingService, paymentService } from '../../services/apiService';

const STATUS_CONFIG: any = {
  pending: { color: '#F59E0B', bg: '#451A03', icon: '⏳' },
  confirmed: { color: '#10B981', bg: '#022C22', icon: '✅' },
  completed: { color: '#6366F1', bg: '#1E1B4B', icon: '🎉' },
  cancelled: { color: '#EF4444', bg: '#450A0A', icon: '❌' },
};

export default function BookingDetailScreen({ route, navigation }: any) {
  const { bookingId } = route.params;
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | null>(null);

  useEffect(() => {
    fetchBooking();
  }, []);

  const fetchBooking = async () => {
    try {
      const res = await bookingService.getById(bookingId);
      setBooking(res.data.booking);
    } catch {
      Alert.alert('Error', 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (!paymentMethod) {
      Alert.alert('Error', 'Select a payment method');
      return;
    }
    try {
      const res = await paymentService.create({
        booking_id: bookingId,
        method: paymentMethod,
        amount: booking.total_amount,
      });

      if (paymentMethod === 'upi' && res.data.upi_link) {
        await Linking.openURL(res.data.upi_link);
      } else {
        Alert.alert('✅ Payment Recorded', 'Admin will verify your cash payment shortly.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error ?? 'Payment failed');
    }
  };

  const callDriver = () => {
    const phone = booking?.driver?.phone ?? booking?.driver?.user?.mobile;
    if (!phone) {
      Alert.alert('Info', 'Driver not assigned yet');
      return;
    }
    Linking.openURL(`tel:${phone}`);
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#F59E0B" />
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.loading}>
        <Text style={{ color: '#F8FAFC' }}>Booking not found</Text>
      </View>
    );
  }

  const sc = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Booking #{booking.id}</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Status Card */}
      <View style={[styles.statusCard, { backgroundColor: sc.bg }]}>
        <Text style={styles.statusIcon}>{sc.icon}</Text>
        <View>
          <Text style={styles.statusLabel}>Booking Status</Text>
          <Text style={[styles.statusValue, { color: sc.color }]}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </Text>
        </View>
      </View>

      {/* Vehicle Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🚗 Vehicle</Text>
        <Text style={styles.cardValue}>{booking.vehicle?.name}</Text>
        <Text style={styles.cardSub}>{booking.vehicle?.seat_type} Seater · ₹{booking.vehicle?.price}</Text>
      </View>

      {/* Trip Details */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📍 Trip Details</Text>
        <InfoRow label="Pickup" value={booking.pickup_location} />
        <InfoRow label="Drop" value={booking.drop_location} />
        <InfoRow label="Start" value={new Date(booking.start_time).toLocaleString('en-IN')} />
        <InfoRow label="End" value={new Date(booking.end_time).toLocaleString('en-IN')} />
        <InfoRow label="Passengers" value={String(booking.passengers)} />
        {booking.notes ? <InfoRow label="Notes" value={booking.notes} /> : null}
      </View>

      {/* Driver Info */}
      {booking.driver && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>👨‍✈️ Driver</Text>
          <InfoRow label="Name" value={booking.driver.name} />
          <InfoRow label="Phone" value={booking.driver.phone} />
          <View style={styles.driverActions}>
            <TouchableOpacity style={styles.callBtn} onPress={callDriver}>
              <Text style={styles.callBtnText}>📞 Call Driver</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.chatBtn}
              onPress={() => navigation.navigate('Chat', { bookingId: booking.id })}
            >
              <Text style={styles.chatBtnText}>💬 Chat</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Payment */}
      {booking.status !== 'cancelled' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💰 Payment · ₹{booking.total_amount}</Text>
          <View style={styles.paymentRow}>
            {(['cash', 'upi'] as const).map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.payBtn, paymentMethod === m && styles.payBtnActive]}
                onPress={() => setPaymentMethod(m)}
              >
                <Text style={styles.payBtnText}>{m === 'cash' ? '💵 Cash' : '📱 UPI'}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.submitPayBtn} onPress={handlePay}>
            <Text style={styles.submitPayText}>Pay Now</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 20,
  },
  back: { color: '#F59E0B', fontSize: 16, fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '800', color: '#F8FAFC' },
  statusCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  statusIcon: { fontSize: 32 },
  statusLabel: { color: '#94A3B8', fontSize: 12, fontWeight: '600' },
  statusValue: { fontSize: 20, fontWeight: '800', marginTop: 2 },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 20,
    marginBottom: 14,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#F8FAFC', marginBottom: 12 },
  cardValue: { fontSize: 18, fontWeight: '700', color: '#F59E0B' },
  cardSub: { color: '#94A3B8', fontSize: 13, marginTop: 2 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  infoLabel: { color: '#64748B', fontSize: 13, fontWeight: '600' },
  infoValue: { color: '#CBD5E1', fontSize: 13, flex: 1, textAlign: 'right', marginLeft: 12 },
  driverActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  callBtn: {
    flex: 1, backgroundColor: '#022C22', borderRadius: 10,
    paddingVertical: 12, alignItems: 'center',
  },
  callBtnText: { color: '#10B981', fontWeight: '700', fontSize: 14 },
  chatBtn: {
    flex: 1, backgroundColor: '#1E1B4B', borderRadius: 10,
    paddingVertical: 12, alignItems: 'center',
  },
  chatBtnText: { color: '#818CF8', fontWeight: '700', fontSize: 14 },
  paymentRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  payBtn: {
    flex: 1, backgroundColor: '#0F172A', borderRadius: 10,
    paddingVertical: 12, alignItems: 'center',
    borderWidth: 2, borderColor: 'transparent',
  },
  payBtnActive: { borderColor: '#F59E0B' },
  payBtnText: { color: '#F8FAFC', fontWeight: '700', fontSize: 15 },
  submitPayBtn: {
    backgroundColor: '#F59E0B', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
  },
  submitPayText: { color: '#0F172A', fontWeight: '800', fontSize: 16 },
});
