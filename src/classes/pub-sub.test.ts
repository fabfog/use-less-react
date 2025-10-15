import { vi } from "vitest";

import { PubSub, Notifies } from "../classes";

export class Sprite extends PubSub {
  x = 0;
  y = 0;

  public setX(value: number) {
    this.x = value;
    this.notify("x");
  }

  @Notifies("y")
  public setY(value: number) {
    this.y = value;
  }

  public setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.notify("x", "y");
  }
}

it("Must call notify on single prop", () => {
  const instance = new Sprite();
  expect(instance.x).toBe(0);

  const subscriber = vi.fn().mockImplementation(() => void 0);
  instance.subscribe(subscriber);
  expect(subscriber).toHaveBeenCalledTimes(0);

  instance.setX(1);
  expect(subscriber).toHaveBeenCalledTimes(1);
  expect(subscriber).toHaveBeenCalledWith(["x"]);
  expect(instance.x).toBe(1);
});

it("Must call notify on single prop with decorator", () => {
  const instance = new Sprite();
  expect(instance.x).toBe(0);

  const subscriber = vi.fn().mockImplementation(() => void 0);
  instance.subscribe(subscriber);
  expect(subscriber).toHaveBeenCalledTimes(0);

  instance.setY(11);
  expect(subscriber).toHaveBeenCalledTimes(1);
  expect(subscriber).toHaveBeenCalledWith(["y"]);
  expect(instance.y).toBe(11);
});

it("Must call notify on multiple props", () => {
  const instance = new Sprite();
  expect(instance.x).toBe(0);
  expect(instance.y).toBe(0);

  const subscriber = vi.fn().mockImplementation(() => void 0);
  instance.subscribe(subscriber);
  expect(subscriber).toHaveBeenCalledTimes(0);

  instance.setPosition(1, 1);
  expect(subscriber).toHaveBeenCalledTimes(1);
  expect(subscriber).toHaveBeenCalledWith(["x", "y"]);
  expect(instance.x).toBe(1);
  expect(instance.y).toBe(1);
});

export class SpriteWithGetter extends PubSub {
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

it("Must call notify on value returned by getter", () => {
  const instance = new SpriteWithGetter();
  expect(instance.position).toStrictEqual({ x: 0, y: 0 });

  const subscriber = vi.fn().mockImplementation(() => void 0);
  instance.subscribe(subscriber);
  expect(subscriber).toHaveBeenCalledTimes(0);

  instance.setPosition(1, 1);
  expect(subscriber).toHaveBeenCalledTimes(1);
  expect(subscriber).toHaveBeenCalledWith(["position"]);

  expect(instance.position).toStrictEqual({ x: 1, y: 1 });
});
