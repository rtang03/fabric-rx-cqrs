import { Entity } from '../typeorm-entity/entity';

export type LocalRepository<T = any, K = any> = {
  // getById?: (
  //   id: string
  // ) => Promise<{
  //   currentState: T;
  //   save: (events: K[], version?: number) => Promise<Entity | { error: any }>;
  // }>;
  create?: (
    id: string
  ) => {
    save: (events: K[]) => Promise<Entity | { error: any }>;
  };
  // getByEntityName?: () => Promise<{ entities: T[] }>;
  // getCommitById?: (
  //   id: string
  // ) => Promise<{ entities: Entity[] | { error: any } }>;
};
