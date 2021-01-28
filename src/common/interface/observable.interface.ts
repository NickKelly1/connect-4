
export interface IObservableSubscriberArg<T> { prev: T; next: T; diff: DeepPartial<T>; };
export interface IObservableSubscriber<T> { (arg: IObservableSubscriberArg<T>): any; };
export interface IObservableUnsubscribe { (): void; };
export interface IObservable<T> {
  value(): T;
  subscribe(fn: IObservableSubscriber<T>): IObservableUnsubscribe;
  set(next: T | ((draft: T) => void)): void;
} 