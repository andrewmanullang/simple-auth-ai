import { Elysia } from 'elysia';
import { userRoutes } from './routes/user-route';

export const app = new Elysia()
  .get('/', () => 'Hello, simple-auth-ai is running!')
  .use(userRoutes);

app.listen(process.env.PORT || 3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
