const express = require('express');
const { register, login, logout } = require('../controllers/auth.controller');
const validateRequest = require('../utils/validateRequestHandler');
const { loginValidation, registerValidation } = require('../utils/validators/authValidator');
const limiter = require('../utils/rateLimitHandler');
const roleBasedLimiter = require('../utils/rateLimitHandler');

const router = express.Router();

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: User registration
 *     description: Register a user with name,email, password and role
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 format: name
 *                 description: User's name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *               role:
 *                 type: string
 *                 format: role
 *                 description: User's role
 *             example:
 *               name: SagarShelke
 *               email: user@example.com
 *               password: userPassword123
 *               role: customer
 *     responses:
 *       200:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                   description: Unique user id
 *                 name:
 *                   type: string
 *                   description: Name of the user
 *                 email:
 *                   type: string
 *                   description: Email of the user
 *                 role:
 *                   type: string
 *                   description: Role of the user
 *                 createdAt:
 *                   type: string
 *                   description: Date if account creation
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Authentication failed
 *       500:
 *         description: Server error
 */

router.post('/register', roleBasedLimiter('auth'), validateRequest(registerValidation), register);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate a user with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *             example:
 *               email: user@example.com
 *               password: userPassword123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *                 message:
 *                   type: string
 *                   description: Success message
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Authentication failed
 *       500:
 *         description: Server error
 */

router.post('/login', roleBasedLimiter('auth'), validateRequest(loginValidation), login);
router.post('/logout', logout); //

module.exports = router;
