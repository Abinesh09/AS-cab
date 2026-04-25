package models

import (
	"time"

	"gorm.io/gorm"
)

type PaymentMethod string

const (
	PaymentCash PaymentMethod = "cash"
	PaymentUPI  PaymentMethod = "upi"
)

type PaymentStatus string

const (
	PaymentPending  PaymentStatus = "pending"
	PaymentVerified PaymentStatus = "verified"
	PaymentRejected PaymentStatus = "rejected"
)

type Payment struct {
	ID             uint           `gorm:"primaryKey;autoIncrement" json:"id"`
	BookingID      uint           `gorm:"not null;uniqueIndex" json:"booking_id"`
	Booking        Booking        `gorm:"foreignKey:BookingID" json:"booking,omitempty"`
	Method         PaymentMethod  `gorm:"size:20;not null" json:"method"`
	Status         PaymentStatus  `gorm:"size:20;default:'pending'" json:"status"`
	Amount         float64        `json:"amount"`
	ScreenshotURL  string         `gorm:"size:500" json:"screenshot_url,omitempty"`
	UPIRef         string         `gorm:"size:100" json:"upi_ref,omitempty"`
	VerifiedBy     *uint          `json:"verified_by,omitempty"` // Admin user ID
	VerifiedAt     *time.Time     `json:"verified_at,omitempty"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
}
