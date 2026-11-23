import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { User } from './user.entity.js';

@Entity('books')
export class Book {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 200 })
  author: string;

  @Column({ type: 'varchar', nullable: true })
  photoUrl: string | null;

  @Index()
  @Column({ type: 'uuid' })
  ownerId: string;

  @ManyToOne(() => User, (user) => user.books, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  owner: Relation<User>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
