import { counterReducer } from '../../example/counter-reducer';

require('dotenv').config();

import { expect } from 'chai';
import { forEach, values } from 'lodash';
import 'reflect-metadata';
import { mergeMap, take } from 'rxjs/operators';
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
import * as fromEntityC from '../entity-command';
import * as fromEntityQ from '../entity-query';
import { generateToken, ofTypeByTxId } from '../helper';
import * as Projection from '../projection';
import { Do, ReconcileAction } from './action';
import { Effect } from './effect';
import { initialState, reducer, REDUCER, State } from './reducer';

interface AppSchema {
  [REDUCER]: State;
  [fromEntityC.REDUCER]: fromEntityC.State;
  [fromEntityQ.REDUCER]: fromEntityQ.State;
  [Projection.REDUCER]: Projection.State;
}

const INITIAL_STATE = {
  [REDUCER]: initialState,
  [fromEntityC.REDUCER]: fromEntityC.initialState,
  [fromEntityQ.REDUCER]: fromEntityQ.initialState,
  [Projection.REDUCER]: Projection.initialState
};

const INITIAL_REDUCER = {
  [REDUCER]: reducer,
  [fromEntityC.REDUCER]: fromEntityC.reducer,
  [fromEntityQ.REDUCER]: fromEntityQ.reducer,
  [Projection.REDUCER]: Projection.reducer
};

export const container = provideStore<AppSchema>(
  INITIAL_STATE,
  INITIAL_REDUCER
);

const store = container.get<IStore<AppSchema>>(TYPES.Store);

container.bind<IEffect>(TYPES.EntityEffect).to(Effect);
container.bind<IEffect>(TYPES.EntityCEffect).to(fromEntityC.Effect);
container.bind<IEffect>(TYPES.EntityQEffect).to(fromEntityQ.Effect);
container.bind<IFabricService>(TYPES.FabricService).to(FabricService);
container.bind<IChannelEvent>(TYPES.ChannelEvent).to(ChannelEvent);
container.get<IEffect>(TYPES.EntityEffect).invokeEffect();

container.get<IEffect>(TYPES.EntityCEffect).invokeEffect();
container.get<IEffect>(TYPES.EntityQEffect).invokeEffect();

const hub = container.get<IChannelEvent>(TYPES.ChannelEvent);
const cqrs$ = store.select<State>(REDUCER);
const command$ = store.select<fromEntityC.State>(fromEntityC.REDUCER);
const query$ = store.select<fromEntityQ.State>(fromEntityQ.REDUCER);
const projection$ = store.select<Projection.State>(Projection.REDUCER);
const entityName = 'cqrs_test';
const id = Date.now().toString();
const events = [{ type: 'ADD' }];
const version = 0;

describe('🎬 CQRS Tests 🎬 \n', () => {
  it('🔬 should provide store', async () => {
    await hub.invoke();
    expect(store).to.be.exist;
  });

  it('🔬 should handle initial state', done => {
    store.pipe(take(1)).subscribe(stores => {
      expect(stores[REDUCER]).to.deep.equal(initialState);
      expect(stores[fromEntityC.REDUCER]).to.deep.equal(
        fromEntityC.initialState
      );
      expect(stores[fromEntityQ.REDUCER]).to.deep.equal(
        fromEntityQ.initialState
      );
      done();
    });
  });

  it('🔬 should listen to channel-events', done => {
    const tx_id = generateToken();
    store.dispatch(
      new fromEntityC.CreateAction({
        tx_id,
        args: { id, entityName, version, events }
      })
    );
    command$
      .pipe(
        ofTypeByTxId(tx_id, fromEntityC.Do.CREATE_SUCCESS, 'result'),
        mergeMap(result =>
          query$.pipe(
            ofTypeByTxId<Record<string, Entity>>(
              values<any>(result)[0].commitId,
              fromEntityQ.Do.MERGE_SUCCESS,
              'result'
            )
          )
        )
      )
      .subscribe(result => {
        const entity = values<Entity>(result)[0];
        expect(entity.id).to.equal(id);
        expect(entity.entityName).to.equal(entityName);
        expect(entity.events).to.deep.equal(events);
        done();
      });
  });

  it('🔬 should reconcile by entityName', done => {
    const tx_id = generateToken();
    store.dispatch(
      new ReconcileAction({
        tx_id,
        args: { entityName, reducer: counterReducer }
      })
    );
    cqrs$
      .pipe(ofTypeByTxId(tx_id, Do.RECONCILE_SUCCESS, 'result'))
      .subscribe(result => {
        forEach(result, obj => expect(obj).to.deep.equal({}));
        done();
      });
  });

  it('🔬 should get projection', done => {
    const tx_id = generateToken();
    store.dispatch(new Projection.FindAction({ tx_id, args: { all: true } }));
    projection$
      .pipe(ofTypeByTxId(tx_id, Projection.Do.FIND, 'result'))
      .subscribe(result => {
        forEach(result, ({ value }) => expect(value).to.equal(1));
        done();
      });
  });

  it('close', async () => {
    await hub.close();
  });
});
