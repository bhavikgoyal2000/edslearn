// blocks/eventcalendar/eventcalendar.js

export default async function decorate(block) {
  // You can fetch real JSON later — for now we use inline sample
  const calendarData = {
    currentDate: "2025-11-18",
    displayDate: "Tuesday, November 18, 2025",
    events: [
      { time: "2:00 PM – 5:00 PM", title: "Care for Custodians", location: "MGSC TBL1 Lobby Information Table 1", host: "Residence Hall Association (HRL)", type: null, moreInfo: "Event Page", description: "Thank you card making with aulalac" },
      { time: "4:00 PM – 6:30 PM", title: "National Security & The Intelligence Community Industry Week Networking Reception", location: "CNST 115 Meeting Room" },
      { time: "5:00 PM – 6:00 PM", title: "Leadership Listening Party", location: "MGSC 327* Meeting Room" },
      { time: "5:30 PM – 6:30 PM", title: "BRASA Game Night", location: "DMT 110 Classroom" }
    ],
    upcoming: [
      { date: "2025-11-19", day: "Wed, 11/19/2025", title: "Guns Down DC Fundraising", location: "QUAD-TBL2 Friedheim Quadrangle Info Table" }
    ]
  };

  block.textContent = ''; // clear loading content

  const container = document.createElement('div');
  container.className = 'eventcalendar';

  // Header
  const header = document.createElement('div');
  header.className = 'eventcalendar-header';
  header.innerHTML = `
    <h2 class="eventcalendar-title">${calendarData.displayDate}</h2>
    <div class="eventcalendar-nav">
      <button>PREVIOUS DAY</button>
      <button>NEXT DAY</button>
    </div>
  `;
  container.appendChild(header);

  // Today's Events
  calendarData.events.forEach(event => {
    const hasExtra = event.description || event.host || event.moreInfo;

    const eventItem = document.createElement('div');
    eventItem.className = `event-item ${hasExtra ? 'closed' : ''}`;

    const toggleClass = hasExtra ? 'event-toggle closed' : 'event-toggle';
    const toggleSymbol = hasExtra ? '<span class="event-toggle closed"></span>' : '';

    eventItem.innerHTML = `
      <div class="event-header">
        ${toggleSymbol}
        <div class="event-time">${event.time}</div>
        <div class="event-details">
          <h3>${event.title}</h3>
          <div class="event-location">${event.location}</div>
        </div>
      </div>
      ${hasExtra ? `
      <div class="event-extra">
        ${event.description ? `<p>${event.description}</p>` : ''}
        ${event.host ? `<p><strong>Host:</strong> ${event.host}</p>` : ''}
        ${event.moreInfo ? `
          <div class="event-actions">
            <a href="#">Export to Calendar</a>
            <a href="#">Email this item</a>
          </div>
        ` : ''}
      </div>` : ''}
    `;

    // Accordion behavior
    if (hasExtra) {
      const headerEl = eventItem.querySelector('.event-header');
      const extraEl = eventItem.querySelector('.event-extra');
      const toggleEl = eventItem.querySelector('.event-toggle');

      headerEl.addEventListener('click', () => {
        const isClosed = eventItem.classList.contains('closed');
        eventItem.classList.toggle('closed', !isClosed);
        toggleEl.classList.toggle('closed', !isClosed);
        toggleEl.classList.toggle('opened', isClosed);
        extraEl.classList.toggle('open', isClosed);
      });
    }

    container.appendChild(eventItem);
  });

  // Upcoming section
  if (calendarData.upcoming.length) {
    const upcomingSection = document.createElement('div');
    upcomingSection.className = 'upcoming-section';
    upcomingSection.innerHTML = `<h3 class="upcoming-title">After November 18, 2025</h3>`;

    calendarData.upcoming.forEach(ev => {
      const item = document.createElement('div');
      item.className = 'upcoming-item';
      item.innerHTML = `
        <div class="event-toggle"></div>
        <div class="upcoming-date">${ev.day}</div>
        <div><strong>${ev.title}</strong><br><> ${ev.location}</div>
      `;
      upcomingSection.appendChild(item);
    });

    container.appendChild(upcomingSection);
  }

  block.appendChild(container);
}