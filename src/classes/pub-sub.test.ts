import { vi } from "vitest";

import { PubSub, Notifies } from "../classes";
import { ImmutableClass } from "./decorators/immutable";

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

interface Todo {
  isCompleted: boolean;
  label: string;
  meta?: Partial<{ color: string }>;
}

@ImmutableClass()
class TodoStore extends PubSub {
  constructor(public todos: Todo[] = []) {
    super();
  }

  @Notifies("todos")
  public addTodo(todo: Todo) {
    this.todos = this.todos.concat(todo);
  }

  @Notifies("todos")
  public wrongAddTodo(todo: Todo) {
    this.todos.push(todo);
  }

  @Notifies("todos")
  public wrongToggleTodo(i: number) {
    this.todos[i].isCompleted = !this.todos[i].isCompleted;
  }

  @Notifies("todos")
  public toggleTodo(i: number) {
    this.todos = this.todos.map((todo, index) =>
      index === i
        ? {
            ...todo,
            isCompleted: !todo.isCompleted,
          }
        : todo,
    );
  }

  @Notifies("todos")
  public wrongSetTodoColor(i: number, color: string) {
    if (!this.todos[i].meta) {
      this.todos[i].meta = {};
    }
    this.todos[i].meta.color = color;
  }

  @Notifies("todos")
  public setTodoColor(i: number, color: string) {
    this.todos = this.todos.map((todo, index) =>
      index === i
        ? {
            ...todo,
            meta: {
              ...todo.meta,
              color,
            },
          }
        : todo,
    );
  }
}

it("Classes decorated with Immutable must fail if not immutable", () => {
  const instance = new TodoStore();

  expect(() => {
    instance.wrongAddTodo({ label: "test", isCompleted: false });
  }).toThrow("Cannot add property 0, object is not extensible");

  expect(() => {
    instance.addTodo({ label: "test", isCompleted: false });
  }).not.toThrow("Cannot add property 0, object is not extensible");

  expect(() => {
    instance.wrongToggleTodo(0);
  }).toThrow(
    "Cannot assign to read only property 'isCompleted' of object '#<Object>'",
  );

  instance.toggleTodo(0);
  expect(instance.todos[0].isCompleted).toBe(true);

  expect(() => {
    instance.wrongSetTodoColor(0, "red");
  }).toThrow("Cannot add property meta, object is not extensible");

  instance.setTodoColor(0, "red");
  expect(instance.todos[0].meta.color).toBe("red");
});
