import api from './api';

export const authService = {
  signup: (name: string, mobile: string, role: string = 'user') =>
    api.post('/auth/signup', { name, mobile, role }),

  login: (mobile: string) =>
    api.post('/auth/login', { mobile }),

  verifyOTP: (mobile: string, otp: string) =>
    api.post('/auth/verify-otp', { mobile, otp }),

  getProfile: () =>
    api.get('/auth/profile'),

  updateProfile: (data: { name?: string; language?: string; fcm_token?: string }) =>
    api.put('/auth/profile', data),
};

export const bookingService = {
  create: (data: {
    vehicle_id: number;
    pickup_location: string;
    drop_location: string;
    start_time: string;
    end_time: string;
    passengers: number;
    notes?: string;
  }) => api.post('/bookings', data),

  getMyBookings: () =>
    api.get('/bookings'),

  getById: (id: number) =>
    api.get(`/bookings/${id}`),
};

export const vehicleService = {
  getAll: (seatType?: string) =>
    api.get('/vehicles', { params: { seat_type: seatType } }),
};

export const paymentService = {
  create: (data: {
    booking_id: number;
    method: 'cash' | 'upi';
    amount: number;
    screenshot_url?: string;
    upi_ref?: string;
  }) => api.post('/payments', data),

  getByBooking: (bookingId: number) =>
    api.get(`/payments/booking/${bookingId}`),
};

export const chatService = {
  getHistory: (bookingId: number) =>
    api.get(`/chat/${bookingId}/history`),
};

export const driverService = {
  getMyBookings: () =>
    api.get('/driver/bookings'),
};

export const adminService = {
  getDashboard: (period?: string) =>
    api.get('/admin/dashboard', { params: { period } }),

  getAllBookings: (status?: string, page?: number) =>
    api.get('/admin/bookings', { params: { status, page } }),

  assignDriver: (bookingId: number, driverId: number) =>
    api.put(`/admin/bookings/${bookingId}/assign`, { driver_id: driverId }),

  updateBookingStatus: (bookingId: number, status: string) =>
    api.put(`/admin/bookings/${bookingId}/status`, { status }),

  getDrivers: () =>
    api.get('/admin/drivers'),

  createDriver: (data: { name: string; phone: string; license_no?: string }) =>
    api.post('/admin/drivers', data),

  getVehicles: () =>
    api.get('/vehicles'),

  createVehicle: (data: {
    name: string;
    seat_type: '5' | '7';
    pricing_type: string;
    price: number;
    description?: string;
  }) => api.post('/admin/vehicles', data),

  updateVehicle: (id: number, data: any) =>
    api.put(`/admin/vehicles/${id}`, data),

  getPayments: () =>
    api.get('/admin/payments'),

  verifyPayment: (paymentId: number, status: 'verified' | 'rejected') =>
    api.put(`/admin/payments/${paymentId}/verify`, { status }),

  exportReport: () =>
    api.get('/admin/reports/export', { responseType: 'blob' }),
};
