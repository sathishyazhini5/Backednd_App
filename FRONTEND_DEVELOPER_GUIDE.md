# 📱 Frontend/Mobile App Developer Guide

## API Response Format & Error Handling

This document explains how to handle all API responses from the backend, especially token expiration scenarios.

---

## 📋 Standard Response Format

All API responses follow this structure:

### ✅ Success Response:
```json
{
  "status": true,
  "statuscode": 200,
  "code": "FETCHED",
  "message": "Data fetched successfully.",
  "results": { /* your data here */ }
}
```

### ❌ Error Response:
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

---

## 🔐 Authentication Flow

### Step 1: Send OTP to Email
**Endpoint:** `POST /v1/auth-email`

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (201):**
```json
{
  "status": true,
  "statuscode": 201,
  "code": "CREATED",
  "message": "OTP sent to your email.",
  "results": {
    "verifytoken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `422` - Validation error (email required/invalid)
- `404` - User not found
- `500` - Server error

---

### Step 2: Verify OTP and Get Tokens
**Endpoint:** `POST /v1/auth-otp`

**Request:**
```json
{
  "email": "user@example.com",
  "verifycode": "123456"
}
```

**Success Response (201):**
```json
{
  "status": true,
  "statuscode": 201,
  "code": "VERIFIED",
  "message": "OTP verified. Login successful.",
  "results": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**⚠️ IMPORTANT:** Store both tokens securely:
- `accessToken` - Use for all API calls (expires in 24 hours)
- `refreshToken` - Use to get new access token (expires in 6 months)

**Error Responses:**
- `422` - Validation error
- `401` - OTP verification failed
- `404` - User not found
- `500` - Server error

---

## 🔄 Token Refresh Flow

### Step 3: Refresh Access Token
**Endpoint:** `POST /v1/create-token`

**Request:**
```json
{
  "refreshtoken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (201):**
```json
{
  "status": true,
  "statuscode": 201,
  "code": "VERIFIED",
  "message": "Access token regenerated successfully.",
  "results": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `401` - `REFRESH_TOKEN_EXPIRED` - Refresh token expired (6 months), user must login again
- `401` - `UNAUTHORIZED` - Invalid refresh token
- `401` - `TOKEN_NOT_PROVIDED` - Refresh token not provided

---

## 🚨 Error Codes & How to Handle Them

### 1. `TOKEN_EXPIRED` (401)
**When:** Access token has expired (after 24 hours)

**Response:**
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

**What to Do:**
1. ✅ **Automatically call** `/v1/create-token` with your stored `refreshToken`
2. ✅ **Update** the `accessToken` with the new token from response
3. ✅ **Retry** the original API call with the new access token
4. ✅ **Don't show error to user** - handle silently

**Example Code:**
```javascript
async function handleApiCall(apiEndpoint, options) {
  try {
    const response = await fetch(apiEndpoint, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    const data = await response.json();
    
    // Check if token expired
    if (data.code === 'TOKEN_EXPIRED') {
      // Auto-refresh token
      const newToken = await refreshAccessToken();
      if (newToken) {
        // Retry original request
        return handleApiCall(apiEndpoint, options);
      }
    }
    
    return data;
  } catch (error) {
    throw error;
  }
}

async function refreshAccessToken() {
  try {
    const response = await fetch('/v1/create-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshtoken: refreshToken })
    });
    
    const data = await response.json();
    
    if (data.status && data.results.accessToken) {
      // Update stored access token
      accessToken = data.results.accessToken;
      // Save to storage
      await saveToken(accessToken);
      return accessToken;
    }
    
    return null;
  } catch (error) {
    return null;
  }
}
```

---

### 2. `REFRESH_TOKEN_EXPIRED` (401)
**When:** Refresh token has expired (after 6 months / 180 days)

**Response:**
```json
{
  "status": false,
  "statuscode": 401,
  "code": "REFRESH_TOKEN_EXPIRED",
  "message": "Refresh token has expired. Please login again.",
  "results": {
    "error": "jwt expired",
    "expiredAt": "2024-07-15T10:30:00.000Z"
  }
}
```

**What to Do:**
1. ❌ **Cannot refresh** - Refresh token is expired
2. ✅ **Clear all stored tokens** (accessToken and refreshToken)
3. ✅ **Force logout** - Show login screen
4. ✅ **Show message to user:** "Your session has expired. Please login again."

**Example Code:**
```javascript
async function refreshAccessToken() {
  try {
    const response = await fetch('/v1/create-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshtoken: refreshToken })
    });
    
    const data = await response.json();
    
    if (data.code === 'REFRESH_TOKEN_EXPIRED') {
      // Refresh token expired - force logout
      await clearAllTokens();
      navigateToLoginScreen();
      showMessage("Your session has expired. Please login again.");
      return null;
    }
    
    if (data.status && data.results.accessToken) {
      accessToken = data.results.accessToken;
      await saveToken(accessToken);
      return accessToken;
    }
    
    return null;
  } catch (error) {
    return null;
  }
}
```

---

### 3. `UNAUTHORIZED` (401)
**When:** Invalid or malformed token

**Response:**
```json
{
  "status": false,
  "statuscode": 401,
  "code": "UNAUTHORIZED",
  "message": "The provided token is not authorized or is invalid.",
  "results": {
    "error": "invalid token",
    "errorName": "JsonWebTokenError"
  }
}
```

**What to Do:**
1. ✅ **Clear stored tokens**
2. ✅ **Force logout** - Show login screen
3. ✅ **Show message:** "Authentication failed. Please login again."

---

### 4. `TOKEN_NOT_PROVIDED` (401)
**When:** No token in request headers

**Response:**
```json
{
  "status": false,
  "statuscode": 401,
  "code": "TOKEN_NOT_PROVIDED",
  "message": "Token not provided. Please include a valid authentication token in the request headers.",
  "results": null
}
```

**What to Do:**
1. ✅ **Check if token exists** in storage
2. ✅ **If no token** - Show login screen
3. ✅ **If token exists** - Retry with proper Authorization header

---

## 📱 Complete Implementation Example

### React Native / Flutter / Mobile App Pattern:

```javascript
// API Service with Auto Token Refresh
class ApiService {
  constructor() {
    this.baseUrl = 'https://your-api-url.com/v1';
    this.accessToken = null;
    this.refreshToken = null;
  }

  // Main API call method
  async call(endpoint, options = {}) {
    // Get tokens from storage
    this.accessToken = await getStoredAccessToken();
    this.refreshToken = await getStoredRefreshToken();

    // Make API call
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`,
        ...options.headers
      }
    });

    const data = await response.json();

    // Handle token expiration
    if (data.code === 'TOKEN_EXPIRED') {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        // Retry original request
        return this.call(endpoint, options);
      } else {
        throw new Error('Token refresh failed');
      }
    }

    // Handle refresh token expiration
    if (data.code === 'REFRESH_TOKEN_EXPIRED') {
      await this.logout();
      throw new Error('Session expired. Please login again.');
    }

    // Handle other errors
    if (!data.status) {
      throw new Error(data.message || 'API Error');
    }

    return data;
  }

  // Refresh access token
  async refreshToken() {
    try {
      const response = await fetch(`${this.baseUrl}/create-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshtoken: this.refreshToken })
      });

      const data = await response.json();

      if (data.code === 'REFRESH_TOKEN_EXPIRED') {
        await this.logout();
        return false;
      }

      if (data.status && data.results.accessToken) {
        this.accessToken = data.results.accessToken;
        await saveStoredAccessToken(this.accessToken);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }

  // Logout
  async logout() {
    await clearAllTokens();
    // Navigate to login screen
    navigation.navigate('Login');
  }
}

// Usage
const api = new ApiService();

// Example: Get dashboard data
try {
  const response = await api.call('/view-dashboard', {
    method: 'POST',
    body: JSON.stringify({ provincecode: 'ALL' })
  });
  
  console.log('Dashboard data:', response.results);
} catch (error) {
  console.error('Error:', error.message);
}
```

---

## 🔑 All Protected Endpoints

All endpoints except these require `Authorization: Bearer <accessToken>` header:

**Public Endpoints (No token needed):**
- `POST /v1/auth-email`
- `POST /v1/auth-otp`
- `POST /v1/create-token` (needs refreshToken in body, not header)

**Protected Endpoints (Need accessToken):**
- `GET /v1/list-province`
- `GET /v1/list-country`
- `POST /v1/view-dashboard`
- `POST /v1/find-confreres`
- `GET /v1/list-confre-filters`
- `POST /v1/view-confre`
- `POST /v1/find-centres`
- `GET /v1/list-centre-filters`
- `POST /v1/view-centre`
- `POST /v1/find-obituary`
- `GET /v1/list-obituary-filters`
- `POST /v1/find-anniversary`
- `POST /v1/find-scholastics`
- `POST /v1/view-scholastic`
- `GET /v1/list-confreres-alphabetical`
- `GET /v1/app-version`

---

## 📊 Response Status Codes Summary

| Status Code | Code | Meaning | Action |
|------------|------|---------|--------|
| 200-201 | Various | Success | Use the data |
| 401 | `TOKEN_EXPIRED` | Access token expired | Auto-refresh token |
| 401 | `REFRESH_TOKEN_EXPIRED` | Refresh token expired | Force logout |
| 401 | `UNAUTHORIZED` | Invalid token | Force logout |
| 401 | `TOKEN_NOT_PROVIDED` | No token | Show login |
| 404 | `NOT_FOUND` | Resource not found | Show error message |
| 422 | `VALIDATION_ERROR` | Invalid input | Show validation error |
| 500 | `INTERNAL_SERVER_ERROR` | Server error | Show error message |

---

## ✅ Best Practices

1. **Always check `data.code`** before checking `data.status`
2. **Handle `TOKEN_EXPIRED` silently** - auto-refresh, don't show error
3. **Handle `REFRESH_TOKEN_EXPIRED`** - show logout message
4. **Store tokens securely** - Use secure storage (Keychain/Keystore)
5. **Retry failed requests** after token refresh
6. **Show loading indicators** during token refresh
7. **Handle network errors** separately from token errors

---

## 🧪 Testing Checklist

- [ ] Login flow works
- [ ] Access token refresh works automatically
- [ ] Refresh token expiration shows logout
- [ ] All protected endpoints work with token
- [ ] Error messages display correctly
- [ ] Network errors handled properly
- [ ] App doesn't crash on token errors

---

## 📞 Support

If you encounter any issues:
1. Check the error `code` in response
2. Check the `message` for details
3. Verify token expiration times match backend
4. Ensure Authorization header format is correct: `Bearer <token>`

---

**Last Updated:** 2024
**Backend Version:** 1.0.0

