const express = require('express');
const cors = require('cors');
// const helmet = require('helmet');

const authRoutes = require('./routes/auth.routes');
const { verifyToken, authorizeRoles } = require('./controllers/auth.controller');
const { requestLogger, logger } = require('./utils/loggingHandler');
const limiter = require('./utils/rateLimitHandler');

const app = express();

const PORT = process.env.PORT || 8800;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Security middleware
// app.use(helmet());
// app.use(
//     cors({
//         origin: 'http://localhost:3001',
//         methods: ['GET', 'POST', 'PUT', 'DELETE'],
//         allowedHeaders: ['Content-Type', 'Authorization'],
//     })
// );
app.use(requestLogger);
const limiterForAdminAPI = limiter(50);
const limiterForEmployeeAPI = limiter(50);
const limiterForCustomerAPI = limiter(50);

app.use('/api/auth', authRoutes);

app.get('/api/test1', limiterForAdminAPI, verifyToken, authorizeRoles(['admin']), (req, res) => {
    res.send('Hello Admin!');
});
app.get('/api/test2', limiterForEmployeeAPI, verifyToken, authorizeRoles(['employee']), (req, res) => {
    res.send('Hello Employee!');
});
app.get('/api/test3', limiterForCustomerAPI, verifyToken, authorizeRoles(['customer']), (req, res) => {
    res.send('Hello Customer!');
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
    logger.warn(err.message);
    // Customize the response
    res.status(err.status || 500).json({
        statusCode: err.status,
        success: false,
        message: err.message || 'Internal Server Error',
        errorCode: err.errorCode,
        errorDetails: err.details,
    });
});

app.listen(PORT, () => {
    // console.log(`Example app listening on port ${PORT}`);
    logger.info(`Example app listening on port ${PORT}`);
});
