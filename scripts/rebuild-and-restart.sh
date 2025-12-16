#!/bin/bash

set -e

echo "=========================================="
echo "Rebuilding Images and Restarting Pods"
echo "=========================================="
echo ""

if ! command -v minikube &> /dev/null; then
    echo "Error: minikube not found. Please install minikube first."
    exit 1
fi

echo "Configuring Docker for Minikube..."
eval $(minikube docker-env)

echo ""
echo "Building Docker images..."
echo ""

echo "Building user-service..."
docker build -t user-service:latest ./user-service

echo "Building event-service..."
docker build -t event-service:latest ./event-service

echo "Building booking-service..."
docker build -t booking-service:latest ./booking-service

echo "Building notification-service..."
docker build -t notification-service:latest ./notification-service

echo ""
echo "Images built successfully!"
echo ""

echo "Deleting pods to force recreation with new images..."
echo ""

kubectl delete pods -l app=user-service 2>/dev/null || true
kubectl delete pods -l app=event-service 2>/dev/null || true
kubectl delete pods -l app=booking-service 2>/dev/null || true
kubectl delete pods -l app=notification-service 2>/dev/null || true

echo ""
echo "Waiting for pods to be recreated..."
kubectl wait --for=condition=ready pod -l app=user-service --timeout=120s 2>/dev/null || echo "User service not ready yet"
kubectl wait --for=condition=ready pod -l app=event-service --timeout=120s 2>/dev/null || echo "Event service not ready yet"
kubectl wait --for=condition=ready pod -l app=booking-service --timeout=120s 2>/dev/null || echo "Booking service not ready yet"
kubectl wait --for=condition=ready pod -l app=notification-service --timeout=120s 2>/dev/null || echo "Notification service not ready yet"

echo ""
echo "=========================================="
echo "All done! Pods are running with new images"
echo "=========================================="
echo ""
kubectl get pods

