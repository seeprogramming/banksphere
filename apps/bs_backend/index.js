const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const { verifyToken, authorizeRoles } = require('./controllers/auth.controller');

const app = express();
const PORT = process.env.PORT || 8800;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use('/api/auth', authRoutes);

app.get('/api/test1', verifyToken, authorizeRoles(['admin']), (req, res) => {
    res.send('Hello Admin!');
});
app.get('/api/test2', verifyToken, authorizeRoles(['employee']), (req, res) => {
    res.send('Hello Employee!');
});
app.get('/api/test3', verifyToken, authorizeRoles(['customer']), (req, res) => {
    res.send('Hello Customer!');
});

// app.use(responseHandler);

// Global Error Handler Middleware
app.use((err, req, res, next) => {
    console.log('ERR', err);

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
    console.log(`Example app listening on port ${PORT}`);
});
