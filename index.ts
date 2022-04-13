export interface SubscribeToken {
  unsubscribe: () => void;
}

export interface KeepToken {
  release: () => void;
}

export interface CommonObject {
  [key: string]: any[];
}

interface Callback<T extends CommonObject, K extends keyof T> {
  (...args: T[K]): void;
}

type Listener<T extends CommonObject> = Partial<
  Record<
    keyof T,
    {
      token: string;
      fn: Callback<T, any>;
    }[]
  >
>;

interface Keep<T extends CommonObject> {
  shouldPublish: true | (() => boolean);
  name: keyof T;
  token: string;
  args: any[];
}

const when = (deps: true | (() => boolean)): boolean => {
  return typeof deps === 'boolean' ? deps : deps();
};

let counter: number = 0;

export class Topic<T extends CommonObject> {
  protected listeners: Listener<T> = {};
  protected origins: Listener<T> = {};
  protected keeps: Keep<T>[] = [];

  publish<K extends keyof T>(name: K, ...args: T[K]): void {
    const listeners = (this.origins[name] = this.listeners[name]);

    if (!listeners || !listeners.length) {
      return;
    }

    for (let i = 0; i < listeners.length; ++i) {
      listeners[i]!.fn.apply(null, args);
    }

    this.origins[name] = undefined;
  }

  subscribeOnce<K extends keyof T>(
    name: K,
    fn: Callback<T, K>,
  ): SubscribeToken {
    let executed = false;

    const token = this.subscribe(name, function () {
      fn.apply(null, arguments as unknown as T[K]);
      if (token) {
        token.unsubscribe();
      } else {
        executed = true;
      }
    });

    if (executed) {
      token.unsubscribe();
    }

    return token;
  }

  subscribe<K extends keyof T>(name: K, fn: Callback<T, K>): SubscribeToken {
    const token = 'Token_' + counter++;
    let listeners = this.listeners[name];

    if (listeners) {
      const origin = this.origins[name];

      if (origin && listeners === origin) {
        listeners = this.listeners[name] = listeners.slice(0);
      }
    } else {
      listeners = this.listeners[name] = [];
    }

    listeners.push({
      token,
      fn,
    });

    if (this.keeps.length) {
      const keeps = this.keeps.filter(
        (item) => item.name === name && when(item.shouldPublish),
      );

      for (let i = 0; i < keeps.length; ++i) {
        fn.apply(null, keeps[i]!.args as T[K]);
      }
    }

    return {
      unsubscribe: this.unsubscribe.bind(this, name, token),
    };
  }

  /**
   * Keep publishing for every subscription.
   * The deps can be `true` or a function `() => true/false`. For dynamic publishing, function is required.
   * ```javascript
   * let deps = true;
   * topic.keep('test', () => deps, 'hello', 'world');
   * ```
   */
  keep<K extends keyof T>(
    name: K,
    shouldPublish: Keep<T>['shouldPublish'],
    ...args: T[K]
  ): KeepToken {
    const token = 'Token_' + counter++;

    when(shouldPublish) && this.publish(name, ...args);
    this.keeps.push({
      shouldPublish,
      token,
      name,
      args,
    });

    return {
      release: this.release.bind(this, token),
    };
  }

  protected unsubscribe(name: keyof T, token: string): void {
    const listeners = this.listeners[name];

    if (!listeners || !listeners.length) {
      return;
    }

    this.listeners[name] = listeners.filter((item) => item.token !== token);
  }

  protected release(token: string) {
    this.keeps = this.keeps.filter((item) => item.token !== token);
  }
}

export const topic = new Topic();
