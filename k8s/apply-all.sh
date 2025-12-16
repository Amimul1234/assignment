#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

echo "Applying PostgreSQL..."
kubectl apply -f postgres/

echo "Applying Redis..."
kubectl apply -f redis/

echo "Applying NATS..."
kubectl apply -f nats/

echo "Waiting for infrastructure to be ready..."
kubectl wait --for=condition=ready pod -l app=postgres --timeout=120s 2>/dev/null || echo "PostgreSQL not ready yet"
kubectl wait --for=condition=ready pod -l app=redis --timeout=120s 2>/dev/null || echo "Redis not ready yet"
kubectl wait --for=condition=ready pod -l app=nats --timeout=120s 2>/dev/null || echo "NATS not ready yet"

echo "Applying User Service..."
kubectl apply -f user-service/

echo "Applying Event Service..."
kubectl apply -f event-service/

echo "Applying Booking Service..."
kubectl apply -f booking-service/

echo "Applying Notification Service..."
kubectl apply -f notification-service/

echo "Waiting for services to be ready..."
kubectl wait --for=condition=ready pod -l app=user-service --timeout=120s 2>/dev/null || echo "User service not ready yet"
kubectl wait --for=condition=ready pod -l app=event-service --timeout=120s 2>/dev/null || echo "Event service not ready yet"
kubectl wait --for=condition=ready pod -l app=booking-service --timeout=120s 2>/dev/null || echo "Booking service not ready yet"
kubectl wait --for=condition=ready pod -l app=notification-service --timeout=120s 2>/dev/null || echo "Notification service not ready yet"

echo "All services deployed!"
kubectl get pods

