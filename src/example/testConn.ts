import { createConnection } from 'typeorm';
import { Entity } from '../typeorm-entity/entity';

export const testConn = (drop: boolean = false) =>
  createConnection({
    name: 'default',
    type: 'sqlite',
    database: 'database.test',
    synchronize: drop,
    dropSchema: drop,
    logging: false,
    entities: [Entity]
  });
