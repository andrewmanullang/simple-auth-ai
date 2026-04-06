import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { db } from '../db';
import { users, sessions } from '../db/schema';

export const registerUser = async ({ name, email, password }: any) => {
  // 1. Check if user already exists
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return { error: 'email is already exist' };
  }

  // 2. Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Insert new user
  await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  });

  return { data: 'OK' };
};

export const loginUser = async ({ email, password }: any) => {
  // 1. Find user by email
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    return { error: 'email or password is incorrect' };
  }

  // 2. Verify password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return { error: 'email or password is incorrect' };
  }

  // 3. Generate token and upsert session
  const token = crypto.randomUUID();
  await db
    .insert(sessions)
    .values({
      token,
      userId: user.id,
    })
    .onConflictDoUpdate({
      target: sessions.userId,
      set: { token },
    });

  return { data: token };
};

export const getCurrentUser = async (token: string) => {
  // Find user by session token
  const [result] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
    })
    .from(users)
    .innerJoin(sessions, eq(users.id, sessions.userId))
    .where(eq(sessions.token, token))
    .limit(1);

  if (!result) {
    return { error: 'Unauthorized' };
  }

  return { data: result };
};
