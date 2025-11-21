import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  Column,
  CreateDateColumn,
  JoinColumn
} from "typeorm";

import { User } from "./User";
import { Mensaje } from "./Mensaje";

@Entity("chats")
export class Chat {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.chats)
  @JoinColumn({ name: "cliente_id" })
  cliente!: User;

  @OneToMany(() => Mensaje, (mensaje) => mensaje.chat)
  mensajes!: Mensaje[];

  @CreateDateColumn()
  creado_en!: Date;
}
