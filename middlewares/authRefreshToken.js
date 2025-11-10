require('dotenv').config();
const jwt = require("jsonwebtoken");
const { authUser } = require('../models/User');
module.exports = (req, res, next) => {
    var authHeader = req.headers.authorization;
    if (Boolean(authHeader)) {
        var token = authHeader.split(' ')[1];
        if (token) {
            jwt.verify(token, process.env.REFRESH_SECRET_AKEY, async (error, tokenCheck) => {
                if (error) {
                    // Check if refresh token is expired specifically
                    if (error.name === 'TokenExpiredError') {
                        return res.status(401).json({ 
                            status: false, 
                            statuscode: 401,
                            code: "REFRESH_TOKEN_EXPIRED",
                            message: "Refresh token has expired. Please login again.",
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
                        message: "The provided refresh token is not authorized or is invalid. Please ensure you have the correct authentication credentials.",
                        results: {
                            error: error.message,
                            errorName: error.name
                        }
                    });
                } else {
                    try {
                        const checkUser = await authUser(tokenCheck.email); 
                        if (!checkUser) {
                            return res.status(404).send({ status: false, statuscode:404, code:'NOT_FOUND', message: 'The requested resource could not be found. Please check your request and try again.',results: checkUser });
                        } else {
                            const userData = {
                                usercode : checkUser.confrer_code,
                                email: checkUser.personal_mailid1
                            };
                            const accessToken = jwt.sign(
                                userData, process.env.ACCESS_SECRET_AKEY,
                                { expiresIn: process.env.ACCESS_AEXPIRE }
                            );
                            req.authtoken = accessToken;
                            next();
                        }
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