export const USER_ROLES = ['user', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
  createdAt: string;
}

export interface UserWithStats extends User {
  booksCount: number;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface Book {
  id: string;
  name: string;
  author: string;
  photoUrl: string | null;
  createdAt: string;
  owner: { id: string; name: string };
}

export interface BookDetails extends Book {
  isExchangeRequested: boolean;
}

export const BOOK_SORT_OPTIONS = [
  'name_asc',
  'name_desc',
  'author_asc',
  'author_desc',
  'newest',
] as const;
export type BookSort = (typeof BOOK_SORT_OPTIONS)[number];

export interface IncomingExchangeRequest {
  id: string;
  createdAt: string;
  book: Pick<Book, 'id' | 'name' | 'author' | 'photoUrl'>;
  requester: Pick<User, 'id' | 'name' | 'email'>;
}

export interface Paginated<T> {
  items: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface ApiErrorBody {
  message: string;
  errors?: Record<string, string[] | undefined>;
}
