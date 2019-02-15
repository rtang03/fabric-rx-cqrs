import { PubSub } from 'graphql-subscriptions';
import { inject, injectable, optional } from 'inversify';
import { filter as _filter, isEqual, keys, pick, remove, values } from 'lodash';
import { map } from 'rxjs/operators';
import {
  IEffect,
  ISideEffects,
  IStore,
  TYPES
} from '../../rx-store';
import { Entity } from '../../types';
import { ofTypeToSpread } from '../helper';
import {
  DeleteByEntityIdAction,
  DeleteByEntityNameAction,
  DeleteSuccessAction,
  MergeAction,
  MergeBatchAction,
  MergeBatchSuccessAction,
  MergeSuccessAction,
  QueryByEntityIdAction,
  QueryByEntityNameAction,
  QueryErrorAction,
  QuerySuccessAction
} from './action';

let db: Record<string, Entity> = {
  '20181208155814606': {
    commitId: '20181208155814606',
    committedAt: '1544284694606',
    entityName: 'dev_test',
    entityId: 'ent_test_1001',
    id: 'ent_test_1001',
    version: 0,
    events: [
      {
        type: 'UserCreated',
        payload: {
          userId: 'ent_test_1001',
          name: 'Mr X',
          timestamp: 1544284694606
        }
      }
    ]
  }
};
let newDB;

@injectable()
export class Effect implements IEffect {
  constructor(
    @inject(TYPES.SideEffect) public action$: ISideEffects,
    @inject(TYPES.Store) public store: IStore,
    @inject('PubSub') @optional() public pubSub: PubSub,
  ) {}

  invokeEffect() {
    const store = this.store;

    this.action$
      .pipe(
        ofTypeToSpread<DeleteByEntityIdAction>(DeleteByEntityIdAction),
        map(({ tx_id, args: { id, entityName } }) => {
          newDB = values(db);
          remove(newDB, { id, entityName });
          db = {};
          newDB.forEach(obj => (db[obj.commitId] = obj));
          const status = '1 number of record deleted successful';
          return new DeleteSuccessAction({ tx_id, result: {}, status });
        })
      )
      .subscribe(_ => store.dispatch(_));

    this.action$
      .pipe(
        ofTypeToSpread<DeleteByEntityNameAction>(DeleteByEntityNameAction),
        map(({ tx_id, args: { entityName } }) => {
          newDB = values(db);
          remove(newDB, { entityName });
          db = {};
          newDB.forEach(obj => (db[obj.commitId] = obj));
          const status = 'records deleted successful';
          return new DeleteSuccessAction({ tx_id, result: {}, status });
        })
      )
      .subscribe(_ => store.dispatch(_));

    this.action$
      .pipe(
        ofTypeToSpread<QueryByEntityIdAction>(QueryByEntityIdAction),
        map(({ tx_id, args: { id, entityName } }) => {
          const result: Record<string, Entity> = {};
          _filter(
            db,
            obj => obj.id === id && obj.entityName === entityName
          ).forEach(obj => (result[obj.commitId] = obj));
          return isEqual(result, {})
            ? new QueryErrorAction({ tx_id, error: 'No Record Found' })
            : new QuerySuccessAction({ tx_id, result });
        })
      )
      .subscribe(_ => store.dispatch(_));

    this.action$
      .pipe(
        ofTypeToSpread<QueryByEntityNameAction>(QueryByEntityNameAction),
        map(({ tx_id, args: { entityName } }) => {
          const result: Record<string, Entity> = {};
          _filter(db, obj => obj.entityName === entityName).forEach(
            obj => (result[obj.commitId] = obj)
          );
          return isEqual(result, {})
            ? new QueryErrorAction({ tx_id, error: 'No Record Found' })
            : new QuerySuccessAction({ tx_id, result });
        })
      )
      .subscribe(_ => store.dispatch(_));

    this.action$
      .pipe(
        ofTypeToSpread<MergeAction>(MergeAction),
        map(({ tx_id, args: { entity } }) => {
          const val: Entity = pick(entity, [
            'id',
            'commitId',
            'committedAt',
            'version',
            'events',
            'entityName',
            'entityId'
          ]);
          db[val.commitId] = val;
          const result = {};
          result[val.commitId] = val;
          return new MergeSuccessAction({
            tx_id,
            result,
            args: { id: entity.id, entityName: entity.entityName }
          });
        })
      )
      .subscribe(_ => store.dispatch(_));

    this.action$
      .pipe(
        ofTypeToSpread<MergeBatchAction>(MergeBatchAction),
        map(({ tx_id, args: { entities, entityName } }) => {
          const result = {};
          newDB = values(db);
          remove(newDB, { entityName });
          db = {};
          newDB.forEach(obj => (db[obj.commitId] = obj));
          values<Entity>(entities).forEach(entity => {
            db[entity.commitId] = entity;
            result[entity.commitId] = {};
          });
          return new MergeBatchSuccessAction({ tx_id, result });
        })
      )
      .subscribe(_ => store.dispatch(_));

    if (this.pubSub)
      this.action$
        .pipe(ofTypeToSpread<MergeSuccessAction>(MergeSuccessAction))
        .subscribe(({ result }) => {
          if (keys(result).length === 1) {
            this.pubSub.publish('ENTITY', values(result)[0]).catch(error => {
              console.error(error);
            });
          }
        });

  }
}
