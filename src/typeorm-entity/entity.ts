import { Column, Entity as EntityORM, PrimaryGeneratedColumn } from 'typeorm';

@EntityORM()
export class Entity {
  @PrimaryGeneratedColumn()
  key?: number;

  @Column()
  id: string;

  @Column()
  entityName: string;

  @Column()
  commitId: string;

  @Column()
  committedAt: string;

  @Column()
  version: number;

  @Column('simple-json')
  events: [{ type: string; payload: any }];
}
