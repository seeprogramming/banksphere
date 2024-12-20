const express = require('express');
const { register, login, logout } = require('../controllers/auth.controller');
const validateRequest = require('../utils/validateRequestHandler');
const { loginValidation, registerValidation } = require('../utils/validators/authValidator');
const limiter = require('../utils/rateLimitHandler');

const router = express.Router();

const limiterForAuth = limiter(5);

router.post('/register', limiterForAuth, validateRequest(registerValidation), register);
router.post('/login', limiterForAuth, validateRequest(loginValidation), login);
router.post('/logout', logout); //

module.exports = router;
