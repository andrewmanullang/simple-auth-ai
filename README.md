# Simple Auth AI

A modern, fast, and secure authentication backend built with Bun and ElysiaJS. This project implements ticket-based session management, securely storing hashed passwords and handling session tokens via PostgreSQL.

## 🏗 Architecture

The application is built using a RESTful architecture, divided into clean layers specifically configured for performance and type-safety:

- **Routing Layer (Elysia)**: Handles HTTP requests, ensures type validation via `@sinclair/typebox`, and handles payload sanitization.
- **Service Layer**: Contains the core business logic (user registration, password hashing using `bcrypt`, login handling, and session validation).
- **Data Access Layer (Drizzle ORM)**: Provides type-safe database queries against PostgreSQL.

The authentication mechanism uses **Opaque Bearer Tokens**. Rather than using stateless JWTs, login generates a UUID session token stored directly in the database (`sessions` table) and linked to the user. This allows for immediate, guaranteed session revocation upon logout.

## 📂 File Structure

```text
simple-auth-ai/
├── src/
│   ├── db/                 # Database connection and Drizzle schema definition
│   │   ├── index.ts
│   │   └── schema.ts
│   ├── routes/             # Elysia route handlers with TypeBox schema validation
│   │   └── user-route.ts
│   ├── services/           # Authentication and business logic operations
│   │   └── user-service.ts
│   └── index.ts            # Application entry point & configuration
├── tests/                  # Behavior-driven unit testing suite
│   └── user.test.ts
├── drizzle/                # Auto-generated Drizzle database migrations
├── docker-compose.yml      # PostgreSQL container definitions
├── package.json            # Scripts and dependencies
└── README.md
```

## 💻 Tech Stacks

- **Runtime Environment**: [Bun](https://bun.sh/)
- **Web Framework**: [ElysiaJS](https://elysiajs.com/)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Database**: PostgreSQL (managed via Docker)
- **Validation**: TypeBox (Integrated within Elysia)
- **Security Logic**: `crypto` & `bcrypt`
- **Testing**: Built-in Bun Test Runner (`bun:test`)

## 🛣 Endpoints

All endpoints are prefixed with `/api`.

| Method | Endpoint             | Description                                | Request Body / Headers                             | Responses                       |
| ------ | -------------------- | ------------------------------------------ | -------------------------------------------------- | ------------------------------- |
| POST   | `/users`             | Register a new user                        | `{ name, email, password }`                        | `200 OK`, `400/422 Bad Request` |
| POST   | `/users/login`       | Authenticate user and receive a token      | `{ email, password }`                              | `200 OK`, `400/422 Bad Request` |
| GET    | `/users/current`     | Retrieve data for the authenticated user   | `Authorization: Bearer <token>`                    | `200 OK`, `401 Unauthorized`    |
| DELETE | `/users/logout`      | Terminate session (delete token from DB)   | `Authorization: Bearer <token>`                    | `204 No Content`, `401 Unauthorized` |

> *Note: Route schema validations correctly enforce `maxLength: 255` and `minLength: 1` limits on input fields to align with the database constraints.*

## 🚀 Installation and Setup

### Prerequisites
- [Bun](https://bun.sh/) installed locally
- Docker Desktop or Docker Engine installed

### Getting Started

**1. Clone the repository and install dependencies**
```bash
bun install
```

**2. Setup Environment Variables**
Ensure you have a `.env` file at the root. Example `.env`:
```ini
DATABASE_URL=postgres://user:password@localhost:5432/simpleauth
PORT=3000
```

**3. Start the Database**
Spin up PostgreSQL via Docker Compose:
```bash
docker-compose up -d
```

**4. Run Database Migrations**
Sync the structured schema with your local Postgres container:
```bash
bun run db:push
```

**5. Start the Development Server**
```bash
bun run dev
```
By default, the Elysia server runs on `localhost:3000`.

## 🧪 Tests

This project features a comprehensive **behavior-driven unit testing suite**. It focuses entirely on defining the outcome of the public API endpoints, shielding the test suite from internal refactors.

### Run Tests
```bash
bun test
```

### Covered Behaviors
- **Registration**: Successfully creates new user, prevents duplicate emails, handles oversized validations, and validates email formats and empty inputs.
- **Login**: Issues active session tokens on correct credentials and rejects incorrect values properly.
- **Session Management**: Permits access via a valid token, denies restricted paths without a token, and effectively clears/revokes sessions upon logout.
