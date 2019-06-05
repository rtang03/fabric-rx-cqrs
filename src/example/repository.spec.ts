require('dotenv').config();

import { expect } from 'chai';
import { keys } from 'lodash';
import { getRepository, setDefaultReducer } from '..';
import { channelEvent, container, store } from '../cqrs';
import { DeleteByEntnameIdAction } from '../cqrs/entity-command';
import * as EntityC from '../cqrs/entity-command';
import * as EntityQ from '../cqrs/entity-query';
import { generateToken, ofTypeByTxId } from '../cqrs/helper';
import { Entity } from '../types';
import { Counter, CounterEvent, counterReducer } from './counter-reducer';

setDefaultReducer(container, 'counter', counterReducer);

const command$ = store.select<EntityC.State>(EntityC.REDUCER);
const query$ = store.select<EntityQ.State>(EntityQ.REDUCER);
const entityName = 'counter';
const id = 'unit_test_01';

const counterRepo = getRepository<Counter, CounterEvent>(
  'counter',
  counterReducer
);

describe('Counter Example', () => {
  before('🔬 should provide store', async () => {
    await channelEvent.invoke();
    expect(store).to.be.exist;
  });

  it(`🔬 should DeleteByEntityId`, done => {
    const tx_id = generateToken();
    store.dispatch(
      new DeleteByEntnameIdAction({ tx_id, args: { id, entityName } })
    );
    command$
      .pipe(ofTypeByTxId(tx_id, EntityC.Do.DELETE_SUCCESS, 'result'))
      .subscribe(_ => {
        console.log(_);
        done();
      });
  });

  it('🔬 should delete query-side entities by entityName', done => {
    const tx_id = generateToken();
    store.dispatch(
      new EntityQ.DeleteByEntityNameAction({
        tx_id,
        args: { entityName: 'counter' }
      })
    );
    query$
      .pipe(ofTypeByTxId(tx_id, EntityQ.Do.DELETE_SUCCESS, 'result'))
      .subscribe(result => {
        expect(result).to.deep.equal({});
        done();
      });
  });

  it('🔬 should Add #1', done => {
    counterRepo
      .create(id)
      .save([{ type: 'ADD' }])
      .then(() => done());
  });

  it('🔬 should Add #2', done => {
    counterRepo
      .create(id)
      .save([{ type: 'ADD' }])
      .then(() => done());
  });

  it('🔬 should Minus #1', done => {
    counterRepo
      .create(id)
      .save([{ type: 'MINUS' }])
      .then(() => done());
  });

  it('🔬 should Add #3', done => {
    counterRepo
      .create(id)
      .save([{ type: 'ADD' }])
      .then(() => done());
  });

  it('🔬 should return entity_query', done => {
    const tx_id = generateToken();
    store.dispatch(
      new EntityQ.QueryByEntityIdAction({
        tx_id,
        args: { entityName: 'counter', id }
      })
    );
    query$
      .pipe(ofTypeByTxId(tx_id, EntityQ.Do.QUERY_SUCCESS, 'result'))
      .subscribe(result => {
        expect(keys(result).length).to.equal(4);
        done();
      });
  });

  it('🔬 should return counter value', done => {
    counterRepo.getById(id).then(({ currentState }) => {
      expect(currentState.value).to.equal(2);
      done();
    });
  });

  it('🔬 should return all commits', done => {
    counterRepo
      .getCommitById(id)
      .then(({ entities }: { entities: Entity[] }) => {
        expect(entities.length).to.equal(4);
        entities.forEach(e => {
          expect(e.entityName).to.equal(entityName);
          expect(e.id).to.equal(id);
          expect(e.version).to.equal(0);
        });
        done();
      });
  });

  it('🔬 should get projection', done => {
    counterRepo.getProjection({ all: true }).then(({ projections }) => {
      expect(projections).to.deep.equal([{ id: 'unit_test_01', value: 2 }]);
      done();
    });
  });

  it('close', async () => {
    await channelEvent.close();
  });
});
