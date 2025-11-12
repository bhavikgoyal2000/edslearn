/* eslint-disable no-console */

/* -------------------------------------------------------------------------- */
/*  Load FullCalendar dynamically – only once                               */
/* -------------------------------------------------------------------------- */
async function loadFullCalendar() {
  if (window.FullCalendar) return;

  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.css';
  document.head.appendChild(css);

  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.js';
  document.head.appendChild(script);

  await new Promise((resolve) => {
    script.addEventListener('load', resolve);
  });
}

export default async function decorate(block) {
  await loadFullCalendar();

  const calendarEl = document.createElement('div');
  calendarEl.classList.add('calendar-full');
  block.textContent = '';
  block.appendChild(calendarEl);

  const calendar = new window.FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: '',
    },
    selectable: true,
    editable: false,
    dateClick(info) {
      console.log(`Selected date: ${info.dateStr}`);

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

  const safetyStyle = document.createElement('style');
  safetyStyle.textContent = `
    .block.calendar .fc table,
    .block.calendar .fc td,
    .block.calendar .fc th {
      background: #fff !important;
      color: #333 !important;
    }
  `;
  document.head.appendChild(safetyStyle);
}
