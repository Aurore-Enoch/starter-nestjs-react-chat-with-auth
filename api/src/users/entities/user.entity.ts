import { Message } from 'src/messages/entities/message.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @OneToMany(() => Message, (message) => message.user)
  messages: Message[];

  @ManyToMany(() => Message, (message) => message.likedBy)
  likedMessages: Message[];
}
