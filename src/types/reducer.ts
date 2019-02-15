export type Reducer<T = any> = (
  history: Array<{ type: string; payload?: any }>,
  initial?: T
) => T;
