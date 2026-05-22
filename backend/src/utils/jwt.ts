import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_ethara_task_manager';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generates a signed JWT token
 * @param payload Payload containing user id, email, role, etc.
 * @returns Signed JWT string
 */
export const generateToken = (payload: object): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as any,
  });
};

/**
 * Verifies a signed JWT token
 * @param token JWT string
 * @returns Decoded payload
 */
export const verifyToken = (token: string): any => {
  return jwt.verify(token, JWT_SECRET);
};
