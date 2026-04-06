# Project Scaffolding Plan

This document outlines the step-by-step instructions to scaffold our backend project stack. It is intended to be executed autonomously by an AI agent or a junior engineer.

## Architecture & Tech Stack
- **Runtime & Package Manager**: [Bun](https://bun.sh)
- **Web Framework**: [ElysiaJS](https://elysiajs.com/)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Database**: PostgreSQL (Dockerized)

---

## Execution Steps

### 1. Project Initialization
Initialize the standard Bun project structure. This will create the initial `package.json` and `tsconfig.json`.

```bash
bun init -y
```

*Note: Ensure `tsconfig.json`'s `compilerOptions.types` includes `["bun-types"]` for native Bun types.*

### 2. Install Dependencies
Install all necessary packages.

```bash
# Core dependencies for the server, ORM, and DB Driver
bun add elysia drizzle-orm postgres

# Development dependencies and Type Definitions
bun add -D bun-types typescript drizzle-kit
```

### 3. Environment Variables setup
Create a `.env` file at the project root for configuration. Also ensure you add `.env` to the `.gitignore` file.

```env
# .env
DATABASE_URL="postgres://postgres:postgres@localhost:5432/simple_auth_db"
PORT=3000
```

### 4. PostgreSQL via Docker Compose
Create a `docker-compose.yml` file to spin up a local PostgreSQL instance.

```yaml
# docker-compose.yml
version: '3.8'
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: simple_auth_db
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

**Instruction:** Run `docker-compose up -d` to start the database container in the background.

### 5. Drizzle ORM Configuration
Create `drizzle.config.ts` at the root of the project to tell Drizzle where to find the schema and the database URL.

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
```

Append useful scripts to your `package.json`'s `"scripts"` block:
```json
"scripts": {
  "dev": "bun run --watch src/index.ts",
  "db:generate": "drizzle-kit generate",
  "db:push": "drizzle-kit push",
  "db:studio": "drizzle-kit studio"
}
```

### 6. Database Connection & Initial Schema
Create the database directories and configure the core setup.

#### `src/db/schema.ts`
Establish an initial users table.
```typescript
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

#### `src/db/index.ts`
Export an initialized Drizzle instance using the Postgres driver.
```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

// Disable prefetch to keep transaction behaviors predictable with Drizzle
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
```

### 7. Scaffolding the Elysia Server
Set up the `src/index.ts` file to start the web framework and connect the components.

```typescript
// src/index.ts
import { Elysia } from 'elysia';
import { db } from './db';
import { users } from './db/schema';

const app = new Elysia()
  .get('/', () => 'Hello, simple-auth-ai is running!')
  .get('/users', async () => {
    // Basic test query
    return await db.select().from(users);
  })
  .listen(process.env.PORT || 3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
```

### 8. Validation Instructions
To finalize and verify the scaffold, the executor must run the following verification steps:

1. **Start the database:** `docker-compose up -d`
2. **Apply the schema:** `bun run db:push`
3. **Start the Development server:** `bun run dev`
4. **Health Check:** Make a `GET` request to `http://localhost:3000/` and ensure the API returns a `200 OK` with the greeting.
5. **Database Check:** Make a `GET` request to `http://localhost:3000/users` and ensure it returns an empty `[]` array without errors.
