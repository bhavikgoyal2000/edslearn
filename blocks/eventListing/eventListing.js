// blocks/eventlisting/eventlisting.js
export default function decorate(block) {
  // CLEAR THE DEFAULT EMPTY DIVS — THIS IS THE KEY LINE!
  block.textContent = '';

  // Hardcoded data exactly matching your screenshot (November 18, 2025)
  const data = {
    displayDate: "Tuesday, November 18, 2025",
    events: [
      {
        time: "2:00 PM – 5:00 PM",
        title: "Care for Custodians",
        location: "MGSC TBL1 Lobby Information Table 1",
        description: "Thank you card making with aulalac",
        host: "Residence Hall Association (HRL)",
        hasExtra: true
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

  const wrapper = document.createElement('div');
  wrapper.className = 'eventlisting';

  wrapper.innerHTML = `
    <div class="eventlisting-header">
      <h2>${data.displayDate}</h2>
      <div class="eventlisting-nav">
        <button>PREVIOUS DAY</button>
        <button>NEXT DAY</button>
      </div>
    </div>
  `;

  data.events.forEach(event => {
    const item = document.createElement('div');
    item.className = 'eventlisting-item';

    item.innerHTML = `
      <div class="eventlisting-row ${event.hasExtra ? 'expandable' : ''}">
        ${event.hasExtra ? '<span class="arrow">▶</span>' : '<span class="arrow no-arrow"></span>'}
        <div class="time">${event.time}</div>
        <div class="details">
          <h3>${event.title}</h3>
          <p class="location">${event.location}</p>
        </div>
      </div>
      ${event.hasExtra ? `
      <div class="extra">
        <p>${event.description}</p>
        <p><strong>Host:</strong> ${event.host}</p>
        <div class="actions">
          <a href="#">Export to Calendar</a>
          <a href="#">Email this item</a>
        </div>
      </div>` : ''}
    `;

    if (event.hasExtra) {
      const row = item.querySelector('.eventlisting-row');
      const extra = item.querySelector('.extra');
      const arrow = item.querySelector('.arrow');

      row.addEventListener('click', () => {
        const open = extra.classList.toggle('open');
        item.classList.toggle('open', open);
        arrow.textContent = open ? '▼' : '▶';
      });
    }

    wrapper.appendChild(item);
  });

  // Upcoming section
  const upcoming = document.createElement('div');
  upcoming.className = 'eventlisting-upcoming';
  upcoming.innerHTML = `<h3>After November 18, 2025</h3>`;
  data.upcoming.forEach(u => {
    upcoming.innerHTML += `
      <div class="upcoming-item">
        <span class="arrow no-arrow"></span>
        <div class="upcoming-day">${u.day}</div>
        <div><strong>${u.title}</strong><br>${u.location}</div>
      </div>
    `;
  });
  wrapper.appendChild(upcoming);

  block.appendChild(wrapper);
}