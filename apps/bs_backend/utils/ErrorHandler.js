class ErrorHandler extends Error {
    constructor(message, statusCode, errorCode = 'UNKNOWN_ERROR', details = null) {
        super(message);
        this.status = statusCode;
        this.errorCode = errorCode; // Custom property
        this.details = details; // Additional information
    }
}

module.exports = ErrorHandler;
