# @dxbox/use-less-react

**Logics first. React later.**
The missing bridge between OOP and React: turn **any** class into a reactive source.

---

## 💡 Philosophy

React is for UI — keep it that way.

`use-less-react` is designed to **separate React from business logics, utilities and everything not strictly and intrinsically related to rendering UI**.

We've all been there: wrapping all your logics in custom hooks and cascades of `useEffect`, `useMemo`, `useCallback`, `useRef` etc. 

Just because we got used to it doesn't mean it's good. A *UI library* shouldn't interfere with the way you write *logics* - at any level.

Decouple your brain from React, for good. With `use-less-react` you will be able to:
* write plain JavaScript classes with OOP principles and whatever design pattern you may deem needed.
* keep React **solely for UI rendering**.
* make your code more **reusable** (for example SSR/CSR in Next.js)
* make your code easier to **test** (no need to install new dependencies just to be able to test a hook...)
* *Make Classes Great Again* 🦅😎 (...ok, now I'm kidding!)

`use-less-react` lets any class instance become **reactive** and usable in React, without polluting your business logic with hooks. Because not everything needs a hook.

---

## 🔹 Installation

```bash
npm install @dxbox/use-less-react
```

---

## 📦 Entry Points

* **Client** (client-side only: hooks and contexts):

```ts
import { useReactiveInstance, createGenericContext, ... } from '@dxbox/use-less-react/client';
```

* **Classes** (wherever you want):

```ts
import { PubSub, PubSubMixin, Notifies, ... } from '@dxbox/use-less-react/classes';
```

---

## 🚀 Quick Start (main use cases)

### 1. Define a class that extends PubSub

```ts
import { PubSub } from '@dxbox/use-less-react/classes';

class Counter extends PubSub {
  count = 0;

  increment() {
    this.count++;
    // you can use the notify method from PubSub or a decorator (see next)
    this.notify('count');
  }
}

const counter = new Counter();
```

then connect it to React like this:

```ts
import { useReactiveInstance } from '@dxbox/use-less-react/hooks';

function CounterComponent({ counter }: { counter: Counter }) {
  const { state: { count } } = useReactiveInstance(counter, ['count']);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => counter.increment()}>Increment</button>
    </div>
  );
}
```

### 2. Use the PubSub mixin to wrap a third-party class

Imagine `Counter` is a class exported by some third-party library, that we will call `some-lib`.

```ts
import { Counter as BaseCounter } from 'some-lib';
import { PubSubMixin, Notifies } from '@dxbox/use-less-react/classes';

// apply the mixin to the base class, then extend it to override its behavior
export class Counter extends PubSubMixin(BaseCounter) {
  // the decorator will call notify("count") after the method has run
  @Notifies("count")
  public override increment() {
    super.increment();
  }
}
```
and now you can use your reactive version of `Counter` with `useReactiveInstance`. It's simple as that, thanks to `PubSubMixin` and the `@Notifies` decorator, which allow for fast "re-wiring" of existing methods, once you know what property they should notify.

```ts
import { useReactiveInstance } from '@dxbox/use-less-react/hooks';

function CounterComponent({ counter }: { counter: Counter }) {
  const { state: { count } } = useReactiveInstance(counter, ['count']);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => counter.increment()}>Increment</button>
    </div>
  );
}
```

Yes: **NOTHING** has changed on React side. It's *reactive*, not *spaghettive*! 🍝

### 3. Use createGenericContext

It's a very simple utility that lets you create a very simple context provider and the related hook, in order to retrieve the provided value. So you won't have to worry about writing dozens of new contexts that do the very same thing: defining some piece of state, some methods, and sharing them. You can use a reactive class instance to define data & methods, share it via the context (or share many instances inside a single object), and just let `useReactiveInstance` do its job for UI updates.

```ts
import { GenericContextProvider } from '@dxbox/use-less-react/hooks';

const [SpriteContextProvider, useSpriteContext] = createGenericContext<Sprite>();

function App() {
  // useRef to create the instance only once
  const sprite = useRef(new Sprite()); 

  return (
    <SpriteContextProvider value={sprite.current}>
      <SomeComponent />
    </SpriteContextProvider>
  );
}

function SomeComponent() {
  const sprite = useSpriteContext();

  const { state: { position } } = useReactiveInstance(sprite, ["position"]);

  return (
    // ...
  )
}
```

**Of course**, if you're using Next.js, keep in mind that **you cannot share class instances between server side and client side**, or you'll receive an error: *"Only plain objects, and a few built-ins, can be passed to Client Components from Server Components"*. In this case, you must pass a serialized version of the instance to the context provider (server-side), and rehydrate it client side.

...wait a second, we have a dedicated context for that!


### 4. use createHydrationContext

This is useful in Next.js applications to "pass" class instances from server-side to client-side. Here's the complete example:

First you define a class extending PubSub (...or applying the mixin, it's the same) and implementing two methods: 
- a static "hydrate" method 
- a "dehydrate" method on the instance
See the details below.
```ts
// classes.ts 
export class Sprite extends PubSub {
  constructor(private x: number, private y: number) {
    super();
  }

  get position() {
    return {
      x: this.x,
      y: this.y,
    };
  }

  setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.notify("position");
  }

  // this method will create an instance from a plain object
  static hydrate(obj: object) {
    if (
      "x" in obj &&
      typeof obj.x === "number" &&
      "y" in obj &&
      typeof obj.y === "number"
    ) {
      return new Sprite(obj.x, obj.y);
    }
    throw new Error("invalid params");
  }

  // this method will serialize an instance to a plain object
  dehydrate() {
    return {
      x: this.x,
      y: this.y,
    };
  }
}
```

You must declare the class as serializable by adding it to a constant shared between server side and client side code:
```ts
// serializable-classes-registry.ts
export const serializableClassesRegistry: SerializableClassesRegistry = {
  Sprite,
};
```

You must declare a type which defines the structure of the shared data. Of course, for this simple example, it's just `HydratedProps`, but in reality you will have many of them, like `HomePageHydratedProps`, `AboutPageHydratedProps` and so on and so forth.
```ts
// types.ts
import { SerializableRecord } from "@dxbox/use-less-react/classes";
export interface HydratedProps extends SerializableRecord {
  sprite1: Sprite;
}
```

Create a context provider and its related hook. Since it depends on the type of hydrated props, you will have to call `createHydrationContext` for every type (in the previous example, you may have `HomePageHydrationProvider`, `useHomePageHydrationProvider`, etc.)
```ts
// hydration-context.ts
import { SerializableClassesRegistry } from "@dxbox/use-less-react/classes";
import { createHydrationContext } from "@dxbox/use-less-react/client";

export const [HydrationProvider, useHydratedInstances] =
  createHydrationContext<HydratedProps>(serializableClassesRegistry);
```

Use the hydration provider in the page (server side) passing it the dehydrated data.
```ts
// page.ts (server side)
import { HydrationProvider } from "./context";
import { HydratedProps } from "./types";
import { dehydrateInstances } from "@dxbox/use-less-react/classes";

function Page() {
  const sprite = new Sprite(5, 5);
  const value: HydratedProps = { sprite1: sprite };

  return (
    <HydrationProvider dehydratedData={dehydrateInstances(value)}>
      <SpriteComponentConnector />
    </HydrationProvider>
  );
}
```

Finally, retrieve the data client-side (it will be re-hydrated automatically by the hook) and use any instances from it, with `useReactiveInstance`.
```ts
// components/sprite.ts (client side)
"use client"
// import from the correct path to your context.ts file
import { useHydratedInstances } from "@/app/context.ts"; 
import { useReactiveInstance } from "@dxbox/use-less-react/client";

export const SpriteClientComponent: FC = () => {
  // get hydrated instances
  const hydratedInstances = useHydratedInstances();

  // use a specific instance with useReactiveInstance
  const {
    state: { position },
    instance: sprite1,
  } = useReactiveInstance(hydratedInstances.sprite1, ["position"]);

  return (
    <div>
      // print an instance state portion
      <pre>{JSON.stringify(position)}</pre>
      <button
        // call a method of the instance
        onClick={() => {
          sprite1.setPosition(9, 9);
        }}
      >
        Set position
      </button>
    </div>
  );
};
```

### 5. Pass an instance getter to useReactiveInstance

If you're working client side, you don't want to create instances of classes at every render. You can pass a function that creates an instance to `useReactiveInstance` in order to make sure it's created only once. Basically, it's just a way to avoid polluting your code with another `useRef` at the expense of readability.

```ts
import { useReactiveInstance } from '@dxbox/use-less-react/hooks';

function CounterComponent() {
  const { 
    state: { count },
    instance // here you will find the created instance
  } = useReactiveInstance(
    // here's the instance getter, it will be called only once
    () => new Counter(),
    ['count']
  );

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => instance.increment()}>Increment</button>
    </div>
  );
}
```

### 6. Notify a derived value calculated via a get method

Let's say you have a class using a get method like this:

```ts
export class Sprite extends PubSub {
  private x = 0;
  private y = 0;

  public get position() {
    return { x: this.x, y: this.y };
  }

  @Notifies("position")
  public setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}
```
When `setPosition` notifies `position`, everything will work like with a standard class attribute. So you can define derived values, notify them, and let `useReactiveInstance` know their value has changed, like any other attribute.

## 🧊 The `ImmutableClass` Decorator

### Overview

`ImmutableClass` is a utility decorator designed to **freeze all instance attributes** of a class immediately after construction.  
This helps enforce immutability and prevents accidental mutations to internal state — particularly useful in architectures where **state reactivity** (e.g. via React or other reactive systems) must remain predictable and consistent.

```ts
import { ImmutableClass } from "../utils/ImmutableClass";

@ImmutableClass()
class MyStore {
  data = { count: 0 };
}
```

### How it works

The decorator returns a subclass of your class that overrides its constructor.  
After calling `super(...)`, it iterates over all **own properties** of the instance and applies [`Object.freeze`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze) to each of them, recursively going deeper into nested structures.

This ensures that any objects, arrays, or maps defined as instance fields become immutable once the instance is created.

### Why it’s separate from `PubSub`

`ImmutableClass` exists as a standalone decorator rather than being built into the `PubSub` constructor because:

- When applied directly inside `PubSub`, the freezing would **only affect properties defined in `PubSub` itself**, not those introduced later by subclasses or mixins.
- As a decorator, it can be applied **after** all subclass fields have been initialized, guaranteeing that **every property** on the final instance gets frozen.

### When to use it

Use `ImmutableClass` when you want to:

- Enforce immutability of instance data to prevent accidental side effects.
- Ensure that logic relying on **reactive state** (e.g. React components observing class fields) isn’t broken by direct mutation.
- Add an extra layer of safety to your data flow without modifying the core logic of your base classes or mixins.

It’s completely optional — you can apply it to any class or leave it out, depending on your use case.

### Example

```ts
@ImmutableClass()
class Store {
  user = { name: "Alice" };
}

const store = new Store();

store.user.name = "Bob"; // ❌ TypeError: Cannot assign to read only property
```

### Notes and Considerations

- `ImmutableClass` performs a **deep freeze** — it freezes deeply nested structures.
- It’s meant as a **development safeguard**, not a performance optimization. Use it to catch unintended state mutations early.
- You can disable its behaviour without manually removing it from your code, for example

  ```ts
  @ImmutableClass({ disabled: process.env.NODE_ENV === "production" })
  class SomeClass extends PubSub {
    ...
  }
  ```
- You can safely compose it with other decorators or mixins, e.g.:

  ```ts
  @ImmutableClass()
  class SomeClass extends PubSubMixin(BaseClass) {
    ...
  }
  ```
  

---

## 📄 License

MIT
