/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Constructor } from "../types";

function deepFreeze(value: any) {
  Object.freeze(value);
  if (value && typeof value === "object") {
    Object.getOwnPropertyNames(value).forEach((prop) => {
      const v = value[prop];
      if (v && typeof v === "object" && !Object.isFrozen(v)) {
        deepFreeze(v);
      }
    });
  }
  return value;
}

interface ImmutableClassOptions {
  enabled?: boolean;
}

export function ImmutableClass(
  options: ImmutableClassOptions = { enabled: true },
) {
  const { enabled = true } = options;

  return function <T extends Constructor>(ctor: T) {
    if (!enabled) {
      // Se disabilitato, ritorniamo la classe originale senza modifiche
      return ctor;
    }

    return class extends ctor {
      constructor(...args: any[]) {
        super(...args);

        if (enabled) {
          Object.keys(this).forEach((key) => {
            deepFreeze(this[key]);
          });

          return new Proxy(this, {
            set(target, prop, value, receiver) {
              deepFreeze(value);
              return Reflect.set(target, prop, value, receiver);
            },
          });
        }
      }
    };
  };
}
