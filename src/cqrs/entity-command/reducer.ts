import { BaseState } from '../../rx-store';
import {
  BASE_INITIAL_STATE,
  getErrorState,
  getInitialState,
  getSuccessState
} from '../helper';
import { ActionsUnion, Do } from './action';

export const REDUCER = 'myEntityC';
export type State = BaseState;
export const initialState: BaseState = BASE_INITIAL_STATE;

export function reducer(state = initialState, action: ActionsUnion): BaseState {
  switch (action.type) {
    case Do.CREATE:
    case Do.DELETE_BY_EN_ID:
    case Do.DELETE_BY_COMMITID:
    case Do.QUERY_BY_ENTITY_ID:
    case Do.QUERY_BY_ENTITY_NAME:
    case Do.QUERY_BY_COMMIT_ID:
      return getInitialState(action);

    case Do.CREATE_SUCCESS:
    case Do.DELETE_SUCCESS:
    case Do.QUERY_SUCCESS:
      return getSuccessState(action);

    case Do.CREATE_ERROR:
    case Do.DELETE_ERROR:
    case Do.QUERY_ERROR:
      return getErrorState(action);

    default:
      return state;
  }
}
