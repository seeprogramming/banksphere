// Swagger configuration
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'BankSphere API',
            description: `
            API endpoints with rate limiting:
            - Authentication: 7 requests per minute per IP
            - Admin endpoints: 200 requests per minute per user
            - Employee endpoints: 100 requests per minute per user
            - Customer endpoints: 50 requests per minute per user
        `,
            version: '1.0.0',
            contact: {
                name: 'API Support - Sagar Shelk',
            },
            servers: ['http://localhost:8800', 'http://localhost:3000'],
        },
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT', // Optional, useful for documentation
                },
            },
        },
        security: [
            {
                BearerAuth: [],
            },
        ],
    },
    apis: ['./**/*.js'], // Path to the API docs
};

module.exports = swaggerOptions;
