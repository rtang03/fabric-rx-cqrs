import { assign, filter, groupBy, isNumber, keys, values } from 'lodash';
import {
  createEntityAdapter,
  EntityAdapter,
  EntityState
} from '../../rx-store/entity';
import { Entity } from '../../types';
import { ActionsUnion, Do } from './action';

export const REDUCER = 'projection';

export interface State<T = any> extends EntityState<T> {
  tx_id: string;
  actionType: string;
  result?: any;
}

export const adapter: EntityAdapter<any> = createEntityAdapter<any>();

export const initialState: State = adapter.getInitialState({
  tx_id: undefined,
  actionType: undefined,
  result: undefined
});

export function reducer(state = initialState, action: ActionsUnion): State {
  switch (action.type) {
    case Do.FIND:
      state.tx_id = action.payload.tx_id;
      state.actionType = action.type;
      // state.result = null;
      const { where, all, contain } = action.payload.args;
      return all
        ? assign({}, state, { result: values(state.entities) })
        : where
        ? assign({}, state, { result: filter(state.entities, where) })
        : contain
        ? assign({}, state, {
            result: filter(state.entities, obj =>
              JSON.stringify(obj).includes(
                isNumber(contain) ? contain.toString() : contain
              )
            )
          })
        : state;

    case Do.UPSERT:
      state.tx_id = action.payload.tx_id;
      state.actionType = action.type;
      const _id = values(action.payload.args.entity)[0].id;
      const temp = {};
      temp[_id] = {};
      state.result = temp;
      return adapter.upsertOne(
        assign(
          { id: _id },
          action.payload.args.reducer(
            getHistory(values(action.payload.args.entity))
          )
        ),
        state
      );

    case Do.UPSERT_MANY:
      state.tx_id = action.payload.tx_id;
      state.actionType = action.type;
      state.result = null;
      const { args } = action.payload;
      const group = groupBy(args.entities, ({ id }) => id);
      const objs = [];
      keys(group).forEach(id => {
        objs.push(assign({ id }, args.reducer(getHistory(values(group[id])))));
      });
      const result = {};
      keys(group).forEach(key => (result[key] = {}));
      return adapter.upsertMany(objs, assign({ result }, state));

    case Do.REMOVE_ALL:
      state.tx_id = action.payload.tx_id;
      state.actionType = action.type;
      state.result = null;
      return adapter.removeAll(state);

    default:
      return state;
  }
}

const getHistory = (entities: Entity[]): any[] => {
  const result = [];
  entities.forEach(({ events }) => events.forEach(_ => result.push(_)));
  return result;
};
