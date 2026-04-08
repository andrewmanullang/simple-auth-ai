import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { userRoutes } from './routes/user-route';

export const app = new Elysia()
  .use(swagger({
    documentation: {
      info: {
        title: 'Simple Auth AI API',
        version: '1.0.0',
        description: 'API documentation for the Simple Auth AI authentication service.'
      },
      tags: [
        { name: 'Auth', description: 'Authentication endpoints' }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      }
    }
  }))
  .get('/', () => 'Hello, simple-auth-ai is running!')
  .use(userRoutes);

app.listen(process.env.PORT || 3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
