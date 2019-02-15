import { inject, injectable } from 'inversify';
import { BehaviorSubject } from 'rxjs';
import { IActionReducer, IDispatcher, IReducer } from './interfaces';
import { TYPES } from './types';

@injectable()
export class Reducer extends BehaviorSubject<IActionReducer>
  implements IReducer {
  static REPLACE = '@ngrx/store/replace-reducer';

  constructor(
    @inject(TYPES.Dispatcher) private _dispatcher: IDispatcher,
    @inject(TYPES.InitialReducer) private initialReducer: IActionReducer
  ) {
    super(initialReducer);
  }

  replaceReducer(reducer: IActionReducer) {
    this.next(reducer);
  }

  next(reducer: IActionReducer) {
    super.next(reducer);
    this._dispatcher.dispatch({ type: Reducer.REPLACE });
  }
}
