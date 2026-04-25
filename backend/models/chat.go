package models

import (
	"time"
)

type ChatMessage struct {
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	BookingID uint      `gorm:"not null;index" json:"booking_id"`
	SenderID  uint      `gorm:"not null" json:"sender_id"`
	Sender    User      `gorm:"foreignKey:SenderID" json:"sender,omitempty"`
	Message   string    `gorm:"type:text;not null" json:"message"`
	IsRead    bool      `gorm:"default:false" json:"is_read"`
	CreatedAt time.Time `json:"created_at"`
}
