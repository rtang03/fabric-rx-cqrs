import { IAction } from '../../rx-store';
import { Entity, Reducer } from '../../types';

export enum Do {
  RECONCILE = '[Entity] Reconcile',
  RECONCILE_ERROR = '[Entity] Reconcile Error',
  RECONCILE_SUCCESS = '[Entity] Reconcile Success',
  MERGE = '[Entity] Merge the queried entity to Query-side'
}

export interface Args {
  entities?: Record<string, Entity>;
  entityName?: string;
  reducer?: Reducer;
}

export type Payload<T = Args> = { tx_id: string; result?: any; error?: any } & {
  args: T;
};

// Reconcile
export class ReconcileAction implements IAction {
  readonly type = Do.RECONCILE;
  constructor(public payload: Payload<Required<Pick<Args, 'entityName' | 'reducer'>>>) {}
}

export class ReconcileErrorAction implements IAction {
  readonly type = Do.RECONCILE_ERROR;
  constructor(public payload: Pick<Payload, 'tx_id' | 'error'>) {}
}

export class ReconcileSuccessAction implements IAction {
  readonly type = Do.RECONCILE_SUCCESS;
  constructor(public payload: Pick<Payload, 'tx_id' | 'result'>) {}
}

export class MergeAction implements IAction {
  readonly type = Do.MERGE;
  constructor(public payload: Payload<Required<Pick<Args, 'entities' | 'entityName' | 'reducer'>>>) {}
}

export type ActionsUnion =
  | MergeAction
  | ReconcileAction
  | ReconcileErrorAction
  | ReconcileSuccessAction;
