export const UNIQUE_CONSTRAINTS = {
  UQ_users_email: { field: 'email', message: 'A user with this email already exists' },
  UQ_exchange_requests_requester_book: {
    field: undefined,
    message: 'You have already requested an exchange for this book',
  },
} as const;

export type UniqueConstraintName = keyof typeof UNIQUE_CONSTRAINTS;
