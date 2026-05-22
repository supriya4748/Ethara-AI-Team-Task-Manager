import { prisma } from '../config/database';
import { RegisterInput, LoginInput } from '../validators/auth.validator';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'MEMBER';
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  user: UserResponse;
  token: string;
}

/**
 * Registers a new user inside PostgreSQL database
 */
export const registerUser = async (input: RegisterInput): Promise<AuthResponse> => {
  const { email, password, name, role } = input;

  // 1. Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    const error = new Error('Email address already registered') as any;
    error.statusCode = 409;
    throw error;
  }

  // 2. Hash password securely
  const passwordHash = await hashPassword(password);

  // 3. Save new user into the database
  const newUser = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      role: role || 'MEMBER',
    },
  });

  // 4. Generate authentic session token
  const token = generateToken({
    id: newUser.id,
    email: newUser.email,
    role: newUser.role,
  });

  return {
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    },
    token,
  };
};

/**
 * Authenticates user credentials against the stored database record
 */
export const loginUser = async (input: LoginInput): Promise<AuthResponse> => {
  const { email, password } = input;

  // 1. Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    const error = new Error('Invalid email or password credentials') as any;
    error.statusCode = 401;
    throw error;
  }

  // 2. Verify hashed password correctness
  const isPasswordValid = await comparePassword(password, user.passwordHash);
  if (!isPasswordValid) {
    const error = new Error('Invalid email or password credentials') as any;
    error.statusCode = 401;
    throw error;
  }

  // 3. Generate authentic session token
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    token,
  };
};

/**
 * Resolves a user's details by id
 */
export const getUserProfile = async (userId: string): Promise<UserResponse> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    const error = new Error('User not found in database') as any;
    error.statusCode = 444;
    throw error;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

/**
 * Resolves all users from the database
 */
export const getAllUsers = async (): Promise<UserResponse[]> => {
  const users = await prisma.user.findMany({
    orderBy: { name: 'asc' },
  });
  return users.map(user => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }));
};
