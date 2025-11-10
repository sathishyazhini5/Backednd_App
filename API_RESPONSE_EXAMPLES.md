# 📋 API Response Examples

Quick reference for all API response formats.

---

## 🔐 Authentication Responses

### 1. Send OTP - Success
```json
POST /v1/auth-email
{
  "email": "user@example.com"
}

Response (201):
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

### 2. Verify OTP - Success
```json
POST /v1/auth-otp
{
  "email": "user@example.com",
  "verifycode": "123456"
}

Response (201):
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

### 3. Refresh Token - Success
```json
POST /v1/create-token
{
  "refreshtoken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response (201):
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

---

## 🚨 Error Responses

### 1. TOKEN_EXPIRED (Access Token)
```json
Response (401):
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

Action: Auto-refresh token using /v1/create-token
```

### 2. REFRESH_TOKEN_EXPIRED (Refresh Token)
```json
Response (401):
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

Action: Force logout, show login screen
```

### 3. UNAUTHORIZED (Invalid Token)
```json
Response (401):
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

Action: Force logout, show login screen
```

### 4. TOKEN_NOT_PROVIDED
```json
Response (401):
{
  "status": false,
  "statuscode": 401,
  "code": "TOKEN_NOT_PROVIDED",
  "message": "Token not provided. Please include a valid authentication token in the request headers.",
  "results": null
}

Action: Check if token exists, if not show login screen
```

### 5. NOT_FOUND
```json
Response (404):
{
  "status": false,
  "statuscode": 404,
  "code": "NOT_FOUND",
  "message": "The requested resource could not be found.",
  "results": null
}

Action: Show error message to user
```

### 6. VALIDATION_ERROR
```json
Response (422):
{
  "status": false,
  "statuscode": 422,
  "code": "VALIDATION_ERROR",
  "message": "The request cannot be processed due to validation errors.",
  "results": {
    "msg": "Email is required.",
    "param": "email",
    "location": "body"
  }
}

Action: Show validation error message
```

### 7. INTERNAL_SERVER_ERROR
```json
Response (500):
{
  "status": false,
  "statuscode": 500,
  "code": "INTERNAL_SERVER_ERROR",
  "message": "Internal Server Error. An error occurred while fetching the data.",
  "results": "Error details..."
}

Action: Show generic error message, retry if appropriate
```

---

## 📊 Data Endpoint Responses

### Dashboard - Success
```json
POST /v1/view-dashboard
Headers: Authorization: Bearer <accessToken>
Body: { "provincecode": "ALL" }

Response (200):
{
  "status": true,
  "statuscode": 200,
  "code": "FETCHED",
  "message": "Dashboard deatils fetched successfully.",
  "results": [
    {
      "quick_code_type": "divtyp",
      "type_code": "001",
      "quickcode_name": "Division Type 1",
      "code_count": 10,
      "province_code": "001",
      "province_name": "Province 1"
    }
  ]
}
```

### Find Confreres - Success
```json
POST /v1/find-confreres
Headers: Authorization: Bearer <accessToken>
Body: {
  "provincecode": "ALL",
  "searchtxt": "John",
  "memtyp": "ALL"
}

Response (200):
{
  "status": true,
  "statuscode": 200,
  "code": "FETCHED",
  "message": "Confreres list fetched successfully.",
  "results": [
    {
      "confrer_code": "001",
      "first_name": "John",
      "last_name": "Doe",
      "personal_mailid1": "john@example.com"
    }
  ]
}
```

---

## 🔄 Complete Flow Example

### Scenario: Access Token Expires During API Call

```javascript
// Step 1: Make API call
const response = await fetch('/v1/view-dashboard', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ provincecode: 'ALL' })
});

const data = await response.json();

// Step 2: Check if token expired
if (data.code === 'TOKEN_EXPIRED') {
  // Step 3: Refresh token
  const refreshResponse = await fetch('/v1/create-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshtoken: refreshToken })
  });
  
  const refreshData = await refreshResponse.json();
  
  // Step 4: Check if refresh token expired
  if (refreshData.code === 'REFRESH_TOKEN_EXPIRED') {
    // Force logout
    logout();
    return;
  }
  
  // Step 5: Update access token
  accessToken = refreshData.results.accessToken;
  
  // Step 6: Retry original request
  const retryResponse = await fetch('/v1/view-dashboard', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ provincecode: 'ALL' })
  });
  
  const retryData = await retryResponse.json();
  return retryData;
}

// Step 7: Return data
return data;
```

---

## 📝 Quick Reference

| Error Code | HTTP Status | Action |
|------------|-------------|--------|
| `TOKEN_EXPIRED` | 401 | Auto-refresh token |
| `REFRESH_TOKEN_EXPIRED` | 401 | Force logout |
| `UNAUTHORIZED` | 401 | Force logout |
| `TOKEN_NOT_PROVIDED` | 401 | Show login |
| `NOT_FOUND` | 404 | Show error |
| `VALIDATION_ERROR` | 422 | Show validation error |
| `INTERNAL_SERVER_ERROR` | 500 | Show error, retry |

---

**Remember:** Always check `data.code` first, then handle accordingly!

