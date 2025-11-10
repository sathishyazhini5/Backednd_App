# ⚡ Quick Reference - Frontend Developer

## 🚨 Most Important: Token Error Handling

### 1. TOKEN_EXPIRED (Access Token Expired)
```javascript
if (response.code === 'TOKEN_EXPIRED') {
  // Auto-refresh - Don't show error to user
  const newToken = await refreshToken();
  // Retry original request
}
```

### 2. REFRESH_TOKEN_EXPIRED (6 Months Passed)
```javascript
if (response.code === 'REFRESH_TOKEN_EXPIRED') {
  // Force logout - Show login screen
  logout();
  showMessage("Session expired. Please login again.");
}
```

---

## 📋 Standard Response Structure

```json
{
  "status": true/false,
  "statuscode": 200/401/404/etc,
  "code": "TOKEN_EXPIRED" | "REFRESH_TOKEN_EXPIRED" | "FETCHED" | etc,
  "message": "Human readable message",
  "results": { /* data or error details */ }
}
```

---

## 🔑 Token Storage

**Store these after login:**
- `accessToken` - Use for API calls (expires in 24h)
- `refreshToken` - Use to refresh access token (expires in 6 months)

**Always include in API calls:**
```
Authorization: Bearer <accessToken>
```

---

## 🔄 Auto Token Refresh Pattern

```javascript
async function apiCall(endpoint, options) {
  let response = await fetch(endpoint, {
    ...options,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      ...options.headers
    }
  });
  
  let data = await response.json();
  
  // Auto-refresh if token expired
  if (data.code === 'TOKEN_EXPIRED') {
    await refreshToken();
    // Retry request
    return apiCall(endpoint, options);
  }
  
  return data;
}
```

---

## 📱 All Error Codes

| Code | Action |
|------|--------|
| `TOKEN_EXPIRED` | Auto-refresh token |
| `REFRESH_TOKEN_EXPIRED` | Force logout |
| `UNAUTHORIZED` | Force logout |
| `TOKEN_NOT_PROVIDED` | Show login |
| `NOT_FOUND` | Show error |
| `VALIDATION_ERROR` | Show validation error |

---

## 📚 Full Documentation

- **Complete Guide:** `FRONTEND_DEVELOPER_GUIDE.md`
- **Response Examples:** `API_RESPONSE_EXAMPLES.md`
- **This Quick Ref:** `QUICK_REFERENCE.md`

---

**Key Point:** Always check `response.code` before `response.status`!

