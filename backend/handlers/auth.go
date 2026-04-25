package handlers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"ascab/config"
	"ascab/models"
	"ascab/utils"
)

type SignupRequest struct {
	Name   string `json:"name"`
	Mobile string `json:"mobile"`
	Role   string `json:"role"` // "user", "driver" (admin created by seeding)
}

type LoginRequest struct {
	Mobile string `json:"mobile"`
}

type VerifyOTPRequest struct {
	Mobile string `json:"mobile"`
	OTP    string `json:"otp"`
}

// POST /auth/signup
func Signup(c *fiber.Ctx) error {
	var req SignupRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	if req.Name == "" || req.Mobile == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "name and mobile are required"})
	}

	// Check if user already exists
	var existing models.User
	result := config.DB.Where("mobile = ?", req.Mobile).First(&existing)
	if result.Error == nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": "Mobile number already registered"})
	}
	if result.Error != gorm.ErrRecordNotFound {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Database error"})
	}

	role := models.RoleUser
	if req.Role == "driver" {
		role = models.RoleDriver
	}

	otp := utils.GenerateOTP()
	expiry := utils.OTPExpiry()

	user := models.User{
		Name:      req.Name,
		Mobile:    req.Mobile,
		Role:      role,
		OTP:       otp,
		OTPExpiry: &expiry,
	}

	if err := config.DB.Create(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create user"})
	}

	// Send OTP (SMS provider integration)
	_ = utils.SendOTP(req.Mobile, otp)

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "User registered. OTP sent to mobile number.",
		"user_id": user.ID,
		// In dev mode only, return OTP for testing
		"otp_dev": otp,
	})
}

// POST /auth/login
func Login(c *fiber.Ctx) error {
	var req LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	if req.Mobile == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "mobile is required"})
	}

	var user models.User
	if err := config.DB.Where("mobile = ?", req.Mobile).First(&user).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Mobile number not registered"})
	}

	otp := utils.GenerateOTP()
	expiry := utils.OTPExpiry()

	config.DB.Model(&user).Updates(map[string]interface{}{
		"otp":        otp,
		"otp_expiry": expiry,
	})

	_ = utils.SendOTP(req.Mobile, otp)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "OTP sent to mobile number",
		"user_id": user.ID,
		// Dev only
		"otp_dev": otp,
	})
}

// POST /auth/verify-otp
func VerifyOTP(c *fiber.Ctx) error {
	var req VerifyOTPRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	if req.Mobile == "" || req.OTP == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "mobile and otp are required"})
	}

	var user models.User
	if err := config.DB.Where("mobile = ?", req.Mobile).First(&user).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
	}

	if user.OTP != req.OTP {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid OTP"})
	}

	if user.OTPExpiry == nil || time.Now().After(*user.OTPExpiry) {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "OTP has expired"})
	}

	config.DB.Model(&user).Updates(map[string]interface{}{
		"is_verified": true,
		"otp":         "",
		"otp_expiry":  nil,
	})

	token, err := utils.GenerateJWT(user.ID, string(user.Role))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to generate token"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Login successful",
		"token":   token,
		"user": fiber.Map{
			"id":     user.ID,
			"name":   user.Name,
			"mobile": user.Mobile,
			"role":   user.Role,
		},
	})
}

// GET /auth/profile
func GetProfile(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uint)

	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"user": user})
}

// PUT /auth/profile
func UpdateProfile(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uint)

	var body struct {
		Name     string `json:"name"`
		Language string `json:"language"`
		FCMToken string `json:"fcm_token"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	updates := map[string]interface{}{}
	if body.Name != "" {
		updates["name"] = body.Name
	}
	if body.Language != "" {
		updates["language"] = body.Language
	}
	if body.FCMToken != "" {
		updates["fcm_token"] = body.FCMToken
	}

	config.DB.Model(&models.User{}).Where("id = ?", userID).Updates(updates)
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Profile updated successfully"})
}
