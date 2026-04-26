import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, Dimensions,
} from 'react-native';
import { adminService } from '../../services/apiService';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

export default function AdminDashboardScreen({ navigation }: any) {
  const { t } = useTranslation();
  const [data, setData] = useState<any>(null);
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboard(); }, [period]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await adminService.getDashboard(period);
      setData(res.data);
    } catch {
      Alert.alert(t('error'), t('loadingError'));
    } finally {
      setLoading(false);
    }
  };

  const periods = ['day', 'week', 'month', 'year'];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Premium Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>{t('adminDashboard').toUpperCase()}</Text>
          <Text style={styles.headerTitle}>{t('adminControlPanel')}</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchDashboard}>
          <Text style={{ fontSize: 20 }}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Modern Period Picker */}
      <View style={styles.periodPicker}>
        {periods.map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.periodBtn, period === p && styles.periodBtnActive]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
              {t(p)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator color="#F59E0B" size="large" />
        </View>
      ) : (
        <View style={styles.content}>
          {/* Main Revenue Card */}
          <View style={styles.revenueCard}>
            <View style={styles.revenueInfo}>
              <Text style={styles.revenueLabel}>{t('revenue')} ({t(period)})</Text>
              <Text style={styles.revenueAmount}>₹{(data?.revenue?.amount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
            </View>
            <View style={styles.revenueIconBg}>
              <Text style={styles.revenueIcon}>💰</Text>
            </View>
          </View>

          {/* Analytics Grid */}
          <View style={styles.statsGrid}>
            <StatCard 
              icon="📋" 
              label={t('totalBookings')} 
              value={data?.total_bookings ?? 0} 
              color="#38BDF8" 
              bgColor="rgba(56, 189, 248, 0.1)"
            />
            <StatCard 
              icon="⏳" 
              label={t('pending')} 
              value={data?.pending_bookings ?? 0} 
              color="#F59E0B" 
              bgColor="rgba(245, 158, 11, 0.1)"
            />
            <StatCard 
              icon="✅" 
              label={t('confirmed')} 
              value={data?.confirmed_bookings ?? 0} 
              color="#10B981" 
              bgColor="rgba(16, 185, 129, 0.1)"
            />
            <StatCard 
              icon="🎉" 
              label={t('completed')} 
              value={data?.completed_bookings ?? 0} 
              color="#6366F1" 
              bgColor="rgba(99, 102, 241, 0.1)"
            />
          </View>

          {/* Top Vehicles Performance */}
          {data?.top_vehicles?.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t('topVehicles')}</Text>
                <Text style={styles.sectionBadge}>Top Performing</Text>
              </View>
              {data.top_vehicles.map((v: any, i: number) => (
                <View key={v.vehicle_id} style={styles.vehicleRow}>
                  <View style={[styles.rankBadge, i === 0 && styles.rankBadgeGold]}>
                    <Text style={[styles.rankText, i === 0 && styles.rankTextGold]}>{i + 1}</Text>
                  </View>
                  <View style={styles.vehicleDetails}>
                    <Text style={styles.vehicleName}>{v.name}</Text>
                    <Text style={styles.vehicleSub}>{v.seat_type} {t('seater')}</Text>
                  </View>
                  <View style={styles.vehicleStats}>
                    <Text style={styles.vehicleCount}>{v.count}</Text>
                    <Text style={styles.vehicleUnit}>{t('trips')}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Management Shortcuts */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('manage')}</Text>
            <View style={styles.actionsGrid}>
              {[
                { icon: '📋', label: t('bookings'), screen: 'AdminBookings', color: '#F43F5E' },
                { icon: '🚗', label: t('vehicles'), screen: 'AdminVehicles', color: '#8B5CF6' },
                { icon: '👨‍✈️', label: t('drivers'), screen: 'AdminDrivers', color: '#10B981' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.label}
                  style={styles.actionCard}
                  onPress={() => navigation.navigate(item.screen)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.actionIconBg, { backgroundColor: item.color + '20' }]}>
                    <Text style={styles.actionIconText}>{item.icon}</Text>
                  </View>
                  <Text style={styles.actionLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function StatCard({ icon, label, value, color, bgColor }: any) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={[styles.statIconCircle, { backgroundColor: bgColor }]}>
        <Text style={styles.statIconText}>{icon}</Text>
      </View>
      <View style={styles.statInfo}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLabel: { color: '#F59E0B', fontSize: 12, fontWeight: '800', letterSpacing: 2, marginBottom: 4 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#F8FAFC' },
  refreshBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  periodPicker: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    backgroundColor: '#1E293B',
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 6,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  periodBtnActive: { backgroundColor: '#0F172A', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
  periodText: { color: '#64748B', fontSize: 13, fontWeight: '700' },
  periodTextActive: { color: '#F59E0B' },
  content: { paddingHorizontal: 24 },
  loaderContainer: { height: 400, justifyContent: 'center', alignItems: 'center' },
  revenueCard: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  revenueInfo: { flex: 1 },
  revenueLabel: { color: '#94A3B8', fontSize: 14, fontWeight: '700', marginBottom: 8 },
  revenueAmount: { fontSize: 32, fontWeight: '900', color: '#F8FAFC' },
  revenueIconBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  revenueIcon: { fontSize: 30 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: (width - 60) / 2,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 16,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statIconText: { fontSize: 20 },
  statInfo: {},
  statValue: { fontSize: 24, fontWeight: '900', color: '#F8FAFC' },
  statLabel: { color: '#94A3B8', fontSize: 12, fontWeight: '600', marginTop: 2 },
  section: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#F8FAFC' },
  sectionBadge: { backgroundColor: 'rgba(245, 158, 11, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, color: '#F59E0B', fontSize: 10, fontWeight: '800' },
  vehicleRow: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  rankBadgeGold: { backgroundColor: 'rgba(245, 158, 11, 0.2)' },
  rankText: { color: '#64748B', fontWeight: '900', fontSize: 16 },
  rankTextGold: { color: '#F59E0B' },
  vehicleDetails: { flex: 1 },
  vehicleName: { color: '#F8FAFC', fontWeight: '800', fontSize: 16 },
  vehicleSub: { color: '#64748B', fontSize: 12, marginTop: 2 },
  vehicleStats: { alignItems: 'flex-end' },
  vehicleCount: { color: '#F59E0B', fontSize: 18, fontWeight: '900' },
  vehicleUnit: { color: '#64748B', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: {
    width: (width - 60) / 2,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  actionIconBg: {
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionIconText: { fontSize: 24 },
  actionLabel: { color: '#CBD5E1', fontSize: 13, fontWeight: '700' },
});
