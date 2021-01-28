import { diff } from 'deep-object-diff';
import * as immer from 'immer';
import format from 'pretty-format';
import { IObservable, IObservableSubscriber, IObservableSubscriberArg } from '../interface/observable.interface';


export interface IOnErrorUtil<T extends (...args: any[]) => any> {
  ignore<R>(handler: (error: unknown, ...args: Parameters<T>) => R): (...args: Parameters<T>) => ReturnType<T> | R;
  handle(handler: (error: unknown, ...args: Parameters<T>) => ReturnType<T>): (...args: Parameters<T>) => ReturnType<T>;
  rethrow(handler: (error: unknown, ...args: Parameters<T>) => any): (...args: Parameters<T>) => ReturnType<T>;
}

interface IObj<T> {
  value(): T;
  item<K extends keyof T>(key: K | null | undefined): undefined | T[K];
}

const ObjCache = new WeakMap<any, IObj<any>>();

export const Util = {
  /**
   * Assert that the argument is defined
   *
   * @param arg
   */
  assertDefined<T>(arg: T | null | undefined): T {
    if (arg == null) throw new ReferenceError('Failed asserting that the argument is defined');
    return arg;
  },

  /**
   * Is the argument defined?
   *
   * @param arg
   */
  isNullable<T>(arg: T | null | undefined): arg is T {
    return !Util.isDefined(arg);
  },

  /**
   * Is the argument defined?
   *
   * @param arg
   */
  isDefined<T>(arg: T | null | undefined): arg is T {
    if (arg == null) return false;
    return true;
  },

  /**
   * Filter a value out
   *
   * @param arr
   * @param out
   */
  filterOut<T>(arr: T[], out: T): T[] {
    return arr.filter(val => val !== out);
  },

  /**
   * Filter a value in
   *
   * @param arr
   * @param out
   */
  filterIn<T>(arr: T[], out: T): T[] {
    return arr.filter(val => val === out);
  },

  /**
   * Index an object
   * (makes TS happy...)
   *
   * @param obj
   * @param k
   */
  obj<T>(obj: T): IObj<T> {
    const match = ObjCache.get(obj);
    if (match) return match;
    const _match: IObj<T> = {
      value() { return obj; },
      item<K extends keyof T>(key: K | null | undefined): T[K] | undefined {
        return obj[key as keyof T] as T[K];
      },
    };
    ObjCache.set(obj, _match as IObj<any>);
    return _match;
  },

  /**
   * Create an Observable
   *
   * @param initial
   */
  createObservable<T>(initial: T): IObservable<T> {
    const ref: { obj: { cur: T } } = { obj: { cur: initial }, };
    let subscribers: IObservableSubscriber<T>[] = [];
    const observable: IObservable<T> = {
      value() { return ref.obj.cur; },
      subscribe(fn: IObservableSubscriber<T>) {
        subscribers.push(fn);
        // returns unsubscribe function
        return () => { subscribers = subscribers.filter(sub => sub !== fn) };
      },
      set(next: T | ((draft: T) => void)) {
        const before = ref.obj.cur;
        // immutably update
        ref.obj = immer.produce(ref.obj, (draft) => {
          // function given...
          if (typeof next === 'function') {
            draft.cur = immer.produce(draft.cur, (next as (draft: T) => void));
          }
          // new value given...
          else {
            (draft.cur as T) = next;
          }
        });
        const after = ref.obj.cur;
        if (subscribers.length) {
          const _diff = diff(before as unknown as object, after as unknown as object);
          const arg: IObservableSubscriberArg<T> = { next: after, prev: before, diff: _diff, };
          subscribers.forEach(subscriber => subscriber(arg));
        }
      },
    };
    return observable;
  },


  /**
   * Create a debouncer
   *
   * @param duration
   */
  createDebouncer(duration: number) {
    let _timeout: ReturnType<typeof setTimeout>;
    return function setDebounce(fn: () => any, thisDuration?: number) {
      if (_timeout) clearTimeout(_timeout);
      _timeout = setTimeout(fn, thisDuration ?? duration);
    };
  },


  /**
   * Convert the number to an equivalent unit
   */
  unit(input: number): -1 | 0 | 1 {
    if (input < 0) return -1;
    if (input > 0) return 1;
    return 0;
  },

  /**
   * Spread an object
   */
  spread<T>(obj: T): T {
    return { ...obj };
  },


  /**
   * Omit the property from the object
   *
   * @param obj
   * @param key
   */
  omit<T, K extends keyof T>(obj: T, key: K): Omit<T, K> {
    const { [key]: dodge, ...keep } = obj;
    return keep;
  },


  /**
   * Pretty format
   *
   * @param value
   */
  pretty(value: unknown, options?: format.OptionsReceived): string {
    const _value = value instanceof Error ? Util.errorToJson(value) : value;
    const result = format(_value, options);
    return result;
  },

  /**
   * Try-catch a function and re-throw after handling...
   *
   * @param doer
   */
  onError<T extends (...args: any[]) => any>(doer: T): IOnErrorUtil<T> {
    return {
      /**
       * Ignore the error
       *
       * @param handler
       */
      ignore<R>(handler: (error: unknown, ...args: Parameters<T>) => R): (...args: Parameters<T>) => ReturnType<T> | R {
        const attempt: T = ((...args: Parameters<T>): ReturnType<T> | R => {
          try {
            return doer(...args);
          } catch (error) {
            return handler(error, ...args);
          }
        }) as T;
        return attempt;
      },

      /**
       * Handle the error gracefully and recover
       *
       * @param handler
       */
      handle(handler: (error: unknown, ...args: Parameters<T>) => ReturnType<T>) {
        const attempt: T = ((...args: Parameters<T>): ReturnType<T> => {
          try {
            return doer(...args);
          } catch (error) {
            return handler(error, ...args);
          }
        }) as T;
        return attempt;
      },

      /**
       * Re-throw after handling the error
       *
       * @param handler
       */
      rethrow(handler: (error: unknown, ...args: Parameters<T>) => any): T {
        const attempt: T = ((...args: Parameters<T>): ReturnType<T> => {
          try {
            return doer(...args);
          } catch (error) {
            handler(error, ...args);
            throw error();
          }
        }) as T;
        return attempt;
      },
    };
  },

  /**
   * Transform an error object to JSON
   */
  errorToJson(error: Error): object {
    const plain: any = {};
    Object.getOwnPropertyNames(error).forEach((key) => {
      plain[key] = (error as any)[key];
    });
    return plain;
  },
}