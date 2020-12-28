export interface TopicToken {
  _n: string | number | symbol;
  _t_k: string;
}

interface WhatT {
  [key: string]: (...args: any[]) => void;
}

interface Callback<T extends WhatT, K extends keyof T> {
  (...args: Parameters<T[K]>): void;
}

type Listener<T extends WhatT> = Partial<Record<keyof T, {
  token: TopicToken;
  fn: Callback<T, keyof T>;
}[]>>;

let counter: number = 0;

export class Topic<T extends WhatT> {
  protected listeners: Listener<T> = {};
  protected origin: Listener<T> = {};

  publish<K extends keyof T>(name: K, ...args: Parameters<T[K]>): void {
    const listeners = this.origin[name] = this.listeners[name];

    if (!listeners || !listeners.length) {
      return;
    }

    for (let i = 0; i < listeners.length; ++i) {
      listeners[i]!.fn.apply(null, args);
    }

    this.origin[name] = undefined;
  }

  subscribeOnce<K extends keyof T>(name: K, fn: Callback<T, K>): TopicToken {
    const that = this;
    const token = this.subscribe(name, function () {
      fn.apply(null, arguments as unknown as Parameters<T[K]>);
      that.unsubscribe(token);
    });

    return token;
  }

  subscribe<K extends keyof T>(name: K, fn: Callback<T, K>): TopicToken {
    const token: TopicToken = {
      _n: name,
      _t_k: 'Token_' + counter++ + ':' + name,
    };
    let listeners = this.listeners[name];

    if (listeners) {
      const origin = this.origin[name];

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

    return token;
  }

  unsubscribe(token?: TopicToken): void {
    if (!token || !token._t_k || !token._n) {
      return;
    }

    const name = token._n as keyof T;
    const listeners = this.listeners[name];

    if (!listeners || !listeners.length) {
      return;
    }

    this.listeners[name] = listeners.filter((item) => item.token !== token);
  }
}

export const topic = new Topic();
