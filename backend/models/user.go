package models

import (
	"time"

	"gorm.io/gorm"
)

type Role string

const (
	RoleUser   Role = "user"
	RoleAdmin  Role = "admin"
	RoleDriver Role = "driver"
)

type User struct {
	ID          uint           `gorm:"primaryKey;autoIncrement" json:"id"`
	Name        string         `gorm:"size:100;not null" json:"name"`
	Mobile      string         `gorm:"size:15;uniqueIndex;not null" json:"mobile"`
	Role        Role           `gorm:"size:20;default:'user'" json:"role"`
	OTP         string         `gorm:"size:6" json:"-"`
	OTPExpiry   *time.Time     `json:"-"`
	IsVerified  bool           `gorm:"default:false" json:"is_verified"`
	FCMToken    string         `gorm:"size:255" json:"fcm_token,omitempty"`
	Language    string         `gorm:"size:10;default:'en'" json:"language"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

type Driver struct {
	ID          uint           `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID      uint           `gorm:"uniqueIndex;not null" json:"user_id"`
	User        User           `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Name        string         `gorm:"size:100;not null" json:"name"`
	Phone       string         `gorm:"size:15;not null" json:"phone"`
	LicenseNo   string         `gorm:"size:50" json:"license_no"`
	IsAvailable bool           `gorm:"default:true" json:"is_available"`
	Rating      float64        `gorm:"default:5.0" json:"rating"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}
