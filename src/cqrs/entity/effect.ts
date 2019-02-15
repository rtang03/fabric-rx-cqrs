import { inject, injectable } from 'inversify';
import { merge } from 'rxjs';
import { filter, map, mergeMap, tap } from 'rxjs/operators';
import { IEffect, ISideEffects, IStore, TYPES } from '../../rx-store';
import { Entity } from '../../types';
import * as EntityC from '../entity-command';
import * as EntityQ from '../entity-query';
import { ofTypeByTxId, ofTypeToSpread } from '../helper';
import * as Projection from '../projection';
import {
  MergeAction,
  ReconcileAction,
  ReconcileErrorAction,
  ReconcileSuccessAction
} from './action';

@injectable()
export class Effect implements IEffect {
  constructor(
    @inject(TYPES.SideEffect) public action$: ISideEffects,
    @inject(TYPES.Store) public store: IStore
  ) {}

  invokeEffect() {
    const store = this.store;
    const command$ = store.select<EntityC.State>(EntityC.REDUCER);
    const query$ = store.select<EntityQ.State>(EntityQ.REDUCER);

    // Reconcile
    this.action$
      .pipe(
        ofTypeToSpread<ReconcileAction>(ReconcileAction),
        tap(({ tx_id, args: { entityName } }) =>
          store.dispatch(
            new EntityC.QueryByEntityNameAction({ tx_id, args: { entityName } })
          )
        ),
        mergeMap(({ tx_id, args: { entityName, reducer } }) =>
          merge(
            command$.pipe(
              ofTypeByTxId<Record<string, Entity>>(
                tx_id,
                EntityC.Do.QUERY_SUCCESS,
                'result'
              ),
              map(
                entities =>
                  new MergeAction({
                    tx_id,
                    args: { entities, entityName, reducer }
                  })
              )
            ),
            command$.pipe(
              ofTypeByTxId(tx_id, EntityC.Do.QUERY_ERROR, 'error'),
              map(error => new ReconcileErrorAction({ tx_id, error }))
            )
          )
        )
      )
      .subscribe(_ => store.dispatch(_));

    this.action$
      .pipe(
        ofTypeToSpread<MergeAction>(MergeAction),
        tap(({ tx_id, args: { entityName, entities } }) =>
          store.dispatch(
            new EntityQ.MergeBatchAction({
              tx_id,
              args: { entityName, entities }
            })
          )
        ),
        mergeMap(({ tx_id }) =>
          query$.pipe(
            ofTypeByTxId(tx_id, EntityQ.Do.MERGE_BATCH_SUCCESS, 'result'),
            map(result => new ReconcileSuccessAction({ tx_id, result }))
          )
        )
      )
      .subscribe(_ => store.dispatch(_));

    this.action$
      .pipe(
        ofTypeToSpread<MergeAction>(MergeAction),
        filter(({ args: { reducer } }) => !!reducer),
        map(
          ({ tx_id, args: { entities, reducer } }) =>
            new Projection.UpsertManyAction({
              tx_id,
              args: { entities, reducer }
            })
        )
      )
      .subscribe(_ => store.dispatch(_));
  }
}
