module.exports = {
    SYSTEM: {
        DB_READINESS: {
            system: 'Database readiness check passed.',
            user: 'The system is running smoothly.',
        },
        DB_READINESS_FAILED: {
            system: 'Database readiness check failed. Unable to connect to the database.',
            user: 'We’re experiencing some technical difficulties. Please try again later.',
        },
        HEALTH_READINESS: {
            system: 'System health check passed.',
            user: 'The system is operating normally.',
        },
        HEALTH_READINESS_FAILED: {
            system: 'System health check failed due to database or other service issues.',
            user: 'Some parts of the system are currently unavailable. We’re working to resolve the issue.',
        },
        SYSTEM_STATUS: {
            UP: {
                system: 'UP',
                user: 'System is online.',
            },
            DOWN: {
                system: 'DOWN',
                user: 'System is offline. Please check back later.',
            },
        },
        UP: {
            system: 'UP',
            user: 'System is online.',
        },
        DOWN: {
            system: 'DOWN',
            user: 'System is offline. Please check back later.',
        },
        HEALTHY: {
            system: 'HEALTHY',
            user: 'System is healthy.',
        },
        NOT_HEALTHY: {
            system: 'NOT_HEALTHY',
            user: 'System is not healthy.',
        },
        PORT_LISTENING_MSG: (service_name, env, port) =>
            `${service_name} server is running in ${env} mode on port ${port}`,
    },
    ERRORS: {
        CORS_ERROR: {
            system: 'The CORS policy for this site does not allow access from the specified Origin.',
            user: 'Access from this origin is not allowed due to the site’s security policy.',
        },
        VALIDATION_ERROR: {
            system: 'Input validation failed.',
            user: 'There was an issue with the input provided. Please check and try again.',
        },
        ROUTE_NOT_FOUND: {
            system: 'Requested endpoint does not exist.',
            user: 'The page or endpoint you’re looking for doesn’t exist.',
        },
        SERVICE_DOWN: {
            system: 'Service is temporarily unavailable. Please try again later.',
            user: 'The service is currently unavailable. Please try again later.',
        },
        UNAUTHORIZED: {
            system: 'User not authorized for this action.',
            user: 'You don’t have the required permissions to perform this action.',
        },
        FORBIDDEN: {
            system: 'Access to resource forbidden.',
            user: 'You are not allowed to access this resource.',
        },
        NOT_FOUND: {
            system: 'Requested resource not found.',
            user: 'We couldn’t find the resource you’re looking for.',
        },
        RATE_LIMIT_EXCEEDED: {
            system: 'Too many requests. Please wait and try again.',
            user: 'You’ve made too many requests. Please wait a moment and try again.',
        },
        INVALID_RESPONSE_OBJECT: {
            system: 'The provided response object is invalid or does not have a status method.',
            user: 'There was an issue with the response. Please try again later or contact support if the problem persists.',
        },
    },
    AUTHENTICATION: {
        TOKEN_ERROR: {
            system: 'Token has expired or is invalid.',
            user: 'Your session has expired or the token is invalid. Please log in again.',
        },
        CREDENTIALS_ERROR: {
            system: 'Invalid credentials.',
            user: 'The email or password you entered is incorrect. Please try again.',
        },
        USER_NOT_FOUND: {
            system: 'User not found in the database. Ensure the provided user ID or email is correct.',
            user: 'We couldn’t find your account. Please check your details and try again.',
        },
        USER_CREATION_SUCCESS: {
            system: '',
            user: 'Your account has been successfully created. Welcome aboard!',
        },
        USER_LOGIN_SUCCESS: {
            system: '',
            user: 'Welcome back! You’ve logged in successfully.',
        },
    },
    INPUT_ERRORS: {
        EMAIL_EXISTS: {
            system: 'Email already exists.',
            user: 'This email address is already registered.',
        },
    },
};
