const express = require('express');
const router = express.Router();
const { authUser } = require('../models/User');
const { check, validationResult } = require('express-validator');
const { sendOTPMail } = require("../middlewares/msgConfig");
const { getConfreresAlphabetical, getScholasticsAlphabetical, getCentresAlphabetical } = require('../models/Search');
const authAccessToken = require("../middlewares/authAccessToken");
const jwt = require('jsonwebtoken');

// ✅ Step 1: Send OTP to email
router.post("/auth-email", [
  check('email')
    .notEmpty()
    .withMessage('The email is required and should not be empty.')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: false,
      statuscode: 422,
      code: "VALIDATION_ERROR",
      message: "The request cannot be processed due to validation errors.",
      results: errors.array()[0]
    });
  }

  try {
    const email = req.body.email;
    const checkUser = await authUser(email);

    if (!checkUser) {
      return res.status(404).json({
        status: false,
        statuscode: 404,
        code: 'NOT_FOUND',
        message: 'The requested user resource could not be found.',
        results: null
      });
    }

    const verifyotp = '123456'; // You can replace this with generateOtp()
    const mailResp = await sendOTPMail(email, verifyotp);

    if (mailResp) {
      const payload = { email: email, verifyotp: verifyotp };
      const token = jwt.sign(payload, process.env.OTP_SECRET_KEY, {
        expiresIn: process.env.OTP_EXPIRE
      });

      return res.status(201).json({
        status: true,
        statuscode: 201,
        code: 'CREATED',
        message: "OTP sent to your email.",
        results: { verifytoken: token }
      });
    } else {
      return res.status(500).json({
        status: false,
        statuscode: 500,
        code: "MAIL_SENDING_FAILED",
        message: "Failed to send OTP email.",
        results: null
      });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      statuscode: 500,
      message: "Internal Server Error",
      results: error
    });
  }
});

// ✅ Step 2: Verify OTP and return JWT tokens
router.post("/auth-otp", [
  check('verifycode')
    .notEmpty().withMessage('OTP is required.')
    .isNumeric().withMessage('OTP must be numeric.')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits.'),
  check('email')
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Email must be valid.')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: false,
      statuscode: 422,
      code: "VALIDATION_ERROR",
      message: "Validation failed.",
      results: errors.array()[0]
    });
  }

  const email = req.body.email;
  const verifycode = req.body.verifycode;
  const verifyotp = '123456'; // OTP sent in previous step

  try {
    const checkUser = await authUser(email);
    if (!checkUser) {
      return res.status(404).json({
        status: false,
        statuscode: 404,
        code: 'NOT_FOUND',
        message: 'User not found.',
        results: null
      });
    }

    if (verifyotp === verifycode && email === checkUser.personal_mailid1) {
      const userData = {
        confrer_code: checkUser.confrer_code,  // ✅ use this consistently
        email: checkUser.personal_mailid1
      };

      const accessToken = jwt.sign(userData, process.env.ACCESS_SECRET_AKEY, {
        expiresIn: process.env.ACCESS_AEXPIRE
      });

      const refreshToken = jwt.sign(userData, process.env.REFRESH_SECRET_AKEY, {
        expiresIn: process.env.REFRESH_AEXPIRE
      });

      return res.status(201).json({
        status: true,
        statuscode: 201,
        code: 'VERIFIED',
        message: "OTP verified. Login successful.",
        results: { accessToken, refreshToken }
      });
    } else {
      return res.status(401).json({
        status: false,
        statuscode: 401,
        code: 'OTP_VERIFY_FAILURE',
        message: 'OTP verification failed. Try again.',
        results: null
      });
    }

  } catch (error) {
    return res.status(500).json({
      status: false,
      statuscode: 500,
      code: 'INTERNAL_SERVER_ERROR',
      message: "Server error during OTP verification.",
      results: error
    });
  }
});

// ✅ Step 3: Check if access token is valid
router.get("/auth-token", (req, res) => {
  return res.status(200).json({
    status: true,
    statuscode: 200,
    code: 'VERIFIED',
    message: "Access token check removed.",
    results: null
  });
});

// ✅ Step 4: Create new access token using refresh token
router.post("/create-token", async (req, res) => {
  const refreshToken = req.body.refreshtoken;

  if (!refreshToken) {
    return res.status(401).json({
      status: false,
      statuscode: 401,
      code: 'TOKEN_NOT_PROVIDED',
      message: 'Refresh token not provided.'
    });
  }

  try {
    const tokenCheck = jwt.verify(refreshToken, process.env.REFRESH_SECRET_AKEY);
    const checkUser = await authUser(tokenCheck.email);

    if (!checkUser) {
      return res.status(401).json({
        status: false,
        statuscode: 401,
        code: 'UNAUTHORIZED',
        message: 'Invalid refresh token or user not found.'
      });
    }

    const userData = {
      confrer_code: checkUser.confrer_code,
      email: checkUser.personal_mailid1
    };

    const accessToken = jwt.sign(userData, process.env.ACCESS_SECRET_AKEY, {
      expiresIn: process.env.ACCESS_AEXPIRE
    });

    return res.status(201).json({
      status: true,
      statuscode: 201,
      code: 'VERIFIED',
      message: 'Access token regenerated successfully.',
      results: { accessToken }
    });

  } catch (error) {
    // Check if refresh token is expired specifically
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: false,
        statuscode: 401,
        code: 'REFRESH_TOKEN_EXPIRED',
        message: 'Refresh token has expired. Please login again.',
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
      code: 'UNAUTHORIZED',
      message: 'Refresh token is invalid.',
      results: {
        error: error.message,
        errorName: error.name
      }
    });
  }
});

// ✅ Get Confreres List Sorted Alphabetically
router.get("/list-confreres-alphabetical", authAccessToken, async (req, res) => {
  try {
    const provincecode = req.query.provincecode || 'ALL';

    const confreresList = await getConfreresAlphabetical(provincecode);

    if (!confreresList || confreresList.length === 0) {
      return res.status(404).json({
        status: false,
        statuscode: 404,
        code: 'NOT_FOUND',
        message: 'No confreres found.',
        results: null
      });
    }

    return res.status(200).json({
      status: true,
      statuscode: 200,
      code: 'FETCHED',
      message: "Confreres list fetched successfully (sorted alphabetically).",
      results: confreresList
    });

  } catch (error) {
    console.error("❌ Error in /list-confreres-alphabetical:", error);
    return res.status(500).json({
      status: false,
      statuscode: 500,
      code: 'INTERNAL_SERVER_ERROR',
      message: "Internal Server Error. An error occurred while fetching the confreres list.",
      results: error.message || error
    });
  }
});

// ✅ Get Scholastics List Sorted Alphabetically
router.get("/list-scholastics-alphabetical", authAccessToken, async (req, res) => {
  try {
    const provincecode = req.query.provincecode || 'ALL';

    const scholasticsList = await getScholasticsAlphabetical(provincecode);

    if (!scholasticsList || scholasticsList.length === 0) {
      return res.status(404).json({
        status: false,
        statuscode: 404,
        code: 'NOT_FOUND',
        message: 'No scholastics found.',
        results: null
      });
    }

    return res.status(200).json({
      status: true,
      statuscode: 200,
      code: 'FETCHED',
      message: "Scholastics list fetched successfully (sorted alphabetically).",
      results: scholasticsList
    });

  } catch (error) {
    console.error("❌ Error in /list-scholastics-alphabetical:", error);
    return res.status(500).json({
      status: false,
      statuscode: 500,
      code: 'INTERNAL_SERVER_ERROR',
      message: "Internal Server Error. An error occurred while fetching the scholastics list.",
      results: error.message || error
    });
  }
});

// ✅ Get Centres List Sorted Alphabetically
router.get("/list-centres-alphabetical", authAccessToken, async (req, res) => {
  try {
    const provincecode = req.query.provincecode || 'ALL';

    const centresList = await getCentresAlphabetical(provincecode);

    if (!centresList || centresList.length === 0) {
      return res.status(404).json({
        status: false,
        statuscode: 404,
        code: 'NOT_FOUND',
        message: 'No centres found.',
        results: null
      });
    }

    return res.status(200).json({
      status: true,
      statuscode: 200,
      code: 'FETCHED',
      message: "Centres list fetched successfully (sorted alphabetically).",
      results: centresList
    });

  } catch (error) {
    console.error("❌ Error in /list-centres-alphabetical:", error);
    return res.status(500).json({
      status: false,
      statuscode: 500,
      code: 'INTERNAL_SERVER_ERROR',
      message: "Internal Server Error. An error occurred while fetching the centres list.",
      results: error.message || error
    });
  }
});

module.exports = router;
