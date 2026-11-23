import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  type Relation,
} from 'typeorm';
import type { UniqueConstraintName } from '../database/unique-constraints.js';
import { Book } from './book.entity.js';
import { User } from './user.entity.js';

const ONE_REQUEST_PER_BOOK_CONSTRAINT: UniqueConstraintName = 'UQ_exchange_requests_requester_book';

@Entity('exchange_requests')
@Unique(ONE_REQUEST_PER_BOOK_CONSTRAINT, ['requesterId', 'bookId'])
export class ExchangeRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  requesterId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requesterId' })
  requester: Relation<User>;

  @Column({ type: 'uuid' })
  bookId: string;

  @ManyToOne(() => Book, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bookId' })
  book: Relation<Book>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
