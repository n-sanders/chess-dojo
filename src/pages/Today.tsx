import { useEffect, useMemo, useState } from 'react';
import TodoList, { type Todo } from '../components/TodoList';
import todosData from '../data/todos.json';
import { localDateKey, readJson, writeJson } from '../storage';

const todos = todosData as Todo[];
const HISTORY_DAYS = 28;

type DayProgress = Record<string, number>;

const dayKey = (date: string) => `dojo:${date}`;

function completion(progress: DayProgress): number {
  const done = todos.filter((t) => (progress[t.id] ?? 0) >= t.target).length;
  return todos.length === 0 ? 0 : done / todos.length;
}

function useToday(): string {
  const [today, setToday] = useState(localDateKey);
  useEffect(() => {
    const id = setInterval(() => setToday(localDateKey()), 60_000);
    return () => clearInterval(id);
  }, []);
  return today;
}

export default function Today() {
  const today = useToday();
  const [progress, setProgress] = useState<DayProgress>(() => readJson(dayKey(today), {}));

  useEffect(() => {
    setProgress(readJson(dayKey(today), {}));
  }, [today]);

  const update = (id: string, count: number) => {
    const next = { ...progress, [id]: Math.max(0, count) };
    setProgress(next);
    writeJson(dayKey(today), next);
  };

  const history = useMemo(() => {
    const days: { date: string; ratio: number }[] = [];
    for (let i = HISTORY_DAYS - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const date = localDateKey(d);
      const p = date === today ? progress : readJson<DayProgress>(dayKey(date), {});
      days.push({ date, ratio: completion(p) });
    }
    return days;
  }, [today, progress]);

  const streak = useMemo(() => {
    let n = 0;
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].ratio === 1) n++;
      else if (i === history.length - 1) continue;
      else break;
    }
    return n;
  }, [history]);

  const doneCount = todos.filter((t) => (progress[t.id] ?? 0) >= t.target).length;

  return (
    <section>
      <h1>Today's dojo</h1>
      <p className="progress-summary muted">
        {today} · {doneCount} of {todos.length} done
        {streak > 0 && ` · ${streak}-day streak`}
      </p>
      <TodoList todos={todos} counts={progress} onChange={update} />
      <div className="streak" aria-label="Last 28 days">
        {history.map((h) => (
          <div
            key={h.date}
            title={`${h.date}: ${Math.round(h.ratio * 100)}%`}
            className={`day${h.ratio === 1 ? ' full' : h.ratio > 0 ? ' partial' : ''}`}
          />
        ))}
      </div>
    </section>
  );
}
