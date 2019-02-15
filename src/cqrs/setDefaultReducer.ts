import { Container } from 'inversify';
import { DefaultReducer } from '../repository/default-reducer';
import { IDefaultReducer, IEffect, TYPES } from '../rx-store';
import { Reducer } from '../types';
import * as Projection from './projection/effect';

export const setDefaultReducer = (
  container: Container,
  entityName: string,
  reducer: Reducer
) => {
  if (!entityName) throw new Error('EntityName cannot be null.');
  if (!reducer) throw new Error('Default reducer cannot be null.');

  const defaultReducer = new DefaultReducer(entityName);
  defaultReducer.setReducer(reducer);
  container
    .bind<IDefaultReducer>(TYPES.DefaultReducer)
    .toConstantValue(defaultReducer);
  container.bind<IEffect>(TYPES.ProjectionEffect).to(Projection.Effect);
  container.get<IEffect>(TYPES.ProjectionEffect).invokeEffect();
};
