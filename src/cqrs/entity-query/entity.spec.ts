require('dotenv').config();

import { expect } from 'chai';
import { keys, values } from 'lodash';
import 'reflect-metadata';
import { take } from 'rxjs/operators';
import * as EntityQ from '.';
import {
  DeleteByEntityNameAction,
  MergeAction,
  MergeBatchAction,
  QueryByEntityIdAction,
  QueryByEntityNameAction
} from '.';
import { IEffect, IStore, provideStore, TYPES } from '../../rx-store';
import { createEntity, Entity } from '../../types';
import { generateToken, ofTypeByTxId } from '../helper';

interface AppSchema {
  [EntityQ.REDUCER]: EntityQ.State;
}

const INITIAL_STATE = {
  [EntityQ.REDUCER]: EntityQ.initialState
};

const INITIAL_REDUCER = {
  [EntityQ.REDUCER]: EntityQ.reducer
};

export const container = provideStore<AppSchema>(
  INITIAL_STATE,
  INITIAL_REDUCER
);

container.bind<IEffect>(TYPES.EntityQEffect).to(EntityQ.Effect);

container.get<IEffect>(TYPES.EntityQEffect).invokeEffect();
const store = container.get<IStore<AppSchema>>(TYPES.Store);
const state$ = store.select<EntityQ.State>(EntityQ.REDUCER);

const mock_CommitId = '20181208155814606';
const entityName = 'dev_test';
const id = 'unit_test_01';
const events = [{ type: 'User Created', payload: { name: 'April' } }];
const entity = createEntity({ id, version: 0, entityName, events });
const commitId = entity.commitId;

describe('🎬Entity-Query Test🎬 \n', () => {
  it('🔬 should provide store', () => {
    expect(store).to.be.exist;
  });

  it('🔬 should handle initial state', done => {
    store.pipe(take(1)).subscribe(stores => {
      expect(stores[EntityQ.REDUCER]).to.deep.equal(EntityQ.initialState);
      done();
    });
  });

  it('🔬should query by entityName & entityId\n', done => {
    const tx_id = generateToken();
    const test_id = 'ent_test_1001';
    store.dispatch(
      new QueryByEntityIdAction({ tx_id, args: { id: test_id, entityName } })
    );
    state$
      .pipe(
        ofTypeByTxId<Record<string, Entity>>(
          tx_id,
          EntityQ.Do.QUERY_SUCCESS,
          'result'
        )
      )
      .subscribe(result => {
        expect(keys(result)[0]).to.equal(mock_CommitId);
        expect(result[mock_CommitId].id).to.equal(test_id);
        expect(result[mock_CommitId].entityName).to.equal(entityName);
        done();
      });
  });

  it('🔬should query by entityName\n', done => {
    const tx_id = generateToken();
    store.dispatch(
      new QueryByEntityNameAction({ tx_id, args: { entityName } })
    );
    state$
      .pipe(
        ofTypeByTxId<Record<string, Entity>>(
          tx_id,
          EntityQ.Do.QUERY_SUCCESS,
          'result'
        )
      )
      .subscribe(result => {
        expect(keys(result)[0]).to.equal(mock_CommitId);
        expect(result[mock_CommitId].entityName).to.equal(entityName);
        done();
      });
  });

  it('🔬should delete all entities by entityName\n', done => {
    const tx_id = generateToken();
    store.dispatch(
      new DeleteByEntityNameAction({ tx_id, args: { entityName } })
    );
    state$
      .pipe(
        ofTypeByTxId<Record<string, Entity>>(
          tx_id,
          EntityQ.Do.DELETE_SUCCESS,
          'status'
        )
      )
      .subscribe(status => {
        expect(status).to.equal('records deleted successful');
        done();
      });
  });

  it('🔬should query nothing by entityName\n', done => {
    const tx_id = generateToken();
    store.dispatch(
      new QueryByEntityNameAction({ tx_id, args: { entityName } })
    );
    state$
      .pipe(ofTypeByTxId(tx_id, EntityQ.Do.QUERY_ERROR, 'error'))
      .subscribe(error => {
        expect(error).to.equal('No Record Found');
        done();
      });
  });

  it('🔬should merge\n', done => {
    const tx_id = generateToken();
    store.dispatch(new MergeAction({ tx_id, args: { entityName, entity } }));
    state$
      .pipe(
        ofTypeByTxId<Record<string, Entity>>(
          tx_id,
          EntityQ.Do.MERGE_SUCCESS,
          'result'
        )
      )
      .subscribe(result => {
        const obj = values<Entity>(result)[0];
        expect(keys(result).toString()).equal(commitId);
        expect(obj.commitId).equal(commitId);
        expect(obj.entityName).equal(entityName);
        expect(obj.id).equal(id);
        expect(obj.version).equal(0);
        expect(obj.events).to.deep.equal(events);
        done();
      });
  });

  it('🔬should query by entityId\n', done => {
    const tx_id = generateToken();
    store.dispatch(
      new QueryByEntityIdAction({
        tx_id,
        args: { id, entityName }
      })
    );
    state$
      .pipe(
        ofTypeByTxId<Record<string, Entity>>(
          tx_id,
          EntityQ.Do.QUERY_SUCCESS,
          'result'
        )
      )
      .subscribe(result => {
        const obj = values<Entity>(result)[0];

        expect(keys(result).toString()).equal(commitId);
        expect(obj.commitId).equal(commitId);
        expect(obj.entityName).equal(entityName);
        expect(obj.id).equal(id);
        expect(obj.version).equal(0);
        expect(obj.events).to.deep.equal(events);
        done();
      });
  });

  it('🔬should merge batch of entities \n', done => {
    const tx_id = generateToken();
    const e2 = createEntity({ id, version: 0, entityName, events });
    const entities = {};
    entities[entity.commitId] = entity;
    entities[e2.commitId] = e2;
    store.dispatch(
      new MergeBatchAction({ tx_id, args: { entityName, entities } })
    );
    state$
      .pipe(ofTypeByTxId(tx_id, EntityQ.Do.MERGE_BATCH_SUCCESS, 'result'))
      .subscribe(result => {
        expect(keys(result).length).to.equal(2);
        done();
      });
  });
});
