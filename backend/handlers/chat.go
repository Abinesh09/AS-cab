package handlers

import (
	"encoding/json"
	"log"
	"strconv"
	"sync"
	"time"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"

	"ascab/config"
	"ascab/models"
)

// Hub manages all WebSocket connections per booking
type Hub struct {
	mu    sync.RWMutex
	rooms map[uint]map[uint]*websocket.Conn // bookingID -> userID -> conn
}

var globalHub = &Hub{
	rooms: make(map[uint]map[uint]*websocket.Conn),
}

type WSMessage struct {
	BookingID uint   `json:"booking_id"`
	SenderID  uint   `json:"sender_id"`
	Message   string `json:"message"`
	Timestamp string `json:"timestamp"`
}

// WS /ws/chat?booking_id=1&token=xxx
func ChatWebSocket(c *fiber.Ctx) error {
	// fiber's websocket middleware converts standard handler to websocket handler
	return websocket.New(func(conn *websocket.Conn) {
		bookingIDStr := conn.Query("booking_id")
		bookingID, err := strconv.ParseUint(bookingIDStr, 10, 64)
		if err != nil {
			log.Printf("Invalid booking_id")
			return
		}

		userIDRaw := conn.Locals("userID")
		if userIDRaw == nil {
			log.Printf("No user ID found in locals")
			return
		}
		userID := userIDRaw.(uint)

		// Register connection
		globalHub.mu.Lock()
		if globalHub.rooms[uint(bookingID)] == nil {
			globalHub.rooms[uint(bookingID)] = make(map[uint]*websocket.Conn)
		}
		globalHub.rooms[uint(bookingID)][userID] = conn
		globalHub.mu.Unlock()

		// Cleanup on disconnect
		defer func() {
			globalHub.mu.Lock()
			delete(globalHub.rooms[uint(bookingID)], userID)
			globalHub.mu.Unlock()
			conn.Close()
		}()

		// Send chat history
		var history []models.ChatMessage
		config.DB.Preload("Sender").
			Where("booking_id = ?", bookingID).
			Order("created_at asc").
			Find(&history)

		historyJSON, _ := json.Marshal(fiber.Map{"type": "history", "messages": history})
		conn.WriteMessage(websocket.TextMessage, historyJSON)

		// Listen for messages
		for {
			_, msgBytes, err := conn.ReadMessage()
			if err != nil {
				log.Printf("WebSocket read error for user %d: %v", userID, err)
				break
			}

			var incoming struct {
				Message string `json:"message"`
			}
			if err := json.Unmarshal(msgBytes, &incoming); err != nil || incoming.Message == "" {
				continue
			}

			// Save to DB
			chatMsg := models.ChatMessage{
				BookingID: uint(bookingID),
				SenderID:  userID,
				Message:   incoming.Message,
				CreatedAt: time.Now(),
			}
			config.DB.Create(&chatMsg)

			// Broadcast to all in same booking room
			outgoing := WSMessage{
				BookingID: uint(bookingID),
				SenderID:  userID,
				Message:   incoming.Message,
				Timestamp: chatMsg.CreatedAt.Format(time.RFC3339),
			}
			outJSON, _ := json.Marshal(outgoing)

			globalHub.mu.RLock()
			for uid, peerConn := range globalHub.rooms[uint(bookingID)] {
				if uid != userID {
					if err := peerConn.WriteMessage(websocket.TextMessage, outJSON); err != nil {
						log.Printf("Failed to send message to user %d: %v", uid, err)
					}
				}
			}
			globalHub.mu.RUnlock()

			// Echo back to sender with saved ID
			config.DB.Preload("Sender").First(&chatMsg, chatMsg.ID)
			echoJSON, _ := json.Marshal(fiber.Map{"type": "sent", "message": chatMsg})
			conn.WriteMessage(websocket.TextMessage, echoJSON)
		}
	})(c)
}

// GET /chat/:booking_id/history
func GetChatHistory(c *fiber.Ctx) error {
	bookingID := c.Params("booking_id")

	var messages []models.ChatMessage
	config.DB.Preload("Sender").
		Where("booking_id = ?", bookingID).
		Order("created_at asc").
		Find(&messages)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"messages": messages})
}
