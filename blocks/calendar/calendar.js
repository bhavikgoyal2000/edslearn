export default async function decorate(block) {
  // Load FullCalendar via CDN
  await loadFullCalendar();

  // Create container for FullCalendar
  const calendarEl = document.createElement('div');
  calendarEl.classList.add('calendar-full');
  block.appendChild(calendarEl);

  // Initialize FullCalendar
  const calendar = new window.FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
    selectable: true,
    editable: false,
    dateClick: (info) => {
      // Custom behavior when date is clicked
      alert(`Selected date: ${info.dateStr}`);

      // You can also dispatch a custom event for other blocks to listen to
      const event = new CustomEvent('calendar:dateSelected', {
        detail: { date: info.dateStr },
      });
      document.dispatchEvent(event);
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

async function loadFullCalendar() {
  if (window.FullCalendar) return;

  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.css';
  document.head.appendChild(css);

  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.js';
  document.head.appendChild(script);

  return new Promise((resolve) => {
    script.onload = () => resolve();
  });
}
