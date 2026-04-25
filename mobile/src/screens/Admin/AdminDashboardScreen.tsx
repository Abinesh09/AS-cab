import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert,
} from 'react-native';
import { adminService } from '../../services/apiService';

export default function AdminDashboardScreen({ navigation }: any) {
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
      Alert.alert('Error', 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const periods = ['day', 'week', 'month', 'year'];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>AS Cab Control Panel</Text>
      </View>

      {/* Period Selector */}
      <View style={styles.periodRow}>
        {periods.map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.periodBtn, period === p && styles.periodBtnActive]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color="#F59E0B" size="large" style={{ marginTop: 40 }} />
      ) : (
        <>
          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <StatCard icon="📋" label="Total Bookings" value={data?.total_bookings ?? 0} />
            <StatCard icon="⏳" label="Pending" value={data?.pending_bookings ?? 0} color="#F59E0B" />
            <StatCard icon="✅" label="Confirmed" value={data?.confirmed_bookings ?? 0} color="#10B981" />
            <StatCard icon="🎉" label="Completed" value={data?.completed_bookings ?? 0} color="#6366F1" />
          </View>

          {/* Revenue */}
          <View style={styles.revenueCard}>
            <Text style={styles.revenueLabel}>💰 Revenue ({period})</Text>
            <Text style={styles.revenueAmount}>₹{(data?.revenue?.amount ?? 0).toFixed(2)}</Text>
          </View>

          {/* Top Vehicles */}
          {data?.top_vehicles?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🚗 Top Vehicles</Text>
              {data.top_vehicles.map((v: any, i: number) => (
                <View key={v.vehicle_id} style={styles.vehicleRow}>
                  <Text style={styles.vehicleRank}>#{i + 1}</Text>
                  <View style={styles.vehicleInfo}>
                    <Text style={styles.vehicleName}>{v.name}</Text>
                    <Text style={styles.vehicleSeat}>{v.seat_type} Seater</Text>
                  </View>
                  <Text style={styles.vehicleCount}>{v.count} trips</Text>
                </View>
              ))}
            </View>
          )}

          {/* Quick Links */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚡ Manage</Text>
            <View style={styles.actionsGrid}>
              {[
                { icon: '📋', label: 'Bookings', screen: 'AdminBookings' },
                { icon: '🚗', label: 'Vehicles', screen: 'AdminVehicles' },
                { icon: '👨‍✈️', label: 'Drivers', screen: 'AdminDrivers' },
                { icon: '💳', label: 'Payments', screen: 'AdminPayments' },
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
        </>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function StatCard({ icon, label, value, color = '#F8FAFC' }: any) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20 },
  title: { fontSize: 28, fontWeight: '800', color: '#F8FAFC' },
  subtitle: { color: '#94A3B8', fontSize: 14, marginTop: 4 },
  periodRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  periodBtn: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  periodBtnActive: { backgroundColor: '#F59E0B' },
  periodText: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
  periodTextActive: { color: '#0F172A', fontWeight: '800' },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  statIcon: { fontSize: 28, marginBottom: 8 },
  statValue: { fontSize: 28, fontWeight: '800' },
  statLabel: { color: '#64748B', fontSize: 12, marginTop: 4, fontWeight: '600' },
  revenueCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  revenueLabel: { color: '#94A3B8', fontSize: 14, fontWeight: '600' },
  revenueAmount: { fontSize: 32, fontWeight: '800', color: '#F59E0B', marginTop: 6 },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#F8FAFC', marginBottom: 14 },
  vehicleRow: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  vehicleRank: { fontSize: 18, fontWeight: '800', color: '#F59E0B', width: 36 },
  vehicleInfo: { flex: 1 },
  vehicleName: { color: '#F8FAFC', fontWeight: '700', fontSize: 15 },
  vehicleSeat: { color: '#64748B', fontSize: 12, marginTop: 2 },
  vehicleCount: { color: '#94A3B8', fontSize: 14, fontWeight: '600' },
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
});
