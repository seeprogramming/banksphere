const ErrorHandler = require('./ErrorHandler');

const validateRequestHandler = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body);

    if (error) {
        throw new ErrorHandler(400, 'VALIDATION_ERROR', {
            ...error.details,
            reason: error?.message?.replace(/"/g, '') || 'NA',
        });
    }
    next();
};

module.exports = validateRequestHandler;
