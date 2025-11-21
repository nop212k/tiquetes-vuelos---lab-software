import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
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
  @ManyToOne(() => User, (user) => user.mensajes)
  @JoinColumn({ name: "usuario_id" })
  usuario!: User;

  // 🔗 administrador_id → User
  @ManyToOne(() => User)
  @JoinColumn({ name: "administrador_id" })
  administrador!: User;

  // 🔗 chat_id → Chat
  @ManyToOne(() => Chat, (chat) => chat.mensajes)
  @JoinColumn({ name: "chat_id" })
  chat!: Chat;

  @Column("text", { name: "mensaje" })
  mensaje!: string;

  @CreateDateColumn({ name: "fecha" })
  fecha!: Date;

  @Column("boolean", { name: "leido", default: false })
  leido!: boolean;
}
