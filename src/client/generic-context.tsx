"use client";

import {
  type PropsWithChildren,
  createContext,
  useContext,
  useRef,
} from "react";

export function createGenericContext<T>() {
  const GenericContext = createContext<T | null>(null);

  const GenericContextProvider = ({
    value,
    children,
  }: PropsWithChildren<{ value: T }>) => {
    const valueRef = useRef(value);
    return (
      <GenericContext.Provider value={valueRef.current}>
        {children}
      </GenericContext.Provider>
    );
  };

  const useGenericContext = () => {
    const context = useContext(GenericContext);
    if (!context) {
      throw new Error(
        "useGenericContext must be used inside its own GenericContextProvider.",
      );
    }
    return context;
  };

  return [GenericContextProvider, useGenericContext] as const;
}
