import 'reflect-metadata';
import { getConnection } from 'typeorm';
import { Entity } from '../typeorm-entity/entity';
import { createLocalEntity, LocalEntity, LocalRepository } from '../types';

const getPromiseToSave = async (
  localEntity: LocalEntity
): Promise<Entity | { error: any }> => {
  const entityRepository = getConnection().getRepository(Entity);
  const newEntity = entityRepository.create(localEntity);
  return new Promise<Entity | { error: any }>((resolve, reject) => {
    entityRepository
      .save(newEntity)
      .then(() => resolve(newEntity))
      .catch(error => reject({ error }));
  });
};

export const getLocalRepository = <T, K>(
  entityName: string,
  reducer: (history) => T
): LocalRepository<T, K> => ({
  create: id => ({
    save: events =>
      getPromiseToSave(
        createLocalEntity({
          id,
          entityName,
          version: 0,
          events
        })
      )
  })
});
