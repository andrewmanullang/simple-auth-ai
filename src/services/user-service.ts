import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { db } from '../db';
import { users } from '../db/schema';

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
