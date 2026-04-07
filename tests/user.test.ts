import { describe, it, expect } from 'bun:test';
import { app } from '../src';

describe('User Authentication', () => {
  const testEmail = `test-${crypto.randomUUID()}@example.com`;
  const testPassword = 'password123';
  let authToken: string;

  describe('Registration', () => {
    it('successfully registers a new user', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Test User',
            email: testEmail,
            password: testPassword,
          }),
        })
      );

      expect(response.status).toBe(200);
      const result = await response.json() as any;
      expect(result.data).toBe('OK');
    });

    it('prevents multiple registrations with the same email', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Another User',
            email: testEmail,
            password: 'anotherPassword',
          }),
        })
      );

      expect(response.status).toBe(400);
      const result = await response.json() as any;
      expect(result.error).toBeDefined();
    });

    it('validates and rejects names longer than 255 characters', async () => {
      const longName = 'a'.repeat(300);
      const response = await app.handle(
        new Request('http://localhost/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: longName,
            email: `long-${crypto.randomUUID()}@example.com`,
            password: testPassword,
          }),
        })
      );

      expect(response.status).toBe(422);
    });

    it('rejects registration with an invalid email format', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Test',
            email: 'not-an-email',
            password: testPassword,
          }),
        })
      );

      expect(response.status).toBe(422);
    });

    it('rejects registration with empty fields', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: '',
            email: '',
            password: '',
          }),
        })
      );

      expect(response.status).toBe(422);
    });
  });

  describe('Login', () => {
    it('returns a session token for valid credentials', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: testEmail,
            password: testPassword,
          }),
        })
      );

      expect(response.status).toBe(200);
      const result = await response.json() as any;
      expect(result.data).toBeDefined();
      authToken = result.data;
    });

    it('denies login with invalid credentials', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: testEmail,
            password: 'wrongPassword',
          }),
        })
      );

      expect(response.status).toBe(400);
      const result = await response.json() as any;
      expect(result.error).toBeDefined();
    });

    it('rejects login with an invalid email format', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'invalid-email',
            password: testPassword,
          }),
        })
      );

      expect(response.status).toBe(422);
    });
  });

  describe('Session Management', () => {
    it('provides user data for requests with a valid session token', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/users/current', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`
          },
        })
      );

      expect(response.status).toBe(200);
      const result = await response.json() as any;
      expect(result.email).toBe(testEmail);
    });

    it('blocks access to protected data without a session token', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/users/current', {
          method: 'GET',
        })
      );

      expect(response.status).toBe(401);
    });

    it('successfully clears the session on logout', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/users/logout', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authToken}`
          },
        })
      );

      expect(response.status).toBe(204);

      // Verify session is actually cleared
      const checkResponse = await app.handle(
        new Request('http://localhost/api/users/current', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`
          },
        })
      );
      expect(checkResponse.status).toBe(401);
    });
  });
});
