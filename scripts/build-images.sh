#!/bin/bash

echo "🔨 Building Docker images..."

if command -v minikube &> /dev/null; then
    echo "📦 Configuring Docker for Minikube..."
    eval $(minikube docker-env)
fi

echo "Building user-service..."
docker build -t user-service:latest ./user-service

echo "Building event-service..."
docker build -t event-service:latest ./event-service

echo "Building booking-service..."
docker build -t booking-service:latest ./booking-service

echo "Building notification-service..."
docker build -t notification-service:latest ./notification-service

echo "✅ All images built successfully!"

