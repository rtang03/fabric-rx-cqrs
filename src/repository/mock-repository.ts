import { filter, omit, values } from 'lodash';
import { createEntity, Entity } from '../types';
import { Repository } from '../types';

const getHistory = (e: Entity[]): any[] => {
  const result = [];
  e.forEach(({ events }) => events.forEach(_ => result.push(_)));
  return result;
};

export const getMockRepository = <T, K>(
  mockdb: Record<string, Entity>,
  entityName: string,
  reducer: (history) => T
): Repository<T, K> => ({
  create: id => ({
    save: events => {
      const entity: Entity = createEntity({
        id,
        entityName,
        version: 0,
        events
      });
      mockdb[entity.commitId] = entity;
      return Promise.resolve(omit(entity, ['events']));
    }
  }),
  getById: id =>
    new Promise<any>(resolve => {
      const matched = filter(
        values<Entity>(mockdb),
        ({ entityId }) => entityId === id
      );
      const matchEvents = getHistory(matched);
      resolve({
        currentState: reducer(matchEvents),
        save: events => {
          const entity = createEntity({
            id,
            entityName,
            version: matched.length,
            events
          });
          mockdb[entity.commitId] = entity;
          return Promise.resolve(omit(entity, 'events'));
        }
      });
    }),
  getByEntityName: () =>
    Promise.resolve<{ entities: T[] }>({
      entities: values(
        values(
          filter(
            values<Entity>(mockdb),
            entity => entity.entityName === entityName
          )
        ).reduce((obj: Entity, { entityId, events }: Entity) => {
          obj[entityId] = obj[entityId] || [];
          events.forEach(_ => obj[entityId].push(_));
          return obj;
        }, {})
      ).map(events => reducer(events))
    }),
  getCommitById: id =>
    Promise.resolve<{ entities: Entity[] }>({
      entities: filter(
        values<Entity>(mockdb),
        ({ entityId }) => entityId === id
      )
    })
});
