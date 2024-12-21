const express = require('express');
const { register, login, logout } = require('../controllers/auth.controller');
const validateRequest = require('../utils/validateRequestHandler');
const { loginValidation, registerValidation } = require('../utils/validators/authValidator');
const limiter = require('../utils/rateLimitHandler');
const roleBasedLimiter = require('../utils/rateLimitHandler');

const router = express.Router();

router.post('/register', roleBasedLimiter('auth'), validateRequest(registerValidation), register);
router.post('/login', roleBasedLimiter('auth'), validateRequest(loginValidation), login);
router.post('/logout', logout); //

module.exports = router;
