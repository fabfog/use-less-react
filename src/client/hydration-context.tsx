"use client";

import { useRef, type FC, type PropsWithChildren } from "react";
import {
  hydrateInstances,
  type SerializableClassesRegistry,
  type SerializedInstance,
} from "../classes";
import { createGenericContext } from "./generic-context";

export function createHydrationContext<HydratedPropsReturn>(
  serializableClassesRegistry: SerializableClassesRegistry,
) {
  const [GenericContextProvider, useGenericContextProvider] =
    createGenericContext<Record<string, SerializedInstance>>();

  const HydrationProvider: FC<
    PropsWithChildren<{ dehydratedData: Record<string, SerializedInstance> }>
  > = ({ children, dehydratedData }) => {
    return (
      <GenericContextProvider value={dehydratedData}>
        {children}
      </GenericContextProvider>
    );
  };

  const useHydratedInstances = () => {
    const value = useGenericContextProvider();
    const hydratedProps = useRef(
      hydrateInstances<HydratedPropsReturn>(value, serializableClassesRegistry),
    );

    return hydratedProps.current as HydratedPropsReturn;
  };

  return [HydrationProvider, useHydratedInstances] as const;
}
