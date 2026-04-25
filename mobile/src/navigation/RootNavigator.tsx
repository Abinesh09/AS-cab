import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useDispatch, useSelector } from 'react-redux';
import { Text, View } from 'react-native';

import { AppDispatch, RootState } from '../store/store';
import { loadStoredAuth } from '../store/slices/authSlice';

// Auth Screens
import LoginScreen from '../screens/Auth/LoginScreen';
import OTPVerifyScreen from '../screens/Auth/OTPVerifyScreen';

// User Screens
import HomeScreen from '../screens/User/HomeScreen';
import BookRideScreen from '../screens/User/BookRideScreen';
import BookingDetailScreen from '../screens/User/BookingDetailScreen';
import ChatScreen from '../screens/User/ChatScreen';

// Admin Screens
import AdminDashboardScreen from '../screens/Admin/AdminDashboardScreen';
import AdminBookingsScreen from '../screens/Admin/AdminBookingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const tabBarStyle = {
  backgroundColor: '#1E293B',
  borderTopColor: '#334155',
  height: 70,
  paddingBottom: 10,
};

// User Bottom Tabs
function UserTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle,
        tabBarActiveTintColor: '#F59E0B',
        tabBarInactiveTintColor: '#64748B',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🏠</Text> }}
      />
      <Tab.Screen
        name="BookRide"
        component={BookRideScreen}
        options={{
          tabBarLabel: 'Book',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🚖</Text>,
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsListScreen}
        options={{
          tabBarLabel: 'My Trips',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>📋</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>👤</Text> }}
      />
    </Tab.Navigator>
  );
}

// Admin Bottom Tabs
function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle,
        tabBarActiveTintColor: '#F59E0B',
        tabBarInactiveTintColor: '#64748B',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>📊</Text>,
        }}
      />
      <Tab.Screen
        name="AdminBookings"
        component={AdminBookingsScreen}
        options={{
          tabBarLabel: 'Bookings',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>📋</Text>,
        }}
      />
      <Tab.Screen
        name="AdminVehicles"
        component={AdminVehiclesScreen}
        options={{
          tabBarLabel: 'Vehicles',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🚗</Text>,
        }}
      />
      <Tab.Screen
        name="AdminDrivers"
        component={AdminDriversScreen}
        options={{
          tabBarLabel: 'Drivers',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>👨‍✈️</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

// Driver Bottom Tabs
function DriverTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle,
        tabBarActiveTintColor: '#F59E0B',
        tabBarInactiveTintColor: '#64748B',
      }}
    >
      <Tab.Screen
        name="DriverHome"
        component={DriverHomeScreen}
        options={{
          tabBarLabel: 'My Rides',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🚗</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>👤</Text> }}
      />
    </Tab.Navigator>
  );
}

// Placeholder screens (implement separately)
function BookingsListScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: '#F8FAFC', fontSize: 18 }}>My Bookings</Text>
    </View>
  );
}
function ProfileScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: '#F8FAFC', fontSize: 18 }}>Profile</Text>
    </View>
  );
}
function AdminVehiclesScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: '#F8FAFC', fontSize: 18 }}>Manage Vehicles</Text>
    </View>
  );
}
function AdminDriversScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: '#F8FAFC', fontSize: 18 }}>Manage Drivers</Text>
    </View>
  );
}
function DriverHomeScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: '#F8FAFC', fontSize: 18 }}>My Assigned Rides</Text>
    </View>
  );
}

export default function RootNavigator() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token } = useSelector((s: RootState) => s.auth);

  useEffect(() => {
    dispatch(loadStoredAuth());
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!token ? (
          // Auth Stack
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="OTPVerify" component={OTPVerifyScreen} />
          </>
        ) : user?.role === 'admin' ? (
          // Admin Stack
          <>
            <Stack.Screen name="AdminRoot" component={AdminTabs} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
          </>
        ) : user?.role === 'driver' ? (
          // Driver Stack
          <>
            <Stack.Screen name="DriverRoot" component={DriverTabs} />
            <Stack.Screen name="Chat" component={ChatScreen} />
          </>
        ) : (
          // User Stack
          <>
            <Stack.Screen name="UserRoot" component={UserTabs} />
            <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
