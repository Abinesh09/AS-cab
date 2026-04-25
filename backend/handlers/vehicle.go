package handlers

import (
	"github.com/gofiber/fiber/v2"

	"ascab/config"
	"ascab/models"
)

// GET /vehicles
func GetVehicles(c *fiber.Ctx) error {
	seatType := c.Query("seat_type") // "5" or "7"

	query := config.DB.Where("is_active = ?", true)
	if seatType != "" {
		query = query.Where("seat_type = ?", seatType)
	}

	var vehicles []models.Vehicle
	query.Find(&vehicles)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"vehicles": vehicles})
}

// POST /admin/vehicles
func AdminCreateVehicle(c *fiber.Ctx) error {
	var body struct {
		Name        string             `json:"name"`
		SeatType    models.SeatType    `json:"seat_type"`
		PricingType models.PricingType `json:"pricing_type"`
		Price       float64            `json:"price"`
		Description string             `json:"description"`
		ImageURL    string             `json:"image_url"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	if body.Name == "" || body.SeatType == "" || body.Price <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "name, seat_type, and valid price are required"})
	}

	pType := body.PricingType
	if pType == "" {
		pType = models.PerTrip
	}

	vehicle := models.Vehicle{
		Name:        body.Name,
		SeatType:    body.SeatType,
		PricingType: pType,
		Price:       body.Price,
		Description: body.Description,
		ImageURL:    body.ImageURL,
		IsActive:    true,
	}

	if err := config.DB.Create(&vehicle).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create vehicle"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Vehicle created successfully",
		"vehicle": vehicle,
	})
}

// PUT /admin/vehicles/:id
func AdminUpdateVehicle(c *fiber.Ctx) error {
	id := c.Params("id")

	var body struct {
		Name        string             `json:"name"`
		SeatType    models.SeatType    `json:"seat_type"`
		PricingType models.PricingType `json:"pricing_type"`
		Price       float64            `json:"price"`
		Description string             `json:"description"`
		ImageURL    string             `json:"image_url"`
		IsActive    *bool              `json:"is_active"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	updates := map[string]interface{}{}
	if body.Name != "" {
		updates["name"] = body.Name
	}
	if body.SeatType != "" {
		updates["seat_type"] = body.SeatType
	}
	if body.PricingType != "" {
		updates["pricing_type"] = body.PricingType
	}
	if body.Price > 0 {
		updates["price"] = body.Price
	}
	if body.Description != "" {
		updates["description"] = body.Description
	}
	if body.ImageURL != "" {
		updates["image_url"] = body.ImageURL
	}
	if body.IsActive != nil {
		updates["is_active"] = *body.IsActive
	}

	config.DB.Model(&models.Vehicle{}).Where("id = ?", id).Updates(updates)
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Vehicle updated successfully"})
}

// DELETE /admin/vehicles/:id
func AdminDeleteVehicle(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Model(&models.Vehicle{}).Where("id = ?", id).Update("is_active", false)
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Vehicle deactivated"})
}
