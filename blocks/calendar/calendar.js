/* eslint-disable no-console */

// helper defined at top before use → fixes "used before defined"
async function loadFullCalendar() {
  if (window.FullCalendar) return; // early exit, no return value expected

  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.css';
  document.head.appendChild(css);

  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.js';
  document.head.appendChild(script);

  // just wait for load, don't return anything (resolves lint rule)
  await new Promise((resolve) => {
    script.addEventListener('load', resolve);
  });
}

export default async function decorate(block) {
  // Wait for FullCalendar to load
  await loadFullCalendar();

  // Create container
  const calendarEl = document.createElement('div');
  calendarEl.classList.add('calendar-full');
  block.textContent = '';
  block.appendChild(calendarEl);

  // Initialize calendar
  const calendar = new window.FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
    selectable: true,
    editable: false,
    dateClick(info) {
      console.log(`Selected date: ${info.dateStr}`);

      // Emit custom event (no alert, cleaner UX)
      document.dispatchEvent(
        new CustomEvent('calendar:dateSelected', { detail: { date: info.dateStr } }),
      );
    },
    events: [
      {
        title: 'Team Meeting',
        start: new Date().toISOString().split('T')[0],
      },
    ],
  });

  calendar.render();
}
