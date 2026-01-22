class AlertService {
    sendAlert(user, message) {
        console.log(`Sending alert to ${user.email}: ${message}`);
        // In a real application, you would integrate with an email or SMS gateway here.
    }
}

module.exports = new AlertService();
