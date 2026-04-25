package models

import (
	"time"

	"gorm.io/gorm"
)

type BookingStatus string

const (
	StatusPending   BookingStatus = "pending"
	StatusConfirmed BookingStatus = "confirmed"
	StatusCompleted BookingStatus = "completed"
	StatusCancelled BookingStatus = "cancelled"
)

type Booking struct {
	ID               uint           `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID           uint           `gorm:"not null" json:"user_id"`
	User             User           `gorm:"foreignKey:UserID" json:"user,omitempty"`
	DriverID         *uint          `json:"driver_id,omitempty"`
	Driver           *Driver        `gorm:"foreignKey:DriverID" json:"driver,omitempty"`
	VehicleID        uint           `gorm:"not null" json:"vehicle_id"`
	Vehicle          Vehicle        `gorm:"foreignKey:VehicleID" json:"vehicle,omitempty"`
	PickupLocation   string         `gorm:"size:500;not null" json:"pickup_location"`
	DropLocation     string         `gorm:"size:500;not null" json:"drop_location"`
	StartTime        time.Time      `gorm:"not null" json:"start_time"`
	EndTime          time.Time      `gorm:"not null" json:"end_time"`
	Passengers       int            `gorm:"not null" json:"passengers"`
	Status           BookingStatus  `gorm:"size:20;default:'pending'" json:"status"`
	TotalAmount      float64        `json:"total_amount"`
	Notes            string         `gorm:"size:500" json:"notes"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`
}
