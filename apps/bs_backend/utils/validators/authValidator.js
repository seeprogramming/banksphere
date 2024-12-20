const Joi = require('joi');

const registerValidation = Joi.object({
    name: Joi.string().alphanum().min(5).max(30).required(),
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
        .required(),
    password: Joi.string().min(8).pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
    role: Joi.string().valid('admin', 'employee', 'user').required(),
});

const loginValidation = Joi.object({
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
        .required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
});

module.exports = { registerValidation, loginValidation };
