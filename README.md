# Event Booking System

A microservices-based event booking platform. Four services working together to handle users, events, bookings, and notifications.

## What's Inside

- **User Service** - Create and manage users
- **Event Service** - CRUD for events with Redis caching
- **Booking Service** - Book seats with race condition protection
- **Notification Service** - Handles booking confirmations via NATS

## Tech Stack

- Node.js + Express
- PostgreSQL
- Redis (caching + distributed locks)
- NATS (message queue)
- Docker
- Kubernetes (Minikube)

## Quick Start

### Prerequisites

Make sure you have:
- Node.js 18+
- Docker Desktop
- Minikube
- kubectl

### Deploy on Minikube

```bash
# Start Minikube
minikube start

# Point Docker to Minikube
eval $(minikube docker-env)

# Build images
docker build -t user-service:latest ./user-service
docker build -t event-service:latest ./event-service
docker build -t booking-service:latest ./booking-service
docker build -t notification-service:latest ./notification-service

# Deploy everything
kubectl apply -f k8s/postgres/
kubectl apply -f k8s/redis/
kubectl apply -f k8s/nats/
kubectl apply -f k8s/user-service/
kubectl apply -f k8s/event-service/
kubectl apply -f k8s/booking-service/
kubectl apply -f k8s/notification-service/

# Wait for pods to be ready
kubectl get pods -w

# Port forward (in separate terminals or background)
kubectl port-forward svc/user-service 3001:3001
kubectl port-forward svc/event-service 3002:3002
kubectl port-forward svc/booking-service 3003:3003
kubectl port-forward svc/notification-service 3004:3004
```

## Database Schema

**Users:**
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Events:**
```sql
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    total_seats INTEGER NOT NULL,
    available_seats INTEGER NOT NULL,
    event_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Bookings:**
```sql
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    event_id INTEGER NOT NULL,
    seats INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, event_id)
);
```

Migrations run automatically when services start.

## API Endpoints

### User Service (3001)
- `POST /api/users` - Create user
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user by ID
- `GET /health` - Health check

### Event Service (3002)
- `POST /api/events` - Create event
- `GET /api/events` - List all events
- `GET /api/events/:id` - Get event (cached)
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `GET /health` - Health check

### Booking Service (3003)
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - List all bookings
- `GET /api/bookings/:id` - Get booking by ID
- `GET /api/bookings/user/:userId` - Get user's bookings
- `GET /health` - Health check

### Notification Service (3004)
- `GET /health` - Health check
- Listens to NATS topic `booking.confirmed` and logs notifications

## Testing It Out

```bash
# 1. Create a user
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'

# 2. Create an event
curl -X POST http://localhost:3002/api/events \
  -H "Content-Type: application/json" \
  -d '{"title": "Concert 2024", "totalSeats": 100, "eventDate": "2024-12-31T20:00:00Z"}'

# 3. Book seats
curl -X POST http://localhost:3003/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "eventId": 1, "seats": 2}'

# 4. Check notifications
kubectl logs -l app=notification-service --tail=20
```

## How Race Conditions Are Prevented

The booking service uses two layers:

1. **Database locks** - `SELECT FOR UPDATE` locks the event row during booking
2. **Redis distributed locks** - Prevents concurrent bookings across multiple instances

This ensures seats aren't oversold even with high concurrency.

## Rate Limiting

All `/api/` endpoints are rate-limited using Redis. Default is 100 requests per 15 minutes per IP address.

**How it works:**
- Each IP gets a Redis counter key (e.g., `rl:user-service:192.168.1.100`)
- Counter increments atomically on each request
- First request sets expiration to 15 minutes
- If count exceeds 100, requests are blocked (429 status)
- Counter resets automatically when key expires

This works across multiple service instances since Redis is shared. Configure via `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX_REQUESTS` environment variables.

## Project Structure

```
assignment/
├── user-service/          # User management
├── event-service/          # Event CRUD + caching
├── booking-service/        # Booking logic + race condition handling
├── notification-service/   # NATS consumer
├── k8s/                   # Kubernetes manifests
└── postman/               # Postman collection
```

Each service has its own Dockerfile and can run independently.

## Postman Collection

Import `postman/Event-Booking-System.postman_collection.json` for easy API testing.

## Features

- Redis caching for events
- NATS message queue for async notifications
- Race condition prevention
- Rate limiting (Redis-based)
- Health check endpoints
- Docker containerization
- Kubernetes deployment

## Notes

- Services communicate via REST (sync) and NATS (async)
- Redis is used for caching events and distributed locking
- Database migrations run on service startup
- All services have health endpoints for Kubernetes probes
