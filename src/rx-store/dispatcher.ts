import { injectable } from 'inversify';
import { BehaviorSubject } from 'rxjs';
import { IAction, IDispatcher } from './interfaces';

@injectable()
export class Dispatcher extends BehaviorSubject<IAction>
  implements IDispatcher {
  static INIT = '@store/init';

  constructor() {
    super({ type: Dispatcher.INIT });
  }

  dispatch(action: IAction): void {
    this.next(action);
  }

  complete() {}
}
