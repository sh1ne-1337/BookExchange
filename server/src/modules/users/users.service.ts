import { AppDataSource } from '../../database/data-source.js';
import { Book } from '../../entities/book.entity.js';
import { User } from '../../entities/user.entity.js';
import { removeUploadedFile } from '../../lib/uploads.js';
import { HttpError } from '../../utils/http-error.js';
import { getOffset, toPaginated, type Paginated } from '../../utils/pagination.js';
import { hashPassword } from '../../utils/password.js';
import { escapeLikePattern } from '../../utils/validation.js';
import { countBooksByOwners } from '../books/books.service.js';
import { toUserWithStatsDto, type UserWithStatsDto } from './users.mapper.js';
import type { CreateUserInput, ListUsersQuery, UpdateUserInput } from './users.schemas.js';

const userRepository = AppDataSource.getRepository(User);
const bookRepository = AppDataSource.getRepository(Book);

interface UserChanges extends UpdateUserInput {
  avatarUrl?: string | null;
}

async function findUserByIdOrFail(id: string): Promise<User> {
  const user = await userRepository.findOneBy({ id });
  if (!user) throw HttpError.notFound('User not found');
  return user;
}

export function findUserWithPasswordByEmail(email: string): Promise<User | null> {
  return userRepository
    .createQueryBuilder('user')
    .addSelect('user.passwordHash')
    .where('user.email = :email', { email })
    .getOne();
}

export async function createUser({ password, ...input }: CreateUserInput): Promise<User> {
  const user = userRepository.create({ ...input, passwordHash: await hashPassword(password) });
  return userRepository.save(user);
}

export async function updateUser(user: User, { password, ...changes }: UserChanges): Promise<User> {
  const previousAvatarUrl = user.avatarUrl;
  userRepository.merge(user, changes);
  if (password) user.passwordHash = await hashPassword(password);

  const savedUser = await userRepository.save(user);
  if (changes.avatarUrl !== undefined && previousAvatarUrl !== changes.avatarUrl) {
    await removeUploadedFile(previousAvatarUrl);
  }
  return savedUser;
}

export async function listUsers({
  search,
  ...pagination
}: ListUsersQuery): Promise<Paginated<UserWithStatsDto>> {
  const query = userRepository.createQueryBuilder('user');

  if (search) {
    query.where('(user.name ILIKE :search OR user.email ILIKE :search)', {
      search: `%${escapeLikePattern(search)}%`,
    });
  }

  const [users, total] = await query
    .orderBy('user.createdAt', 'DESC')
    .offset(getOffset(pagination))
    .limit(pagination.limit)
    .getManyAndCount();

  const booksCountByOwner = await countBooksByOwners(users.map((user) => user.id));
  const items = users.map((user) => toUserWithStatsDto(user, booksCountByOwner.get(user.id) ?? 0));

  return toPaginated(items, total, pagination);
}

export async function updateUserAsAdmin(
  id: string,
  input: UpdateUserInput,
  admin: User,
): Promise<UserWithStatsDto> {
  if (id === admin.id && input.role && input.role !== admin.role) {
    throw HttpError.badRequest('You cannot change your own role');
  }

  const user = await updateUser(await findUserByIdOrFail(id), input);
  const booksCountByOwner = await countBooksByOwners([user.id]);
  return toUserWithStatsDto(user, booksCountByOwner.get(user.id) ?? 0);
}

export async function deleteUserAsAdmin(id: string, admin: User): Promise<void> {
  if (id === admin.id) throw HttpError.badRequest('You cannot delete your own account');

  const user = await findUserByIdOrFail(id);
  const books = await bookRepository.find({ where: { ownerId: id }, select: { photoUrl: true } });

  await userRepository.remove(user);

  const uploadedFiles = [user.avatarUrl, ...books.map((book) => book.photoUrl)];
  await Promise.all(uploadedFiles.map(removeUploadedFile));
}
