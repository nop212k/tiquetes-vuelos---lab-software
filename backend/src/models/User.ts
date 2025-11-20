// src/models/User.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { OneToMany } from "typeorm";
import { Chat } from "./Chat";
import { Mensaje } from "./Mensaje";


@Entity("usuarios")
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  tipoDocumento!: string;

  @Column()
  documento!: string;

  @Column()
  tipo!: string;

  @Column()
  nombres!: string;

  @Column()
  apellidos!: string;

  @Column({ type: "date" })
  fechaNacimiento!: string;

  @Column()
  lugarNacimiento!: string;

  @Column({ name: "direccion_facturacion", type: "text" })
  direccion!: string;

  @Column()
  genero!: string;

  @Column({ name: "correo_electronico", unique: true })
  correo!: string;

  @Column( {name: "usuario", unique: true })
  usuario!: string;

  @Column({ name: "contrasena"})
  contrasena!: string;

  @Column({ name: "imagen_url", nullable: true })
  imagenUrl?: string;

  @Column({ name: "suscrito_noticias", default: false })
  suscritoNoticias!: boolean;

  @CreateDateColumn({ name: "creado_en" })
  creadoEn!: Date;

  @UpdateDateColumn({ name: "actualizado_en" })
  actualizadoEn!: Date;

  @OneToMany(() => Chat, (chat) => chat.cliente)
  chats!: Chat[];

  @OneToMany(() => Mensaje, (mensaje) => mensaje.sender)
  mensajes!: Mensaje[];


}
