require('dotenv').config();

import { expect } from 'chai';
import { keys, values } from 'lodash';
import 'reflect-metadata';
import { take } from 'rxjs/operators';
import * as EntityC from '.';
import {
  CreateAction,
  DeleteByEntnameCommitIdAction,
  DeleteByEntnameIdAction,
  QueryByCommitIdAction,
  QueryByEntityIdAction,
  QueryByEntityNameAction
} from '.';
import {
  IChannelEvent,
  IEffect,
  IFabricService,
  IStore,
  provideStore,
  TYPES
} from '../../rx-store';
import { ChannelEvent, FabricService } from '../../service';
import { Entity } from '../../types';
import { generateToken, ofTypeByTxId } from '../helper';

interface AppSchema {
  [EntityC.REDUCER]: EntityC.State;
}

const INITIAL_STATE = {
  [EntityC.REDUCER]: EntityC.initialState
};

const INITIAL_REDUCER = {
  [EntityC.REDUCER]: EntityC.reducer
};

export const container = provideStore<AppSchema>(
  INITIAL_STATE,
  INITIAL_REDUCER
);

const store = container.get<IStore<AppSchema>>(TYPES.Store);

container.bind<IEffect>(TYPES.EntityCEffect).to(EntityC.Effect);
container.bind<IFabricService>(TYPES.FabricService).to(FabricService);
container.bind<IChannelEvent>(TYPES.ChannelEvent).to(ChannelEvent);
container.get<IEffect>(TYPES.EntityCEffect).invokeEffect();
const hub = container.get<IChannelEvent>(TYPES.ChannelEvent);

const state$ = store.select<EntityC.State>(EntityC.REDUCER);
const entityName = 'dev_test';
const id = 'unit_test_01';
const events = [{ type: 'User Created', payload: { name: 'April' } }];
const version = 0;
let commitId_1: string;
let commitId_2: string;

describe('🎬Entity-Command Test🎬 \n', () => {
  it('🔬 should provide store', async () => {
    await hub.invoke();
    expect(store).to.be.exist;
  });

  it('🔬 should handle initial state', done => {
    store.pipe(take(1)).subscribe(stores => {
      expect(stores[EntityC.REDUCER]).to.deep.equal(EntityC.initialState);
      done();
    });
  });

  it(`🔬 should DeleteByEntityId`, done => {
    const tx_id = generateToken();
    store.dispatch(
      new DeleteByEntnameIdAction({ tx_id, args: { id, entityName } })
    );
    state$
      .pipe(ofTypeByTxId(tx_id, EntityC.Do.DELETE_SUCCESS, 'result'))
      .subscribe(_ => {
        console.log(_);
        done();
      });
  });

  it(`🔬 should #1 CreateEntity`, done => {
    const tx_id = generateToken();
    store.dispatch(
      new CreateAction({ tx_id, args: { id, entityName, version, events } })
    );
    state$
      .pipe(
        ofTypeByTxId<Record<string, Entity>>(
          tx_id,
          EntityC.Do.CREATE_SUCCESS,
          'result'
        )
      )
      .subscribe(_ => {
        const entity: Entity = values(_)[0];
        commitId_1 = entity.commitId;
        expect(entity.id).to.equal(id);
        expect(entity.version).to.equal(version);
        expect(entity.entityName).to.equal(entityName);
        expect(entity.events).to.deep.equal(events);
        done();
      });
  });

  it(`🔬 should QueryByEntityIdCommitId`, done => {
    const tx_id = generateToken();
    store.dispatch(
      new QueryByCommitIdAction({
        tx_id,
        args: { id, entityName, commitId: commitId_1 }
      })
    );
    state$
      .pipe(
        ofTypeByTxId<Record<string, Entity>>(
          tx_id,
          EntityC.Do.QUERY_SUCCESS,
          'result'
        )
      )
      .subscribe(_ => {
        const entity: Entity = values(_)[0];
        expect(entity.id).to.equal(id);
        expect(entity.version).to.equal(version);
        expect(entity.entityName).to.equal(entityName);
        expect(entity.events).to.deep.equal(events);
        done();
      });
  });

  it(`🔬 should #2 CreateEntity`, done => {
    const tx_id = generateToken();
    store.dispatch(
      new CreateAction({ tx_id, args: { id, entityName, version: 1, events } })
    );
    state$
      .pipe(
        ofTypeByTxId<Record<string, Entity>>(
          tx_id,
          EntityC.Do.CREATE_SUCCESS,
          'result'
        )
      )
      .subscribe(_ => {
        const entity: Entity = values(_)[0];
        commitId_2 = entity.commitId;
        done();
      });
  });

  it(`🔬 should QueryByEntityName`, done => {
    const tx_id = generateToken();
    store.dispatch(
      new QueryByEntityNameAction({ tx_id, args: { entityName } })
    );
    state$
      .pipe(
        ofTypeByTxId<Record<string, Entity>>(
          tx_id,
          EntityC.Do.QUERY_SUCCESS,
          'result'
        )
      )
      .subscribe(result => {
        const entity_2 = result[commitId_2];
        expect(keys(result).length).to.equal(2);
        expect(entity_2.version).to.equal(1);
        done();
      });
  });

  it(`🔬 should QueryByEntityId`, done => {
    const tx_id = generateToken();
    store.dispatch(
      new QueryByEntityIdAction({ tx_id, args: { entityName, id } })
    );
    state$
      .pipe(
        ofTypeByTxId<Record<string, Entity>>(
          tx_id,
          EntityC.Do.QUERY_SUCCESS,
          'result'
        )
      )
      .subscribe(result => {
        const entity_2 = result[commitId_2];
        expect(keys(result).length).to.equal(2);
        expect(entity_2.version).to.equal(1);
        done();
      });
  });

  it(`🔬 should DeleteByEntityIdCommitId`, done => {
    const tx_id = generateToken();
    store.dispatch(
      new DeleteByEntnameCommitIdAction({
        tx_id,
        args: { entityName, id, commitId: commitId_1 }
      })
    );
    state$
      .pipe(
        ofTypeByTxId<Record<string, Entity>>(
          tx_id,
          EntityC.Do.DELETE_SUCCESS,
          'result'
        )
      )
      .subscribe(result => {
        const entity = result[commitId_1];
        expect(entity).to.deep.equal({});
        done();
      });
  });

  it(`🔬 should fail to delete non-exist entity by EntityId/CommitId`, done => {
    const tx_id = generateToken();
    store.dispatch(
      new DeleteByEntnameCommitIdAction({
        tx_id,
        args: { entityName, id, commitId: commitId_1 }
      })
    );
    state$
      .pipe(
        ofTypeByTxId<Record<string, Entity>>(
          tx_id,
          EntityC.Do.DELETE_SUCCESS,
          'result'
        )
      )
      .subscribe(result => {
        expect(result).to.deep.equal({});
        done();
      });
  });

  it(`🔬 should QueryByEntityId`, done => {
    const tx_id = generateToken();
    store.dispatch(
      new QueryByEntityIdAction({ tx_id, args: { entityName, id } })
    );
    state$
      .pipe(
        ofTypeByTxId<Record<string, Entity>>(
          tx_id,
          EntityC.Do.QUERY_SUCCESS,
          'result'
        )
      )
      .subscribe(result => {
        expect(keys(result).length).to.equal(1);
        done();
      });
  });

  it('close', async () => {
    await hub.close();
  });
});
