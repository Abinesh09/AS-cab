package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"

	"ascab/config"
	"ascab/routes"
)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Initialize database
	config.InitDB()

	// Run migrations
	config.RunMigrations()

	// Setup Fiber app
	app := fiber.New(fiber.Config{
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			return c.Status(code).JSON(fiber.Map{
				"error": err.Error(),
			})
		},
	})

	// CORS middleware
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "*",
		AllowMethods:     "GET,POST,PUT,PATCH,DELETE,OPTIONS",
		AllowHeaders:     "Origin, Content-Type, Authorization",
		ExposeHeaders:    "Content-Length",
		AllowCredentials: false,
	}))

	// Register all routes
	routes.RegisterRoutes(app)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 AS Cab backend running on port %s", port)
	if err := app.Listen(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
