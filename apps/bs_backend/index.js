const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const prisma = require('./prisma-client');
const authRoutes = require('./routes/auth.routes');
const testRoutes = require('./routes/test.routes');
const { requestLogger, logger } = require('./utils/loggingHandler');
const ErrorHandler = require('./utils/ErrorHandler');
const responseHandler = require('./utils/responseHandler');
const messages = require('./utils/messages');
const swaggerOptions = require('./utils/configurations/swagger');

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

// Swagger setup
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api/v1/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Database health check configuration
const dbHealthConfig = {
    timeout: 3000, // Database query timeout in ms
    maxRetries: 3, // Maximum retry attempts for DB connection
    retryDelay: 1000, // Delay between retries in ms
};

// Enhanced database check with retries and detailed diagnostics
let isDbReady = false;
const checkDatabaseHealth = async () => {
    let retries = 0;
    let lastError = null;

    while (retries < dbHealthConfig.maxRetries) {
        try {
            const startTime = Date.now();
            await Promise.race([
                prisma.$queryRaw`SELECT 1`,
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Database timeout')), dbHealthConfig.timeout)
                ),
            ]);

            const responseTime = Date.now() - startTime;
            isDbReady = true;

            logger.info({
                message: messages.SYSTEM.DB_READINESS.system,
                service: process.env.SERVICE_NAME,
                environment: process.env.NODE_ENV,
                responseTime,
            });

            return {
                status: 'connected',
                responseTime,
                retryCount: retries,
                lastError: null,
            };
        } catch (error) {
            lastError = error;
            retries++;

            if (retries < dbHealthConfig.maxRetries) {
                await new Promise((resolve) => setTimeout(resolve, dbHealthConfig.retryDelay));
            }
        }
    }

    isDbReady = false;
    logger.warn({
        message: messages.SYSTEM.DB_READINESS_FAILED.system,
        service: process.env.SERVICE_NAME,
        environment: process.env.NODE_ENV,
        error: lastError?.message,
        retryAttempts: retries,
    });

    return {
        status: 'disconnected',
        responseTime: null,
        retryCount: retries,
        lastError: lastError?.message,
    };
};

// Enhanced health check endpoint focused on database
app.get('/api/v1/health', async (req, res, next) => {
    try {
        const startTime = Date.now();
        const dbHealth = await checkDatabaseHealth();

        const healthStatus = {
            status:
                dbHealth.status === 'connected' ? messages.SYSTEM.HEALTHY.system : messages.SYSTEM.NOT_HEALTHY.system,
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            details: {
                database: {
                    ...dbHealth,
                    type: process.env.DATABASE_TYPE || 'postgres',
                    host: process.env.DATABASE_HOST, // Consider if you want to expose this
                    name: process.env.DATABASE_NAME,
                },
                uptime: process.uptime(),
                memory: {
                    heap: process.memoryUsage().heapUsed,
                    external: process.memoryUsage().external,
                },
            },
            responseTime: Date.now() - startTime,
        };

        if (dbHealth.status === 'connected') {
            logger.info({
                message: messages.SYSTEM.HEALTH_READINESS.system,
                service: process.env.SERVICE_NAME,
                responseTime: healthStatus.responseTime,
            });
            return responseHandler(res, healthStatus, 'SYSTEM', 'HEALTHY', 200);
        }

        logger.warn({
            message: messages.SYSTEM.HEALTH_READINESS_FAILED.system,
            service: process.env.SERVICE_NAME,
            details: dbHealth,
        });

        // Adding retry information in headers
        res.set({
            'Retry-After': '5',
            'X-Database-Status': 'disconnected',
        });

        return responseHandler(res, healthStatus, 'SYSTEM', 'NOT_HEALTHY', 503);
    } catch (error) {
        next(error);
    }
});

// Enhanced middleware with more detailed error response
app.use(async (req, res, next) => {
    if (!isDbReady) {
        logger.error({
            message: messages.ERRORS.SERVICE_DOWN.system,
            service: process.env.SERVICE_NAME,
            path: req.path,
        });

        return next(
            new ErrorHandler(503, 'ERRORS', 'SERVICE_DOWN', {
                field: 'database',
                retryAfter: 30,
                suggestion: 'Database connection is currently unavailable. Please try again later.',
            })
        );
    }
    next();
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', testRoutes);

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
    checkDatabaseHealth(); // Add this
    logger.info({
        message: messages.SYSTEM.PORT_LISTENING_MSG(process.env.SERVICE_NAME, process.env.NODE_ENV, PORT),
        service: process.env.SERVICE_NAME,
        environment: process.env.NODE_ENV || 'development',
    });
});
