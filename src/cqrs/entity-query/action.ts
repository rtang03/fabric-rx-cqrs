import { IAction } from '../../rx-store';
import { Entity } from '../../types';

export enum Do {
  DELETE_BY_ENTITYNAME = '[Entity-Q] Delete entities by EntityName',
  DELETE_BY_ENTITY_ID = '[Entity-Q] Delete entities by entityId',
  DELETE_ERROR = '[Entity-Q] Delete Error',
  DELETE_SUCCESS = '[Entity-Q] Delete Success',
  QUERY_BY_ENTITYNAME = '[Entity-Q] Query entities By EntityName',
  QUERY_BY_ENTITY_ID = '[Entity-Q] Query entities By entityId, and EntityName',
  QUERY_ERROR = '[Entity-Q] Query Error',
  QUERY_SUCCESS = '[Entity-Q] Query Success',
  MERGE = '[Entity-Q] Merge entity',
  MERGE_ERROR = '[Entity-Q] Merge Error',
  MERGE_SUCCESS = '[Entity-Q] Merge Success',
  MERGE_BATCH = '[Entity-Q] Merge records of entities',
  MERGE_BATCH_ERROR = '[Entity-Q] Merge Batch Error',
  MERGE_BATCH_SUCCESS = '[Entity-Q] Merge Batch Success'
}

export interface Args {
  id?: string;
  entity?: Entity;
  entityName?: string;
  entities?: Record<string, Entity>;
}

export type Payload<T = Args> = {
  tx_id: string;
  result?: any;
  error?: any;
  status?: string;
} & {
  args: T;
};

export class DeleteByEntityIdAction implements IAction {
  readonly type = Do.DELETE_BY_ENTITY_ID;
  constructor(
    public payload: Payload<Required<Pick<Args, 'id' | 'entityName'>>>
  ) {}
}

export class DeleteByEntityNameAction implements IAction {
  readonly type = Do.DELETE_BY_ENTITYNAME;
  constructor(public payload: Payload<Required<Pick<Args, 'entityName'>>>) {}
}

export class DeleteErrorAction implements IAction {
  readonly type = Do.DELETE_ERROR;
  constructor(public payload: Partial<Payload>) {}
}

export class DeleteSuccessAction implements IAction {
  readonly type = Do.DELETE_SUCCESS;
  constructor(public payload: Partial<Payload>) {}
}

export class QueryByEntityNameAction implements IAction {
  readonly type = Do.QUERY_BY_ENTITYNAME;
  constructor(public payload: Payload<Required<Pick<Args, 'entityName'>>>) {}
}

export class QueryByEntityIdAction implements IAction {
  readonly type = Do.QUERY_BY_ENTITY_ID;
  constructor(
    public payload: Payload<Required<Pick<Args, 'id' | 'entityName'>>>
  ) {}
}

export class QueryErrorAction implements IAction {
  readonly type = Do.QUERY_ERROR;
  constructor(public payload: Pick<Payload, 'tx_id' | 'error'>) {}
}
export class QuerySuccessAction implements IAction {
  readonly type = Do.QUERY_SUCCESS;
  constructor(public payload: Pick<Payload, 'tx_id' | 'result'>) {}
}

export class MergeAction implements IAction {
  readonly type = Do.MERGE;
  constructor(
    public payload: Payload<Required<Pick<Args, 'entity' | 'entityName'>>>
  ) {}
}

export class MergeErrorAction implements IAction {
  readonly type = Do.MERGE_ERROR;
  constructor(public payload: Pick<Payload, 'tx_id' | 'error'>) {}
}

export class MergeSuccessAction implements IAction {
  readonly type = Do.MERGE_SUCCESS;
  constructor(public payload: Payload<Required<Pick<Args, 'id' | 'entityName'>>>) {}
}

export class MergeBatchAction implements IAction {
  readonly type = Do.MERGE_BATCH;
  constructor(
    public payload: Payload<Required<Pick<Args, 'entities' | 'entityName'>>>
  ) {}
}

export class MergeBatchErrorAction implements IAction {
  readonly type = Do.MERGE_BATCH_ERROR;
  constructor(public payload: Pick<Payload, 'tx_id' | 'error'>) {}
}

export class MergeBatchSuccessAction implements IAction {
  readonly type = Do.MERGE_BATCH_SUCCESS;
  constructor(public payload: Pick<Payload, 'tx_id' | 'result'>) {}
}


export type ActionsUnion =
  | DeleteByEntityNameAction
  | DeleteByEntityIdAction
  | DeleteErrorAction
  | DeleteSuccessAction
  | QueryByEntityNameAction
  | QueryByEntityIdAction
  | QuerySuccessAction
  | QueryErrorAction
  | MergeAction
  | MergeErrorAction
  | MergeSuccessAction
  | MergeBatchAction
  | MergeBatchErrorAction
  | MergeBatchSuccessAction
  ;
