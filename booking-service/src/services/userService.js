const axios = require('axios');

class UserService {
    constructor() {
        this.baseURL = process.env.USER_SERVICE_URL || 'http://localhost:3001';
    }

    async getUser(userId) {
        try {
            const response = await axios.get(`${this.baseURL}/api/users/${userId}`);
            return response.data.data;
        } catch (error) {
            if (error.response && error.response.status === 404) {
                return null;
            }
            throw new Error(`Failed to fetch user: ${error.message}`);
        }
    }
}

module.exports = new UserService();

