package config

import (
	"fmt"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"ascab/models"
)

var DB *gorm.DB

func InitDB() {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Kolkata",
		getEnv("DB_HOST", "localhost"),
		getEnv("DB_USER", "admin"),
		getEnv("DB_PASSWORD", "password"),
		getEnv("DB_NAME", "cabapp"),
		getEnv("DB_PORT", "5432"),
	)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatalf("❌ Failed to connect to database: %v", err)
	}

	log.Println("✅ Database connected successfully")
}

func RunMigrations() {
	err := DB.AutoMigrate(
		&models.User{},
		&models.Driver{},
		&models.Vehicle{},
		&models.Booking{},
		&models.Payment{},
		&models.ChatMessage{},
	)
	if err != nil {
		log.Fatalf("❌ Failed to run migrations: %v", err)
	}
	log.Println("✅ Database migrations completed")
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
