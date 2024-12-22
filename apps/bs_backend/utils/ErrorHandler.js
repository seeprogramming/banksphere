const messages = require('./messages');

class ErrorHandler extends Error {
    constructor(statusCode, errorCode = 'UNKNOWN_ERROR', details = null) {
        super();
        this.status = statusCode;
        this.errorCode = errorCode;
        this.details = {
            ...details,
            timestamp: new Date().toISOString(),
            requestId: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            path: details.path || '',
            method: details.method || '',
            reason: details.reason || this.getSystemReason(errorCode),
        };
        this.serviceName = process.env.SERVICE_NAME;
        this.userMessage = this.getUserReason(errorCode) || 'Something went wrong. Please try again later.';
    }

    getSystemReason(errorCode) {
        return messages[errorCode]?.system || 'An unexpected error occurred';
    }
    getUserReason(errorCode) {
        return messages[errorCode]?.user || 'An unexpected error occurred. Please try again.';
    }
}

module.exports = ErrorHandler;
