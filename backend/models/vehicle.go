package models

import (
	"time"

	"gorm.io/gorm"
)

type SeatType string

const (
	FiveSeater  SeatType = "5"
	SevenSeater SeatType = "7"
)

type PricingType string

const (
	PerTrip PricingType = "per_trip"
	PerDay  PricingType = "per_day"
	PerKm   PricingType = "per_km"
)

type Vehicle struct {
	ID          uint           `gorm:"primaryKey;autoIncrement" json:"id"`
	Name        string         `gorm:"size:100;not null" json:"name"` // SUV, Sedan, etc.
	SeatType    SeatType       `gorm:"size:5;not null" json:"seat_type"`
	PricingType PricingType    `gorm:"size:20;default:'per_trip'" json:"pricing_type"`
	Price       float64        `gorm:"not null" json:"price"`
	Description string         `gorm:"size:255" json:"description"`
	ImageURL    string         `gorm:"size:500" json:"image_url"`
	IsActive    bool           `gorm:"default:true" json:"is_active"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}
