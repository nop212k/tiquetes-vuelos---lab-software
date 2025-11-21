import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  Column,
  CreateDateColumn,
  JoinColumn,
} from "typeorm";

import { User } from "./User";
import { Chat } from "./Chat";

@Entity("mensajes")
export class Mensaje {
  @PrimaryGeneratedColumn()
  id!: number;

  // 🔗 usuario_id → User
  @ManyToOne(() => User, (user) => user.mensajes, { nullable: true })
  @JoinColumn({ name: "usuario_id" })
  usuario!: User;

  // 🔗 administrador_id → User
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "administrador_id" })
  administrador!: User;

  // 🔗 chat_id → Chat
  @ManyToOne(() => Chat, (chat) => chat.mensajes, { onDelete: "CASCADE" })
  @JoinColumn({ name: "chat_id" })
  chat!: Chat;

  @Column("text", { name: "mensaje" })
  mensaje!: string;

  @CreateDateColumn({ name: "fecha" })
  fecha!: Date;

  @Column("boolean", { name: "leido", default: false })
  leido!: boolean;
}
