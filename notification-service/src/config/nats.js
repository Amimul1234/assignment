const {connect, StringCodec} = require('nats');
require('dotenv').config();

let natsClient = null;
const codec = StringCodec();

const connectNats = async () => {
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

const subscribeToBookings = async (callback) => {
    try {
        const client = await connectNats();
        const subject = process.env.NATS_BOOKING_SUBJECT || 'booking.confirmed';

        const sub = client.subscribe(subject);
        console.log(`Subscribed to ${subject}`);

        for await (const msg of sub) {
            try {
                const data = JSON.parse(codec.decode(msg.data));
                await callback(data);
            } catch (error) {
                console.error('Error processing message:', error);
            }
        }
    } catch (error) {
        console.error('Subscription error:', error);
        throw error;
    }
};

module.exports = {
    connectNats,
    subscribeToBookings,
};

