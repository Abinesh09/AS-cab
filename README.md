# AS Cab 🚖

A complete mobile-only cab booking application built with React Native and Go Fiber.

## 🌟 Features
- **User App**: Book rides, view history, and chat with drivers.
- **Driver App**: Manage assigned bookings and status.
- **Admin Dashboard**: Analytics, manage drivers, vehicles, and bookings.
- **Real-Time Chat**: WebSocket integration for live communication between users and drivers.
- **Role-Based Authentication**: JWT-based login with phone numbers and OTPs.

## 🛠️ Tech Stack
- **Frontend**: React Native (Expo/CLI), Redux Toolkit, React Navigation.
- **Backend**: Go (Fiber v2), GORM.
- **Database**: PostgreSQL.
- **Infrastructure**: Docker, Docker Compose, Nginx.

## 🚀 Quick Start (Backend)
The backend is fully dockerized. To start the API and Database:
```bash
docker-compose up -d --build
```
The API will be available at `http://localhost:8080`.

## 📱 Quick Start (Mobile)
To preview the app using Expo:
```bash
cd mobile
npm install
npx expo start
```
Scan the QR code in the Expo Go app!

## 🔐 Environment Variables
Check `backend/.env.example` for required secrets. Ensure `backend/.env` is properly configured before running Docker.
