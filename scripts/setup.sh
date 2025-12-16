#!/bin/bash

echo "🚀 Setting up Event Booking System..."

if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "📦 Starting infrastructure services (PostgreSQL, Redis, NATS)..."
docker-compose up -d postgres redis nats

echo "⏳ Waiting for services to be ready..."
sleep 10

echo "📥 Installing dependencies..."

cd user-service && npm install && cd ..
cd event-service && npm install && cd ..
cd booking-service && npm install && cd ..
cd notification-service && npm install && cd ..

echo "🗄️  Running database migrations..."
cd user-service && npm run migrate && cd ..
cd event-service && npm run migrate && cd ..
cd booking-service && npm run migrate && cd ..

echo "✅ Setup complete!"
echo ""
echo "To start the services, run:"
echo "  cd user-service && npm start"
echo "  cd event-service && npm start"
echo "  cd booking-service && npm start"
echo "  cd notification-service && npm start"
echo ""
echo "Or use Docker Compose to start all services:"
echo "  docker-compose up"

