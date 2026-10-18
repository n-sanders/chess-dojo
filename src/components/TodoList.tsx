export type Todo = {
  id: string;
  title: string;
  url: string;
  target: number;
};

type Props = {
  todos: Todo[];
  counts: Record<string, number>;
  onChange: (id: string, count: number) => void;
};

export default function TodoList({ todos, counts, onChange }: Props) {
  return (
    <ul className="todo-list">
      {todos.map((todo) => {
        const count = Math.min(counts[todo.id] ?? 0, todo.target);
        const done = count >= todo.target;
        return (
          <li key={todo.id} className={`todo${done ? ' done' : ''}`}>
            <span className="todo-title">{todo.title}</span>
            <a href={todo.url} target="_blank" rel="noreferrer">
              Open ↗
            </a>
            {todo.target === 1 ? (
              <label className="counter toggle">
                <input
                  type="checkbox"
                  checked={done}
                  onChange={(e) => onChange(todo.id, e.target.checked ? 1 : 0)}
                />
                Done
              </label>
            ) : (
              <span className="counter">
                <button
                  aria-label={`Decrease ${todo.title}`}
                  disabled={count === 0}
                  onClick={() => onChange(todo.id, count - 1)}
                >
                  −
                </button>
                <span className="count">
                  {count} / {todo.target}
                </span>
                <button
                  aria-label={`Increase ${todo.title}`}
                  disabled={done}
                  onClick={() => onChange(todo.id, count + 1)}
                >
                  +
                </button>
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
