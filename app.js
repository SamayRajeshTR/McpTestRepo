(function () {
  const core = window.CalendarCore;
  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const state = {
    tasks: core.loadTasks(window.localStorage),
    viewYear: new Date().getFullYear(),
    viewMonth: new Date().getMonth(),
    selectedDates: new Set(),
  };

  const el = {
    monthLabel: document.getElementById('month-label'),
    grid: document.getElementById('calendar-grid'),
    prev: document.getElementById('prev-month'),
    next: document.getElementById('next-month'),
    today: document.getElementById('today-btn'),
    form: document.getElementById('task-form'),
    title: document.getElementById('task-title'),
    dateInput: document.getElementById('task-date'),
    addDate: document.getElementById('add-date'),
    selectedDates: document.getElementById('selected-dates'),
    weekdayOptions: document.getElementById('weekday-options'),
    error: document.getElementById('form-error'),
    taskList: document.getElementById('task-list'),
  };

  WEEKDAYS.forEach((name, i) => {
    const label = document.createElement('label');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.value = String(i);
    box.name = 'weekday';
    label.append(box, ' ' + name);
    el.weekdayOptions.appendChild(label);
  });

  function persist() {
    core.saveTasks(window.localStorage, state.tasks);
  }

  function renderCalendar() {
    const monthName = new Date(state.viewYear, state.viewMonth, 1).toLocaleString(undefined, {
      month: 'long',
      year: 'numeric',
    });
    el.monthLabel.textContent = monthName;
    el.grid.innerHTML = '';
    const todayKey = core.toDateKey(new Date());

    core.getMonthGrid(state.viewYear, state.viewMonth).flat().forEach((date) => {
      const key = core.toDateKey(date);
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'day';
      if (date.getMonth() !== state.viewMonth) cell.classList.add('outside');
      if (key === todayKey) cell.classList.add('today');
      if (state.selectedDates.has(key)) cell.classList.add('selected');
      cell.setAttribute('aria-label', date.toDateString());

      const num = document.createElement('span');
      num.className = 'day-number';
      num.textContent = date.getDate();
      cell.appendChild(num);

      core.tasksForDate(state.tasks, date).forEach((task) => {
        const item = document.createElement('span');
        item.className = 'day-task';
        item.textContent = task.title;
        item.title = task.title;
        cell.appendChild(item);
      });

      cell.addEventListener('click', () => toggleSelectedDate(key));
      el.grid.appendChild(cell);
    });
  }

  function renderSelectedDates() {
    el.selectedDates.innerHTML = '';
    [...state.selectedDates].sort().forEach((key) => {
      const li = document.createElement('li');
      li.textContent = key;
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = '×';
      remove.setAttribute('aria-label', `Remove ${key}`);
      remove.addEventListener('click', () => toggleSelectedDate(key));
      li.appendChild(remove);
      el.selectedDates.appendChild(li);
    });
  }

  function describeTask(task) {
    const parts = [];
    if (task.weekdays.length) parts.push('Every ' + task.weekdays.map((d) => WEEKDAYS[d]).join(', '));
    if (task.dates.length) parts.push(task.dates.join(', '));
    return parts.join(' · ');
  }

  function renderTaskList() {
    el.taskList.innerHTML = '';
    if (state.tasks.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'empty';
      empty.textContent = 'No tasks yet.';
      el.taskList.appendChild(empty);
      return;
    }
    state.tasks.forEach((task) => {
      const li = document.createElement('li');
      const info = document.createElement('div');
      const title = document.createElement('strong');
      title.textContent = task.title;
      const when = document.createElement('small');
      when.textContent = describeTask(task);
      info.append(title, when);
      const del = document.createElement('button');
      del.type = 'button';
      del.textContent = 'Delete';
      del.addEventListener('click', () => {
        state.tasks = state.tasks.filter((t) => t.id !== task.id);
        persist();
        render();
      });
      li.append(info, del);
      el.taskList.appendChild(li);
    });
  }

  function render() {
    renderCalendar();
    renderSelectedDates();
    renderTaskList();
  }

  function toggleSelectedDate(key) {
    if (state.selectedDates.has(key)) state.selectedDates.delete(key);
    else state.selectedDates.add(key);
    render();
  }

  function shiftMonth(delta) {
    const d = new Date(state.viewYear, state.viewMonth + delta, 1);
    state.viewYear = d.getFullYear();
    state.viewMonth = d.getMonth();
    renderCalendar();
  }

  el.prev.addEventListener('click', () => shiftMonth(-1));
  el.next.addEventListener('click', () => shiftMonth(1));
  el.today.addEventListener('click', () => {
    const now = new Date();
    state.viewYear = now.getFullYear();
    state.viewMonth = now.getMonth();
    renderCalendar();
  });

  el.addDate.addEventListener('click', () => {
    const key = el.dateInput.value;
    if (core.parseDateKey(key)) {
      state.selectedDates.add(key);
      el.dateInput.value = '';
      render();
    }
  });

  el.form.addEventListener('submit', (event) => {
    event.preventDefault();
    const weekdays = [...el.weekdayOptions.querySelectorAll('input:checked')].map((b) => Number(b.value));
    try {
      const task = core.createTask({
        title: el.title.value,
        dates: [...state.selectedDates],
        weekdays,
      });
      state.tasks.push(task);
      persist();
      el.form.reset();
      state.selectedDates.clear();
      el.error.textContent = '';
      render();
    } catch (err) {
      el.error.textContent = err.message;
    }
  });

  render();
})();
