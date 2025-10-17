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
  disabled?: boolean;
}

export function ImmutableClass(
  { disabled }: ImmutableClassOptions = { disabled: false },
) {
  return function <T extends Constructor>(ctor: T) {
    if (disabled) {
      return ctor;
    }

    const decoratedClass = class extends ctor {
      constructor(...args: any[]) {
        super(...args);

        if (!disabled) {
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

    // Keep original class name
    Object.defineProperty(decoratedClass, "name", { value: ctor.name });

    return decoratedClass;
  };
}
