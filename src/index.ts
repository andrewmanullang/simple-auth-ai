import { Elysia } from 'elysia';
import { userRoutes } from './routes/user-route';

const app = new Elysia()
  .get('/', () => 'Hello, simple-auth-ai is running!')
  .use(userRoutes)
  .listen(process.env.PORT || 3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
