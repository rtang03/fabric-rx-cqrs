import { Reducer } from '../../types';

export interface CounterEvent {
  type: string;
}

export interface Counter {
  value: number;
}

export const counterReducer: Reducer<Counter> = (
  history: Event[],
  initial = { value: 0 }
): Counter => history.reduce(reducer, initial);

const reducer = ({ value }, e: Event) => {
  switch (e.type) {
    case 'ADD':
      value++;
      return { value };
    case 'MINUS':
      value--;
      return { value };
    default:
      return { value };
  }
};
