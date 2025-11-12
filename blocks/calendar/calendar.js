/* eslint-disable no-console */

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
    const check = () => {
      if (script.readyState === 'complete' || script.readyState === 'loaded') {
        resolve();
      } else {
        setTimeout(check, 50);
      }
    };
    script.addEventListener('load', resolve);
    check();
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
      left: 'prev',
      center: 'title',
      right: 'next',
    },
    height: 'auto',
    selectable: true,
    editable: false,
    dateClick(info) {
      console.log(`Selected date: ${info.dateStr}`);
      document.dispatchEvent(
        new CustomEvent('calendar:dateSelected', { detail: { date: info.dateStr } }),
      );
    },
  });

  calendar.render();
}
