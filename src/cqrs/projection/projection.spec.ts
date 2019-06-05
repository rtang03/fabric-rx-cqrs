import { expect } from 'chai';
import 'reflect-metadata';
import { take } from 'rxjs/operators';
import * as Projection from '.';
import {
  FindAction,
  RemoveAllAction,
  UpsertAction,
  UpsertManyAction
} from '.';
import { IStore, provideStore, TYPES } from '../../rx-store';
import { Entity } from '../../types';
import { counterReducer } from '../../example/counter-reducer';
import { generateToken, ofProjectionByTxId } from '../helper';

type Counter = {
  id: string;
  desc: string;
  value: number;
};

interface AppSchema {
  [Projection.REDUCER]: Projection.State<Counter>;
}

const INITIAL_STATE = {
  [Projection.REDUCER]: Projection.initialState
};

const INITIAL_REDUCER = {
  [Projection.REDUCER]: Projection.reducer
};

export const container = provideStore<AppSchema>(
  INITIAL_STATE,
  INITIAL_REDUCER
);

const store = container.get<IStore<AppSchema>>(TYPES.Store);
const state$ = store.select<Projection.State>(Projection.REDUCER);

describe('Projection', () => {
  it('🔬 should provide store', done => {
    expect(store).to.be.exist;
    done();
  });

  it('🔬 should handle initial state', done => {
    store.pipe(take(1)).subscribe(stores => {
      expect(stores[Projection.REDUCER]).to.deep.equal(Projection.initialState);
      done();
    });
  });

  it('should insert batch of entities', done => {
    const tx_id = generateToken();
    const entities: Record<string, Entity> = {
      '001': {
        id: '1000',
        entityName: 'test-entity',
        events: [{ type: 'ADD' }]
      },
      '002': {
        id: '1000',
        entityName: 'test-entity',
        events: [{ type: 'ADD' }]
      },
      '003': {
        id: '1000',
        entityName: 'test-entity',
        events: [{ type: 'MINUS' }]
      },
      '004': {
        id: '2000',
        entityName: 'test-entity',
        events: [{ type: 'ADD' }]
      },
      '005': {
        id: '2000',
        entityName: 'test-entity',
        events: [{ type: 'ADD' }]
      }
    };
    store.dispatch(
      new UpsertManyAction({
        tx_id,
        args: { entities, reducer: counterReducer }
      })
    );
    state$
      .pipe(ofProjectionByTxId(tx_id, Projection.Do.UPSERT_MANY))
      .subscribe(result => {
        expect(result.ids).to.deep.equal(['1000', '2000']);
        expect(result.entities).to.deep.equal({
          '1000': { id: '1000', value: 1 },
          '2000': { id: '2000', value: 2 }
        });
        done();
      });
  });

  it('should find #2, by All', done => {
    const tx_id = generateToken();
    store.dispatch(new FindAction({ tx_id, args: { all: true } }));
    state$
      .pipe(ofProjectionByTxId(tx_id, Projection.Do.FIND))
      .subscribe(({ result }) => {
        expect(result).to.deep.equal([
          { id: '1000', value: 1 },
          { id: '2000', value: 2 }
        ]);
        done();
      });
  });

  it('should find #2, by WHERE', done => {
    const tx_id = generateToken();
    const where = { value: 2 };
    store.dispatch(new FindAction({ tx_id, args: { where } }));
    state$
      .pipe(ofProjectionByTxId(tx_id, Projection.Do.FIND))
      .subscribe(({ result }) => {
        expect(result).to.deep.equal([{ id: '2000', value: 2 }]);
        done();
      });
  });

  it('should insert #1', done => {
    const tx_id = generateToken();
    const entity: Record<string, Entity> = {
      '1001': {
        id: '91000',
        entityName: 'test-entity',
        events: [{ type: 'ADD' }]
      },
      '1002': {
        id: '91000',
        entityName: 'test-entity',
        events: [{ type: 'ADD' }]
      },
      '1003': {
        id: '91000',
        entityName: 'test-entity',
        events: [{ type: 'MINUS' }]
      }
    };
    store.dispatch(
      new UpsertAction({ tx_id, args: { entity, reducer: counterReducer } })
    );
    state$
      .pipe(ofProjectionByTxId(tx_id, Projection.Do.UPSERT))
      .subscribe(result => {
        expect(result.ids).to.deep.equal(['1000', '2000', '91000']);
        expect(result.entities['91000']).to.deep.equal({
          id: '91000',
          value: 1
        });
        done();
      });
  });

  it('should find # by contain', done => {
    const tx_id = generateToken();
    const contain = '9';
    store.dispatch(new FindAction({ tx_id, args: { contain } }));
    state$
      .pipe(ofProjectionByTxId(tx_id, Projection.Do.FIND))
      .subscribe(({ result }) => {
        expect(result).to.deep.equal([{ id: '91000', value: 1 }]);
        done();
      });
  });

  it('should upsert #1', done => {
    const entity: Record<string, Entity> = {
      '8888': {
        id: '81000',
        entityName: 'test-entity',
        events: [{ type: 'ADD' }]
      }
    };
    store.dispatch(
      new UpsertAction({
        tx_id: generateToken(),
        args: { entity, reducer: counterReducer }
      })
    );
    const tx_id = generateToken();
    const where = { id: '81000' };
    store.dispatch(new FindAction({ tx_id, args: { where } }));
    state$
      .pipe(ofProjectionByTxId(tx_id, Projection.Do.FIND))
      .subscribe(({ result }) => {
        expect(result).to.deep.equal([{ id: '81000', value: 1 }]);
        done();
      });
  });

  it('should remove all', done => {
    const tx_id = generateToken();
    store.dispatch(new RemoveAllAction({ tx_id }));
    state$
      .pipe(ofProjectionByTxId(tx_id, Projection.Do.REMOVE_ALL))
      .subscribe(result => {
        expect(result.ids).to.deep.equal([]);
        expect(result.entities).to.deep.equal({});
        done();
      });
  });
});
