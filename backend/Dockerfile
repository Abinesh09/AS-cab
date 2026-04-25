# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Install dependencies
RUN apk add --no-cache git ca-certificates

# Copy go.mod and go.sum first for layer caching
COPY go.mod go.sum* ./
RUN GOTOOLCHAIN=auto go mod download

# Copy source
COPY . .

# Build binary
RUN GOTOOLCHAIN=auto CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o ascab-server ./main.go

# ─── Stage 2: Run ─────────────────────────────────────────────────────────────
FROM alpine:3.19

WORKDIR /app

# Install certificates and timezone data
RUN apk add --no-cache ca-certificates tzdata

# Copy binary from builder
COPY --from=builder /app/ascab-server .

# Copy .env if exists (override with Docker env vars)
COPY .env* ./

# Expose port
EXPOSE 8080

# Non-root user for security
RUN addgroup -S ascab && adduser -S ascab -G ascab
RUN chown -R ascab:ascab /app
USER ascab

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:8080/api/v1/health || exit 1

ENTRYPOINT ["./ascab-server"]
