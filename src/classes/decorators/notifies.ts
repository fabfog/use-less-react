/* eslint-disable @typescript-eslint/no-explicit-any */
export function Notifies<TClass>(...propNames: (keyof TClass)[]) {
  return function decorator(
    _target: TClass,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function wrappedMethod(...args: any[]) {
      const result = originalMethod.apply(this, args);

      const notifyLogic = () => {
        if (typeof (this as any).notify === "function") {
          (this as any).notify(...propNames);
        } else {
          console.error(
            `Class using @Notifies on '${propertyKey}' must extend PubSub.`,
          );
        }
      };

      if (result && typeof result.then === "function") {
        return result.then((resolvedResult: any) => {
          notifyLogic();
          return resolvedResult;
        });
      } else {
        notifyLogic();
        return result;
      }
    };

    return descriptor;
  };
}
