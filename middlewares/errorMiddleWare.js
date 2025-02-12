// Enggo-Server/middlewares/errorMiddleWare.js
const errorMiddleHandle = (err, req, res, next) => {
    const statusCode = res.statusCode ? res.statusCode : 500;

    res.status(statusCode).json({
        message: err.message || 'An unknown error occurred',
        statusCode,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = errorMiddleHandle;