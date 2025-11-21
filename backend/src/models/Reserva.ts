// backend/src/models/Reserva.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from "typeorm";
import { User } from "./User";
import { Vuelo } from "./vuelos";

export enum TipoTransaccion {
  RESERVA = "reserva",
  COMPRA = "compra",
}

export enum EstadoTransaccion {
  PENDIENTE = "pendiente",
  CONFIRMADO = "confirmado",
  CANCELADO = "cancelado",
  COMPLETADO = "completado",
}

@Entity("reservas")
export class Reserva {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: "userId" })
  usuario!: User;

  @Column()
  userId!: number;

  @ManyToOne(() => Vuelo, { eager: true })
  @JoinColumn({ name: "vueloId" })
  vuelo!: Vuelo;

  @Column()
  vueloId!: number;

  @Column({
    type: "enum",
    enum: TipoTransaccion,
    default: TipoTransaccion.RESERVA,
  })
  tipo!: TipoTransaccion;

  @Column({
    type: "enum",
    enum: EstadoTransaccion,
    default: EstadoTransaccion.PENDIENTE,
  })
  estado!: EstadoTransaccion;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  precioTotal!: number;

  @Column({ type: "int", default: 1 })
  numeroPasajeros!: number;

  @Column({ type: "text", nullable: true })
  notas?: string;

  @CreateDateColumn()
  creadoEn!: Date;

  @UpdateDateColumn()
  actualizadoEn!: Date;

  @Column({ type: "timestamp", nullable: true })
  canceladoEn?: Date;

  @Column({ type: "text", nullable: true })
  motivoCancelacion?: string;
}