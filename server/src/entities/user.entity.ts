import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
  type Relation,
} from 'typeorm';
import type { UniqueConstraintName } from '../database/unique-constraints.js';
import { Book } from './book.entity.js';

export enum UserRole {
  User = 'user',
  Admin = 'admin',
}

const EMAIL_CONSTRAINT: UniqueConstraintName = 'UQ_users_email';

@Entity('users')
@Unique(EMAIL_CONSTRAINT, ['email'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', select: false })
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.User })
  role: UserRole;

  @Column({ type: 'varchar', nullable: true })
  avatarUrl: string | null;

  @Column({ type: 'varchar', nullable: true, select: false })
  passwordResetTokenHash: string | null;

  @Column({ type: 'timestamptz', nullable: true, select: false })
  passwordResetExpiresAt: Date | null;

  @OneToMany(() => Book, (book) => book.owner)
  books: Relation<Book[]>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
