import { BehaviorSubject, Observable, queueScheduler } from 'rxjs';
import { observeOn, scan, withLatestFrom } from 'rxjs/operators';

import { IAction, IDispatcher, IReducer } from './interfaces';

interface Action {
  type: string;
}

type ActionReducer<T, V extends Action = Action> = (state: T | undefined, action: V) => T;

export class State<T> extends BehaviorSubject<T> {
  constructor(_initialState: T, action$: IDispatcher, reducer$: IReducer) {
    super(_initialState);

    const actionInQueue$: Observable<IAction> = action$.pipe(
      observeOn(queueScheduler)
    );
    const actionAndReducer$ = actionInQueue$.pipe(withLatestFrom(reducer$));

    // reference: see https://github.com/ngrx/platform/blob/master/modules/store/src/state.ts

    const seed: StateActionPair<T> = { state: _initialState };
    const state$ = actionAndReducer$.pipe(
      scan<[Action, ActionReducer<T, Action>], StateActionPair<T>>(
        reduceState,
        seed
      )
    );

    state$.subscribe(({ state }) => this.next(state));
  }
}

export interface StateActionPair<T, V extends Action = Action> {
  state: T | undefined;
  action?: V;
}
export function reduceState<T, V extends Action = Action>(
  stateActionPair: StateActionPair<T, V> = { state: undefined },
  [action, reducer]: [V, ActionReducer<T, V>]
): StateActionPair<T, V> {
  const { state } = stateActionPair;
  return { state: reducer(state, action), action };
}
