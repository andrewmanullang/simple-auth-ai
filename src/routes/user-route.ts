import { Elysia, t } from 'elysia';
import { registerUser, loginUser, getCurrentUser, logoutUser } from '../services/user-service';

export const userRoutes = new Elysia({ prefix: '/api' })
  .post('/users', async ({ body, set }) => {
    const result = await registerUser(body);

    if (result.error) {
      set.status = 400;
      return result;
    }

    return result;
  }, {
    body: t.Object({
      name: t.String({ maxLength: 255, minLength: 1 }),
      email: t.String({ format: 'email', maxLength: 255, minLength: 1 }),
      password: t.String({ maxLength: 255, minLength: 1 })
    })
  })
  .post('/users/login', async ({ body, set }) => {
    const result = await loginUser(body);

    if (result.error) {
      set.status = 400;
      return result;
    }

    return result;
  }, {
    body: t.Object({
      email: t.String({ format: 'email', maxLength: 255, minLength: 1 }),
      password: t.String({ maxLength: 255, minLength: 1 })
    })
  })
  .derive(({ headers }) => {
    const auth = headers['authorization'];
    if (auth && auth.startsWith('Bearer ')) {
      return { token: auth.replace('Bearer ', '') };
    }
    return { token: null };
  })
  .get('/users/current', async ({ token, set }) => {
    if (!token) {
      set.status = 401;
      return { error: 'Unauthorized' };
    }

    const result = await getCurrentUser(token);

    if (result.error) {
      set.status = 401;
      return result;
    }

    return result.data;
  })
  .delete('/users/logout', async ({ token, set }) => {
    if (!token) {
      set.status = 401;
      return { error: 'Unauthorized' };
    }

    await logoutUser(token);
    set.status = 204;
    return;
  });
