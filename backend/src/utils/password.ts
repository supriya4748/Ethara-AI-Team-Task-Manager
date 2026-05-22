import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hashes a plaintext password using bcryptjs
 * @param password Plaintext password
 * @returns Hashed password string
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compares a plaintext password against a stored hashed password
 * @param password Plaintext password
 * @param hash Stored hashed password
 * @returns True if matching, false otherwise
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
