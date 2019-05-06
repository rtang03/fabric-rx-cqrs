import { injectable } from 'inversify';
import { IDefaultReducer } from '../rx-store';
import { Reducer } from '../types';

@injectable()
export class DefaultReducer implements IDefaultReducer {
  reducer: Reducer;
  constructor(public entityName: string) {}

  getReducer() {
    return this.reducer;
  }

  setReducer(reducer) {
    this.reducer = reducer;
  }

}
