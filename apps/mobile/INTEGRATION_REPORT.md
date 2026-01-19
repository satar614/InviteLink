# Backend Integration Report

**Generated:** January 19, 2026  
**Backend:** SmartInvite.Api (C# / ASP.NET Core 8.0)

## Summary

The backend is currently a minimal ASP.NET Core Web API scaffolded with Swagger/OpenAPI support. At this stage, it contains only the default `WeatherForecastController` and has no invite-specific endpoints implemented yet.

---

## OpenAPI/Swagger

**Status:** ✅ Enabled (Development only)

- **Swagger UI URL:** `https://localhost:<port>/swagger` (when running in development mode)
- **OpenAPI JSON:** `https://localhost:<port>/swagger/v1/swagger.json`

The backend uses **Swashbuckle.AspNetCore v6.6.2** to auto-generate OpenAPI documentation.

### Action Items
- Once invite endpoints are implemented in the backend, download the OpenAPI spec from `/swagger/v1/swagger.json` and save it to `apps/mobile/openapi.json`.
- Generate TypeScript types using:
  ```bash
  npx openapi-typescript ./apps/mobile/openapi.json --output ./apps/mobile/src/types/api-types.ts
  ```

---

## Authentication

**Status:** ⚠️ Not Implemented

The backend currently has no authentication mechanism configured. Based on the project requirements (InviteLink - guest management with RSVP), the expected auth flow will likely be:

### Expected Auth Pattern (to be implemented)
- **Type:** Bearer Token (JWT) or Phone-based magic link
- **Login Endpoint (proposed):** `POST /api/auth/login`
  - Request:
    ```json
    {
      "phone": "+1234567890"
    }
    ```
  - Response:
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 3600
    }
    ```

- **Authorization Header:** `Authorization: Bearer <token>`

### Action Items
- Coordinate with backend team to implement auth endpoints.
- Update mobile `AuthContext` once endpoints are live.
- Add token refresh logic if needed.

---

## API Endpoints

### Current State
The backend only exposes one sample endpoint:

#### `GET /WeatherForecast`
- **Description:** Returns sample weather data (template endpoint)
- **Auth Required:** No
- **Response:**
  ```json
  [
    {
      "date": "2026-01-20",
      "temperatureC": 15,
      "temperatureF": 59,
      "summary": "Mild"
    }
  ]
  ```

---

### Expected Invite Endpoints (to be implemented)

Based on the project README and domain requirements, the following endpoints are expected:

#### 1. **Create Invite**
`POST /api/invites`

**Request:**
```json
{
  "guestName": "John Doe",
  "phone": "+1234567890",
  "allowedPlusOnes": 2,
  "eventId": "nikah-2026"
}
```

**Response:**
```json
{
  "inviteId": "abc123",
  "qrCodeUrl": "https://api.invitelink.com/invites/abc123/qr",
  "rsvpUrl": "https://invitelink.com/rsvp/abc123"
}
```

---

#### 2. **Get Invite Details**
`GET /api/invites/{inviteId}`

**Response:**
```json
{
  "inviteId": "abc123",
  "guestName": "John Doe",
  "phone": "+1234567890",
  "allowedPlusOnes": 2,
  "rsvpStatus": "pending",
  "checkedIn": false
}
```

---

#### 3. **Submit RSVP**
`POST /api/invites/{inviteId}/rsvp`

**Request:**
```json
{
  "attending": true,
  "plusOnes": [
    { "name": "Jane Doe", "phone": "+1234567891" }
  ],
  "parkingRequired": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "RSVP submitted successfully"
}
```

---

#### 4. **Check-In Guest**
`POST /api/invites/{inviteId}/checkin`

**Request:**
```json
{
  "scannedAt": "2026-01-20T18:30:00Z",
  "scannedBy": "Security Station 1"
}
```

**Response:**
```json
{
  "success": true,
  "guestName": "John Doe",
  "allowedPlusOnes": 2,
  "checkedInCount": 1
}
```

---

## Base URL Configuration

### Local Development
```
http://localhost:5000
```
or
```
https://localhost:5001
```

### PR Preview Backend
The repository's CI/CD provisions preview backends for each PR. The URL format is typically:
```
https://pr-<pr-number>-api.azurewebsites.net
```

Mobile app developers should set `REACT_NATIVE_API_URL` in `.env` to point to the appropriate backend.

---

## Headers & Query Params

### Expected Headers (once auth is implemented)
- `Authorization: Bearer <token>` (for authenticated requests)
- `Content-Type: application/json`

### No Special Query Params
Standard REST query params may be used for pagination/filtering in list endpoints (e.g., `GET /api/invites?eventId=xyz&page=1`).

---

## Next Steps

1. **Backend Team Actions:**
   - Implement invite CRUD endpoints
   - Add JWT authentication
   - Expose invite-specific models and validation

2. **Mobile Team Actions:**
   - Use this report to scaffold API client with placeholder endpoints
   - Mock responses for local development/testing
   - Update client once backend endpoints are live
   - Download OpenAPI spec and generate TypeScript types

3. **Integration Testing:**
   - Test against PR preview backends
   - Validate QR code scanning flow
   - Test RSVP and check-in workflows end-to-end

---

## References

- Backend codebase: `backend/SmartInvite.Api/`
- Project README: [README.md](../../README.md)
- Swagger UI (dev): `https://localhost:<port>/swagger`
