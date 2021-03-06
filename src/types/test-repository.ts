import { Entity } from '../types';

export type TestRepository<TEntity = any, TEvent = any> = {
  create?: (
    id: string
  ) => {
    save: (events: TEvent[]) => Promise<Entity | { error: any }>;
  };
  deleteByCommitId?: (id: string) => Promise<any>;
  deleteByEntityId?: (id: string) => Promise<any>;
  getByEntityName?: () => Promise<{ entities: TEntity[] | { error: any } }>;
  getById?: (
    id: string
  ) => Promise<{
    currentState: TEntity;
    save: (
      events: TEvent[],
      version?: number
    ) => Promise<Entity | { error: any }>;
  }>;
  getCommitById?: (
    id: string
  ) => Promise<{ commits: Entity[] | { error: any } }>;
  getProjection?: ({
    where,
    all,
    contain
  }: {
    where?: Partial<TEntity>;
    all?: boolean;
    contain?: string;
  }) => Promise<{ projections: TEntity[] }>;
};
