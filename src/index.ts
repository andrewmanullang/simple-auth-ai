import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { userRoutes } from './routes/user-route';

const toFieldLabel = (path: string) => {
  const field = path.replace(/^\//, '');
  if (!field) return 'Field';
  return field.charAt(0).toUpperCase() + field.slice(1);
};

const toUserMessage = (path: string, summary?: string) => {
  const label = toFieldLabel(path);
  if (summary?.includes('email')) return `${label} must be a valid email address`;
  if (summary?.includes('greater or equal to 1')) return `${label} is required`;
  return `${label} is invalid`;
};

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
  .onError(({ code, error, set }) => {
    if (code === 'VALIDATION') {
      const errors = ((error as any)?.all ?? []) as Array<{ path?: string; summary?: string }>;
      const fieldErrors: Record<string, string> = {};

      for (const item of errors) {
        const path = item.path ?? '';
        if (!path) continue;
        const field = path.replace(/^\//, '');
        if (!fieldErrors[field]) {
          fieldErrors[field] = toUserMessage(path, item.summary);
        }
      }

      set.status = 400;
      return {
        error: 'Validation failed',
        fields: fieldErrors
      };
    }
  })
  .get('/', () => 'Hello, simple-auth-ai is running!')
  .use(userRoutes);

app.listen(process.env.PORT || 3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
