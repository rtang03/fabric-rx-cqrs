require('dotenv').config();

import { expect } from 'chai';
import { isEqual, keys, values } from 'lodash';
import { submit } from './submit';
const entityName = 'dev_test';
const id = 'unit_test_01';
let commitId: string;
let createdEntity;

describe('EventStore Tests', () => {
  it('Remove all entity - dev_test', done => {
    const args = [entityName, id];
    submit('deleteByEntityId', args).then(result => {
      if (isEqual(result, {})) expect(result).to.deep.equal({});
      done();
    });
  });

  it('Create #1', done => {
    const args = [
      entityName,
      id,
      '0',
      JSON.stringify([
        { type: 'User Created', payload: { name: 'Someone New' } }
      ])
    ];
    submit('createEntity', args).then(_ => {
      const result = values(_)[0];
      commitId = result.commitId;
      createdEntity = result;
      expect(result.id).to.equal(id);
      expect(result.entityName).to.equal(entityName);
      done();
    });
  });

  it(`should QueryByEntityIdCommitId`, done => {
    const args = [entityName, id, commitId];
    submit('queryByEntityIdCommitId', args).then(result => {
      expect(result[commitId]).to.deep.equal(createdEntity);
      done();
    });
  });

  it('Create #2', done => {
    const args = [
      entityName,
      id,
      '0',
      JSON.stringify([{ type: 'User Created', payload: { name: 'Anoynmous' } }])
    ];
    submit('createEntity', args).then(() => done());
  });

  it(`should QueryByEntityName`, done => {
    const args = [entityName];
    submit('queryByEntityName', args).then(result => {
      expect(keys(result).length).equal(2);
      done();
    });
  });

  it(`should QueryByEntityId`, done => {
    const args = [entityName, id];
    submit('queryByEntityId', args).then(result => {
      expect(keys(result).length).equal(2);
      done();
    });
  });

  it(`should DeleteByEntityIdCommitId`, done => {
    const args = [entityName, id, commitId];
    submit('deleteByEntityIdCommitId', args).then(result => {
      expect(result[commitId]).to.deep.equal({});
      done();
    });
  });

  it('fail to delete non-exist entity by EntityId/CommitId', done => {
    const args = [entityName, id, commitId];
    submit('deleteByEntityIdCommitId', args).then(result => {
      expect(result).to.deep.equal({});
      done();
    });
  });

  it(`should QueryByEntityId`, done => {
    const args = [entityName, id];
    submit('queryByEntityId', args).then(result => {
      expect(keys(result).length).equal(1);
      done();
    });
  });
});
