import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView,
  Platform, ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { AppDispatch, RootState } from '../../store/store';
import { signup, login, clearError } from '../../store/slices/authSlice';

export default function LoginScreen({ navigation }: any) {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((s: RootState) => s.auth);

  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');

  const handleSubmit = async () => {
    if (!mobile || mobile.length < 10) {
      Alert.alert(t('error'), 'Enter a valid 10-digit mobile number');
      return;
    }
    if (isSignup && !name.trim()) {
      Alert.alert(t('error'), 'Please enter your name');
      return;
    }

    dispatch(clearError());
    let result: any;
    if (isSignup) {
      result = await dispatch(signup({ name, mobile }));
    } else {
      result = await dispatch(login(mobile));
    }

    if (!result.error) {
      navigation.navigate('OTPVerify', { mobile });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🚖</Text>
          <Text style={styles.appName}>{t('appName')}</Text>
          <Text style={styles.tagline}>Your premium cab booking app</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.title}>{isSignup ? t('signup') : t('login')}</Text>

          {isSignup && (
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>{t('name')}</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#94a3b8"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>{t('mobile')}</Text>
            <View style={styles.phoneRow}>
              <Text style={styles.countryCode}>🇮🇳 +91</Text>
              <TextInput
                style={styles.phoneInput}
                placeholder="98765 43210"
                placeholderTextColor="#94a3b8"
                value={mobile}
                onChangeText={setMobile}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.btn, isLoading && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>{t('sendOtp')}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchBtn}
            onPress={() => {
              setIsSignup(!isSignup);
              dispatch(clearError());
            }}
          >
            <Text style={styles.switchText}>
              {isSignup
                ? 'Already have an account? Login'
                : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  header: { alignItems: 'center', marginBottom: 36 },
  logo: { fontSize: 60, marginBottom: 8 },
  appName: { fontSize: 32, fontWeight: '800', color: '#F8FAFC', letterSpacing: 1 },
  tagline: { fontSize: 14, color: '#94A3B8', marginTop: 4 },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  title: { fontSize: 24, fontWeight: '700', color: '#F8FAFC', marginBottom: 24 },
  inputWrapper: { marginBottom: 16 },
  label: { fontSize: 13, color: '#94A3B8', marginBottom: 6, fontWeight: '600' },
  input: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#334155',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  countryCode: {
    fontSize: 16,
    color: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRightWidth: 1,
    borderRightColor: '#334155',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: '#F8FAFC',
    letterSpacing: 1,
  },
  errorBox: {
    backgroundColor: '#450A0A',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
  },
  errorText: { color: '#FCA5A5', fontSize: 13 },
  btn: {
    backgroundColor: '#F59E0B',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#0F172A', fontSize: 17, fontWeight: '800' },
  switchBtn: { alignItems: 'center', marginTop: 20 },
  switchText: { color: '#F59E0B', fontSize: 14, fontWeight: '600' },
});
