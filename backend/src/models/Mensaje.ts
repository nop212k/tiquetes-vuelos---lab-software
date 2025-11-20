import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
} from "typeorm";

import { User } from "./User";
import { Chat } from "./Chat";

@Entity("messages")
export class Mensaje {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Chat, (chat) => chat.mensajes)
  chat!: Chat;

  @ManyToOne(() => User, (user) => user.mensajes)
  sender!: User;

  @Column("text")
  message!: string;

  @CreateDateColumn()
  created_at!: Date;
}
