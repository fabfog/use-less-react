import type { Subscriber } from "./types";

class PubSub {
  _subscribers = new Set<Subscriber<typeof this>>();

  notify(...propNames: (keyof typeof this)[]): void {
    if (propNames.length === 0) return;
    this._subscribers.forEach((callback) => {
      callback(propNames);
    });
  }

  subscribe(callback: Subscriber<typeof this>): () => void {
    this._subscribers.add(callback);
    return () => this._subscribers.delete(callback);
  }
}

export { PubSub };
