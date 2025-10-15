import { render } from "@testing-library/react";
import "@testing-library/jest-dom";

import { PubSub } from "../classes";
import { createGenericContext } from "./generic-context";
import { useRef, type FC } from "react";
import { useReactiveInstance } from "./use-reactive-instance";

class Sprite extends PubSub {
  x = 0;
  y = 0;

  public setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.notify("x", "y");
  }
}

const [SpriteProvider, useSpriteContext] = createGenericContext<Sprite>();

const SpriteApp: FC = () => {
  const sprite = useRef<Sprite>(new Sprite());

  return (
    <SpriteProvider value={sprite.current}>
      <SpriteComponent />
    </SpriteProvider>
  );
};

const SpriteComponent: FC = () => {
  const sprite = useSpriteContext();

  const {
    state: { x, y },
  } = useReactiveInstance(sprite, ["x", "y"]);

  return <div>{`sprite ${x} ${y}`}</div>;
};

it("share a PubSub instance via context", () => {
  const { getByText } = render(<SpriteApp />);

  expect(getByText("sprite 0 0")).toBeVisible();
});

const [SomeProvider, useSomeContext] = createGenericContext<{
  value: number;
  check: boolean;
}>();

const SomeApp: FC = () => {
  return (
    <SomeProvider value={{ value: 0, check: false }}>
      <SomeComponent />
    </SomeProvider>
  );
};

const SomeComponent: FC = () => {
  const { value, check } = useSomeContext();

  return <div>{`values ${value} ${check.toString()}`}</div>;
};

it("share any kind of value via context", () => {
  const { getByText } = render(<SomeApp />);

  expect(getByText("values 0 false")).toBeVisible();
});
