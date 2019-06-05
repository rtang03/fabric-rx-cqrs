import { getLocalRepository } from '../local-repository/localRepository';
import { Counter, CounterEvent } from './counter-reducer';
import { testConn } from './testConn';

require('dotenv').config();

const entityName = 'counter';
const id = 'unit_test_01';

const counterRepo = getLocalRepository<Counter, CounterEvent>(entityName, null);

describe('Counter Example', () => {
  before('connect', async () => {
    const conn = await testConn();
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

});
