import { render } from "@testing-library/react";
import "@testing-library/jest-dom";

import {
  dehydrateInstances,
  PubSub,
  type SerializableClassesRegistry,
} from "../classes";
import { type FC } from "react";
import { useReactiveInstance } from "./use-reactive-instance";
import { createHydrationContext } from "./hydration-context";

export class Sprite extends PubSub {
  constructor(
    private x: number,
    private y: number,
  ) {
    super();
  }

  setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.notify("position");
  }

  static hydrate(json: object) {
    if (
      "x" in json &&
      typeof json.x === "number" &&
      "y" in json &&
      typeof json.y === "number"
    ) {
      return new Sprite(json.x, json.y);
    }
    throw new Error("invalid params");
  }

  get position() {
    return {
      x: this.x,
      y: this.y,
    };
  }

  dehydrate() {
    return {
      x: this.x,
      y: this.y,
    };
  }
}

const serializableClassesRegistry: SerializableClassesRegistry = {
  Sprite,
};

interface HydrationProps {
  sprite1: Sprite;
}

const [HydrationProvider, useHydratedInstances] =
  createHydrationContext<HydrationProps>(serializableClassesRegistry);

const SpriteApp: FC = () => {
  const sprite = new Sprite(0, 0);

  return (
    <HydrationProvider dehydratedData={dehydrateInstances({ sprite1: sprite })}>
      <SpriteComponent />
    </HydrationProvider>
  );
};

const SpriteComponent: FC = () => {
  const { sprite1 } = useHydratedInstances();

  const {
    state: { position },
  } = useReactiveInstance(sprite1, ["position"]);

  return <div>{`sprite ${position.x} ${position.y}`}</div>;
};

it("share a serializable instance via context", () => {
  const { getByText } = render(<SpriteApp />);

  expect(getByText("sprite 0 0")).toBeVisible();
});
