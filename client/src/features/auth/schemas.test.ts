import { describe, expect, it } from 'vitest';
import { registerSchema } from './schemas';

const validValues = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  password: 'Password123',
  confirmPassword: 'Password123',
};

describe('registerSchema', () => {
  it('accepts valid values', () => {
    expect(registerSchema.safeParse(validValues).success).toBe(true);
  });

  it('reports mismatched passwords on the confirmation field', () => {
    const result = registerSchema.safeParse({ ...validValues, confirmPassword: 'Different123' });

    expect(result.error?.issues).toEqual([
      expect.objectContaining({ path: ['confirmPassword'], message: 'Passwords do not match' }),
    ]);
  });

  it('enforces the same password rules as the API', () => {
    const result = registerSchema.safeParse({
      ...validValues,
      password: 'short',
      confirmPassword: 'short',
    });

    expect(result.error?.issues[0]).toMatchObject({ path: ['password'] });
  });
});
