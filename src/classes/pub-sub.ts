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

  onNotify<T extends (keyof typeof this)[]>(
    propNames: T,
    callback: (data: Pick<this, T[number]>) => void | Promise<void>,
  ) {
    return this.subscribe((notifiedProps) => {
      const hasRelevantUpdate = notifiedProps.some((p) =>
        propNames.includes(p),
      );
      if (hasRelevantUpdate) {
        const data = propNames.reduce<Partial<Pick<this, T[number]>>>(
          (acc, cur) => {
            return {
              ...acc,
              [cur]: this[cur],
            };
          },
          {},
        );
        callback(data as Pick<this, T[number]>);
      }
    });
  }
}

export { PubSub };
