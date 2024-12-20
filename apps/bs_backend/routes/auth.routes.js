const express = require('express');
const { register, login, logout } = require('../controllers/auth.controller');
const validateRequest = require('../utils/validateRequestHandler');
const { loginValidation, registerValidation } = require('../utils/validators/authValidator');
const limiter = require('../utils/rateLimitHandler');

const router = express.Router();

router.post('/register', limiter, validateRequest(registerValidation), register);
router.post('/login', limiter, validateRequest(loginValidation), login);
router.post('/logout', logout); //

module.exports = router;
