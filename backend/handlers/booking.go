package handlers

import (
	"time"

	"github.com/gofiber/fiber/v2"

	"ascab/config"
	"ascab/models"
)

type CreateBookingRequest struct {
	VehicleID      uint   `json:"vehicle_id"`
	PickupLocation string `json:"pickup_location"`
	DropLocation   string `json:"drop_location"`
	StartTime      string `json:"start_time"` // RFC3339: 2024-01-15T10:00:00Z
	EndTime        string `json:"end_time"`
	Passengers     int    `json:"passengers"`
	Notes          string `json:"notes"`
}

// POST /api/v1/bookings
func CreateBooking(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uint)

	var req CreateBookingRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	if req.VehicleID == 0 || req.PickupLocation == "" || req.DropLocation == "" || req.StartTime == "" || req.EndTime == "" || req.Passengers < 1 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Missing required fields"})
	}

	// Validate vehicle
	var vehicle models.Vehicle
	if err := config.DB.First(&vehicle, req.VehicleID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Vehicle not found"})
	}

	// Parse times (RFC3339)
	startTime, err := time.Parse(time.RFC3339, req.StartTime)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid start_time. Use RFC3339 format: 2024-01-15T10:00:00Z"})
	}
	endTime, err := time.Parse(time.RFC3339, req.EndTime)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid end_time. Use RFC3339 format: 2024-01-15T10:00:00Z"})
	}

	if endTime.Before(startTime) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "end_time must be after start_time"})
	}

	// Validate passenger count vs seat type
	seatCount := 5
	if vehicle.SeatType == models.SevenSeater {
		seatCount = 7
	}
	if req.Passengers > seatCount {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Passenger count exceeds vehicle capacity of " + string(vehicle.SeatType) + " seats",
		})
	}

	booking := models.Booking{
		UserID:         userID,
		VehicleID:      req.VehicleID,
		PickupLocation: req.PickupLocation,
		DropLocation:   req.DropLocation,
		StartTime:      startTime,
		EndTime:        endTime,
		Passengers:     req.Passengers,
		Notes:          req.Notes,
		Status:         models.StatusPending,
		TotalAmount:    vehicle.Price,
	}

	if err := config.DB.Create(&booking).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create booking"})
	}

	config.DB.Preload("Vehicle").First(&booking, booking.ID)

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Booking created successfully",
		"booking": booking,
	})
}

// GET /api/v1/bookings
func GetMyBookings(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uint)

	var bookings []models.Booking
	config.DB.Preload("Vehicle").Preload("Driver.User").
		Where("user_id = ?", userID).
		Order("created_at desc").
		Find(&bookings)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"bookings": bookings})
}

// GET /api/v1/bookings/:id
func GetBookingByID(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := c.Locals("userID").(uint)
	userRole := c.Locals("userRole").(string)

	var booking models.Booking
	var err error

	if userRole == "admin" {
		err = config.DB.Preload("Vehicle").Preload("Driver.User").Preload("User").
			First(&booking, id).Error
	} else {
		err = config.DB.Preload("Vehicle").Preload("Driver.User").Preload("User").
			Where("id = ? AND user_id = ?", id, userID).First(&booking).Error
	}

	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Booking not found"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"booking": booking})
}

// GET /api/v1/driver/bookings
func GetDriverBookings(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uint)

	var driver models.Driver
	if err := config.DB.Where("user_id = ?", userID).First(&driver).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Driver profile not found"})
	}

	var bookings []models.Booking
	config.DB.Preload("Vehicle").Preload("User").
		Where("driver_id = ?", driver.ID).
		Order("start_time asc").
		Find(&bookings)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"bookings": bookings})
}
