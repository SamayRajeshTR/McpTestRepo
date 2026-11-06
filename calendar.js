/*
 * Core calendar logic (no DOM access) so it can be used in the browser
 * and unit-tested with Node.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.CalendarCore = api;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  const STORAGE_KEY = 'calendar-app-tasks';

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  /** Format a Date as YYYY-MM-DD using local time. */
  function toDateKey(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  /** Parse a YYYY-MM-DD string into a local Date, or null if invalid. */
  function parseDateKey(key) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key || '');
    if (!match) return null;
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return toDateKey(date) === key ? date : null;
  }

  /**
   * Build a month grid (array of weeks, each an array of 7 Dates) for the
   * given year/month (month is 0-based). Weeks start on Sunday.
   */
  function getMonthGrid(year, month) {
    const first = new Date(year, month, 1);
    const start = new Date(year, month, 1 - first.getDay());
    const last = new Date(year, month + 1, 0);
    const end = new Date(year, month, last.getDate() + (6 - last.getDay()));
    const weeks = [];
    for (const cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
      if (cursor.getDay() === 0) weeks.push([]);
      weeks[weeks.length - 1].push(new Date(cursor));
    }
    return weeks;
  }

  /**
   * Create a validated task.
   * @param {{title: string, dates?: string[], weekdays?: number[]}} input
   */
  function createTask(input) {
    const title = String((input && input.title) || '').trim();
    if (!title) throw new Error('Task title is required.');
    const dates = [...new Set((input.dates || []).filter((d) => parseDateKey(d)))].sort();
    const weekdays = [...new Set((input.weekdays || []).map(Number))]
      .filter((d) => Number.isInteger(d) && d >= 0 && d <= 6)
      .sort((a, b) => a - b);
    if (dates.length === 0 && weekdays.length === 0) {
      throw new Error('Assign at least one date or repeating weekday.');
    }
    const id = input.id || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    return { id, title, dates, weekdays };
  }

  /** Whether the task should show on the given Date. */
  function taskOccursOn(task, date) {
    return task.dates.includes(toDateKey(date)) || task.weekdays.includes(date.getDay());
  }

  /** Tasks that should show on the given Date. */
  function tasksForDate(tasks, date) {
    return tasks.filter((task) => taskOccursOn(task, date));
  }

  function loadTasks(storage) {
    try {
      const raw = storage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed.flatMap((t) => {
        try {
          return [createTask(t)];
        } catch (e) {
          return [];
        }
      });
    } catch (e) {
      return [];
    }
  }

  function saveTasks(storage, tasks) {
    storage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  return {
    STORAGE_KEY,
    toDateKey,
    parseDateKey,
    getMonthGrid,
    createTask,
    taskOccursOn,
    tasksForDate,
    loadTasks,
    saveTasks,
  };
});
