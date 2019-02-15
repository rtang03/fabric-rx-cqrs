import { IAction } from '../../rx-store';
import { BaseEvent  } from '../../types';

export enum Do {
  CREATE = '[Entity-C] Create',
  CREATE_ERROR = '[Entity-C] Create Error',
  CREATE_SUCCESS = '[Entity-C] Create Success',
  DELETE_BY_EN_ID = '[Entity-C] Delete entities By entityName and id',
  DELETE_ERROR = '[Entity-C] Delete Error',
  DELETE_SUCCESS = '[Entity-C] Delete Success',
  DELETE_BY_COMMITID = '[Entity-C] Delete By commitId',
  QUERY_BY_ENTITY_ID = '[Entity-C] Query entity by entity id',
  QUERY_BY_ENTITY_NAME = '[Entity-C] Query entity by entityName',
  QUERY_BY_COMMIT_ID = '[Entity-C] Query by commitId',
  QUERY_ERROR = '[Entity-C] Query Error',
  QUERY_SUCCESS = '[Entity-C] Query Success'
}

export interface Args {
  entityName: string;
  id?: string;
  version?: number;
  events?: BaseEvent[];
  commitId?: string;
}

export type Payload<T = Args> = { tx_id: string; result?: any; error?: any } & {
  args: T;
};

export class CreateAction implements IAction {
  readonly type = Do.CREATE;
  constructor(
    public payload: Payload<
      Required<Pick<Args, 'entityName' | 'id' | 'version' | 'events'>>
    >
  ) {}
}

export class CreateErrorAction implements IAction {
  readonly type = Do.CREATE_ERROR;
  constructor(public payload: Pick<Payload, 'tx_id' | 'error'>) {}
}

export class CreateSuccessAction implements IAction {
  readonly type = Do.CREATE_SUCCESS;
  constructor(public payload: Pick<Payload, 'tx_id' | 'result'>) {}
}

export class DeleteByEntnameIdAction implements IAction {
  readonly type = Do.DELETE_BY_EN_ID;
  constructor(
    public payload: Payload<Required<Pick<Args, 'entityName' | 'id'>>>
  ) {}
}

export class DeleteErrorAction implements IAction {
  readonly type = Do.DELETE_ERROR;
  constructor(public payload: Pick<Payload, 'tx_id' | 'error'>) {}
}

export class DeleteSuccessAction implements IAction {
  readonly type = Do.DELETE_SUCCESS;
  constructor(public payload: Pick<Payload, 'tx_id' | 'result'>) {}
}

export class DeleteByEntnameCommitIdAction implements IAction {
  readonly type = Do.DELETE_BY_COMMITID;
  constructor(
    public payload: Payload<
      Required<Pick<Args, 'entityName' | 'id' | 'commitId'>>
    >
  ) {}
}

export class QueryByEntityIdAction implements IAction {
  readonly type = Do.QUERY_BY_ENTITY_ID;
  constructor(
    public payload: Payload<Required<Pick<Args, 'entityName' | 'id'>>>
  ) {}
}

export class QueryByEntityNameAction implements IAction {
  readonly type = Do.QUERY_BY_ENTITY_NAME;
  constructor(public payload: Payload<Required<Pick<Args, 'entityName'>>>) {}
}

export class QueryByCommitIdAction implements IAction {
  readonly type = Do.QUERY_BY_COMMIT_ID;
  constructor(
    public payload: Payload<
      Required<Pick<Args, 'id' | 'entityName' | 'commitId'>>
    >
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

export type ActionsUnion =
  | CreateAction
  | CreateErrorAction
  | CreateSuccessAction
  | DeleteByEntnameIdAction
  | DeleteErrorAction
  | DeleteSuccessAction
  | DeleteByEntnameCommitIdAction
  | QueryByEntityIdAction
  | QueryByEntityNameAction
  | QueryByCommitIdAction
  | QueryErrorAction
  | QuerySuccessAction;
