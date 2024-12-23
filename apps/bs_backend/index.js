const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./routes/auth.routes');
const { verifyToken, authorizeRoles } = require('./controllers/auth.controller');
const { requestLogger, logger } = require('./utils/loggingHandler');
const roleBasedLimiter = require('./utils/rateLimitHandler');
const ErrorHandler = require('./utils/ErrorHandler');
const prisma = require('./prisma-client');
const responseHandler = require('./utils/responseHandler');
const messages = require('./utils/messages');

const app = express();

const PORT = process.env.PORT || 8800;

// Parse allowed origins from env
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000']; // Default fallback

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// SECURITY :: Remove X-Powered-By (Reveals tech stack)
app.disable('x-powered-by');

// SECURITY ::
app.use(
    helmet({
        contentSecurityPolicy: true,
        crossOriginEmbedderPolicy: true,
        crossOriginOpenerPolicy: true,
        crossOriginResourcePolicy: true,
    })
);

// SECURITY :: Configure CORS with dynamic origin checking
app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);

            if (allowedOrigins.indexOf(origin) === -1) {
                return callback(new ErrorHandler(403, 'ERRORS', 'CORS_ERROR', { field: 'route' }));
            }
            return callback(null, true);
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
        credentials: true,
        maxAge: 600, // Cache preflight requests for 10 minutes
    })
);

// SECURITY :: Add security headers
app.use((req, res, next) => {
    res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    // Cache Control headers to prevent sensitive data caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('X-Content-Security-Policy', "default-src 'none'");
    next();
});

app.use(requestLogger);

// Checks DB readiness before doing any operations
let isDbReady = false;
const checkDatabseConnection = async () => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        isDbReady = true;
        logger.info({
            message: messages.SYSTEM.DB_READINESS.system,
            service: process.env.SERVICE_NAME,
            environment: process.env.NODE_ENV || 'development',
        });
        return true;
    } catch (error) {
        isDbReady = false;
        if (error) {
            logger.warn({
                message: messages.SYSTEM.DB_READINESS_FAILED.system,
                service: process.env.SERVICE_NAME,
                environment: process.env.NODE_ENV || 'development',
            });
            new ErrorHandler(503, 'SYSTEM', 'DB_READINESS_FAILED', {
                field: 'database',
            });
        }
        return false;
    }
};

// Application Health Check API
app.get('/api/health', async (req, res, next) => {
    try {
        const isDbConnected = await checkDatabseConnection();

        // Build health status
        const healthStatus = {
            status: messages.SYSTEM.SYSTEM_STATUS.UP.system,
            timestamp: new Date().toISOString(),
            details: {
                uptime: process.uptime(),
                memoryUsage: process.memoryUsage(),
                database: isDbConnected ? 'Connected' : 'Disconnected',
            },
        };

        // Respond with health status
        if (isDbConnected) {
            logger.info({
                message: messages.SYSTEM.HEALTH_READINESS.system,
                service: process.env.SERVICE_NAME,
                environment: process.env.NODE_ENV || 'development',
            });
            responseHandler(res, healthStatus, 'SYSTEM', 'UP');
        } else {
            logger.warn({
                message: messages.SYSTEM.HEALTH_READINESS_FAILED.system,
                service: process.env.SERVICE_NAME,
                environment: process.env.NODE_ENV || 'development',
            });
            healthStatus.status = messages.SYSTEM.SYSTEM_STATUS.DOWN.system;

            responseHandler(res, healthStatus, 'SYSTEM', 'DOWN');
        }
    } catch (error) {
        next(error);
    }
});

// Middleware to block operations if DB is down
app.use(async (req, res, next) => {
    // DB readiness check
    await checkDatabseConnection();

    if (!isDbReady) {
        logger.error({
            message: messages.SERVICE_DOWN.system,
            service: process.env.SERVICE_NAME,
            environment: process.env.NODE_ENV || 'development',
        });
        next(
            new ErrorHandler(503, 'ERRORS', 'SERVICE_DOWN', {
                field: 'database',
            })
        );
    }
    next();
});

app.use('/api/auth', authRoutes);

app.get('/api/test1', roleBasedLimiter('admin'), verifyToken, authorizeRoles(['admin']), (req, res) => {
    res.send('Hello Admin!');
});
app.get('/api/test2', roleBasedLimiter('employee'), verifyToken, authorizeRoles(['employee']), (req, res) => {
    res.send('Hello Employee!');
});
app.get('/api/test3', roleBasedLimiter('customer'), verifyToken, authorizeRoles(['customer']), (req, res) => {
    res.send('Hello Customer!');
});

// Catch-All Route for Undefined Routes
app.use((req, res, next) => {
    // Create an instance of ErrorHandler for undefined routes
    throw new ErrorHandler(404, 'ERRORS', 'ROUTE_NOT_FOUND', { field: 'route' });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
    logger.warn(err?.message);

    // Customize the response
    const isDevelopment = process.env.NODE_ENV === 'development';

    // Build the response object
    const response = {
        statusCode: err.status || 500,
        success: false,
        // message: err.message || 'Internal Server Error',
        errorCode: err.errorCode,
        errorDetails: { ...err.details, path: req.path, method: req.method },
        service: err.serviceName,
        userMessage: err.userMessage,
    };

    // Include error stack trace only in development environment
    if (isDevelopment) {
        response.errStack = err.stack;
    }

    // Send the response
    res.status(err.status || 500).json(response);
});

app.listen(PORT, () => {
    logger.info({
        message: messages.SYSTEM.PORT_LISTENING_MSG(process.env.SERVICE_NAME, process.env.NODE_ENV, PORT),
        service: process.env.SERVICE_NAME,
        environment: process.env.NODE_ENV || 'development',
    });
});
