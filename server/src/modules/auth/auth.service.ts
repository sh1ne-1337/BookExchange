import type { User } from '../../entities/user.entity.js';
import { HttpError } from '../../utils/http-error.js';
import { signAccessToken } from '../../utils/jwt.js';
import { verifyPassword } from '../../utils/password.js';
import { toUserDto, type UserDto } from '../users/users.mapper.js';
import { createUser, findUserWithPasswordByEmail } from '../users/users.service.js';
import type { LoginInput, RegisterInput } from './auth.schemas.js';

const DUMMY_PASSWORD_HASH = '$2b$10$k60JTAYVONtkNBq620NFSOiUT5nQ/aqxGT2U5rUf5ZNZqFgHv0YC6';

export interface AuthResult {
  accessToken: string;
  user: UserDto;
}

function toAuthResult(user: User): AuthResult {
  return { accessToken: signAccessToken(user.id), user: toUserDto(user) };
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  const user = await createUser(input);
  return toAuthResult(user);
}

export async function login({ email, password }: LoginInput): Promise<AuthResult> {
  const user = await findUserWithPasswordByEmail(email);
  const isPasswordValid = await verifyPassword(password, user?.passwordHash ?? DUMMY_PASSWORD_HASH);

  if (!user || !isPasswordValid) throw HttpError.unauthorized('Invalid email or password');

  return toAuthResult(user);
}
