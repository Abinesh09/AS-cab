import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { driverService } from '../../services/apiService';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

export default function DriverHomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMyBookings = async () => {
    try {
      setIsLoading(true);
      const res = await driverService.getMyBookings();
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error('Failed to load driver bookings:', err);
      Alert.alert(t('error'), t('loadingError'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadMyBookings();
    });
    return unsubscribe;
  }, [navigation]);

  const activeBookings = bookings.filter(b => b.status === 'confirmed');
  const completedBookings = bookings.filter(b => b.status === 'completed');

  const renderBookingItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('Chat', { bookingId: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.tripId}>Trip #{item.id}</Text>
        <View style={[styles.statusBadge, item.status === 'completed' && styles.statusCompleted]}>
          <Text style={[styles.statusText, item.status === 'completed' && {color: '#10B981'}]}>
            {t(item.status)}
          </Text>
        </View>
      </View>

      <View style={styles.customerBox}>
        <Text style={styles.customerName}>👤 {item.user?.name}</Text>
        <Text style={styles.customerPhone}>📞 +91 {item.user?.mobile}</Text>
      </View>

      <View style={styles.locationBox}>
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
        <Text style={styles.timeText}>📅 {new Date(item.start_time).toLocaleString()}</Text>
        <Text style={styles.priceText}>₹{item.total_amount}</Text>
      </View>
      
      {item.status === 'confirmed' && (
        <Text style={styles.chatHint}>{t('chatHint')}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('adminDashboard')}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{activeBookings.length}</Text>
          <Text style={styles.statLabel}>{t('activeTrips')}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{completedBookings.length}</Text>
          <Text style={styles.statLabel}>{t('completed')}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>{t('assignedTrips')}</Text>

      {isLoading ? (
        <ActivityIndicator style={{ flex: 1 }} color="#F59E0B" size="large" />
      ) : bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t('noTripsAssigned')}</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderBookingItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#F8FAFC' },
  statsRow: { flexDirection: 'row', padding: 20, gap: 16 },
  statBox: {
    flex: 1, backgroundColor: '#1E293B', padding: 20, borderRadius: 16,
    alignItems: 'center', borderWidth: 1, borderColor: '#334155'
  },
  statValue: { fontSize: 32, fontWeight: '800', color: '#F59E0B', marginBottom: 4 },
  statLabel: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#F8FAFC', paddingHorizontal: 20, marginBottom: 8 },
  listContent: { padding: 20, paddingBottom: 100 },
  card: { backgroundColor: '#1E293B', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#334155' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  tripId: { color: '#94A3B8', fontWeight: '700', fontSize: 14 },
  statusBadge: { backgroundColor: 'rgba(245, 158, 11, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusCompleted: { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
  statusText: { color: '#F59E0B', fontSize: 12, fontWeight: '700' },
  customerBox: { backgroundColor: '#0F172A', padding: 12, borderRadius: 12, marginBottom: 16 },
  customerName: { color: '#F8FAFC', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  customerPhone: { color: '#94A3B8', fontSize: 14 },
  locationBox: { marginBottom: 16 },
  locRow: { flexDirection: 'row', alignItems: 'center' },
  dot: { fontSize: 10, marginRight: 12 },
  locText: { color: '#F8FAFC', fontSize: 15, flex: 1 },
  line: { width: 2, height: 16, backgroundColor: '#334155', marginLeft: 4, marginVertical: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 12 },
  timeText: { color: '#64748B', fontSize: 13 },
  priceText: { color: '#F59E0B', fontSize: 18, fontWeight: '800' },
  chatHint: { color: '#38BDF8', fontSize: 12, textAlign: 'center', marginTop: 12, fontStyle: 'italic' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#64748B', fontSize: 16 },
});
