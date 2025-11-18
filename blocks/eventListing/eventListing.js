// blocks/eventlisting/eventlisting.js

export default async function decorate(block) {
  // Full real data matching your screenshot exactly
  const calendarData = {
    displayDate: "Tuesday, November 18, 2025",
    events: [
      {
        time: "2:00 PM – 5:00 PM",
        title: "Care for Custodians",
        location: "MGSC TBL1 Lobby Information Table 1",
        description: "Thank you card making with aulalac",
        host: "Residence Hall Association (HRL)",
        moreInfo: true
      },
      {
        time: "4:00 PM – 6:30 PM",
        title: "National Security & The Intelligence Community Industry Week Networking Reception",
        location: "CNST 115 Meeting Room"
      },
      {
        time: "5:00 PM – 6:00 PM",
        title: "Leadership Listening Party",
        location: "MGSC 327* Meeting Room"
      },
      {
        time: "5:30 PM – 6:30 PM",
        title: "BRASA Game Night",
        location: "DMT 110 Classroom"
      }
    ],
    upcoming: [
      {
        day: "Wed, 11/19/2025",
        title: "Guns Down DC Fundraising",
        location: "QUAD-TBL2 Friedheim Quadrangle Info Table"
      }
    ]
  };

  // Clear the default empty divs
  block.textContent = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'eventlisting-wrapper';

  // Header
  wrapper.innerHTML = `
    <div class="eventlisting-header">
      <h2 class="eventlisting-title">${calendarData.displayDate}</h2>
      <div class="eventlisting-nav">
        <button type="button">PREVIOUS DAY</button>
        <button type="button">NEXT DAY</button>
      </div>
    </div>
  `;

  // Today's events
  calendarData.events.forEach(event => {
    const hasExtra = event.description || event.host || event.moreInfo;
    const item = document.createElement('div');
    item.className = 'eventlisting-item';

    item.innerHTML = `
      <div class="eventlisting-header-row ${hasExtra ? 'clickable' : ''}">
        ${hasExtra ? '<span class="eventlisting-toggle">›</span>' : '<span class="eventlisting-toggle no-toggle"></span>'}
        <div class="eventlisting-time">${event.time}</div>
        <div class="eventlisting-info">
          <h3>${event.title}</h3>
          <div class="eventlisting-location">${event.location}</div>
        </div>
      </div>
      ${hasExtra ? `
        <div class="eventlisting-details">
          ${event.description ? `<p>${event.description}</p>` : ''}
          ${event.host ? `<p><strong>Host:</strong> ${event.host}</p>` : ''}
          <div class="eventlisting-actions">
            <a href="javascript:void(0)">Export to Calendar</a>
            <a href="javascript:void(0)">Email this item</a>
          </div>
        </div>
      ` : ''}
    `;

    if (hasExtra) {
      const headerRow = item.querySelector('.eventlisting-header-row');
      const details = item.querySelector('.eventlisting-details');
      const toggle = item.querySelector('.eventlisting-toggle');

      headerRow.addEventListener('click', () => {
        const isOpen = details.classList.contains('open');
        details.classList.toggle('open', !isOpen);
        item.classList.toggle('open', !isOpen);
        toggle.textContent = isOpen ? '›' : '↓';
      });
    }

    wrapper.appendChild(item);
  });

  // Upcoming section
  if (calendarData.upcoming.length > 0) {
    const upcoming = document.createElement('div');
    upcoming.className = 'eventlisting-upcoming';
    upcoming.innerHTML = `<h3>After November 18, 2025</h3>`;
    calendarData.upcoming.forEach(ev => {
      upcoming.innerHTML += `
        <div class="eventlisting-upcoming-item">
          <span class="eventlisting-toggle no-toggle"></span>
          <div class="eventlisting-upcoming-date">${ev.day}</div>
          <div><strong>${ev.title}</strong><br>${ev.location}</div>
        </div>
      `;
    });
    wrapper.appendChild(upcoming);
  }

  block.appendChild(wrapper);
}