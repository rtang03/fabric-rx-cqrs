import { inject, injectable } from 'inversify';
import { map, mergeMap } from 'rxjs/operators';
import {
  IAction,
  IEffect,
  IFabricService,
  ISideEffects,
  IStore,
  TYPES
} from '../../rx-store';
import { Entity } from '../../types';
import { ofTypeToSpread } from '../helper';
import {
  CreateAction,
  CreateErrorAction,
  CreateSuccessAction,
  DeleteByEntnameCommitIdAction,
  DeleteByEntnameIdAction,
  DeleteErrorAction,
  DeleteSuccessAction,
  QueryByCommitIdAction,
  QueryByEntityIdAction,
  QueryByEntityNameAction,
  QueryErrorAction,
  QuerySuccessAction
} from './action';

@injectable()
export class Effect implements IEffect {
  constructor(
    @inject(TYPES.SideEffect) public action$: ISideEffects,
    @inject(TYPES.Store) public store: IStore,
    @inject(TYPES.FabricService) public fabric: IFabricService
  ) {}

  invokeEffect() {
    const store = this.store;

    this.action$
      .pipe(
        ofTypeToSpread<CreateAction>(CreateAction),
        mergeMap(({ tx_id, args: { id, entityName, version, events } }) =>
          this.fabric
            .submitTransaction({
              fcn: 'createEntity',
              args: [entityName, id, version.toString(), JSON.stringify(events)]
            })
            .pipe(
              map<Record<string, Entity>, IAction>(result =>
                result.error
                  ? new CreateErrorAction({ tx_id, error: result.error })
                  : new CreateSuccessAction({ tx_id, result })
              )
            )
        )
      )
      .subscribe(_ => store.dispatch(_));

    this.action$
      .pipe(
        ofTypeToSpread<DeleteByEntnameCommitIdAction>(
          DeleteByEntnameCommitIdAction
        ),
        mergeMap(({ tx_id, args: { entityName, id, commitId } }) =>
          this.fabric
            .submitTransaction({
              fcn: 'deleteByEntityIdCommitId',
              args: [entityName, id, commitId]
            })
            .pipe(
              map<Record<string, Entity>, IAction>(result =>
                result.error
                  ? new DeleteErrorAction({
                      tx_id,
                      error: result.error
                    })
                  : new DeleteSuccessAction({ tx_id, result })
              )
            )
        )
      )
      .subscribe(_ => store.dispatch(_));

    this.action$
      .pipe(
        ofTypeToSpread<DeleteByEntnameIdAction>(DeleteByEntnameIdAction),
        mergeMap(({ tx_id, args: { entityName, id } }) =>
          this.fabric
            .submitTransaction({
              fcn: 'deleteByEntityId',
              args: [entityName, id]
            })
            .pipe(
              map<Record<string, Entity>, IAction>(result =>
                result.error
                  ? new DeleteErrorAction({ tx_id, error: result.error })
                  : new DeleteSuccessAction({ tx_id, result })
              )
            )
        )
      )
      .subscribe(_ => store.dispatch(_));

    this.action$
      .pipe(
        ofTypeToSpread<QueryByCommitIdAction>(QueryByCommitIdAction),
        mergeMap(({ tx_id, args: { id, entityName, commitId } }) =>
          this.fabric
            .submitTransaction({
              fcn: 'queryByEntityIdCommitId',
              args: [entityName, id, commitId]
            })
            .pipe(
              map<Record<string, Entity>, IAction>(result =>
                result.error
                  ? new QueryErrorAction({ tx_id, error: result.error })
                  : new QuerySuccessAction({ tx_id, result })
              )
            )
        )
      )
      .subscribe(_ => store.dispatch(_));

    this.action$
      .pipe(
        ofTypeToSpread<QueryByEntityNameAction>(QueryByEntityNameAction),
        mergeMap(({ tx_id, args: { entityName } }) =>
          this.fabric
            .submitTransaction({
              fcn: 'queryByEntityName',
              args: [entityName]
            })
            .pipe(
              map<Record<string, Entity>, IAction>(result =>
                result.error
                  ? new QueryErrorAction({ tx_id, error: result.error })
                  : new QuerySuccessAction({ tx_id, result })
              )
            )
        )
      )
      .subscribe(_ => store.dispatch(_));

    this.action$
      .pipe(
        ofTypeToSpread<QueryByEntityIdAction>(QueryByEntityIdAction),
        mergeMap(({ tx_id, args: { entityName, id } }) =>
          this.fabric
            .submitTransaction({
              fcn: 'queryByEntityId',
              args: [entityName, id]
            })
            .pipe(
              map<Record<string, Entity>, IAction>(result =>
                result.error
                  ? new QueryErrorAction({ tx_id, error: result.error })
                  : new QuerySuccessAction({ tx_id, result })
              )
            )
        )
      )
      .subscribe(_ => store.dispatch(_));
  }
}
