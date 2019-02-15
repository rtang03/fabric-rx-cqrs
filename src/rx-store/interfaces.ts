import { BehaviorSubject, Observable } from 'rxjs';
import { Entity } from '../types';

export interface BaseState {
  tx_id: string;
  actionType: string;
  action?: IAction;
  loading?: boolean;
  error?: string;
  result?: any;
  status?: string;
}

export interface IAction {
  readonly type?: string;
  payload?: any;
  nextAction?: {
    success?: any;
    error?: any;
  };
}

export type IActionReducer<T = any> = (state: T, action: IAction) => T;

export interface IDispatcher extends BehaviorSubject<IAction> {
  dispatch(action: IAction): void;
}

export interface IStore<T = any> extends Observable<any> {
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
  >(
    key1: a,
    key2: b,
    key3: c,
    key4: d
  ): Observable<T[a][b][c][d]>;
  select<
    a extends keyof T,
    b extends keyof T[a],
    c extends keyof T[a][b],
    d extends keyof T[a][b][c],
    e extends keyof T[a][b][c][d]
  >(
    key1: a,
    key2: b,
    key3: c,
    key4: d,
    key5: e
  ): Observable<T[a][b][c][d][e]>;
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
  select<K = any>(...paths: string[]): Observable<K>;
  select(
    pathOrMapFn: ((state: T) => any) | string,
    ...paths: string[]
  ): Observable<any>;

  replaceReducer(reducer: IActionReducer);
  dispatch(action: IAction): void;
  next(action: IAction): void;
  error(err: any): void;
  complete(): void;
}

export interface IReducer extends BehaviorSubject<IActionReducer> {
  replaceReducer(reducer: IActionReducer<any>): void;
  next(reducer: IActionReducer<any>): void;
}

export interface IEffect {
  invokeEffect(): void;
}

export interface IFabricService {
  submitTransaction({
    fcn,
    args
  }: {
    fcn: string;
    args: string[];
  }): Observable<Record<string, Entity>>;
}

export interface IChannelEvent {
  invoke();
  close();
}

export interface ISideEffects extends BehaviorSubject<IAction> {
  dispatch(action: IAction): void;
}

export interface IDefaultReducer {
  entityName: string;
  getReducer();
  setReducer(reducer);
}
