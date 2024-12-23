const rateLimit = require('express-rate-limit');
const ErrorHandler = require('./ErrorHandler');

const roleBasedLimiter = (role) => {
    const limits = {
        admin: 200,
        employee: 100,
        customer: 50,
        auth: 7,
    };

    return rateLimit({
        windowMs: 15 * 60 * 1000,
        max: limits[role],
        handler: (req, res, next) => {
            next(
                new ErrorHandler(429, 'ERRORS', 'RATE_LIMIT_EXCEEDED', {
                    field: 'api',
                })
            );
        },
    });
};

module.exports = roleBasedLimiter;
