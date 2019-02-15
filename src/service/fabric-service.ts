import { Entity } from '../types';
import { inject, injectable, optional } from 'inversify';
import { from, Observable } from 'rxjs';
import { IFabricService, Logger, TYPES } from '../rx-store';
import { submit } from './submit';

@injectable()
export class FabricService implements IFabricService {
  constructor(
    @inject(TYPES.Logger)
    @optional()
    public logger: Logger
  ) {}

  submitTransaction({ fcn, args }): Observable<Record<string, Entity>> {
    return from(submit(fcn, args));
  }
}
