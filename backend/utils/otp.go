package utils

import (
	"fmt"
	"math/rand"
	"time"
)

// GenerateOTP generates a 6-digit OTP
func GenerateOTP() string {
	rand.Seed(time.Now().UnixNano())
	return fmt.Sprintf("%06d", rand.Intn(1000000))
}

// OTPExpiry returns the OTP expiry time (10 minutes from now)
func OTPExpiry() time.Time {
	return time.Now().Add(10 * time.Minute)
}

// In production, integrate with an SMS provider like Twilio or MSG91
func SendOTP(mobile, otp string) error {
	// TODO: Integrate with SMS provider
	fmt.Printf("📱 Sending OTP %s to %s\n", otp, mobile)
	return nil
}
