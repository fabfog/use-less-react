import { renderHook } from "@testing-library/react";
import { act } from "react";

import { PubSub, PubSubMixin, Notifies } from "../classes";
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

it("useReactiveInstance with instance getter and class extending PubSub", () => {
  const { result } = renderHook(() =>
    useReactiveInstance(() => new Sprite(), ["x", "y"]),
  );

  expect(result.current.state).toStrictEqual({ x: 0, y: 0 });

  act(() => {
    result.current.instance.setPosition(5, 5);
  });

  expect(result.current.state).toStrictEqual({ x: 5, y: 5 });
});

it("useReactiveInstance with bare instance and class extending PubSub", () => {
  const instance = new Sprite();
  const { result } = renderHook(() =>
    useReactiveInstance(instance, ["x", "y"]),
  );

  expect(result.current.state).toStrictEqual({ x: 0, y: 0 });

  act(() => {
    instance.setPosition(5, 5);
  });

  expect(result.current.state).toStrictEqual({ x: 5, y: 5 });
});

class ThirdPartySprite {
  x = 0;
  y = 0;

  public setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

class ReactiveSprite extends PubSubMixin(ThirdPartySprite) {
  @Notifies("x", "y")
  override setPosition(x: number, y: number) {
    super.setPosition(x, y);
  }
}

it("useReactiveInstance with instance getter and class mixin", () => {
  const { result } = renderHook(() =>
    useReactiveInstance(() => new ReactiveSprite(), ["x", "y"]),
  );

  expect(result.current.state).toStrictEqual({ x: 0, y: 0 });

  act(() => {
    result.current.instance.setPosition(5, 5);
  });

  expect(result.current.state).toStrictEqual({ x: 5, y: 5 });
});

it("useReactiveInstance with bare instance and class mixin", () => {
  const instance = new ReactiveSprite();
  const { result } = renderHook(() =>
    useReactiveInstance(instance, ["x", "y"]),
  );

  expect(result.current.state).toStrictEqual({ x: 0, y: 0 });

  act(() => {
    instance.setPosition(5, 5);
  });

  expect(result.current.state).toStrictEqual({ x: 5, y: 5 });
});
