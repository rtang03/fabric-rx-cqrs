import { keys, values } from 'lodash';
import { merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { store } from '../cqrs';
import * as EntityC from '../cqrs/entity-command';
import * as EntityQ from '../cqrs/entity-query';
import {
  generateToken,
  ofProjectionByTxId,
  ofTypeByTxId
} from '../cqrs/helper';
import * as Projection from '../cqrs/projection';
import { Entity, TestRepository } from '../types';

const testAccounts = ['test@example.com'];
const command$ = store.select<EntityC.State>(EntityC.REDUCER);
const query$ = store.select<EntityQ.State>(EntityQ.REDUCER);
const projection$ = store.select<Projection.State>(Projection.REDUCER);

const getHistory = (entities: Record<string, Entity>): any[] => {
  const events = [];
  values(entities).forEach(entity =>
    entity.events.forEach(event => events.push(event))
  );
  return events;
};

const getPromiseToSave = ({
  id,
  version,
  entityName,
  events
}): Promise<Entity | { error: any }> => {
  const tx_id = generateToken();
  store.dispatch(
    new EntityC.CreateAction({
      tx_id,
      args: { id, entityName, version, events }
    })
  );
  return new Promise<Entity | { error: any }>((resolve, reject) => {
    const success$ = command$.pipe(
      ofTypeByTxId<Record<string, Entity>>(
        tx_id,
        EntityC.Do.CREATE_SUCCESS,
        'result'
      )
    );
    const error$ = command$.pipe(
      ofTypeByTxId<{ error: any }>(tx_id, EntityC.Do.CREATE_ERROR, 'error'),
      map(error => ({ error }))
    );
    // todo: should return events
    merge(success$, error$).subscribe(result =>
      result.error
        ? reject({ error: result.error })
        : resolve(values(result)[0] as Entity)
    );
  });
};

export const getTestRepository = <TEntity, TEvent>(
  entityName: string,
  reducer: (history) => TEntity
): TestRepository<TEntity, TEvent> => ({
  create: id => ({
    save: events => getPromiseToSave({ id, entityName, version: 0, events })
  }),
  deleteByCommitId: id =>
    new Promise<any>((resolve, reject) => {
      const tx_id = generateToken();
    }),
  deleteByEntityId: id =>
    new Promise<any>((resolve, reject) => {
      const tx_id = generateToken();
    }),
  getById: id =>
    new Promise<{
      currentState: TEntity;
      save: (
        events: TEvent[],
        version: number
      ) => Promise<Entity | { error: any }>;
    }>((resolve, reject) => {
      const tx_id = generateToken();
      store.dispatch(
        new EntityQ.QueryByEntityIdAction({
          tx_id,
          args: { id, entityName }
        })
      );
      const success$ = query$.pipe(
        ofTypeByTxId<Record<string, Entity>>(
          tx_id,
          EntityQ.Do.QUERY_SUCCESS,
          'result'
        )
      );
      const error$ = query$.pipe(
        ofTypeByTxId<{ error: any }>(tx_id, EntityQ.Do.QUERY_ERROR, 'error'),
        map(error => ({ error }))
      );
      merge(success$, error$).subscribe(result =>
        result.error
          ? result.error === 'No Record Found'
            ? resolve({ currentState: null, save: null })
            : reject({ error: result.error })
          : resolve({
              currentState: reducer(getHistory(result as any)),
              save: events =>
                getPromiseToSave({
                  id,
                  entityName,
                  version: keys(result).length,
                  events
                })
            })
      );
    }),
  getByEntityName: () =>
    new Promise<{ entities: TEntity[] | { error: any } }>((resolve, reject) => {
      const tx_id = generateToken();
      store.dispatch(
        new EntityQ.QueryByEntityNameAction({
          tx_id,
          args: { entityName }
        })
      );
      const success$ = query$.pipe(
        ofTypeByTxId<Record<string, Entity>>(
          tx_id,
          EntityQ.Do.QUERY_SUCCESS,
          'result'
        )
      );
      const error$ = query$.pipe(
        ofTypeByTxId<{ error: any }>(tx_id, EntityQ.Do.QUERY_ERROR, 'error'),
        map(error => ({ error }))
      );
      merge(success$, error$).subscribe(result =>
        result.error
          ? result.error === 'No Record Found'
            ? resolve({ entities: [] })
            : reject({ error: result.error })
          : resolve({
              entities: values(
                values(result).reduce((obj: Entity, entity: Entity) => {
                  obj[entity.entityId] = obj[entity.entityId] || [];
                  entity.events.forEach(_ => obj[entity.entityId].push(_));
                  return obj;
                }, {})
              ).map(events => reducer(events))
            })
      );
    }),
  getCommitById: id =>
    new Promise<{
      commits: Entity[] | { error: any };
    }>((resolve, reject) => {
      const tx_id = generateToken();
      store.dispatch(
        new EntityQ.QueryByEntityIdAction({
          tx_id,
          args: { id, entityName }
        })
      );
      const success$ = query$.pipe(
        ofTypeByTxId<Record<string, Entity>>(
          tx_id,
          EntityQ.Do.QUERY_SUCCESS,
          'result'
        )
      );
      const error$ = query$.pipe(
        ofTypeByTxId<{ error: any }>(tx_id, EntityQ.Do.QUERY_ERROR, 'error'),
        map(error => ({ error }))
      );
      merge(success$, error$).subscribe(entities =>
        entities.error
          ? entities.error === 'No Record Found'
            ? resolve({ commits: null })
            : reject({ error: entities.error })
          : resolve({ commits: values(entities).reverse() })
      );
    }),
  getProjection: criteria =>
    new Promise<{ projections: TEntity[] }>(resolve => {
      const tx_id = generateToken();
      store.dispatch(new Projection.FindAction({ tx_id, args: criteria }));
      projection$
        .pipe(ofProjectionByTxId(tx_id, Projection.Do.FIND))
        .subscribe(({ result }) => {
          resolve({ projections: result });
        });
    })
});
