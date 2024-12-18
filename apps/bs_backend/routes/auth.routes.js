const express = require('express');
const { register, login, logout } = require('../controllers/auth.controller');

const router = express.Router();

router.post('/register', register); // DONE
router.post('/login', login); // DONE
router.post('/logout', logout); //

module.exports = router;
