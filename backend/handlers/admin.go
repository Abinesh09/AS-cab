package handlers

import (
	"strconv"
	"time"
	"fmt"

	"github.com/gofiber/fiber/v2"

	"ascab/config"
	"ascab/models"
)

// GET /admin/bookings
func AdminGetAllBookings(c *fiber.Ctx) error {
	status := c.Query("status")
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))
	offset := (page - 1) * limit

	query := config.DB.Preload("User").Preload("Vehicle").Preload("Driver.User")

	if status != "" {
		query = query.Where("status = ?", status)
	}

	var total int64
	var bookings []models.Booking

	config.DB.Model(&models.Booking{}).Where("status = ?", status).Count(&total)
	query.Order("created_at desc").Limit(limit).Offset(offset).Find(&bookings)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"bookings": bookings,
		"total":    total,
		"page":     page,
		"limit":    limit,
	})
}

// PUT /admin/bookings/:id/assign
func AdminAssignDriver(c *fiber.Ctx) error {
	bookingID := c.Params("id")

	var body struct {
		DriverID uint `json:"driver_id"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	if body.DriverID == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "driver_id is required"})
	}

	// Verify driver exists
	var driver models.Driver
	if err := config.DB.First(&driver, body.DriverID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Driver not found"})
	}

	result := config.DB.Model(&models.Booking{}).
		Where("id = ?", bookingID).
		Updates(map[string]interface{}{
			"driver_id": body.DriverID,
			"status":    models.StatusConfirmed,
		})

	if result.RowsAffected == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Booking not found"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Driver assigned and booking confirmed"})
}

// PUT /admin/bookings/:id/status
func AdminUpdateBookingStatus(c *fiber.Ctx) error {
	bookingID := c.Params("id")

	var body struct {
		Status models.BookingStatus `json:"status"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	if body.Status == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "status is required"})
	}

	result := config.DB.Model(&models.Booking{}).
		Where("id = ?", bookingID).
		Update("status", body.Status)

	if result.RowsAffected == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Booking not found"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Booking status updated"})
}

// GET /admin/dashboard
func AdminDashboard(c *fiber.Ctx) error {
	period := c.Query("period", "month") // day, week, month, year

	var totalBookings int64
	var pendingBookings int64
	var confirmedBookings int64
	var completedBookings int64

	config.DB.Model(&models.Booking{}).Count(&totalBookings)
	config.DB.Model(&models.Booking{}).Where("status = ?", models.StatusPending).Count(&pendingBookings)
	config.DB.Model(&models.Booking{}).Where("status = ?", models.StatusConfirmed).Count(&confirmedBookings)
	config.DB.Model(&models.Booking{}).Where("status = ?", models.StatusCompleted).Count(&completedBookings)

	// Revenue
	var revenue struct {
		Total float64
	}
	startTime := getPeriodStart(period)
	config.DB.Model(&models.Payment{}).
		Select("COALESCE(SUM(amount), 0) as total").
		Where("status = ? AND created_at >= ?", models.PaymentVerified, startTime).
		Scan(&revenue)

	// Most used vehicle type
	var vehicleStats []struct {
		VehicleID uint    `json:"vehicle_id"`
		Name      string  `json:"name"`
		SeatType  string  `json:"seat_type"`
		Count     int64   `json:"count"`
	}
	config.DB.Model(&models.Booking{}).
		Select("vehicles.id as vehicle_id, vehicles.name, vehicles.seat_type, COUNT(*) as count").
		Joins("JOIN vehicles ON bookings.vehicle_id = vehicles.id").
		Group("vehicles.id, vehicles.name, vehicles.seat_type").
		Order("count desc").
		Limit(5).
		Scan(&vehicleStats)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"total_bookings":     totalBookings,
		"pending_bookings":   pendingBookings,
		"confirmed_bookings": confirmedBookings,
		"completed_bookings": completedBookings,
		"revenue": fiber.Map{
			"period": period,
			"amount": revenue.Total,
		},
		"top_vehicles": vehicleStats,
	})
}

// GET /admin/drivers
func AdminGetDrivers(c *fiber.Ctx) error {
	var drivers []models.Driver
	config.DB.Preload("User").Find(&drivers)
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"drivers": drivers})
}

// POST /admin/drivers
func AdminCreateDriver(c *fiber.Ctx) error {
	var body struct {
		Name      string `json:"name"`
		Phone     string `json:"phone"`
		LicenseNo string `json:"license_no"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	if body.Name == "" || body.Phone == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "name and phone are required"})
	}

	// Create a user account for driver
	otp := "123456"
	user := models.User{
		Name:   body.Name,
		Mobile: body.Phone,
		Role:   models.RoleDriver,
		OTP:    otp,
	}
	if err := config.DB.Create(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create driver user account"})
	}

	driver := models.Driver{
		UserID:    user.ID,
		Name:      body.Name,
		Phone:     body.Phone,
		LicenseNo: body.LicenseNo,
	}
	if err := config.DB.Create(&driver).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create driver"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Driver created successfully",
		"driver":  driver,
	})
}

// DELETE /admin/drivers/:id
func AdminDeleteDriver(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Delete(&models.Driver{}, id)
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Driver deleted"})
}

// GET /admin/payments
func AdminGetPayments(c *fiber.Ctx) error {
	var payments []models.Payment
	config.DB.Preload("Booking.User").
		Order("created_at desc").
		Find(&payments)
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"payments": payments})
}

// PUT /admin/payments/:id/verify
func AdminVerifyPayment(c *fiber.Ctx) error {
	paymentID := c.Params("id")
	adminID := c.Locals("userID").(uint)

	var body struct {
		Status models.PaymentStatus `json:"status"` // verified or rejected
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	if body.Status == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "status is required"})
	}

	now := time.Now()
	result := config.DB.Model(&models.Payment{}).
		Where("id = ?", paymentID).
		Updates(map[string]interface{}{
			"status":      body.Status,
			"verified_by": adminID,
			"verified_at": now,
		})

	if result.RowsAffected == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Payment not found"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Payment status updated"})
}

// GET /admin/reports/export - Export CSV report
func AdminExportReport(c *fiber.Ctx) error {
	var bookings []models.Booking
	config.DB.Preload("User").Preload("Vehicle").Preload("Driver").Find(&bookings)

	c.Set("Content-Type", "text/csv")
	c.Set("Content-Disposition", "attachment;filename=bookings_report.csv")

	// Write CSV header
	c.Write([]byte("ID,User,Mobile,Vehicle,Pickup,Drop,Start,End,Passengers,Status,Amount\n"))

	for _, b := range bookings {
		line := fmt.Sprintf("%d,%s,%s,%s,%s,%s,%s,%s,%d,%s,%.2f\n",
			b.ID,
			b.User.Name,
			b.User.Mobile,
			b.Vehicle.Name,
			b.PickupLocation,
			b.DropLocation,
			b.StartTime.Format("2006-01-02 15:04"),
			b.EndTime.Format("2006-01-02 15:04"),
			b.Passengers,
			string(b.Status),
			b.TotalAmount,
		)
		c.Write([]byte(line))
	}
	return nil
}

func getPeriodStart(period string) time.Time {
	now := time.Now()
	switch period {
	case "day":
		return now.Truncate(24 * time.Hour)
	case "week":
		return now.AddDate(0, 0, -7)
	case "month":
		return now.AddDate(0, -1, 0)
	case "year":
		return now.AddDate(-1, 0, 0)
	default:
		return now.AddDate(0, -1, 0)
	}
}
