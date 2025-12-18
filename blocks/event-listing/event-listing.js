import { fetchCalendarAnnouncementData, fetchCalendarEventsData } from '../../scripts/graphql-api.js';

function buildHeader(data, currentDateStr) {
  const currentDate = new Date(currentDateStr);
  const prevDate = new Date(currentDate);
  const nextDate = new Date(currentDate);

  prevDate.setDate(currentDate.getDate() - 1);
  nextDate.setDate(currentDate.getDate() + 1);

  const prevDateStr = prevDate.toISOString().split('T')[0];
  const nextDateStr = nextDate.toISOString().split('T')[0];

  return `
    <div class="au-header">
      <h1>${data.dateFormatted || 'Date not provided'}</h1>
      <div class="au-nav day-by-day-navigation" role="navigation" aria-label="Day by Day Navigation">
        <button type="button" class="nav-button previous" data-date="${prevDateStr}">Previous Day</button>
        <button type="button" class="nav-button next" data-date="${nextDateStr}">Next Day</button>
      </div>
    </div>
  `;
}

function buildAnnouncements(data) {
  if (!data.announcements || data.announcements.length === 0) return '';

  const items = data.announcements.map((a) => `
    <li class="event-announcement">
      ${a.text}
      <span class="tag ${a.color || 'red'}" data-popup="${a.popupKey || ''}">
        ${a.tagLabel || ''}
      </span>
    </li>
  `).join('');

  return `
    <div class="au-announcement">
      <span class="info-icon main-icon">i</span>
      <ul id="calendar-announcements-list">${items}</ul>
    </div>
  `;
}

function buildEvents(data) {
  if (!data.events || data.events.length === 0) {
    return '<p class="no-events">No events scheduled for this day.</p>';
  }

  return `
    <div class="au-events>
      ${data.events.map((event) => {
    const hasDetails = event.host || event.type !== '(none)' || event.moreInfo || event.description;
    const expandable = hasDetails;

        return `
          <div class="au-event ${expandable ? 'expandable' : ''}">
            <div class="au-event-header">
              ${expandable ? '<span class="au-arrow">Right Arrow</span>' : ''}
              <div class="au-time">${event.time || ''}</div>
              <div class="au-title">${event.title}</div>
              <div class="au-location">${event.location || ''}</div>
            </div>

            ${expandable ? `
              <div class="au-details">
                ${event.description ? `<p>${event.description}</p>` : ''}
                ${event.host ? `<p><strong>Host</strong> ${event.host}</p>` : ''}
                ${event.type && event.type !== '(none)' ? `<p><strong>Type</strong> ${event.type}</p>` : ''}
                ${event.moreInfo ? `<p><strong>More Info</strong> <a href="${event.moreInfo}" target="_blank">Event Page</a></p>` : ''}
                <div class="au-actions">
                  <a href="#">Export to Calendar</a>
                  <a href="#">Email this item</a>
                </div>
              </div>
            ` : ''}
          </div>
        `;
  }).join('')}
    </div>
  `;
}

function buildPopup(data) {
  // This can later be mapped from API
  return `
    <div class="au-popup-overlay" id="au-popup">
      <div class="au-popup">
        <div class="au-popup-header">
          <h2>Academic Calendar Explanations</h2>
          <button class="au-close">×</button>
        </div>
        <div class="au-popup-body">
          ${(data.popupItems || []).map((item) => `
            <div class="au-popup-row">
              <span class="au-tag ${item.color}">${item.label}</span>
              <div>${item.description}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function attachAccordion(block) {
  block.querySelectorAll('.au-event.expandable').forEach((event) => {
    const header = event.querySelector('.au-event-header');
    const details = event.querySelector('.au-details');
    const arrow = event.querySelector('.au-arrow');

    header.addEventListener('click', () => {
      const isOpen = event.classList.toggle('open');
      if (arrow) arrow.textContent = isOpen ? 'Down Arrow' : 'Right Arrow';
      details.style.display = isOpen ? 'block' : 'none';
    });
  });
}

function attachPopup(block) {
  block.querySelectorAll('.tag').forEach((tag) => {
    tag.addEventListener('click', (e) => {
      e.stopPropagation();
      block.querySelector('#au-popup').classList.add('visible');
    });
  });

  block.querySelector('.au-close')?.addEventListener('click', () => {
    block.querySelector('#au-popup').classList.remove('visible');
  });

  block.querySelector('.au-popup-overlay')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      block.querySelector('#au-popup').classList.remove('visible');
    }
  });
}

export function renderCalendarFromApi(block, data, currentDateStr = new Date().toISOString().split('T')[0]) {
  block.textContent = '';

  const html = `
    <div class="au-calendar">

      <!-- Search -->
      <div class="au-search">
        <div class="au-input-wrapper">
            <input type="text" id="searchInput" required>
            <label for="searchInput">Search University Calendar</label>
        </div>
        <button type="button" aria-label="Search">
          <ion-icon name="search-outline"></ion-icon>
        </button>
      </div>

      <!-- Header -->
      ${buildHeader(data, currentDateStr)}

      <!-- Announcement Box -->
      ${buildAnnouncements(data)}

      <!-- Events -->
      ${buildEvents(data)}

      <!-- Popup -->
      ${buildPopup(data)}

    </div>
  `;

  block.innerHTML = html;

  attachAccordion(block);
  attachPopup(block);
  attachNavButtons(block);
}

// async function loadAnnouncementsForDate(dateStr, block) {

//   try {
//     const url = `https://publish-p153273-e1586163.adobeaemcloud.com/graphql/execute.json/au/searchAnnouncementsByDate%3Bdate%3D${dateStr}%3BvisbleRequested%3D2%3BvisibleApproved%3Dtrue?_cb=1763881094443?hbv=${dateStr}`;

//     const response = await fetch(url);
//     // if (!response.ok) throw new Error('Network error');

//     const json = await response.json();
//     let rawItems = [];
//     if (json && json.announcementList && json.announcementList.items) {
//       rawItems = json.announcementList.items;
//     }

//     const collectionMap = {
//       is_holiday: { label: 'AU', color: 'red', popupKey: '' },
//       is_academic_calendar: { label: 'AU', color: 'red', popupKey: '' },
//       is_olsis: { label: 'OL: SIS', color: 'green', popupKey: 'olsis' },
//       is_olcas_soc_spa_spexs: { label: 'OL: CAS, SOC, SPA & SPEXS', color: 'navy', popupKey: 'olcas' },
//       is_olsoe: { label: 'OL: SOE', color: 'green', popupKey: 'olsoe' },
//       is_four_term: { label: 'Four Term Calendar', color: 'gray', popupKey: 'fourterm' },
//     };

//     const announcements = rawItems.map((item) => {
//       const matchedKey = Object.keys(collectionMap)
//         .find((key) => item.announcementCollections?.includes(key));
//       const tag = matchedKey ? collectionMap[matchedKey] : null;

//       return {
//         text: item.announcement_text || '(No announcement text)',
//         tagLabel: tag ? `<ion-icon name="calendar-outline"></ion-icon>${tag.label}` : '',
//         color: tag?.color || 'gray',
//         popupKey: tag?.popupKey || '',
//       };
//     });

//     const dateObj = new Date(dateStr);
//     const dateFormatted = dateObj.toLocaleDateString('en-US', {
//       weekday: 'long',
//       month: 'long',
//       day: 'numeric',
//       year: 'numeric',
//     });

//     const data = {
//       dateFormatted,
//       announcements,
//       events: [],
//       popupItems: [
//         { color: 'red', label: '<ion-icon name="calendar-outline"></ion-icon>Semester Calendar', description: "AU's standard academic calendar consisting of the Fall & Spring Semesters and the Summer Sessions each year." },
//         { color: 'gray', label: '<ion-icon name="calendar-outline"></ion-icon>Four Term Calendar', description: "AU's Four Term academic calendar..." },
//         { color: 'navy', label: '<ion-icon name="calendar-outline"></ion-icon>OL: CAS, SOC, SPA & SPEXS', description: 'Academic Calendar for Online Programs in SOC, SPA, CAS (excluding School of Education) and SPEXS' },
//         { color: 'green', label: '<ion-icon name="calendar-outline"></ion-icon>OL: SIS', description: 'Academic Calendar for Online Programs in School of International Service' },
//         { color: 'green', label: '<ion-icon name="calendar-outline"></ion-icon>OL: SOE', description: 'Academic Calendar for Online Programs in School of Education' },
//       ],
//     };
// debugger
//     renderCalendarFromApi(block, data, dateStr);
//   } catch (err) {
//     // console.error(err);
//     renderCalendarFromApi(block, "", dateStr);
//     // block.textContent = 'Failed to load announcements for this date.';
//   }
// }

function attachNavButtons(block) {
  block.querySelectorAll('.nav-button').forEach(button => {
    button.addEventListener('click', (e) => {
      const targetDate = e.currentTarget.getAttribute('data-date');
      if (targetDate) {
        // Dispatch the same custom event your calendar listens to
        document.dispatchEvent(new CustomEvent('calendar:dateSelected', {
          detail: { date: targetDate }
        }));
      }
    });
  });
}

async function loadAnnouncementsForDate(dateStr, block) {
  try {
    const annJson = await fetchCalendarAnnouncementData('searchAnnouncementsByDate', dateStr, '2', 'true');
    
    const eventJson = await fetchCalendarEventsData('GetCalendarEventsBydate', `${dateStr}T00:00:00.000Z`, `${dateStr}T23:59:59.999Z`, '2', '2');
    console.log('eventJson:', eventJson);
    let rawItems = [];
    if (annJson && annJson.announcementList && annJson.announcementList.items) {
      rawItems = annJson.announcementList.items;
    }

    const collectionMap = {
      is_holiday: { label: 'AU', color: 'red', popupKey: '' },
      is_academic_calendar: { label: 'AU', color: 'red', popupKey: '' },
      is_olsis: { label: 'OL: SIS', color: 'green', popupKey: 'olsis' },
      is_olcas_soc_spa_spexs: { label: 'OL: CAS, SOC, SPA & SPEXS', color: 'navy', popupKey: 'olcas' },
      is_olsoe: { label: 'OL: SOE', color: 'green', popupKey: 'olsoe' },
      is_four_term: { label: 'Four Term Calendar', color: 'gray', popupKey: 'fourterm' },
    };

    const announcements = rawItems.map((item) => {
      const matchedKey = Object.keys(collectionMap)
        .find((key) => item.announcementCollections?.includes(key));
      const tag = matchedKey ? collectionMap[matchedKey] : null;

      return {
        text: item.announcement_text || '(No announcement text)',
        tagLabel: tag ? `<ion-icon name="calendar-outline"></ion-icon>${tag.label}` : '',
        color: tag?.color || 'gray',
        popupKey: tag?.popupKey || '',
      };
    });

    const rawEvents = eventJson?.eventList?.items || [];
    const events = rawEvents.map((item) => {
      const time = item.startTime && item.endTime
        ? `${item.startTime.replace(':00', '')} – ${item.endTime.replace(':00', '')}`
        : (item.startTime?.replace(':00', '') || '');

      return {
        time,
        title: item.title || 'Untitled Event',
        location: item.location || '',
        description: item.description || '',
        host: item.host || '',
        type: item.eventType || '(none)',
        moreInfo: item.eventUrl || '',
      };
    });

    const dateObj = new Date(dateStr);
    const dateFormatted = dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    const data = {
      dateFormatted,
      announcements,
      events,
      popupItems: [
        { color: 'red', label: '<ion-icon name="calendar-outline"></ion-icon>Semester Calendar', description: "AU's standard academic calendar consisting of the Fall & Spring Semesters and the Summer Sessions each year." },
        { color: 'gray', label: '<ion-icon name="calendar-outline"></ion-icon>Four Term Calendar', description: "AU's Four Term academic calendar..." },
        { color: 'navy', label: '<ion-icon name="calendar-outline"></ion-icon>OL: CAS, SOC, SPA & SPEXS', description: 'Academic Calendar for Online Programs in SOC, SPA, CAS (excluding School of Education) and SPEXS' },
        { color: 'green', label: '<ion-icon name="calendar-outline"></ion-icon>OL: SIS', description: 'Academic Calendar for Online Programs in School of International Service' },
        { color: 'green', label: '<ion-icon name="calendar-outline"></ion-icon>OL: SOE', description: 'Academic Calendar for Online Programs in School of Education' },
      ],
    };

    renderCalendarFromApi(block, data, dateStr);
  } catch (err) {
    console.error('Error loading calendar data:', err);
    block.textContent = 'Failed to load announcements and events.';
    block.style.color = 'red';
  }
}

export default async function decorate(block) {
  block.textContent = 'Loading Announcements...';

  const today = new Date().toISOString().split('T')[0];
  await loadAnnouncementsForDate(today, block);

  document.addEventListener('calendar:dateSelected', (e) => {
    const selectedDate = e.detail.date;
    loadAnnouncementsForDate(selectedDate, block);
  });

  if (!document.querySelector('script[src*="ionicons"]')) {
    const ioniconsScript = document.createElement('script');
    ioniconsScript.type = 'module';
    ioniconsScript.src = 'https://unpkg.com/ionicons@7.4.0/dist/ionicons/ionicons.esm.js';
    document.head.appendChild(ioniconsScript);

    const ioniconsNomodule = document.createElement('script');
    ioniconsNomodule.noModule = true;
    ioniconsNomodule.src = 'https://unpkg.com/ionicons@7.4.0/dist/ionicons/ionicons.js';
    document.head.appendChild(ioniconsNomodule);
  }
}
