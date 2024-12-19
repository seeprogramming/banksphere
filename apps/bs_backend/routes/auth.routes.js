const express = require('express');
const { register, login, logout } = require('../controllers/auth.controller');
const validateRequest = require('../utils/validateRequest');
const { loginValidation, registerValidation } = require('../utils/validatators/authValidator');

const router = express.Router();

router.post('/register', validateRequest(registerValidation), register);
router.post('/login', validateRequest(loginValidation), login);
router.post('/logout', logout); //

module.exports = router;
