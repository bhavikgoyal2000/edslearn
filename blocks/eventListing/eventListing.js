export default async function decorate(block) {
  // ---------------------------------------
  // The Franklin rule: every block MUST contain ONE inner div
  // This is where we inject all content
  // ---------------------------------------
  const container = block.querySelector(':scope > div');
  if (!container) return;

  // ---------------------------------------
  // 1. HARD-CODED JSON DATA (later replace via fetch)
  // ---------------------------------------
  const data = {
    title: 'Tuesday, November 18, 2025',
    navigation: {
      previousLabel: 'PREVIOUS DAY',
      nextLabel: 'NEXT DAY'
    },
    events: [
      {
        timeDisplay: '2:00 pm — 5:00 pm',
        title: 'Care for Custodians',
        description: 'Thank you card making with aululac',
        location: 'MGSC TBL1 Lobby Information Table 1',
        host: 'Residence Hall Association (HRL)',
        type: '(none)',
        links: {
          export: '#',
          email: '#',
          eventPage: '#'
        },
        expanded: true
      },
      {
        timeDisplay: '4:00 pm — 6:30 pm',
        title: 'National Security & Intelligence Community Networking Reception',
        description: '',
        location: 'CNST 115 Meeting Room',
        host: 'School of Public Affairs',
        type: 'Networking',
        links: {
          export: '#',
          email: '#',
          eventPage: '#'
        }
      },
      {
        timeDisplay: '5:00 pm — 6:00 pm',
        title: 'Leadership Listening Party',
        description: '',
        location: 'MGSC 327* Meeting Room',
        host: 'Leadership Office',
        type: 'Meeting',
        links: {
          export: '#',
          email: '#',
          eventPage: '#'
        }
      },
      {
        timeDisplay: '5:30 pm — 6:30 pm',
        title: 'BRASA Game Night',
        description: '',
        location: 'DMTL 110 Classroom',
        host: 'BRASA Student Group',
        type: 'Social',
        links: {
          export: '#',
          email: '#',
          eventPage: '#'
        }
      }
    ]
  };

  // ---------------------------------------
  // 2. CLEAR INNER CONTAINER
  // ---------------------------------------
  container.innerHTML = '';
  container.classList.add('eventListing');

  // ---------------------------------------
  // 3. HEADER
  // ---------------------------------------
  const header = document.createElement('div');
  header.className = 'eventListing-header';
  header.innerHTML = `
    <h2 class="eventListing-title">${data.title}</h2>
    <div class="eventListing-nav">
      <button>${data.navigation.previousLabel}</button>
      <button>${data.navigation.nextLabel}</button>
    </div>
  `;
  container.append(header);

  // ---------------------------------------
  // 4. EVENT LIST WRAPPER
  // ---------------------------------------
  const list = document.createElement('div');
  list.className = 'eventListing-list';

  data.events.forEach((evt) => {
    // -------------------------------------
    // ROW / ITEM
    // -------------------------------------
    const row = document.createElement('div');
    row.className = 'eventListing-item';

    // TOGGLE (CHEVRON)
    const toggle = document.createElement('button');
    toggle.className = 'eventListing-toggle';
    toggle.innerHTML = '<span class="eventListing-chevron">▾</span>';

    // TIME
    const timeCol = document.createElement('div');
    timeCol.className = 'eventListing-time';
    timeCol.textContent = evt.timeDisplay;

    // TITLE + DESCRIPTION
    const titleCol = document.createElement('div');
    titleCol.className = 'eventListing-titleCol';
    titleCol.innerHTML = `
      <div>${evt.title}</div>
      ${evt.description ? `<small>${evt.description}</small>` : ''}
    `;

    // LOCATION
    const locCol = document.createElement('div');
    locCol.className = 'eventListing-location';
    locCol.textContent = evt.location;

    // ADD MAIN CELLS
    row.append(toggle, timeCol, titleCol, locCol);

    // -------------------------------------
    // DETAILS PANEL (ACCORDION CONTENT)
    // -------------------------------------
    const details = document.createElement('div');
    details.className = 'eventListing-details';
    details.innerHTML = `
      <dl class="eventListing-meta">
        <div><dt>Host</dt><dd>${evt.host}</dd></div>
        <div><dt>Type</dt><dd>${evt.type}</dd></div>
        <div><dt>Info</dt><dd><a href="${evt.links.eventPage}">Event Page</a></dd></div>
      </dl>
      <div class="eventListing-actions">
        <a href="${evt.links.export}">Export</a>
        <a href="${evt.links.email}">Email</a>
      </div>
    `;

    row.append(details);

    // -------------------------------------
    // TOGGLE LOGIC
    // -------------------------------------
    toggle.addEventListener('click', () => {
      const expanded = details.classList.toggle('expanded');
      const chevron = toggle.querySelector('.eventListing-chevron');
      chevron.style.transform = expanded ? 'rotate(180deg)' : 'rotate(0deg)';
    });

    // DEFAULT OPEN?
    if (evt.expanded) {
      details.classList.add('expanded');
      toggle.querySelector('.eventListing-chevron').style.transform = 'rotate(180deg)';
    }

    list.append(row);
  });

  container.append(list);
}
