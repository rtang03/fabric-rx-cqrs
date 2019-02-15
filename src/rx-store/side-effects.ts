import { injectable } from 'inversify';
import { BehaviorSubject } from 'rxjs';
import { IAction, ISideEffects } from './interfaces';

@injectable()
export class SideEffects extends BehaviorSubject<IAction>
  implements ISideEffects {
  static INIT = 'side-effects';

  constructor() {
    super({ type: SideEffects.INIT });
  }

  dispatch(action: IAction): void {
    this.next(action);
  }

  complete() {}
}
