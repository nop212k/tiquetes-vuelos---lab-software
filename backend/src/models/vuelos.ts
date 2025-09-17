// src/vuelos/vuelo.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'vuelos' })
@Index('uq_vuelos_codigo_vuelo', ['codigoVuelo'], { unique: true })
export class Vuelo {
  @PrimaryGeneratedColumn({ type: 'int4', name: 'id' })
  id: number;

  @Column({ name: 'codigo_vuelo', type: 'varchar', length: 10 })
  codigoVuelo: string;

  @Column({ name: 'fecha', type: 'date', nullable: false })
  fecha: string; // YYYY-MM-DD

  @Column({ name: 'hora', type: 'time', nullable: false })
  hora: string; // HH:MM:SS

  @Column({ name: 'origen', type: 'varchar', length: 100 })
  origen: string;

  @Column({ name: 'destino', type: 'varchar', length: 100 })
  destino: string;

  @Column({ name: 'tiempo_vuelo', type: 'int4' })
  tiempoVuelo: number;

  @Column({ name: 'es_internacional', type: 'boolean', default: false })
  esInternacional: boolean;

  @Column({ name: 'hora_local_destino', type: 'time', nullable: true })
  horaLocalDestino: string | null; // HH:MM:SS

  @Column({ name: 'costo_base', type: 'numeric', precision: 12, scale: 2 })
  costoBase: string; // usar string para numeric en TS

  @Column({ name: 'estado', type: 'varchar', length: 30, default: 'programado' })
  estado: string;

  @CreateDateColumn({
    name: 'creado_en',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  creadoEn: Date;

  @UpdateDateColumn({
    name: 'actualizado_en',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  actualizadoEn: Date;
}
