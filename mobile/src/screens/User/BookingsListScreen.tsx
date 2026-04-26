import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { bookingService } from '../../services/apiService';
import { useTranslation } from 'react-i18next';

export default function BookingsListScreen() {
  const navigation = useNavigation<any>();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingService.getMyBookings();
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error('Failed to load bookings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchBookings();
    });
    return unsubscribe;
  }, [navigation]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#10B981';
      case 'completed': return '#6366F1';
      case 'cancelled': return '#EF4444';
      default: return '#F59E0B'; // pending
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'confirmed': return 'rgba(16, 185, 129, 0.1)';
      case 'completed': return 'rgba(99, 102, 241, 0.1)';
      case 'cancelled': return 'rgba(239, 68, 68, 0.1)';
      default: return 'rgba(245, 158, 11, 0.1)'; // pending
    }
  };

  const renderBooking = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('BookingDetail', { bookingId: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.vehicleName}>{item.vehicle?.name || 'Cab'}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusBg(item.status) }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {t(item.status) || item.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.locationContainer}>
        <View style={styles.locRow}>
          <Text style={styles.dot}>🟢</Text>
          <Text style={styles.locText} numberOfLines={1}>{item.pickup_location}</Text>
        </View>
        <View style={styles.line} />
        <View style={styles.locRow}>
          <Text style={styles.dot}>🔴</Text>
          <Text style={styles.locText} numberOfLines={1}>{item.drop_location}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.dateText}>
          {new Date(item.start_time).toLocaleDateString()} • {new Date(item.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </Text>
        <Text style={styles.priceText}>₹{item.total_amount}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('bookings')}</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color="#F59E0B" size="large" />
      ) : bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t('noBookingsYet')}</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderBooking}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#F8FAFC' },
  listContainer: { padding: 20 },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  vehicleName: { color: '#F8FAFC', fontSize: 18, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  locationContainer: { marginBottom: 16 },
  locRow: { flexDirection: 'row', alignItems: 'center' },
  dot: { fontSize: 10, marginRight: 12 },
  locText: { color: '#F8FAFC', fontSize: 15, flex: 1 },
  line: { width: 2, height: 16, backgroundColor: '#334155', marginLeft: 4, marginVertical: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 12 },
  dateText: { color: '#94A3B8', fontSize: 13, fontWeight: '500' },
  priceText: { color: '#F59E0B', fontSize: 18, fontWeight: '800' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#64748B', fontSize: 16 },
});
