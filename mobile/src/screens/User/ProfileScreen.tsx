import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { AppDispatch, RootState } from '../../store/store';
import { logout } from '../../store/slices/authSlice';

export default function ProfileScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((s: RootState) => s.auth);
  const { t, i18n } = useTranslation();

  const handleLogout = () => {
    Alert.alert(t('logout'), 'Are you sure you want to log out?', [
      { text: t('cancel'), style: 'cancel' },
      { text: t('logout'), style: 'destructive', onPress: () => dispatch(logout()) },
    ]);
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('profile')}</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
        <Text style={styles.nameText}>{user?.name || 'AS Cab User'}</Text>
        <Text style={styles.phoneText}>+91 {user?.mobile}</Text>
        
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role ? t(`${user.role}Role`) : t('userRole')}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>{t('appLanguage')}</Text>
      <View style={styles.langContainer}>
        <TouchableOpacity 
          style={[styles.langBtn, i18n.language === 'en' && styles.langBtnActive]}
          onPress={() => changeLanguage('en')}
        >
          <Text style={[styles.langText, i18n.language === 'en' && styles.langTextActive]}>English</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.langBtn, i18n.language === 'ta' && styles.langBtnActive]}
          onPress={() => changeLanguage('ta')}
        >
          <Text style={[styles.langText, i18n.language === 'ta' && styles.langTextActive]}>தமிழ்</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>📄</Text>
          <Text style={styles.menuText}>{t('terms')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>📞</Text>
          <Text style={styles.menuText}>{t('contactSupport')}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>{t('logout')}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#F8FAFC' },
  profileCard: {
    backgroundColor: '#1E293B',
    margin: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  avatarText: { fontSize: 36, fontWeight: '800', color: '#F59E0B' },
  nameText: { fontSize: 22, fontWeight: '700', color: '#F8FAFC', marginBottom: 4 },
  phoneText: { fontSize: 16, color: '#94A3B8', marginBottom: 12 },
  roleBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  roleText: { color: '#F59E0B', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  menuContainer: { marginHorizontal: 20 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  menuIcon: { fontSize: 20, marginRight: 12 },
  menuText: { fontSize: 16, color: '#F8FAFC', fontWeight: '600' },
  logoutBtn: {
    margin: 20,
    backgroundColor: '#450A0A',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EF4444',
    marginTop: 'auto',
    marginBottom: 40,
  },
  logoutText: { color: '#FCA5A5', fontSize: 16, fontWeight: '700' },
  sectionTitle: { color: '#94A3B8', fontSize: 13, fontWeight: '700', marginLeft: 20, marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' },
  langContainer: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 24, gap: 12 },
  langBtn: {
    flex: 1,
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  langBtnActive: { borderColor: '#F59E0B', backgroundColor: 'rgba(245, 158, 11, 0.1)' },
  langText: { color: '#94A3B8', fontWeight: '600', fontSize: 16 },
  langTextActive: { color: '#F59E0B', fontWeight: '800' },
});
