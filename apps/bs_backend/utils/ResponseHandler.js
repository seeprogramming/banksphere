const ErrorHandler = require('./ErrorHandler');
const messages = require('./messages');

const responseHandler = async (res, data = null, category, errorCode, message = 'Success', statusCode = 200) => {
    if (!res || typeof res.status !== 'function') {
        throw new ErrorHandler(400, 'ERRORS', 'INVALID_RESPONSE_OBJECT', {
            field: 'response',
        });
    }

    function getUserReason(category, errorCode) {
        return messages?.[category]?.[errorCode]?.user || 'An unexpected error occurred. Please try again.';
    }

    const messageUpdated = await getUserReason(category, errorCode);

    const isSuccess = statusCode >= 200 && statusCode < 300;

    const response = {
        success: isSuccess,
        message: messageUpdated || message,
        data,
        timestamp: new Date().toISOString(),
        requestId: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    return res.status(statusCode).json(response);
};

module.exports = responseHandler;
