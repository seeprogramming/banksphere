const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma-client');
const ErrorHandler = require('../utils/ErrorHandler');
const responseHandler = require('../utils/ResponseHandler');

// Login
const login = async (req, res, next) => {
    const { email, password } = req.body;
    console.log(req.body);

    try {
        // Check if user exists
        const user = await prisma.user.findUnique({ where: { email } });
        console.log(user);

        if (!user) {
            //return res.status(404).json({ message: 'User not found' });
            throw new ErrorHandler('User not found', 404, 'NOT_FOUND_ERROR', { field: 'user' });
        }

        // Validate password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            // return res.status(401).json({ message: 'Invalid credentials' });
            throw new ErrorHandler('Invalid credentials', 401, 'CREDENTIALS_ERROR', { field: 'user' });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                id: user.id,
                role: user.role,
                name: user.name,
            },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '1h' }
        );

        let data = {
            token,
            role: user.role,
        };

        return responseHandler(res, data, 'Successfully logged in');
    } catch (error) {
        next(error); // Pass the error to the global error handler
    }
};

// Register
const register = async (req, res, next) => {
    const { name, email, password, role } = req.body;

    try {
        // Check if email already exists
        const isEmailExists = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (isEmailExists) {
            // return res.status(409).json({
            //     message: 'Email already exists.',
            // });
            throw new ErrorHandler('Email already exists', 409, 'EMAIL_ERROR', {
                field: 'email',
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
            },
        });
        console.log(newUser);

        function excludePassword(obj) {
            const { password, ...rest } = obj; // Destructure password and exclude it
            return rest;
        }

        const userWithoutPassword = excludePassword(newUser);

        return responseHandler(res, userWithoutPassword, 'User registered successfully');
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

// Middleware to verify the token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Check if the token is provided
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // return res.status(401).json({ message: 'Access token is missing or invalid' });

        throw new ErrorHandler('Access token is missing or invalid', 401, 'TOKEN_ERROR', { field: 'authorization' });
    }

    const token = authHeader.split(' ')[1]; // Extract the token

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = decoded; // Attach user info to the request object
        next(); // Proceed to the next middleware/controller
    } catch (err) {
        throw new ErrorHandler('Invalid or expired token', 401, 'TOKEN_ERROR', { field: 'authorization' });
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
