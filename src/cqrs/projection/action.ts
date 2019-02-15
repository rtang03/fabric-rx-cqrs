import { IAction } from '../../rx-store';
import { Entity, Reducer } from '../../types';

export enum Do {
  UPSERT = '[Project] Upsert Entity',
  UPSERT_MANY = '[Project] Upsert Many Entity',
  UPSERT_MANY_SUCCESS = '[Project] Upsert Many Success',
  REMOVE = '[Project] Remove Entity',
  REMOVE_ALL = '[Project] Remove All',
  FIND = '[Project] Find',
  MERGE = '[Project] MERGE',
}

export interface Args {
  id?: string;
  entity?: Record<string, Entity>;
  entities?: Record<string, Entity>;
  where?: Record<string, any>;
  all?: boolean;
  contain?: string | number;
  entityName?: string;
  reducer?: Reducer;
}

export type Payload<T = Args> = {
  tx_id: string;
  result?: any;
  error?: any;
  status?: string;
} & { args: T };

export class FindAction implements IAction {
  readonly type = Do.FIND;
  constructor(public payload: Payload<Pick<Args, 'where' | 'all' | 'contain'>>) {}
}

export class RemoveAllAction implements IAction {
  readonly type = Do.REMOVE_ALL;
  constructor(public payload: { tx_id: string }) {}
}

export class RemoveAction implements IAction {
  readonly type = Do.REMOVE;
  constructor(public payload: Payload) {}
}

export class UpsertAction implements IAction {
  readonly type = Do.UPSERT;
  constructor(public payload: Payload<Required<Pick<Args, 'entity' | 'reducer'>>>) {}
}

export class UpsertManyAction implements IAction {
  readonly type = Do.UPSERT_MANY;
  constructor(public payload: Payload<Required<Pick<Args, 'entities' | 'reducer'>>>) {}
}

export class UpsertManySuccessAction implements IAction {
  readonly type = Do.UPSERT_MANY_SUCCESS;
  constructor(public payload: Pick<Payload, 'tx_id' | 'result'>) {}
}

export class MergeAction implements IAction {
  readonly type = Do.MERGE;
  constructor(public payload: Payload<Required<Pick<Args, 'where'>>>) {}
}


export type ActionsUnion =
  | RemoveAllAction
  | RemoveAction
  | UpsertAction
  | UpsertManyAction
  | UpsertManySuccessAction
  | FindAction
  | MergeAction;
