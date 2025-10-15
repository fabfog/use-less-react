import type { Constructor, Subscriber } from "./types";

export function PubSubMixin<TBase extends Constructor>(Base: TBase) {
  return class PubSub extends Base {
    _subscribers = new Set<Subscriber<TBase>>();

    notify(...propNames: (keyof TBase)[]): void {
      if (propNames.length === 0) return;
      this._subscribers.forEach((callback) => {
        callback(propNames);
      });
    }

    subscribe(callback: Subscriber<TBase>): () => void {
      this._subscribers.add(callback);
      return () => this._subscribers.delete(callback);
    }
  };
}
