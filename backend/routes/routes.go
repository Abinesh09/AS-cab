package routes

import (
	"github.com/gofiber/fiber/v2"

	"ascab/handlers"
	"ascab/middleware"
)

func RegisterRoutes(app *fiber.App) {
	api := app.Group("/api/v1")

	// ─── Public Routes ────────────────────────────────────────────────────────
	api.Get("/test", func(c *fiber.Ctx) error {
		return c.SendString("Backend is reachable!")
	})
	
	auth := api.Group("/auth")
	auth.Post("/signup", handlers.Signup)
	auth.Post("/login", handlers.Login)
	auth.Post("/verify-otp", handlers.VerifyOTP)

	// Public vehicle listing
	api.Get("/vehicles", handlers.GetVehicles)

	// ─── Authenticated Routes ─────────────────────────────────────────────────
	protected := api.Group("/")
	protected.Use(middleware.AuthMiddleware())
	
	// Profile
	protected.Get("auth/profile", handlers.GetProfile)
	protected.Put("auth/profile", handlers.UpdateProfile)

	// Bookings (User)
	protected.Post("bookings", handlers.CreateBooking)
	protected.Get("bookings", handlers.GetMyBookings)
	protected.Get("bookings/:id", handlers.GetBookingByID)

	// Payments (User)
	protected.Post("payments", handlers.CreatePayment)
	protected.Get("payments/booking/:booking_id", handlers.GetPaymentByBooking)

	// Chat
	protected.Get("chat/:booking_id/history", handlers.GetChatHistory)

	// WebSocket Chat
	protected.Use("/ws", middleware.WebSocketUpgradeMiddleware())
	protected.Get("ws/chat", handlers.ChatWebSocket)

	// ─── Driver Routes ────────────────────────────────────────────────────────
	driverRoutes := api.Group("/driver")
	driverRoutes.Use(middleware.AuthMiddleware(), middleware.RoleMiddleware("driver", "admin"))
	driverRoutes.Get("/bookings", handlers.GetDriverBookings)

	// ─── Admin Routes ─────────────────────────────────────────────────────────
	admin := api.Group("/admin")
	admin.Use(middleware.AuthMiddleware(), middleware.RoleMiddleware("admin"))
	
	// Dashboard
	admin.Get("/dashboard", handlers.AdminDashboard)

	// Bookings
	admin.Get("/bookings", handlers.AdminGetAllBookings)
	admin.Put("/bookings/:id/assign", handlers.AdminAssignDriver)
	admin.Put("/bookings/:id/status", handlers.AdminUpdateBookingStatus)

	// Vehicles
	admin.Post("/vehicles", handlers.AdminCreateVehicle)
	admin.Put("/vehicles/:id", handlers.AdminUpdateVehicle)
	admin.Delete("/vehicles/:id", handlers.AdminDeleteVehicle)

	// Drivers
	admin.Get("/drivers", handlers.AdminGetDrivers)
	admin.Post("/drivers", handlers.AdminCreateDriver)
	admin.Delete("/drivers/:id", handlers.AdminDeleteDriver)

	// Payments
	admin.Get("/payments", handlers.AdminGetPayments)
	admin.Put("/payments/:id/verify", handlers.AdminVerifyPayment)

	// Reports
	admin.Get("/reports/export", handlers.AdminExportReport)
}
