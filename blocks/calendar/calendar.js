// async function loadFullCalendar() {
//   if (window.FullCalendar) return;

//   const css = document.createElement('link');
//   css.rel = 'stylesheet';
//   css.href = 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.css';
//   document.head.appendChild(css);

//   const script = document.createElement('script');
//   script.src = 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.js';
//   document.head.appendChild(script);

//   await new Promise((resolve) => {
//     const check = () => {
//       if (script.readyState === 'complete' || script.readyState === 'loaded') {
//         resolve();
//       } else {
//         setTimeout(check, 50);
//       }
//     };
//     script.addEventListener('load', resolve);
//     check();
//   });
// }

async function loadFullCalendar() {
  if (window.FullCalendar) return;

  // Load CSS properly with onload
  await new Promise((resolve, reject) => {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.css';
    css.onload = resolve;
    css.onerror = reject;
    document.head.appendChild(css);
  });

  // Now load JS
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.js';

  await new Promise((resolve, reject) => {
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
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
    selectMirror: true,
    unselectAuto: false,
    dateClick(info) {
      const selectedDate = info.dateStr;

      document.querySelectorAll('.fc-daygrid-day.fc-day-selected').forEach((el) => el.classList.remove('fc-day-selected'));
      document.querySelectorAll('.fc-day-today').forEach((el) => el.classList.remove('fc-day-today'));
      info.dayEl.classList.add('fc-day-selected');

      document.dispatchEvent(new CustomEvent('calendar:dateSelected', {
        detail: { date: selectedDate },
      }));
    },
  });

  calendar.render();
  const today = new Date().toISOString().split('T')[0];
  document.dispatchEvent(new CustomEvent('calendar:dateSelected', {
    detail: { date: today },
  }));
}
