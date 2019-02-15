import { randomBytes } from 'crypto';
import { assign } from 'lodash';
import { pipe } from 'rxjs';
import { filter, map, pluck, tap } from 'rxjs/operators';
import { BaseState, IAction, Logger } from '../rx-store';

const logger = new Logger();

export const BASE_INITIAL_STATE = {
  tx_id: undefined,
  actionType: undefined,
  action: undefined,
  result: undefined,
  loading: undefined,
  error: undefined,
  status: undefined
};

export const getErrorState = (action: IAction): BaseState =>
  assign(
    {},
    {
      tx_id: action.payload.tx_id,
      actionType: action.type,
      action,
      loading: false,
      result: null,
      error: action.payload.error,
      status: action.payload.status
    }
  );

export const getInitialState = (action: IAction): BaseState =>
  assign(
    {},
    {
      tx_id: action.payload.tx_id,
      actionType: action.type,
      action,
      loading: true,
      result: null,
      error: null,
      status: undefined
    }
  );

export const getSuccessState = (action: IAction): BaseState =>
  assign(
    {},
    {
      tx_id: action.payload.tx_id,
      actionType: action.type,
      action,
      loading: false,
      result: action.payload.result,
      error: null,
      status: action.payload.status
    }
  );

export function generateToken(len: number = 4): string {
  return randomBytes(len)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  // .replace(/\=/g, '');
}

export const doLogAction = () =>
  pipe(tap<IAction>((action: IAction) => logger.waiting(action)));

export const ofType = TAction =>
  pipe(filter<IAction>(_ => _ instanceof TAction));

export const ofTypeByTxId = <T>(
  tx_id: string,
  action: string,
  prop: 'result' | 'error' | 'status'
) =>
  pipe(
    filter<BaseState>(_ => !!_),
    filter<BaseState>(_ => _.tx_id === tx_id),
    filter<BaseState>(_ => _.actionType === action),
    pluck<BaseState, T>(prop)
  );

export const ofProjectionByTxId = (tx_id: string, action: string) =>
  pipe(
    filter<any>(_ => _.tx_id === tx_id),
    filter<any>(_ => _.actionType === action)
  );

export const ofTypeToSpread = <T>(Action: new (p) => IAction) =>
  pipe(
    ofType(Action),
    doLogAction(),
    map<
      IAction,
      {
        tx_id: string;
        args: T extends { payload: { args: infer U } } ? U : never;
        action: IAction;
        result: any;
      }
    >(action => ({
      tx_id: action.payload.tx_id,
      args: action.payload.args,
      action,
      result: action.payload.result
    }))
  );
