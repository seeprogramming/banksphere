const ErrorHandler = require('../utils/ErrorHandler');
const responseHandler = require('../utils/responseHandler');
const authService = require('../services/auth.service');

// User registration
const register = async (req, res, next) => {
    const { name, email, password, role } = req.body;

    try {
        const user = await authService.registerUser(name, email, password, role);
        return responseHandler(res, user, 'User registered successfully');
    } catch (error) {
        next(error); // Pass the error to the global error handler
    }
};

// User login
const login = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const data = await authService.loginUser(email, password);
        return responseHandler(res, data, 'Successfully logged in');
    } catch (error) {
        next(error); // Pass the error to the global error handler
    }
};

// Logout a user
const logout = async (req, res, next) => {
    try {
        res.clearCookie('access_token', {
            sameSite: 'none',
            secure: true,
        })
            .status(200)
            .json('User has been logged out');
    } catch (error) {
        next(error);
    }
};

// Token verification
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    try {
        const decoded = authService.verifyUser(authHeader);
        req.user = decoded;
        next();
    } catch (err) {
        next(err);
    }
};

// Middleware for role authorization
const authorizeRoles = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new ErrorHandler('Access denied', 402, 'ACCESS_ERROR', { field: 'role' });
        }
        next();
    };
};

module.exports = {
    register,
    login,
    logout,
    verifyToken,
    authorizeRoles,
};
