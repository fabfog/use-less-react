"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from "react";
import { useImmer } from "use-immer";

import type { Subscriber } from "../classes/types";

interface Subscribable {
  subscribe: (callback: Subscriber<any>) => () => void;
}

function useExistingReactiveInstance<
  TClass extends Subscribable,
  K extends (keyof TClass)[],
>(instance: TClass, dependencies: K) {
  type TDep = K[number]; // strongly typed dependency values as instance keys
  type TState = Pick<TClass, TDep>; // subset of instance fields based on dependency items (returned as state)

  const [state, setState] = useImmer<TState>(
    (() => {
      // create initial state snapshot
      const s = {} as TState;
      dependencies.forEach((key) => {
        s[key] = instance[key];
      });
      return s;
    })(),
  );

  useEffect(() => {
    const unsubscribe = instance.subscribe((propNames) => {
      const hasRelevantUpdate = propNames.some((p) =>
        dependencies.includes(p as keyof TClass),
      );

      if (hasRelevantUpdate) {
        setState((draft) => {
          propNames.forEach((propName) => {
            if (dependencies.includes(propName as keyof TClass)) {
              const key = propName as TDep;
              // update state setting each key
              (draft as TState)[key] = instance[key];
            }
          });
        });
      }
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instance, setState, ...dependencies]);

  return { state };
}

export function useReactiveInstance<
  TClass extends Subscribable,
  K extends (keyof TClass)[],
>(instanceGetter: TClass | (() => TClass), dependencies: K) {
  const instanceRef = useRef<TClass>(null);

  if (instanceRef.current === null) {
    if (typeof instanceGetter === "function") {
      instanceRef.current = instanceGetter();
    } else {
      instanceRef.current = instanceGetter;
    }
  }

  const result = useExistingReactiveInstance(instanceRef.current, dependencies);

  return {
    ...result,
    instance: instanceRef.current,
  };
}
