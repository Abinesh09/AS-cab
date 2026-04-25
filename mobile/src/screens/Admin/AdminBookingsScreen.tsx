import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, Modal, FlatList,
} from 'react-native';
import { adminService } from '../../services/apiService';

const STATUS_CONFIG: any = {
  pending:   { color: '#F59E0B', bg: '#451A03' },
  confirmed: { color: '#10B981', bg: '#022C22' },
  completed: { color: '#6366F1', bg: '#1E1B4B' },
  cancelled: { color: '#EF4444', bg: '#450A0A' },
};

export default function AdminBookingsScreen({ navigation }: any) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [drivers, setDrivers] = useState<any[]>([]);
  const [assignModal, setAssignModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  useEffect(() => {
    fetchBookings();
    fetchDrivers();
  }, [filter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllBookings(filter || undefined);
      setBookings(res.data.bookings ?? []);
    } catch { Alert.alert('Error', 'Failed to load bookings'); }
    finally { setLoading(false); }
  };

  const fetchDrivers = async () => {
    try {
      const res = await adminService.getDrivers();
      setDrivers(res.data.drivers ?? []);
    } catch {}
  };

  const handleAssign = async (driverId: number) => {
    if (!selectedBooking) return;
    try {
      await adminService.assignDriver(selectedBooking.id, driverId);
      Alert.alert('✅ Success', 'Driver assigned and booking confirmed');
      setAssignModal(false);
      fetchBookings();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error ?? 'Assignment failed');
    }
  };

  const handleStatusChange = async (bookingId: number, status: string) => {
    try {
      await adminService.updateBookingStatus(bookingId, status);
      fetchBookings();
    } catch { Alert.alert('Error', 'Failed to update status'); }
  };

  const filters = ['', 'pending', 'confirmed', 'completed'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Manage Bookings</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f || 'all'}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f ? f.charAt(0).toUpperCase() + f.slice(1) : 'All'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator color="#F59E0B" size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const sc = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pending;
            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.bookingId}>Booking #{item.id}</Text>
                    <Text style={styles.userName}>{item.user?.name} · {item.user?.mobile}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                    <Text style={[styles.statusText, { color: sc.color }]}>{item.status}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <Text style={styles.detailText}>🚗 {item.vehicle?.name} ({item.vehicle?.seat_type} Seat)</Text>
                <Text style={styles.detailText} numberOfLines={1}>📍 {item.pickup_location}</Text>
                <Text style={styles.detailText} numberOfLines={1}>🏁 {item.drop_location}</Text>
                <Text style={styles.detailText}>
                  📅 {new Date(item.start_time).toLocaleDateString('en-IN')} → {new Date(item.end_time).toLocaleDateString('en-IN')}
                </Text>
                {item.driver && (
                  <Text style={styles.detailText}>👨‍✈️ {item.driver?.name}</Text>
                )}
                <Text style={styles.amountText}>₹{item.total_amount}</Text>

                {/* Actions */}
                <View style={styles.actions}>
                  {item.status === 'pending' && (
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => { setSelectedBooking(item); setAssignModal(true); }}
                    >
                      <Text style={styles.actionBtnText}>Assign Driver</Text>
                    </TouchableOpacity>
                  )}
                  {item.status === 'confirmed' && (
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: '#1E1B4B' }]}
                      onPress={() => handleStatusChange(item.id, 'completed')}
                    >
                      <Text style={[styles.actionBtnText, { color: '#818CF8' }]}>Mark Completed</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.chatActionBtn}
                    onPress={() => navigation.navigate('Chat', { bookingId: item.id })}
                  >
                    <Text style={styles.chatActionText}>💬</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No bookings found</Text>
            </View>
          }
        />
      )}

      {/* Assign Driver Modal */}
      <Modal visible={assignModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Select Driver</Text>
            <FlatList
              data={drivers}
              keyExtractor={(d) => String(d.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.driverItem}
                  onPress={() => handleAssign(item.id)}
                >
                  <Text style={styles.driverName}>{item.name}</Text>
                  <Text style={styles.driverPhone}>{item.phone}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.closeModal} onPress={() => setAssignModal(false)}>
              <Text style={styles.closeModalText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
  },
  back: { color: '#F59E0B', fontSize: 16, fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '800', color: '#F8FAFC' },
  filterScroll: { paddingLeft: 20, marginBottom: 12, maxHeight: 52 },
  filterBtn: {
    backgroundColor: '#1E293B', borderRadius: 20, paddingHorizontal: 16,
    paddingVertical: 8, marginRight: 8, height: 36,
  },
  filterBtnActive: { backgroundColor: '#F59E0B' },
  filterText: { color: '#94A3B8', fontWeight: '600', fontSize: 13 },
  filterTextActive: { color: '#0F172A', fontWeight: '800' },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  card: {
    backgroundColor: '#1E293B', borderRadius: 16, padding: 16, marginBottom: 14,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  bookingId: { color: '#F8FAFC', fontWeight: '800', fontSize: 16 },
  userName: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
  statusBadge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  statusText: { fontSize: 12, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#334155', marginVertical: 12 },
  detailText: { color: '#94A3B8', fontSize: 13, marginBottom: 4 },
  amountText: { color: '#F59E0B', fontSize: 18, fontWeight: '800', marginTop: 6 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  actionBtn: {
    flex: 1, backgroundColor: '#451A03', borderRadius: 10,
    paddingVertical: 10, alignItems: 'center',
  },
  actionBtnText: { color: '#F59E0B', fontWeight: '700', fontSize: 13 },
  chatActionBtn: {
    width: 40, height: 40, backgroundColor: '#1E1B4B', borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  chatActionText: { fontSize: 18 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: '#64748B', fontSize: 16 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#1E293B', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, maxHeight: '60%',
  },
  modalTitle: { color: '#F8FAFC', fontSize: 20, fontWeight: '800', marginBottom: 16 },
  driverItem: {
    backgroundColor: '#0F172A', borderRadius: 12, padding: 14, marginBottom: 8,
  },
  driverName: { color: '#F8FAFC', fontWeight: '700', fontSize: 16 },
  driverPhone: { color: '#94A3B8', fontSize: 13, marginTop: 2 },
  closeModal: {
    backgroundColor: '#334155', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 8,
  },
  closeModalText: { color: '#F8FAFC', fontWeight: '700', fontSize: 16 },
});
