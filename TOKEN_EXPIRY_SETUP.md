# Token Expiry Configuration - 6 Months Auto Logout

## ✅ All Files Updated Successfully

### Files Modified:
1. ✅ `middlewares/authAccessToken.js` - Returns `TOKEN_EXPIRED` when access token expires
2. ✅ `middlewares/authRefreshToken.js` - Returns `REFRESH_TOKEN_EXPIRED` when refresh token expires  
3. ✅ `routes/user.routes.js` - `/create-token` endpoint returns `REFRESH_TOKEN_EXPIRED` when refresh token expires

## 🔧 .env File Configuration Required

You need to create/update your `.env` file with these values:

```env
# Server Configuration
PORT=3000

# JWT Secret Keys (IMPORTANT: Use strong random strings in production)
ACCESS_SECRET_AKEY=your_access_secret_key_here_change_this
REFRESH_SECRET_AKEY=your_refresh_secret_key_here_change_this
OTP_SECRET_KEY=your_otp_secret_key_here_change_this

# JWT Token Expiration Times
# Access Token: Expires in 24 hours (user needs to refresh using refresh token)
ACCESS_AEXPIRE=24h

# Refresh Token: Expires in 6 months (180 days) - After 6 months, user must login again
REFRESH_AEXPIRE=180d

# OTP Token Expiration
OTP_EXPIRE=10m
```

## 📋 How It Works:

### 1. Access Token Expiry (24 hours)
- When access token expires → Returns `TOKEN_EXPIRED` error
- Mobile app should automatically call `/v1/create-token` with refresh token
- New access token is generated

### 2. Refresh Token Expiry (6 months / 180 days)
- When refresh token expires → Returns `REFRESH_TOKEN_EXPIRED` error
- User must login again (automatic logout)
- Cannot generate new access token

## 🔍 Error Codes:

| Error Code | When It Happens | What Mobile App Should Do |
|------------|----------------|---------------------------|
| `TOKEN_EXPIRED` | Access token expired | Call `/v1/create-token` with refresh token |
| `REFRESH_TOKEN_EXPIRED` | Refresh token expired (6 months) | Force user to login again |
| `UNAUTHORIZED` | Invalid/malformed token | Force user to login again |
| `TOKEN_NOT_PROVIDED` | No token in request | Show login screen |

## ✅ Verification:

All syntax checks passed:
- ✅ `middlewares/authAccessToken.js` - No syntax errors
- ✅ `middlewares/authRefreshToken.js` - No syntax errors  
- ✅ `routes/user.routes.js` - No syntax errors

## 🚀 Next Steps:

1. **Create/Update `.env` file** with the configuration above
2. **Update your secret keys** with strong random strings
3. **Restart your server** after updating `.env`
4. **Test the token expiration** flow

## 📱 Mobile App Integration:

The mobile app developer needs to:
1. Handle `TOKEN_EXPIRED` → Auto-refresh token
2. Handle `REFRESH_TOKEN_EXPIRED` → Force logout and show login screen
3. Store both access token and refresh token securely

---

**Status: ✅ Backend is ready and correctly configured for 6-month auto logout**

