# McpTestRepo

## Calendar app

A basic, dependency-free calendar app where you can add your own tasks and
choose which days they show up on.

### Running

Open `index.html` in a browser, or serve the folder locally:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

### Usage

1. Type a task name under **Add a task**.
2. Assign the days it should appear on:
   - **Specific days** – pick a date and click **Add day**, or simply click days
     on the calendar to toggle them.
   - **Series (repeat weekly)** – check this option to enable **Repeat every**,
     then tick at least one weekday (e.g. *Mon*). The task appears every week on
     those days, with no end date. Leave Series unchecked for one-time dates only.
3. Click **Save task**. The task appears on every matching day in the calendar.
4. Use ‹ / › to change month, **Today** to jump back, and **Delete** in
   *My tasks* to remove a task.

Tasks are saved in your browser's `localStorage`, so they persist between visits.

### Tests

```sh
npm test
```
