import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '../../store/store';
import { bookingService } from '../../services/apiService';

const STATUS_CONFIG: any = {
  pending: { color: '#F59E0B', bg: '#451A03', key: 'pending' },
  confirmed: { color: '#10B981', bg: '#022C22', key: 'confirmed' },
  completed: { color: '#6366F1', bg: '#1E1B4B', key: 'completed' },
  cancelled: { color: '#EF4444', bg: '#450A0A', key: 'cancelled' },
};

export default function HomeScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { user } = useSelector((s: RootState) => s.auth);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = async () => {
    try {
      const res = await bookingService.getMyBookings();
      setRecentBookings(res.data.bookings?.slice(0, 3) ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return t('goodMorning');
    if (h < 17) return t('goodAfternoon');
    return t('goodEvening');
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchBookings(); }} tintColor="#F59E0B" />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting()}, 👋</Text>
          <Text style={styles.username}>{user?.name ?? t('traveller')}</Text>
        </View>
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.profileInitial}>{(user?.name ?? 'U')[0].toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      {/* Book Now Banner */}
      <TouchableOpacity
        style={styles.bookBanner}
        onPress={() => navigation.navigate('BookRide')}
        activeOpacity={0.9}
      >
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>{t('bookYourRide')}</Text>
          <Text style={styles.bannerSub}>{t('vehiclesAvailable')}</Text>
          <View style={styles.bannerBtn}>
            <Text style={styles.bannerBtnText}>{t('bookNow')} →</Text>
          </View>
        </View>
        <Text style={styles.bannerEmoji}>🚖</Text>
      </TouchableOpacity>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('quickActions')}</Text>
        <View style={styles.actionsGrid}>
          {[
            { icon: '📋', label: t('bookings'), screen: 'Bookings' },
            { icon: '🚗', label: t('selectVehicle'), screen: 'BookRide' },
            { icon: '💬', label: t('support'), screen: 'Bookings' },
            { icon: '👤', label: t('profile'), screen: 'Profile' },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.actionCard}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.8}
            >
              <Text style={styles.actionIcon}>{item.icon}</Text>
              <Text style={styles.actionLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Bookings */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('recentBookings')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Bookings')}>
            <Text style={styles.seeAll}>{t('seeAll')}</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color="#F59E0B" style={{ marginTop: 20 }} />
        ) : recentBookings.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>{t('noBookingsYet')}</Text>
            <Text style={styles.emptySubText}>{t('bookFirstRide')}</Text>
          </View>
        ) : (
          recentBookings.map((b) => {
            const sc = STATUS_CONFIG[b.status] ?? STATUS_CONFIG.pending;
            return (
              <TouchableOpacity
                key={b.id}
                style={styles.bookingCard}
                onPress={() => navigation.navigate('BookingDetail', { bookingId: b.id })}
                activeOpacity={0.8}
              >
                <View style={styles.bookingLeft}>
                  <Text style={styles.vehicleName}>{b.vehicle?.name ?? 'Vehicle'}</Text>
                  <Text style={styles.bookingRoute} numberOfLines={1}>
                    📍 {b.pickup_location}
                  </Text>
                  <Text style={styles.bookingRoute} numberOfLines={1}>
                    🏁 {b.drop_location}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                  <Text style={[styles.statusText, { color: sc.color }]}>{t(sc.key)}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 20,
  },
  greeting: { fontSize: 14, color: '#94A3B8', fontWeight: '500' },
  username: { fontSize: 22, fontWeight: '800', color: '#F8FAFC', marginTop: 2 },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  bookBanner: {
    marginHorizontal: 20,
    backgroundColor: '#F59E0B',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  bannerContent: { flex: 1 },
  bannerTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  bannerSub: { fontSize: 13, color: '#451A03', marginTop: 4, marginBottom: 12 },
  bannerBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  bannerBtnText: { color: '#F59E0B', fontWeight: '700', fontSize: 13 },
  bannerEmoji: { fontSize: 60 },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#F8FAFC' },
  seeAll: { color: '#F59E0B', fontWeight: '600', fontSize: 14 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: {
    width: '46%',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  actionIcon: { fontSize: 30, marginBottom: 8 },
  actionLabel: { color: '#CBD5E1', fontSize: 13, fontWeight: '600' },
  emptyCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { color: '#F8FAFC', fontSize: 16, fontWeight: '700' },
  emptySubText: { color: '#94A3B8', fontSize: 13, marginTop: 4 },
  bookingCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  bookingLeft: { flex: 1, marginRight: 12 },
  vehicleName: { fontSize: 15, fontWeight: '700', color: '#F8FAFC', marginBottom: 4 },
  bookingRoute: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  statusBadge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  statusText: { fontSize: 12, fontWeight: '700' },
});
