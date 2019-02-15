import { BaseState } from '../../rx-store';
import {
  BASE_INITIAL_STATE,
  getErrorState,
  getInitialState,
  getSuccessState
} from '../helper';
import { ActionsUnion, Do } from './action';

export const REDUCER = 'myEntityQ';
export type State = BaseState;
export const initialState: State = BASE_INITIAL_STATE;

export function reducer(state = initialState, action: ActionsUnion): State {
  switch (action.type) {
    case Do.DELETE_BY_ENTITY_ID:
    case Do.DELETE_BY_ENTITYNAME:
    case Do.MERGE:
    case Do.QUERY_BY_ENTITY_ID:
      return getInitialState(action);

    case Do.DELETE_SUCCESS:
    case Do.QUERY_SUCCESS:
    case Do.MERGE_SUCCESS:
    case Do.MERGE_BATCH_SUCCESS:
      return getSuccessState(action);

    case Do.DELETE_ERROR:
    case Do.QUERY_ERROR:
    case Do.MERGE_ERROR:
    case Do.MERGE_BATCH_ERROR:
      return getErrorState(action);

    default:
      return state;
  }
}
