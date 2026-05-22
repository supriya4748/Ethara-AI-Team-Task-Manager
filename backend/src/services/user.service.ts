import { RegisterInput } from '../validators/auth.validator';

export const createUserPlaceholder = async (input: RegisterInput) => {
  // Service placeholder for Phase 0
  return {
    id: 'placeholder-uuid',
    email: input.email,
    name: input.name,
    role: input.role || 'MEMBER',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};
