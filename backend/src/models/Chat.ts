import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  Column,
  CreateDateColumn,
} from "typeorm";

import { User } from "./User";
import { Mensaje } from "./Mensaje";

@Entity("chats")
export class Chat {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.chats)
  cliente!: User;

  @OneToMany(() => Mensaje, (mensaje) => mensaje.chat)
  mensajes!: Mensaje[];

  @CreateDateColumn()
  creado_en!: Date;
}
