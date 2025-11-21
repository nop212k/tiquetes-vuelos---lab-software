import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateReservasTable1234567890123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "reservas",
        columns: [
          { name: "id", type: "int", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "userId", type: "int" },
          { name: "vueloId", type: "int" },
          { name: "tipo", type: "enum", enum: ["reserva", "compra"], default: "'reserva'" },
          { name: "estado", type: "enum", enum: ["pendiente", "confirmado", "cancelado", "completado"], default: "'pendiente'" },
          { name: "precioTotal", type: "decimal", precision: 10, scale: 2 },
          { name: "numeroPasajeros", type: "int", default: 1 },
          { name: "notas", type: "text", isNullable: true },
          { name: "creadoEn", type: "timestamp", default: "CURRENT_TIMESTAMP" },
          { name: "actualizadoEn", type: "timestamp", default: "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" },
          { name: "canceladoEn", type: "timestamp", isNullable: true },
          { name: "motivoCancelacion", type: "text", isNullable: true },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      "reservas",
      new TableForeignKey({
        columnNames: ["userId"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "reservas",
      new TableForeignKey({
        columnNames: ["vueloId"],
        referencedColumnNames: ["id"],
        referencedTableName: "vuelos",
        onDelete: "CASCADE",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("reservas");
    if (table) {
      const foreignKeys = table.foreignKeys;
      for (const fk of foreignKeys) {
        await queryRunner.dropForeignKey("reservas", fk);
      }
    }
    await queryRunner.dropTable("reservas");
  }
}