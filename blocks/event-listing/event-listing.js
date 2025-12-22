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
    <div class="au-events">
      ${data.events.map((event) => {
    const hasDetails = event.host || event.type !== '(none)' || event.moreInfo || event.description;
    const expandable = hasDetails;
    const safeTitle = event.title.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const safeLocation = (event.location || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const safeDescription = (event.eventDescription || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    return `
          <div class="au-event ${expandable ? 'expandable' : ''}" 
            data-title="${safeTitle}"
            data-fullstart="${event.fullStart}"
            data-fullend="${event.fullEnd}"
            data-location="${safeLocation}"
            data-description="${safeDescription}">
            <div class="au-event-header">
              ${expandable ? '<span class="au-arrow"><ion-icon name="chevron-down-outline"></ion-icon></span>' : ''}
              <div class="au-time">${event.time || ''}</div>
              <div class="au-title">${event.title}</div>
              <div class="au-location">${event.location || ''}</div>
            </div>
            ${expandable ? `
              <div class="au-details">
                <div class="au-left-column">
                  <div class="au-metadata">
                    ${event.eventDescription ? `<div class="au-description"><p>${event.eventDescription}</p></div>` : ''}
                    ${event.host ? `
                      <div class="meta-row">
                        <span class="meta-label"><p>Host</p></span>
                        <span class="meta-value">${event.host}</span>
                      </div>
                    ` : ''}
                    ${event.type && event.type !== '(none)' ? `
                      <div class="meta-row">
                        <span class="meta-label"><strong>Type</strong></span>
                        <span class="meta-value">${event.type}</span>
                      </div>
                    ` : ''}
                    ${event.moreInfo ? `
                      <div class="meta-row">
                        <span class="meta-label"><strong>More Info</strong></span>
                        <span class="meta-value"><a href="${event.moreInfo}" target="_blank">Event Page</a></span>
                      </div>
                    ` : ''}
                  </div>
                </div>
                <div class="au-right-column">
                  <div class="au-actions">
                    <a href="#" class="export-calendar"><ion-icon name="calendar-outline"></ion-icon> Export to Calendar</a>
                    <a href="#"><ion-icon name="mail-outline"></ion-icon> Email this item</a>
                  </div>
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
      const icon = arrow?.querySelector('ion-icon');
      if (icon) icon.name = isOpen ? 'chevron-up-outline' : 'chevron-down-outline';
      details.style.display = isOpen ? 'block' : 'none';
    });
    event.addEventListener('mouseenter', () => event.classList.add('hovered'));
    event.addEventListener('mouseleave', () => event.classList.remove('hovered'));
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

function attachNavButtons(block) {
  block.querySelectorAll('.nav-button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const targetDate = e.currentTarget.getAttribute('data-date');
      if (targetDate) {
        // Dispatch the same custom event your calendar listens to
        document.dispatchEvent(new CustomEvent('calendar:dateSelected', {
          detail: { date: targetDate },
        }));
      }
    });
  });
}

function attachExport(block) {
  block.querySelectorAll('.export-calendar').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();

      const eventDiv = link.closest('.au-event');
      const title = eventDiv.dataset.title || 'Untitled Event';
      const start = new Date(eventDiv.dataset.fullstart);
      const end = new Date(eventDiv.dataset.fullend);
      const location = eventDiv.dataset.location || '';
      let description = eventDiv.dataset.description || '';

      // Convert to ICS timestamp format (UTC, Z means UTC)
      function toICSFormat(date) {
        return `${date.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
      }

      // Escape newlines and other chars for ICS DESCRIPTION
      description = description.replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');

      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${Date.now()}@dynamic.event
DTSTAMP:${toICSFormat(new Date())}
DTSTART:${toICSFormat(start)}
DTEND:${toICSFormat(end)}
SUMMARY:${title.replace(/,/g, '\\,').replace(/;/g, '\\;')}
DESCRIPTION:${description}
LOCATION:${location.replace(/,/g, '\\,').replace(/;/g, '\\;')}
END:VEVENT
END:VCALENDAR`;

      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/[^a-z0-9]/gi, '_')}.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url);
    });
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
  attachNavButtons(block);
  attachExport(block);
  attachPopup(block);
}

async function loadAnnouncementsForDate(dateStr, block) {
  try {
    const annJson = await fetchCalendarAnnouncementData('searchAnnouncementsByDate', dateStr, '2', 'true');

    const eventJson = await fetchCalendarEventsData('GetCalendarEventsBydate', `${dateStr}T00:00:00.000-05:00`, `${dateStr}T23:59:59.999-05:00`, '2', '2');
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

    const rawEvents = eventJson?.calendarEventsList?.items || [];
    const events = rawEvents.map((item) => {
      const start = new Date(item.eventStart);
      const end = new Date(item.eventEnd);
      const startTime = start.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'America/New_York',
      });
      const endTime = end.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'America/New_York',
      });
      const time = item.eventStart && item.eventEnd
        ? `${startTime} – ${endTime}`
        : (startTime || '');

      return {
        time,
        title: item.eventName || 'Untitled Event',
        location: item.roomDescription?.markdown || '',
        eventDescription: item.eventDescription?.markdown || '',
        host: item.calendarContactName || '',
        type: item.calendarEventType || '(none)',
        moreInfo: item.path ? `${window.location.origin}${item.path.replace('/content/dam', '/events')}` : '',
        fullStart: item.eventStart,
        fullEnd: item.eventEnd,
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
