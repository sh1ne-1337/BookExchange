import { env } from '../config/env.js';
import { Book } from '../entities/book.entity.js';
import { User, UserRole } from '../entities/user.entity.js';
import { hashPassword } from '../utils/password.js';
import { AppDataSource } from './data-source.js';

const DEMO_PASSWORD = 'Password123';

const coverByIsbn = (isbn: string) =>
  `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`;
const coverById = (coverId: number) =>
  `https://covers.openlibrary.org/b/id/${coverId}-L.jpg?default=false`;

function demoEmail(alias: string): string {
  if (!env.DEMO_EMAIL) return `${alias}@bookexchange.local`;

  const [localPart, domain] = env.DEMO_EMAIL.toLowerCase().split('@');
  return `${localPart}+${alias}@${domain}`;
}

const DEMO_USERS = [
  {
    name: 'Admin',
    email: demoEmail('admin'),
    role: UserRole.Admin,
    books: [],
  },
  {
    name: 'Olena Kovalenko',
    email: demoEmail('olena'),
    role: UserRole.User,
    books: [
      ['1984', 'George Orwell', coverByIsbn('9780451524935')],
      ['The Great Gatsby', 'F. Scott Fitzgerald', coverByIsbn('9780743273565')],
      ['To Kill a Mockingbird', 'Harper Lee', coverByIsbn('9780061120084')],
      ['The Hobbit', 'J.R.R. Tolkien', coverByIsbn('9780547928227')],
      ['Pride and Prejudice', 'Jane Austen', coverByIsbn('9780141439518')],
      ['Brave New World', 'Aldous Huxley', coverByIsbn('9780060850524')],
      ['Fahrenheit 451', 'Ray Bradbury', coverByIsbn('9781451673319')],
      ['The Alchemist', 'Paulo Coelho', coverByIsbn('9780062315007')],
      ['Kobzar', 'Taras Shevchenko', coverById(6826629)],
    ],
  },
  {
    name: 'Andrii Melnyk',
    email: demoEmail('andrii'),
    role: UserRole.User,
    books: [
      ['Dune', 'Frank Herbert', coverByIsbn('9780441172719')],
      ['Foundation', 'Isaac Asimov', coverByIsbn('9780553293357')],
      ['Clean Code', 'Robert C. Martin', coverByIsbn('9780132350884')],
      ['The Pragmatic Programmer', 'Andrew Hunt, David Thomas', coverByIsbn('9780201616224')],
      ['Voroshilovgrad', 'Serhiy Zhadan', coverById(12649478)],
      ['The Orphanage', 'Serhiy Zhadan', coverById(10710124)],
      ['The Catcher in the Rye', 'J.D. Salinger', coverByIsbn('9780316769488')],
      ['The Lord of the Rings', 'J.R.R. Tolkien', coverByIsbn('9780544003415')],
    ],
  },
  {
    name: 'Iryna Shevchenko',
    email: demoEmail('iryna'),
    role: UserRole.User,
    books: [
      ['Death and the Penguin', 'Andrey Kurkov', coverById(915096)],
      ['Grey Bees', 'Andrey Kurkov', coverById(14721961)],
      ['The Museum of Abandoned Secrets', 'Oksana Zabuzhko', coverById(7624755)],
      ['The Forest Song', 'Lesya Ukrainka', coverById(13270722)],
      ['JavaScript: The Good Parts', 'Douglas Crockford', coverByIsbn('9780596517748')],
      ["Harry Potter and the Sorcerer's Stone", 'J.K. Rowling', coverByIsbn('9780590353427')],
      ['Sapiens', 'Yuval Noah Harari', coverByIsbn('9780062316097')],
      ['Atomic Habits', 'James Clear', coverByIsbn('9780735211292')],
    ],
  },
] as const;

async function seed() {
  await AppDataSource.initialize();
  const userRepository = AppDataSource.getRepository(User);

  if ((await userRepository.count()) > 0) {
    console.log('Database already contains data, skipping seed.');
    return;
  }

  const passwordHash = await hashPassword(DEMO_PASSWORD);

  await AppDataSource.transaction(async (manager) => {
    for (const { books, ...userData } of DEMO_USERS) {
      const user = await manager.save(User, manager.create(User, { ...userData, passwordHash }));
      await manager.save(
        Book,
        books.map(([name, author, photoUrl]) =>
          manager.create(Book, { name, author, photoUrl, owner: user }),
        ),
      );
    }
  });

  console.log('Seeded demo users (password for all accounts: %s):', DEMO_PASSWORD);
  console.table(DEMO_USERS.map(({ email, role, books }) => ({ email, role, books: books.length })));
}

seed()
  .catch((error: unknown) => {
    console.error('Seeding failed', error);
    process.exitCode = 1;
  })
  .finally(() => AppDataSource.destroy());
