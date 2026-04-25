package handlers

import (
	"fmt"
	"strconv"

	"github.com/gofiber/fiber/v2"

	"ascab/config"
	"ascab/models"
)

// POST /api/v1/payments
func CreatePayment(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uint)

	var body struct {
		BookingID     uint                 `json:"booking_id"`
		Method        models.PaymentMethod `json:"method"`
		Amount        float64              `json:"amount"`
		ScreenshotURL string               `json:"screenshot_url"`
		UPIRef        string               `json:"upi_ref"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	if body.BookingID == 0 || body.Method == "" || body.Amount <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "booking_id, method, and valid amount are required"})
	}

	// Verify booking belongs to user
	var booking models.Booking
	if err := config.DB.Where("id = ? AND user_id = ?", body.BookingID, userID).
		First(&booking).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Booking not found or does not belong to you"})
	}

	payment := models.Payment{
		BookingID:     body.BookingID,
		Method:        body.Method,
		Amount:        body.Amount,
		Status:        models.PaymentPending,
		ScreenshotURL: body.ScreenshotURL,
		UPIRef:        body.UPIRef,
	}

	if err := config.DB.Create(&payment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to record payment"})
	}

	// Generate UPI deep link if method is UPI
	var upiLink string
	if body.Method == models.PaymentUPI {
		upiLink = generateUPILink(body.Amount)
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message":  "Payment recorded. Awaiting admin verification.",
		"payment":  payment,
		"upi_link": upiLink,
	})
}

// GET /api/v1/payments/booking/:booking_id
func GetPaymentByBooking(c *fiber.Ctx) error {
	bookingID := c.Params("booking_id")
	userID := c.Locals("userID").(uint)

	var payment models.Payment
	if err := config.DB.
		Joins("JOIN bookings ON payments.booking_id = bookings.id").
		Where("payments.booking_id = ? AND bookings.user_id = ?", bookingID, userID).
		First(&payment).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Payment not found"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"payment": payment})
}

// Generate UPI deep link - Phase 1 manual payment
func generateUPILink(amount float64) string {
	// Replace with actual UPI ID from env config
	upiID := "ascab@upi"
	name := "AS+Cab+Services"
	amtStr := strconv.FormatFloat(amount, 'f', 2, 64)
	return fmt.Sprintf("upi://pay?pa=%s&pn=%s&am=%s&cu=INR", upiID, name, amtStr)
}
