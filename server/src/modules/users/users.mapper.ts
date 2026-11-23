import type { User, UserRole } from '../../entities/user.entity.js';

export interface UserDto {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
  createdAt: Date;
}

export interface UserWithStatsDto extends UserDto {
  booksCount: number;
}

export function toUserDto(user: User): UserDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  };
}

export function toUserWithStatsDto(user: User, booksCount: number): UserWithStatsDto {
  return { ...toUserDto(user), booksCount };
}
