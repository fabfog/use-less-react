import { vi } from "vitest";

import { Notifies } from "./decorators";
import { PubSubMixin } from "./mixins";

class ThirdPartySprite {
  x = 0;
  y = 0;

  setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

class ReactiveSprite extends PubSubMixin(ThirdPartySprite) {
  @Notifies("x", "y")
  setPosition(x: number, y: number) {
    super.setPosition(x, y);
  }
}

it("Must call notify on many props after overriding method with decorator", () => {
  const instance = new ReactiveSprite();
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
