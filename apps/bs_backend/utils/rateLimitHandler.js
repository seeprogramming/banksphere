const rateLimit = require('express-rate-limit');
const ErrorHandler = require('./ErrorHandler');

//Define the rate limit
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    handler: (req, res, next) => {
        next(
            new ErrorHandler('Rate limit exceeded: Too many requests.', 429, 'REQUEST_EXCEED_ERROR', { field: 'api' })
        );
    },
});

module.exports = limiter;
