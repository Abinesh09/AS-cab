package middleware

import (
	"strings"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"

	"ascab/utils"
)

func AuthMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			// For websockets, token might be passed as a query param
			token := c.Query("token")
			if token != "" {
				authHeader = "Bearer " + token
			} else {
				return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Authorization header required"})
			}
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid authorization format. Use: Bearer <token>"})
		}

		tokenStr := parts[1]
		claims, err := utils.ValidateJWT(tokenStr)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid or expired token"})
		}

		c.Locals("userID", claims.UserID)
		c.Locals("userRole", claims.Role)
		return c.Next()
	}
}

func RoleMiddleware(roles ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userRole := c.Locals("userRole")
		if userRole == nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
		}

		roleStr := userRole.(string)
		for _, role := range roles {
			if roleStr == role {
				return c.Next()
			}
		}

		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Access denied. Insufficient permissions"})
	}
}

func WebSocketUpgradeMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			c.Locals("allowed", true)
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	}
}
