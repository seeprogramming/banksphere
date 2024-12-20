const rateLimit = require('express-rate-limit');
const ErrorHandler = require('./ErrorHandler');

//Define the rate limit
const limiter = (maxRequest) =>
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: maxRequest || 100,
        handler: (req, res, next) => {
            next(
                new ErrorHandler('Rate limit exceeded: Too many requests.', 429, 'REQUEST_EXCEED_ERROR', {
                    field: 'api',
                })
            );
        },
    });

module.exports = limiter;
