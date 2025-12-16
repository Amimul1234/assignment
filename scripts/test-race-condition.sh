#!/bin/bash

USER_ID=1
EVENT_ID=1
SEATS=1
CONCURRENT_REQUESTS=10

echo "🧪 Testing race condition handling..."
echo "Creating $CONCURRENT_REQUESTS concurrent booking requests..."
echo "User ID: $USER_ID, Event ID: $EVENT_ID, Seats per request: $SEATS"
echo ""

make_booking() {
    curl -s -X POST http://localhost:3003/api/bookings \
        -H "Content-Type: application/json" \
        -d "{\"userId\": $USER_ID, \"eventId\": $EVENT_ID, \"seats\": $SEATS}" \
        -w "\nHTTP Status: %{http_code}\n" \
        | grep -E "(success|message|HTTP Status)"
}

for i in $(seq 1 $CONCURRENT_REQUESTS); do
    make_booking &
done

wait

echo ""
echo "✅ Test completed!"
echo "Check the booking service logs to verify race condition handling."

