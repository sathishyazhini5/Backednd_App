# 📚 Complete API Documentation

Base URL: `http://localhost:3000/v1`

All protected endpoints require `Authorization: Bearer <accessToken>` header.

---

## 🔐 Authentication Endpoints

### 1. Send OTP to Email
**Endpoint:** `POST /v1/auth-email`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
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

**Error Response (404):**
```json
{
  "status": false,
  "statuscode": 404,
  "code": "NOT_FOUND",
  "message": "The requested user resource could not be found.",
  "results": null
}
```

---

### 2. Verify OTP and Get Tokens
**Endpoint:** `POST /v1/auth-otp`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
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

**Error Response (401):**
```json
{
  "status": false,
  "statuscode": 401,
  "code": "OTP_VERIFY_FAILURE",
  "message": "OTP verification failed. Try again.",
  "results": null
}
```

---

### 3. Refresh Access Token
**Endpoint:** `POST /v1/create-token`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
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

**Error Response (401) - Refresh Token Expired:**
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

---

## 📋 List Endpoints (Alphabetical)

### 4. Get Confreres List (Alphabetical)
**Endpoint:** `GET /v1/list-confreres-alphabetical`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:**
- `provincecode` (optional): Province code or 'ALL' (default: 'ALL')

**Example Request:**
```
GET http://localhost:3000/v1/list-confreres-alphabetical?provincecode=ALL
```

**Success Response (200):**
```json
{
  "status": true,
  "statuscode": 200,
  "code": "FETCHED",
  "message": "Confreres list fetched successfully (sorted alphabetically).",
  "results": [
    {
      "confrer_code": "001",
      "first_name": "John",
      "middle_name": "Michael",
      "last_name": "Doe",
      "personal_mailid1": "john@example.com",
      "province_code": "001",
      "province_name": "Province 1",
      "member_type_code": "001",
      "member_type_name": "Priest",
      "nationality_code": "001",
      "nationality_name": "Indian",
      "language_code": "001",
      "language_name": "English"
    }
  ]
}
```

**Error Response (404):**
```json
{
  "status": false,
  "statuscode": 404,
  "code": "NOT_FOUND",
  "message": "No confreres found.",
  "results": null
}
```

---

### 5. Get Scholastics List (Alphabetical)
**Endpoint:** `GET /v1/list-scholastics-alphabetical`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:**
- `provincecode` (optional): Province code or 'ALL' (default: 'ALL')

**Example Request:**
```
GET http://localhost:3000/v1/list-scholastics-alphabetical?provincecode=ALL
```

**Success Response (200):**
```json
{
  "status": true,
  "statuscode": 200,
  "code": "FETCHED",
  "message": "Scholastics list fetched successfully (sorted alphabetically).",
  "results": [
    {
      "scholastic_code": "001",
      "first_name": "Alice",
      "middle_name": "Marie",
      "last_name": "Smith",
      "personal_mailid1": "alice@example.com",
      "province_code": "001",
      "province_name": "Province 1",
      "member_type_code": "002",
      "member_type_name": "Scholastic",
      "nationality_code": "001",
      "nationality_name": "Indian"
    }
  ]
}
```

**Error Response (404):**
```json
{
  "status": false,
  "statuscode": 404,
  "code": "NOT_FOUND",
  "message": "No scholastics found.",
  "results": null
}
```

---

### 6. Get Centres List (Alphabetical)
**Endpoint:** `GET /v1/list-centres-alphabetical`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:**
- `provincecode` (optional): Province code or 'ALL' (default: 'ALL')

**Example Request:**
```
GET http://localhost:3000/v1/list-centres-alphabetical?provincecode=ALL
```

**Success Response (200):**
```json
{
  "status": true,
  "statuscode": 200,
  "code": "FETCHED",
  "message": "Centres list fetched successfully (sorted alphabetically).",
  "results": [
    {
      "centre_code": "001",
      "centre_name": "St. Mary's Centre",
      "centre_place": "Mumbai",
      "city_dist": "Mumbai",
      "pin_zipcode": "400001",
      "province_code": "001",
      "province_name": "Province 1",
      "state_name": "Maharashtra",
      "country_name": "India",
      "division_type_name": "Division Type 1",
      "division_name": "Division 1",
      "apostolate_name": "Education",
      "centre_type_name": "School",
      "language_name": "English",
      "community_house_name": "Community House 1"
    }
  ]
}
```

**Error Response (404):**
```json
{
  "status": false,
  "statuscode": 404,
  "code": "NOT_FOUND",
  "message": "No centres found.",
  "results": null
}
```

---

## 📊 Filter & List Endpoints

### 7. Get Province List
**Endpoint:** `GET /v1/list-province`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Example Request:**
```
GET http://localhost:3000/v1/list-province
```

**Success Response (200):**
```json
{
  "status": true,
  "statuscode": 200,
  "code": "FETCHED",
  "message": "Province list fetched successfully.",
  "results": [
    {
      "province_code": "001",
      "province_name": "Province 1"
    }
  ]
}
```

---

### 8. Get Country List
**Endpoint:** `GET /v1/list-country`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Example Request:**
```
GET http://localhost:3000/v1/list-country
```

**Success Response (200):**
```json
{
  "status": true,
  "statuscode": 200,
  "code": "FETCHED",
  "message": "Country list fetched successfully.",
  "results": [
    {
      "country_code": "001",
      "country_name": "India"
    }
  ]
}
```

---

### 9. Get Confreres Filters
**Endpoint:** `GET /v1/list-confre-filters`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Example Request:**
```
GET http://localhost:3000/v1/list-confre-filters
```

**Success Response (200):**
```json
{
  "status": true,
  "statuscode": 200,
  "code": "FETCHED",
  "message": "Filter list fetched successfully.",
  "results": {
    "member_types": [...],
    "blood_groups": [...],
    "nationalities": [...],
    "languages": [...]
  }
}
```

---

### 10. Get Centre Filters
**Endpoint:** `GET /v1/list-centre-filters`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Example Request:**
```
GET http://localhost:3000/v1/list-centre-filters
```

**Success Response (200):**
```json
{
  "status": true,
  "statuscode": 200,
  "code": "FETCHED",
  "message": "Filter list fetched successfully.",
  "results": {
    "division_types": [...],
    "apostolates": [...],
    "centre_types": [...],
    "countries": [...],
    "states": [...]
  }
}
```

---

### 11. Get Obituary Filters
**Endpoint:** `GET /v1/list-obituary-filters`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Example Request:**
```
GET http://localhost:3000/v1/list-obituary-filters
```

**Success Response (200):**
```json
{
  "status": true,
  "statuscode": 200,
  "code": "FETCHED",
  "message": "Filter list fetched successfully.",
  "results": {
    "member_types": [...],
    "languages": [...],
    "countries": [...]
  }
}
```

---

## 🔍 Search Endpoints

### 12. Find Confreres
**Endpoint:** `POST /v1/find-confreres`

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body:**
```json
{
  "provincecode": "ALL",
  "searchtxt": "John",
  "memtyp": "ALL",
  "bloodgroup": "ALL",
  "natlty": "ALL",
  "languagecode": "ALL",
  "divtyp": "ALL",
  "subdivision": "ALL",
  "destyp": "ALL"
}
```

**Success Response (200):**
```json
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

### 13. Find Scholastics
**Endpoint:** `POST /v1/find-scholastics`

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body:**
```json
{
  "provincecode": "ALL",
  "searchtxt": "Alice",
  "natlty": "ALL"
}
```

**Success Response (200):**
```json
{
  "status": true,
  "statuscode": 200,
  "code": "FETCHED",
  "message": "Scholastics list fetched successfully.",
  "results": [
    {
      "scholastic_code": "001",
      "first_name": "Alice",
      "last_name": "Smith",
      "personal_mailid1": "alice@example.com"
    }
  ]
}
```

---

### 14. Find Centres
**Endpoint:** `POST /v1/find-centres`

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body:**
```json
{
  "provincecode": "ALL",
  "searchtxt": "School",
  "divtyp": "ALL",
  "apostl": "ALL",
  "ctrtyp": "ALL",
  "diocse": "ALL",
  "communitygroup": "ALL",
  "language": "ALL",
  "state": "ALL",
  "country": "ALL"
}
```

**Success Response (200):**
```json
{
  "status": true,
  "statuscode": 200,
  "code": "FETCHED",
  "message": "Center list fetched successfully.",
  "results": [
    {
      "centre_code": "001",
      "centre_name": "St. Mary's School",
      "centre_place": "Mumbai"
    }
  ]
}
```

---

### 15. Find Obituary
**Endpoint:** `POST /v1/find-obituary`

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body:**
```json
{
  "provincecode": "ALL",
  "searchtxt": "",
  "memtyp": "ALL",
  "language": "ALL",
  "dcountry": "ALL",
  "ocountry": "ALL",
  "fromdate": "2024-01-01",
  "todate": "2024-12-31"
}
```

**Success Response (200):**
```json
{
  "status": true,
  "statuscode": 200,
  "code": "FETCHED",
  "message": "Center list fetched successfully.",
  "results": [
    {
      "obituary_code": "001",
      "disease_name": "Natural",
      "death_date": "2024-01-15"
    }
  ]
}
```

---

### 16. Find Anniversary
**Endpoint:** `POST /v1/find-anniversary`

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body:**
```json
{
  "deathdate": "2024-01-15"
}
```

**Success Response (200):**
```json
{
  "status": true,
  "statuscode": 200,
  "code": "FETCHED",
  "message": "Anniversary list fetched successfully.",
  "results": [
    {
      "obituary_code": "001",
      "death_date": "2024-01-15"
    }
  ]
}
```

---

## 👁️ View Details Endpoints

### 17. View Dashboard
**Endpoint:** `POST /v1/view-dashboard`

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body:**
```json
{
  "provincecode": "ALL"
}
```

**Success Response (200):**
```json
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

---

### 18. View Confrere Details
**Endpoint:** `POST /v1/view-confre`

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body:**
```json
{
  "confrercode": "001"
}
```

**Success Response (200):**
```json
{
  "status": true,
  "statuscode": 200,
  "code": "FETCHED",
  "message": "Confrer deatils fetched successfully.",
  "results": {
    "confrer_code": "001",
    "first_name": "John",
    "last_name": "Doe",
    "personal_mailid1": "john@example.com"
  }
}
```

---

### 19. View Scholastic Details
**Endpoint:** `POST /v1/view-scholastic`

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body:**
```json
{
  "scholasticCode": "001"
}
```

**Success Response (200):**
```json
{
  "status": true,
  "statuscode": 200,
  "code": "FETCHED",
  "message": "Scholastic details fetched successfully.",
  "results": {
    "scholastic_code": "001",
    "first_name": "Alice",
    "last_name": "Smith",
    "personal_mailid1": "alice@example.com"
  }
}
```

---

### 20. View Centre Details
**Endpoint:** `POST /v1/view-centre`

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body:**
```json
{
  "centrecode": "001"
}
```

**Success Response (200):**
```json
{
  "status": true,
  "statuscode": 200,
  "code": "FETCHED",
  "message": "Centre deatils fetched successfully.",
  "results": {
    "centre_code": "001",
    "centre_name": "St. Mary's Centre",
    "centre_place": "Mumbai"
  }
}
```

---

## 📱 App Version

### 21. Get App Version
**Endpoint:** `GET /v1/app-version`

**Headers:** None required

**Example Request:**
```
GET http://localhost:3000/v1/app-version
```

**Success Response (200):**
```json
{
  "version": "1.0.0"
}
```

---

## 🚨 Common Error Responses

### Token Expired (401)
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

### Refresh Token Expired (401)
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

### Unauthorized (401)
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

### Not Found (404)
```json
{
  "status": false,
  "statuscode": 404,
  "code": "NOT_FOUND",
  "message": "The requested resource could not be found.",
  "results": null
}
```

### Validation Error (422)
```json
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
```

### Internal Server Error (500)
```json
{
  "status": false,
  "statuscode": 500,
  "code": "INTERNAL_SERVER_ERROR",
  "message": "Internal Server Error. An error occurred while fetching the data.",
  "results": "Error details..."
}
```

---

## 📝 Notes

1. **All protected endpoints** require `Authorization: Bearer <accessToken>` header
2. **Token expiration**: Access token expires in 24 hours, Refresh token expires in 6 months (180 days)
3. **Auto-refresh**: Handle `TOKEN_EXPIRED` by calling `/v1/create-token` endpoint
4. **Force logout**: When `REFRESH_TOKEN_EXPIRED` is received, user must login again
5. **Query parameters**: Use `?provincecode=ALL` for query parameters
6. **Request body**: Always send JSON with `Content-Type: application/json` header

---

**Last Updated:** 2024
**Base URL:** `http://localhost:3000/v1`

