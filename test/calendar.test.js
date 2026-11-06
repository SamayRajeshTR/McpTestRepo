const test = require('node:test');
const assert = require('node:assert');
const core = require('../calendar.js');

test('toDateKey / parseDateKey round-trip', () => {
  const d = new Date(2024, 1, 29);
  assert.strictEqual(core.toDateKey(d), '2024-02-29');
  assert.strictEqual(core.parseDateKey('2024-02-29').getTime(), d.getTime());
  assert.strictEqual(core.parseDateKey('2023-02-29'), null);
  assert.strictEqual(core.parseDateKey('nope'), null);
});

test('getMonthGrid returns full Sunday-start weeks covering the month', () => {
  const weeks = core.getMonthGrid(2024, 8); // September 2024 starts on Sunday
  assert.ok(weeks.every((w) => w.length === 7));
  assert.ok(weeks.every((w) => w[0].getDay() === 0));
  assert.strictEqual(core.toDateKey(weeks[0][0]), '2024-09-01');
  assert.strictEqual(core.toDateKey(weeks.at(-1).at(-1)), '2024-10-05');

  const feb = core.getMonthGrid(2026, 1); // Feb 2026: Sun 1st .. Sat 28th
  assert.strictEqual(feb.length, 4);

  const mar = core.getMonthGrid(2025, 2); // March 2025 starts Saturday
  assert.strictEqual(core.toDateKey(mar[0][0]), '2025-02-23');
  assert.strictEqual(mar.length, 6);
});

test('createTask validates input', () => {
  assert.throws(() => core.createTask({ title: '  ', dates: ['2024-01-01'] }), /title/);
  assert.throws(() => core.createTask({ title: 'x' }), /at least one/);
  const task = core.createTask({
    title: ' Gym ',
    dates: ['2024-01-02', 'bad', '2024-01-01', '2024-01-02'],
    weekdays: [3, 1, 9, 1],
  });
  assert.strictEqual(task.title, 'Gym');
  assert.deepStrictEqual(task.dates, ['2024-01-01', '2024-01-02']);
  assert.deepStrictEqual(task.weekdays, [1, 3]);
  assert.ok(task.id);
});

test('tasksForDate matches specific dates and repeating weekdays', () => {
  const once = core.createTask({ title: 'Dentist', dates: ['2024-05-10'] });
  const weekly = core.createTask({ title: 'Gym', weekdays: [1] }); // Mondays
  const tasks = [once, weekly];
  assert.deepStrictEqual(core.tasksForDate(tasks, new Date(2024, 4, 10)), [once]);
  assert.deepStrictEqual(core.tasksForDate(tasks, new Date(2024, 4, 13)), [weekly]);
  assert.deepStrictEqual(core.tasksForDate(tasks, new Date(2024, 4, 14)), []);
});

test('saveTasks / loadTasks persist via storage and ignore bad data', () => {
  const store = {};
  const storage = {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = v; },
  };
  assert.deepStrictEqual(core.loadTasks(storage), []);
  const tasks = [core.createTask({ title: 'A', dates: ['2024-01-01'] })];
  core.saveTasks(storage, tasks);
  assert.deepStrictEqual(core.loadTasks(storage), tasks);

  store[core.STORAGE_KEY] = '{not json';
  assert.deepStrictEqual(core.loadTasks(storage), []);
  store[core.STORAGE_KEY] = JSON.stringify([{ title: '' }, { title: 'B', weekdays: [0] }]);
  assert.strictEqual(core.loadTasks(storage).length, 1);
});
