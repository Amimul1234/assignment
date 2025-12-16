const notifications = [];

class NotificationService {
    async sendBookingConfirmation(bookingData) {
        const notification = {
            id: Date.now(),
            type: 'booking_confirmation',
            bookingId: bookingData.id,
            userId: bookingData.userId,
            eventId: bookingData.eventId,
            seats: bookingData.seats,
            message: `Booking confirmed! You have booked ${bookingData.seats} seat(s) for event ${bookingData.eventId}. Booking ID: ${bookingData.id}`,
            timestamp: new Date().toISOString(),
            createdAt: bookingData.createdAt,
        };

        notifications.push(notification);

        console.log('📧 Notification sent:', JSON.stringify(notification, null, 2));

        return notification;
    }

    getAllNotifications() {
        return notifications;
    }

    getNotificationsByUserId(userId) {
        return notifications.filter(n => n.userId === userId);
    }
}

module.exports = new NotificationService();

