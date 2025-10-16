import type {
  Serializable,
  SerializableClassesRegistry,
  SerializableRecord,
  SerializedInstance,
} from "./types";

export function dehydrateInstances<T extends SerializableRecord>(value: T) {
  const serializedData: Record<string, SerializedInstance> = Object.entries(
    value,
  ).reduce((acc, [id, value]) => {
    return {
      ...acc,
      [id]: {
        data: value.dehydrate(),
        constructorName: value.constructor.name,
      },
    };
  }, {});

  return serializedData;
}

export function hydrateInstances<T>(
  serializedData: object,
  serializableClassesRegistry: SerializableClassesRegistry,
) {
  const instancesMap = Object.entries(serializedData).reduce<
    Record<string, Serializable>
  >((acc, [id, { constructorName, data }]) => {
    const Class = serializableClassesRegistry[constructorName];
    if (Class) {
      acc[id] = Class.hydrate(data);
    }
    return acc;
  }, {});

  return instancesMap as T;
}
