/* eslint-disable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-explicit-any */

export type Constructor = new (...args: any[]) => {};

export type Subscriber<T> = (propNames: (keyof T)[]) => void;

export interface Serializable {
  dehydrate(): object;
}

export interface SerializableConstructor<TBase extends Serializable> {
  new (...args: any[]): TBase;
  hydrate(obj: object): TBase;
}

export interface SerializedInstance {
  data: object;
  constructorName: string;
}

export type SerializableClassesRegistry = Record<
  string,
  SerializableConstructor<Serializable>
>;

export type SerializableRecord = Record<string, Serializable>;
