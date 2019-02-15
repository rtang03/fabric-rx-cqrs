import { merge } from 'rxjs';
import { generateToken, ofTypeByTxId } from '../helper';
import { store } from '../inversify.config';
import { Do, ReconcileAction } from './action';
import { REDUCER, State } from './reducer';

export const reconcile = async (entityName: string, reducer: () => void) =>
  await new Promise(resolve => {
    const tx_id = generateToken();
    const entity$ = store.select<State>(REDUCER);
    store.dispatch(new ReconcileAction({ tx_id, args: { entityName, reducer } }));
    const success$ = entity$.pipe(
      ofTypeByTxId(tx_id, Do.RECONCILE_SUCCESS, 'result')
    );
    const error$ = entity$.pipe(
      ofTypeByTxId(tx_id, Do.RECONCILE_ERROR, 'error')
    );
    merge(success$, error$).subscribe(() => {
      console.log(`🔥 ${entityName} - Reconcile Done 🔥\n`);
      resolve(true);
    });
  });
