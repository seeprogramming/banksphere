const ErrorHandler = require('./ErrorHandler');

const validateRequest = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
        throw new ErrorHandler('Validation Error', 400, 'VALIDATION_ERROR', error.details);
    }
    next();
};

module.exports = validateRequest;
