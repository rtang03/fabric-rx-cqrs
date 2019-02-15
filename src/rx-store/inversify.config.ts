import { Container, injectable } from 'inversify';
import getDecorators from 'inversify-inject-decorators';
import { Observable, Observer, Operator } from 'rxjs';

import { Dispatcher } from './dispatcher';
import {
  IAction, IActionReducer,
  IDispatcher,
  IReducer,
  ISideEffects,
  IStore
} from './interfaces';
import { Logger } from './logger';
import { Reducer } from './reducer';
import { select } from './select';
import { SideEffects } from './side-effects';
import { State } from './state';
import { TYPES } from './types';
import { combineReducers } from './utils';

/* Container Bindings */
const container = new Container({ skipBaseClassChecks: true });
export let { lazyInject } = getDecorators(container, false);

export function provideStore<T>(initialState, _initialReducer): Container {
  /**
   * Container binding; should not amend
   */

  const initialReducer = initialReducerFactory(
    combineReducers(_initialReducer)
  );

  container.bind<Logger>(TYPES.Logger).to(Logger);
  container.bind<IDispatcher>(TYPES.Dispatcher).to(Dispatcher);
  container.bind<IReducer>(TYPES.Reducer).to(Reducer);
  container
    .bind<IActionReducer>(TYPES.InitialReducer)
    .toConstantValue(initialReducer);
  container
    .bind(TYPES.InitialState)
    .toConstantValue(initialState);

  const dispatcher = container.get<IDispatcher>(TYPES.Dispatcher);
  const reducer = container.get<IReducer>(TYPES.Reducer);
  const state = stateFactory(initialState, dispatcher, reducer);

  // toConstantValue create singleton
  const store = new Store<any>(dispatcher, reducer, state);
  container.bind<IStore<any>>(TYPES.Store).toConstantValue(store);

  const sideEffects = new SideEffects();
  container.bind<ISideEffects>(TYPES.SideEffect).toConstantValue(sideEffects);

  return container;
}

@injectable()
export class Store<T> extends Observable<T>
  implements Observer<IAction>, IStore<T> {
  @lazyInject(TYPES.Logger)
  public _logger;

  @lazyInject(TYPES.SideEffect)
  public newEffect: ISideEffects;

  constructor(
    private _dispatcher: Observer<IAction>,
    private _reducer: Observer<IActionReducer>,
    state$: Observable<any>
  ) {
    super();
    this.source = state$;
  }

  lift<R>(operator: Operator<T, R>): Store<R> {
    const store = new Store<R>(this._dispatcher, this._reducer, this);
    store.operator = operator;
    return store;
  }

  replaceReducer(reducer: IActionReducer) {
    this._reducer.next(reducer);
  }

  dispatch<V extends IAction = IAction>(action: V) {
    this._logger.dispatch(action);

    this._dispatcher.next(action);

    this.newEffect.dispatch(action);
  }

  next(action: IAction) {
    this._dispatcher.next(action);
  }

  error(err: any) {
    this._dispatcher.error(err);
  }

  complete() {
    this._dispatcher.complete();
  }

  /**
   * Need to add to interface carefully
   * @param mapFn
   */
  select<K>(mapFn: (state: T) => K): Observable<K>;
  select<a extends keyof T>(key: a): Observable<T[a]>;
  select<a extends keyof T, b extends keyof T[a]>(
    key1: a,
    key2: b
  ): Observable<T[a][b]>;
  select<a extends keyof T, b extends keyof T[a], c extends keyof T[a][b]>(
    key1: a,
    key2: b,
    key3: c
  ): Observable<T[a][b][c]>;
  select<
    a extends keyof T,
    b extends keyof T[a],
    c extends keyof T[a][b],
    d extends keyof T[a][b][c]
  >(key1: a, key2: b, key3: c, key4: d): Observable<T[a][b][c][d]>;
  select<
    a extends keyof T,
    b extends keyof T[a],
    c extends keyof T[a][b],
    d extends keyof T[a][b][c],
    e extends keyof T[a][b][c][d]
  >(key1: a, key2: b, key3: c, key4: d, key5: e): Observable<T[a][b][c][d][e]>;
  select<
    a extends keyof T,
    b extends keyof T[a],
    c extends keyof T[a][b],
    d extends keyof T[a][b][c],
    e extends keyof T[a][b][c][d],
    f extends keyof T[a][b][c][d][e]
  >(
    key1: a,
    key2: b,
    key3: c,
    key4: d,
    key5: e,
    key6: f
  ): Observable<T[a][b][c][d][e][f]>;
  /**
   * This overload is used to support spread operator with
   * fixed length tuples type in typescript 2.7
   */
  select<K = any>(...paths: string[]): Observable<K>;
  select(
    pathOrMapFn: ((state: T) => any) | string,
    ...paths: string[]
  ): Observable<any> {
    return select.call(null, pathOrMapFn, ...paths)(this);
  }
}

// Helpers
function stateFactory(
  initialState: any,
  dispatcher: IDispatcher,
  reducer: IReducer
) {
  return new State(initialState, dispatcher, reducer);
}

function initialReducerFactory(reducer) {
  if (typeof reducer === 'function') return reducer;

  return combineReducers(reducer);
}
