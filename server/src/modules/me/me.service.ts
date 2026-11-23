import type { User } from '../../entities/user.entity.js';
import { countBooksByOwners } from '../books/books.service.js';
import { toUserWithStatsDto, type UserWithStatsDto } from '../users/users.mapper.js';
import { updateUser } from '../users/users.service.js';
import type { UpdateProfileInput } from './me.schemas.js';

export async function getProfile(user: User): Promise<UserWithStatsDto> {
  const booksCountByOwner = await countBooksByOwners([user.id]);
  return toUserWithStatsDto(user, booksCountByOwner.get(user.id) ?? 0);
}

export async function updateProfile(
  user: User,
  { removeAvatar, ...changes }: UpdateProfileInput,
  uploadedAvatarUrl?: string,
): Promise<UserWithStatsDto> {
  const avatarUrl = uploadedAvatarUrl ?? (removeAvatar ? null : undefined);
  const updatedUser = await updateUser(user, { ...changes, avatarUrl });
  return getProfile(updatedUser);
}
