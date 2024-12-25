const express = require('express');
const { register, login, logout, authorizeRoles, verifyToken } = require('../controllers/auth.controller');
const validateRequest = require('../utils/validateRequestHandler');
const { loginValidation, registerValidation } = require('../utils/validators/authValidator');
const limiter = require('../utils/rateLimitHandler');
const roleBasedLimiter = require('../utils/rateLimitHandler');

const router = express.Router();
/**
 * @swagger
 * /api/v1/test1:
 *   get:
 *     summary: Protected endpoint that requires a token
 *     description: Register a user with name,email, password and role
 *     tags: [Admin Test]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Authorized access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You are authorized!"
 *                 token:
 *                   type: string
 *                   example: "your.jwt.token"
 *       401:
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 */

router.get('/test1', roleBasedLimiter('admin'), verifyToken, authorizeRoles(['admin']), (req, res) => {
    res.send('Hello Admin!');
});

router.get('/test2', roleBasedLimiter('employee'), verifyToken, authorizeRoles(['employee']), (req, res) => {
    res.send('Hello Employee!');
});
router.get('/test3', roleBasedLimiter('customer'), verifyToken, authorizeRoles(['customer']), (req, res) => {
    res.send('Hello Customer!');
});

module.exports = router;
