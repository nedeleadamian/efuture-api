import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Table } from 'typeorm';

export class CustomNamingStrategy extends SnakeNamingStrategy {

  indexName(tableOrName: Table | string, columnNames: string[]): string {
    const table = tableOrName instanceof Table ? tableOrName.name : tableOrName;
    const columns = columnNames.join('_');
    return `IDX_${table}_${columns}`;
  }


  foreignKeyName(tableOrName: Table | string, columnNames: string[]): string {
    const table = tableOrName instanceof Table ? tableOrName.name : tableOrName;
    const columns = columnNames.join('_');
    return `FK_${table}_${columns}`;
  }


  uniqueConstraintName(tableOrName: Table | string, columnNames: string[]): string {
    const table = tableOrName instanceof Table ? tableOrName.name : tableOrName;
    const columns = columnNames.join('_');
    return `UQ_${table}_${columns}`;
  }


  primaryKeyName(tableOrName: Table | string): string {
    const table = tableOrName instanceof Table ? tableOrName.name : tableOrName;
    return `PK_${table}`;
  }
}