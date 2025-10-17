import { vi } from "vitest";

import { ImmutableClass, Notifies } from "../decorators";
import { PubSubMixin } from "./pub-sub-mixin";

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

interface Todo {
  isCompleted: boolean;
  label: string;
  meta?: Partial<{
    color: string;
  }>;
}

class ThirdPartyTodoStore {
  constructor(public todos: Todo[] = []) {}

  public wrongAddTodo(todo: Todo) {
    this.todos.push(todo);
  }

  public addTodo(todo: Todo) {
    this.todos = this.todos.concat(todo);
  }

  public wrongToggleTodo(i: number) {
    this.todos[i].isCompleted = !this.todos[i].isCompleted;
  }

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

  public wrongSetTodoColor(i: number, color: string) {
    if (!this.todos[i].meta) {
      this.todos[i].meta = {};
    }
    this.todos[i].meta.color = color;
  }

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

@ImmutableClass()
class TodoStore extends PubSubMixin(ThirdPartyTodoStore) {
  constructor(todos?: Todo[]) {
    super(todos);
  }

  @Notifies("todos")
  public wrongAddTodo(todo: Todo) {
    super.wrongAddTodo(todo);
  }

  @Notifies("todos")
  public addTodo(todo: Todo) {
    super.addTodo(todo);
  }

  @Notifies("todos")
  public toggleTodo(i: number) {
    super.toggleTodo(i);
  }

  @Notifies("todos")
  public wrongToggleTodo(i: number) {
    super.wrongToggleTodo(i);
  }

  @Notifies("todos")
  public wrongSetTodoColor(i: number, color: string) {
    super.wrongSetTodoColor(i, color);
  }

  @Notifies("todos")
  public setTodoColor(i: number, color: string) {
    super.setTodoColor(i, color);
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

@ImmutableClass()
class FakeClass extends PubSubMixin(ThirdPartyTodoStore) {}
it("Classes must keep their original name when using decorators and mixins", () => {
  expect(FakeClass.name).toBe("FakeClass");
});
