# Implementation Plan: Get Current User Endpoint

This plan outlines the steps for a junior developer to implement the `GET /api/users/current` endpoint, allowing authenticated users to retrieve their profile using a session token.

## 1. Implement the Service Logic

Add a function to retrieve the user's profile based on their active session token.

**File:** `src/services/user-service.ts`

- Add a new exported function `getCurrentUser(token: string)`.
- Make it `async`.
- **Step 1:** Query the `users` table, joining it with the `sessions` table where `sessions.token` matches the provided token.
  *(Example with Drizzle: `await db.select({ id: users.id, name: users.name, email: users.email, createdAt: users.createdAt }).from(users).innerJoin(sessions, eq(users.id, sessions.userId)).where(eq(sessions.token, token)).limit(1)`)*
- **Step 2:** If no user is found, return `null` or a specific error indicator.
- **Step 3:** Return the user's details: `id`, `name`, `email`, and `createdAt`.

## 2. Implement the Controller Route

Expose the endpoint and handle the `Authorization` header.

**File:** `src/routes/user-route.ts`

- Chain a new `.get('/users/current', async ({ headers, set }) => { ... })` route onto the existing Elysia instance.
- **Step 1:** Extract the `authorization` header from the `headers` object.
- **Step 2:** Ensure the header exists and starts with `Bearer `. If not, set `set.status = 401` and return `{"error": "Unauthorized"}`.
- **Step 3:** Extract the token string (remove the `Bearer ` prefix).
- **Step 4:** Call your new `getCurrentUser(token)` service function.
- **Step 5:** If the service returns a user, return it in the response.
- **Step 6:** If the service returns no user (invalid token), set `set.status = 401` and return `{"error": "Unauthorized"}`.

## 3. Verification

Verify the implementation with these manual tests:

1. **Successful Profile Retrieval:**
   - Login first to receive a valid session token.
   - Send a GET request to `http://localhost:3000/api/users/current` with the header `Authorization: Bearer <your-token>`.
   - Expected Output (200 OK): `{"id": 1, "name": "andrew", "email": "andrew@gmail.com", "createdAt": "..."}`.

2. **Expired or Invalid Token:**
   - Send the same GET request but with an altered or non-existent token.
   - Expected Output (401 Unauthorized): `{"error": "Unauthorized"}`.

3. **Missing Authorization Header:**
   - Send the GET request without any `Authorization` header.
   - Expected Output (401 Unauthorized): `{"error": "Unauthorized"}`.
