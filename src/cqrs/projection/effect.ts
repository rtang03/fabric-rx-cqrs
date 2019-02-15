import { inject, injectable } from 'inversify';
import { filter, map, mergeMap, tap } from 'rxjs/operators';
import {
  IDefaultReducer,
  IEffect,
  ISideEffects,
  IStore,
  TYPES
} from '../../rx-store';
import { Entity } from '../../types';
import * as fromEntityQ from '../entity-query';
import { ofTypeByTxId, ofTypeToSpread } from '../helper';
import * as Projection from './index';

@injectable()
export class Effect implements IEffect {
  constructor(
    @inject(TYPES.SideEffect) public action$: ISideEffects,
    @inject(TYPES.Store) public store: IStore,
    @inject(TYPES.DefaultReducer) public defaultReducer: IDefaultReducer
  ) {}

  invokeEffect() {
    const store = this.store;
    const query$ = store.select<fromEntityQ.State>(fromEntityQ.REDUCER);
    const reducer = this.defaultReducer.getReducer();

    this.action$
      .pipe(
        ofTypeToSpread<fromEntityQ.MergeSuccessAction>(
          fromEntityQ.MergeSuccessAction
        ),
        filter(
          ({ tx_id, args: { entityName } }) =>
            entityName === this.defaultReducer.entityName
        ),
        tap(({ tx_id, args: { id, entityName } }) =>
          store.dispatch(
            new fromEntityQ.QueryByEntityIdAction({
              tx_id,
              args: { id, entityName }
            })
          )
        ),
        mergeMap(({ tx_id }) =>
          query$.pipe(
            ofTypeByTxId<Record<string, Entity>>(
              tx_id,
              fromEntityQ.Do.QUERY_SUCCESS,
              'result'
            ),
            map(
              entity =>
                new Projection.UpsertAction({
                  tx_id,
                  args: { entity, reducer }
                })
            )
          )
        )
      )
      .subscribe(_ => store.dispatch(_));
  }
}
