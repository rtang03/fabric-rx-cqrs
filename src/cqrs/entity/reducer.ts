import { BaseState } from '../../rx-store';
import {
  BASE_INITIAL_STATE,
  getErrorState,
  getInitialState,
  getSuccessState
} from '../helper';
import { ActionsUnion, Do } from './action';

export const REDUCER = 'myEntity';
export type State = BaseState;
export const initialState: State = BASE_INITIAL_STATE;

export function reducer(state = initialState, action: ActionsUnion): State {
  switch (action.type) {
    case Do.RECONCILE:
      return getInitialState(action);

    case Do.RECONCILE_SUCCESS:
      return getSuccessState(action);

    case Do.RECONCILE_ERROR:
      return getErrorState(action);

    default:
      return state;
  }
}
