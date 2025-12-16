const { connect } = require('nats');
require('dotenv').config();

let natsClient = null;

const getNatsClient = async () => {
  if (!natsClient) {
    try {
      natsClient = await connect({
        servers: process.env.NATS_URL || 'nats://localhost:4222',
      });
      console.log('Connected to NATS');
      
      natsClient.closed().then(() => {
        console.log('NATS connection closed');
      });
    } catch (error) {
      console.error('NATS connection error:', error);
      throw error;
    }
  }
  return natsClient;
};

const publishBookingEvent = async (bookingData) => {
  try {
    const client = await getNatsClient();
    const subject = process.env.NATS_BOOKING_SUBJECT || 'booking.confirmed';
    
    await client.publish(subject, JSON.stringify(bookingData));
    console.log('Published booking event:', bookingData.id);
  } catch (error) {
    console.error('Failed to publish booking event:', error);
    throw error;
  }
};

module.exports = {
  getNatsClient,
  publishBookingEvent,
};

