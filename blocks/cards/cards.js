/* eslint-disable no-console */
export default async function decorate(block) {
  /**
   * Loads FullCalendar from CDN if not already present.
   */
  async function loadFullCalendar() {
    if (window.FullCalendar) return Promise.resolve();

    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.css';
    document.head.appendChild(css);

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.js';
    document.head.appendChild(script);

    return new Promise((resolve) => {
      script.addEventListener('load', () => resolve());
    });
  }

  // Wait until the library is loaded before continuing
  await loadFullCalendar();

  // Build the DOM container for FullCalendar
  const calendarEl = document.createElement('div');
  calendarEl.classList.add('calendar-full');
  block.textContent = ''; // clear placeholder content
  block.appendChild(calendarEl);

  // Initialize the FullCalendar instance
  const calendar = new window.FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
    selectable: true,
    editable: false,

    // Called when a date is clicked
    dateClick: (info) => {
      console.log(`Selected date: ${info.dateStr}`);

      // Dispatch a custom event instead of using alert()
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
