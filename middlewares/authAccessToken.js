const axios = require('axios');
const jwt = require("jsonwebtoken");
const { authUser } = require('../models/User');
module.exports = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (Boolean(authHeader)) {
        var token = authHeader.split(' ')[1];
        if (token) {
            jwt.verify(token, process.env.ACCESS_SECRET_AKEY, async (error, tokenCheck) => {
                if (error) {
                    // Check if token is expired specifically
                    if (error.name === 'TokenExpiredError') {
                        return res.status(401).json({ 
                            status: false, 
                            statuscode: 401,
                            code: "TOKEN_EXPIRED",
                            message: "Access token has expired. Please refresh your token using the refresh token endpoint.",
                            results: {
                                error: error.message,
                                expiredAt: error.expiredAt
                            }
                        });
                    }
                    // For other JWT errors (invalid token, malformed, etc.)
                    return res.status(401).json({ 
                        status: false, 
                        statuscode: 401,
                        code: "UNAUTHORIZED",
                        message: "The provided token is not authorized or is invalid. Please ensure you have the correct authentication credentials.",
                        results: {
                            error: error.message,
                            errorName: error.name
                        }
                    });
                } else {
                    // Use data from JWT token directly (already verified) - No database query needed
                    // This improves performance significantly by avoiding DB query on every request
                    try {
                        var userData = {
                            confrer_code : tokenCheck.confrer_code,
                            personal_mailid1 : tokenCheck.email
                        }
                        req.authuser = userData;
                        next();
                    } catch (error) {
                        return res.status(500).json({ status: false, statuscode:500, code:'INTERNAL_SERVER_ERROR', message: "Internal Server Error. An internal error occurred in server", results:error});
                    }
                }
            });
        } else {
            return res.status(401).json({ 
                status: false, 
                statuscode:401,
                code:"TOKEN_NOT_PROVIDED",
                message: "Token not provided. Please include a valid authentication token in the request headers.",
                results: null
            });
        }
    } else {
        return res.status(401).json({ 
            status: false, 
            statuscode:401,
            code:"TOKEN_NOT_PROVIDED",
            message: "Token not provided. Please include a valid authentication token in the request headers.",
            results: null
        });
    }
};