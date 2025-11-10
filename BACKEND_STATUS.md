# Backend Status - Token Expiration Fix

## ✅ Backend Status: **CORRECT & READY**

The backend has been fixed and is now ready to work with the mobile app.

## 🔧 What Was Fixed

1. **Token Expiration Detection**: The backend now properly detects when access tokens expire and returns a specific error code `TOKEN_EXPIRED` instead of a generic `UNAUTHORIZED` error.

2. **Error Response Format**: When access token expires, the backend returns:
   ```json
   {
     "status": false,
     "statuscode": 401,
     "code": "TOKEN_EXPIRED",
     "message": "Access token has expired. Please refresh your token using the refresh token endpoint.",
     "results": {
       "error": "jwt expired",
       "expiredAt": "2024-01-15T10:30:00.000Z"
     }
   }
   ```

## 📱 What Mobile App Developer Needs to Do

The mobile app needs to implement **automatic token refresh** when it receives `TOKEN_EXPIRED` error:

1. **Detect TOKEN_EXPIRED Error**: When any API call returns `code: "TOKEN_EXPIRED"`

2. **Call Refresh Token Endpoint**: 
   - **Endpoint**: `POST /v1/create-token`
   - **Body**: `{ "refreshtoken": "<stored_refresh_token>" }`
   - **Response**: `{ "status": true, "results": { "accessToken": "<new_token>" } }`

3. **Update Access Token**: Save the new access token

4. **Retry Original Request**: Retry the failed API call with the new access token

## ⏰ Token Expiration Times

Token expiration times are configured in your `.env` file using these variables:

- **ACCESS_AEXPIRE**: Access token expiration time
  - Format: JWT expiration format (e.g., "1h", "24h", "7d", "15m")
  - Typical values: 15 minutes to 7 days
  - **Check your .env file to see the exact value**

- **REFRESH_AEXPIRE**: Refresh token expiration time  
  - Format: JWT expiration format (e.g., "7d", "30d", "90d")
  - Typical values: 7 days to 90 days
  - **Check your .env file to see the exact value**

### Common JWT Expiration Formats:
- `"15m"` = 15 minutes
- `"1h"` = 1 hour
- `"24h"` = 24 hours (1 day)
- `"7d"` = 7 days
- `"30d"` = 30 days

## 🔍 How to Check Your Token Expiration Settings

Check your `.env` file for:
```
ACCESS_AEXPIRE=7d
REFRESH_AEXPIRE=30d
```

(Replace with your actual values)

## 📋 API Endpoints Summary

### Authentication Flow:
1. `POST /v1/auth-email` - Send OTP to email
2. `POST /v1/auth-otp` - Verify OTP, get access & refresh tokens
3. `POST /v1/create-token` - Refresh access token using refresh token

### Protected Endpoints (require access token):
- All endpoints in `/v1` except auth endpoints require `Authorization: Bearer <access_token>` header

## ✅ Backend is Ready

The backend will now:
- ✅ Properly detect expired tokens
- ✅ Return clear `TOKEN_EXPIRED` error code
- ✅ Support token refresh via `/v1/create-token` endpoint

**The mobile app just needs to implement automatic token refresh handling.**

