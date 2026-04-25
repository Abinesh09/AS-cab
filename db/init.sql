-- AS Cab PostgreSQL Schema
-- This file is auto-run by Docker on first initialization
-- GORM AutoMigrate handles schema; this file seeds initial data

-- ─── Extensions ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Seed Admin User ────────────────────────────────────────────────────────
-- Default admin: mobile=9999999999, password handled via OTP flow
-- Role admin is set directly in DB seed
INSERT INTO users (name, mobile, role, is_verified, language, created_at, updated_at)
VALUES ('Super Admin', '9999999999', 'admin', true, 'en', NOW(), NOW())
ON CONFLICT (mobile) DO NOTHING;

-- ─── Seed Sample Vehicles ───────────────────────────────────────────────────
INSERT INTO vehicles (name, seat_type, pricing_type, price, description, is_active, created_at, updated_at)
VALUES
  ('Toyota Innova Crysta', '7', 'per_trip', 2500.00, 'Comfortable 7-seater SUV, ideal for family trips', true, NOW(), NOW()),
  ('Mahindra XUV700',      '7', 'per_day',  3500.00, 'Premium 7-seater with AC and entertainment system', true, NOW(), NOW()),
  ('Toyota Etios',         '5', 'per_trip', 1500.00, 'Budget-friendly 5-seater sedan', true, NOW(), NOW()),
  ('Honda Amaze',          '5', 'per_day',  2000.00, 'Spacious 5-seater sedan with great mileage', true, NOW(), NOW()),
  ('Maruti Ertiga',        '7', 'per_km',   18.00,   '7-seater MPV, priced per kilometer', true, NOW(), NOW())
ON CONFLICT DO NOTHING;
