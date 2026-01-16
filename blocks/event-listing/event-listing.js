/* eslint-disable no-use-before-define */
/* eslint-disable default-param-last */
/* eslint-disable max-len */
// import { GRAPHQL_ENDPOINT } from '../../scripts/constants.js';

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

function buildFooter(data, currentDateStr) {
  const currentDate = new Date(currentDateStr);
  const prevDate = new Date(currentDate);
  const nextDate = new Date(currentDate);

  prevDate.setDate(currentDate.getDate() - 1);
  nextDate.setDate(currentDate.getDate() + 1);

  const prevDateStr = prevDate.toISOString().split('T')[0];
  const nextDateStr = nextDate.toISOString().split('T')[0];

  return `
    <div class="au-footer">
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
  const isUpcoming = data.isUpcoming === true;
  if (!data.events || data.events.length === 0) {
    return '<p class="no-events">No events scheduled for this day.</p>';
  }

  return `
    <div class="au-events">
      ${data.events.map((event) => {
    const expandable = true;
    const safeTitle = event.title.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const safeLocation = (event.location || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const safeDescription = (event.eventDescription || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const eventDateLabel = isUpcoming ? new Date(event.fullStart).toLocaleDateString('en-US', {
      weekday: 'short',
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    })
      : '';

    return `
          <div class="au-event ${expandable ? 'expandable' : ''}"
            data-title="${safeTitle}"
            data-fullstart="${event.fullStart}"
            data-fullend="${event.fullEnd}"
            data-location="${safeLocation}"
            data-description="${safeDescription}"
            data-eventtypeid="${event.eventTypeId || ''}"
            data-type="${event.type || ''}"
            data-groupid="${event.groupId || ''}"
            data-groupname="${event.groupName || ''}"
            data-groupdisplayonweb="${event.groupDisplayOnWeb}"
            data-contactname="${event.contactName || ''}"
            data-contactemail="${event.contactEmail || ''}"
            data-contactphone="${event.contactPhone || ''}">
            <div class="au-event-header">
              ${expandable ? '<span class="au-arrow"><ion-icon name="chevron-down-outline"></ion-icon></span>' : ''}
              ${isUpcoming ? `<div class="au-date"> ${eventDateLabel}</div>` : ''}
              <div class="au-time">${event.time || ''}</div>
              <div class="au-title">${event.title}</div>
              <div class="au-location">${event.location || ''}</div>
            </div>
            ${expandable ? `
              <div class="au-details">
                <div class="au-left-column">
                  <div class="au-metadata">
                    ${event.eventDescription ? `<div class="au-description"><p>${event.eventDescription}</p></div>` : ''}
                    ${event.groupName && event.groupDisplayOnWeb ? `
                      <div class="meta-row">
                        <span class="meta-label"><p>Host</p></span>
                        <span class="meta-value">
                          <button
                            type="button"
                            class="host-filter-link link-button"
                            data-groupid="${event.groupId}">
                            ${event.groupName}
                          </button>
                        </span>
                      </div>
                    ` : ''}
                    ${event.type ? `
                      <div class="meta-row">
                        <span class="meta-label"><p>Type</p></span>
                        <span class="meta-value">${event.type}</span>
                      </div>
                    ` : ''}
                    ${`
                      <div class="meta-row">
                        <span class="meta-label"><p>More Info</p></span>
                        <span class="meta-value">
                          <a href="javascript:void(0);" class="event-page-link">Event Page</a>
                        </span>
                      </div>
                    `}
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

    event.classList.remove('open');
    if (details) details.style.display = 'none';
    const icon = arrow?.querySelector('ion-icon');
    if (icon) icon.name = 'chevron-down-outline';

    header.addEventListener('click', () => {
      const isOpen = event.classList.toggle('open');
      if (icon) icon.name = isOpen ? 'chevron-up-outline' : 'chevron-down-outline';
      if (details) details.style.display = isOpen ? 'flex' : 'none';
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

      function toICSFormat(date) {
        return `${date.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
      }

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

function buildUpcomingHeading(currentDateStr) {
  const date = new Date(currentDateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return `
    <h2 class="au-upcoming-heading">
      After ${date}
    </h2>
  `;
}

// eslint-disable-next-line default-param-last
export function renderCalendarFromApi(block, data, currentDateStr = new Date().toISOString().split('T')[0], visibilityLevel, visibilityApproved, visibleRequested, visibleApproved) {
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
      ${buildEvents({ ...data, events: data.events })}

      <!-- Popup -->
      ${buildPopup(data)}

      ${buildFooter(data, currentDateStr)}

      ${buildUpcomingHeading(currentDateStr)}

      ${buildEvents({ ...data, events: data.upcomingEvents, isUpcoming: true })}

    </div>
  `;

  block.innerHTML = html;

  attachAccordion(block);
  attachNavButtons(block);
  attachExport(block);
  attachPopup(block);
  // eslint-disable-next-line no-use-before-define
  attachEventPageLinks(block, visibilityLevel, visibilityApproved, visibleRequested, visibleApproved);
  // eslint-disable-next-line no-use-before-define
  attachHostFilter(block, currentDateStr, visibilityLevel, visibilityApproved, visibleRequested, visibleApproved);
}

// async function loadUpcomingEvents(eventEndDateTime, groupId, eventTypeId, location, visibilityLevel, visibilityApproved, visibleRequested, visibleApproved) {
//   try {
//     const json = await fetchCalendarData('GetUpcomingCalendarEvents', null, eventEndDateTime, visibilityLevel, visibilityApproved, null, visibleRequested, visibleApproved, groupId, eventTypeId, location);

//     return json?.calendarEventsList?.items || [];
//   } catch (e) {
//     return [];
//   }
// }

// async function loadAnnouncementsForDate(dateStr, block, groupId, eventTypeId, location, visibilityLevel, visibilityApproved, visibleRequested, visibleApproved) {
//   try {
//     const calendarJson = await fetchCalendarData('GetCalendarData', `${dateStr}T00:00:00.000-05:00`, `${dateStr}T23:59:59.999-05:00`, visibilityLevel, visibilityApproved, dateStr, visibleRequested, visibleApproved, groupId, eventTypeId, location);
//     let rawItems = [];
//     if (calendarJson && calendarJson.announcementList && calendarJson.announcementList.items) {
//       rawItems = calendarJson.announcementList.items;
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

//     const rawEventsToday = calendarJson?.calendarEventsList?.items || [];

//     const lastEventEnd = rawEventsToday.length > 0 ? rawEventsToday[rawEventsToday.length - 1].eventEnd : `${dateStr}T23:59:59.999-05:00`;

//     const upcomingRawEvents = await loadUpcomingEvents(lastEventEnd, groupId, eventTypeId, location, visibilityLevel, visibilityApproved, visibleRequested, visibleApproved);

//     const mapEvent = (item) => {
//       const start = new Date(item.eventStart);
//       const end = new Date(item.eventEnd);

//       const startTime = start.toLocaleTimeString('en-US', {
//         hour: 'numeric',
//         minute: '2-digit',
//         hour12: true,
//         timeZone: 'America/New_York',
//       });

//       const endTime = end.toLocaleTimeString('en-US', {
//         hour: 'numeric',
//         minute: '2-digit',
//         hour12: true,
//         timeZone: 'America/New_York',
//       });

//       return {
//         time: `${startTime} – ${endTime}`,
//         title: item.eventName || 'Untitled Event',
//         location: item.roomDescription?.markdown || '',
//         eventDescription: item.eventDescription?.markdown || '',
//         groupId: item.groupId || '',
//         eventTypeId: item.eventTypeId || '',
//         groupName: item.groupName || '',
//         groupDisplayOnWeb: item.groupDisplayOnWeb || false,
//         contactName: item.calendarContactName || '',
//         contactEmail: item.calendarContactEmail || '',
//         contactPhone: item.calendarContactPhone || '',
//         type: item.eventTypeName || '',
//         fullStart: item.eventStart,
//         fullEnd: item.eventEnd,
//         dateLabel: start.toLocaleDateString('en-US', {
//           weekday: 'short',
//           month: '2-digit',
//           day: '2-digit',
//           year: 'numeric',
//         }),
//       };
//     };

//     const eventsToday = rawEventsToday.map(mapEvent);
//     const upcomingEvents = upcomingRawEvents.map(mapEvent);

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
//       events: eventsToday,
//       upcomingEvents,
//       popupItems: [
//         { color: 'red', label: '<ion-icon name="calendar-outline"></ion-icon>Semester Calendar', description: "AU's standard academic calendar consisting of the Fall & Spring Semesters and the Summer Sessions each year." },
//         { color: 'gray', label: '<ion-icon name="calendar-outline"></ion-icon>Four Term Calendar', description: "AU's Four Term academic calendar..." },
//         { color: 'navy', label: '<ion-icon name="calendar-outline"></ion-icon>OL: CAS, SOC, SPA & SPEXS', description: 'Academic Calendar for Online Programs in SOC, SPA, CAS (excluding School of Education) and SPEXS' },
//         { color: 'green', label: '<ion-icon name="calendar-outline"></ion-icon>OL: SIS', description: 'Academic Calendar for Online Programs in School of International Service' },
//         { color: 'green', label: '<ion-icon name="calendar-outline"></ion-icon>OL: SOE', description: 'Academic Calendar for Online Programs in School of Education' },
//       ],
//     };

//     renderCalendarFromApi(block, data, dateStr, visibilityLevel, visibilityApproved, visibleRequested, visibleApproved);
//   } catch (err) {
//     block.textContent = 'Failed to load announcements and events.';
//     block.style.color = 'red';
//   }
// }

async function loadAnnouncementsForDate(
  dateStr,
  block,
  groupIds = [],
  eventTypeIds = [],
  visibilityLevel,
  visibilityApproved,
  visibleRequested,
  visibleApproved,
) {
  try {
    // Fetch day data (events + announcements)
    const dayQuery = buildDayQuery(groupIds, eventTypeIds);
    const dayVariables = {
      eventStart: `${dateStr}T00:00:00.000-05:00`,
      eventEnd: `${dateStr}T23:59:59.999-05:00`,
      visibilityLevel: visibilityLevel.toString(),
      visibilityApproved: visibilityApproved.toString(),
      date: dateStr,
      visbleRequested: visibleRequested.toString(),
      visibleApproved,
    };

    const dayData = await fetchDynamic(dayQuery, dayVariables);

    // Process announcements (unchanged from your original)
    const rawItems = dayData?.announcementList?.items || [];

    const collectionMap = {
      is_holiday: { label: 'AU', color: 'red', popupKey: '' },
      is_academic_calendar: { label: 'AU', color: 'red', popupKey: '' },
      is_olsis: { label: 'OL: SIS', color: 'green', popupKey: 'olsis' },
      is_olcas_soc_spa_spexs: { label: 'OL: CAS, SOC, SPA & SPEXS', color: 'navy', popupKey: 'olcas' },
      is_olsoe: { label: 'OL: SOE', color: 'green', popupKey: 'olsoe' },
      is_four_term: { label: 'Four Term Calendar', color: 'gray', popupKey: 'fourterm' },
    };

    const announcements = rawItems.map((item) => {
      const matchedKey = Object.keys(collectionMap).find((key) => item.announcementCollections?.includes(key));
      const tag = matchedKey ? collectionMap[matchedKey] : null;

      return {
        text: item.announcement_text || '(No announcement text)',
        tagLabel: tag ? `<ion-icon name="calendar-outline"></ion-icon>${tag.label}` : '',
        color: tag?.color || 'gray',
        popupKey: tag?.popupKey || '',
      };
    });

    // Today's events
    const rawEventsToday = dayData?.calendarEventsList?.items || [];

    const lastEventEnd = rawEventsToday.length > 0
      ? rawEventsToday[rawEventsToday.length - 1].eventEnd
      : `${dateStr}T23:59:59.999-05:00`;

    // Fetch upcoming events
    const upcomingQuery = buildUpcomingQuery(groupIds, eventTypeIds);
    const upcomingVariables = {
      eventStart: lastEventEnd,
      visibilityLevel: visibilityLevel.toString(),
      visibilityApproved: visibilityApproved.toString(),
    };

    const upcomingData = await fetchDynamic(upcomingQuery, upcomingVariables);
    const upcomingRawEvents = upcomingData?.calendarEventsList?.items || [];

    const mapEvent = (item) => {
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

      return {
        time: `${startTime} – ${endTime}`,
        title: item.eventName || 'Untitled Event',
        location: item.roomDescription?.markdown || '',
        eventDescription: item.eventDescription?.markdown || '',
        groupId: item.groupId || '',
        eventTypeId: item.eventTypeId || '',
        groupName: item.groupName || '',
        groupDisplayOnWeb: item.groupDisplayOnWeb || false,
        contactName: item.calendarContactName || '',
        contactEmail: item.calendarContactEmail || '',
        contactPhone: item.calendarContactPhone || '',
        type: item.eventTypeName || '',
        fullStart: item.eventStart,
        fullEnd: item.eventEnd,
        dateLabel: start.toLocaleDateString('en-US', {
          weekday: 'short',
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
        }),
      };
    };

    const eventsToday = rawEventsToday.map(mapEvent);
    const upcomingEvents = upcomingRawEvents.map(mapEvent);

    // Build maps for active filter chips
    const groupMap = {};
    const typeMap = {};
    [...eventsToday, ...upcomingEvents].forEach((ev) => {
      if (ev.groupId && ev.groupName) groupMap[ev.groupId] = ev.groupName;
      if (ev.eventTypeId && ev.type) typeMap[ev.eventTypeId] = ev.type;
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
      events: eventsToday,
      upcomingEvents,
      popupItems: [
        { color: 'red', label: '<ion-icon name="calendar-outline"></ion-icon>Semester Calendar', description: "AU's standard academic calendar consisting of the Fall & Spring Semesters and the Summer Sessions each year." },
        { color: 'gray', label: '<ion-icon name="calendar-outline"></ion-icon>Four Term Calendar', description: "AU's Four Term academic calendar..." },
        { color: 'navy', label: '<ion-icon name="calendar-outline"></ion-icon>OL: CAS, SOC, SPA & SPEXS', description: 'Academic Calendar for Online Programs in SOC, SPA, CAS (excluding School of Education) and SPEXS' },
        { color: 'green', label: '<ion-icon name="calendar-outline"></ion-icon>OL: SIS', description: 'Academic Calendar for Online Programs in School of International Service' },
        { color: 'green', label: '<ion-icon name="calendar-outline"></ion-icon>OL: SOE', description: 'Academic Calendar for Online Programs in School of Education' },
      ],
      activeGroupIds: groupIds,
      activeTypeIds: eventTypeIds,
      groupMap,
      typeMap,
    };

    block.dataset.currentDate = dateStr;
    block.dataset.currentGroupids = groupIds.join(',');
    block.dataset.currentEventtypeids = eventTypeIds.join(',');

    renderCalendarFromApi(block, data, dateStr, visibilityLevel, visibilityApproved, visibleRequested, visibleApproved);
  } catch (err) {
    console.error(err);
    block.textContent = 'Failed to load calendar data.';
    block.style.color = 'red';
  }
}

function formatEventDate(dateStr) {
  if (!dateStr) return '';

  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function renderEventDetail(block, eventData, visibilityLevel, visibilityApproved, visibleRequested, visibleApproved) {
  const formattedDate = formatEventDate(eventData.fullStart);
  block.innerHTML = `
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
      <section class="au-event-detail">
        <div class="event-content">
          <h1 class="event-date">${formattedDate}</h1>
          <h1>${eventData.title}</h1>

          <p class="event-time-location">
            ${new Date(eventData.fullStart).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            -
            ${new Date(eventData.fullEnd).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}, ${eventData.location}
          </p>

          <div class="event-description">
            <p>${eventData.description}</p>
          </div>
          ${eventData.type ? `
            <div class="meta-row">
              <span class="meta-label">Type</span>
              <span class="meta-value">
                <button
                  type="button"
                  class="event-type-filter-link link-button"
                  data-eventtypeid="${eventData.eventTypeId}">
                  ${eventData.type}
                </button>
              </span>
            </div>
          ` : ''}
          ${eventData.groupName && eventData.groupDisplayOnWeb ? `
            <div class="meta-row">
              <span class="meta-label"><p>Host</p></span>
              <span class="meta-value">
                <button
                  type="button"
                  class="host-filter-link link-button"
                  data-groupid="${eventData.groupId}">
                  ${eventData.groupName}
                </button>
              </span>
            </div>
          ` : ''}
          <div class="meta-row">
            <span class="meta-label">Contact</span>
            <span class="meta-value">
              <div class="contact-name">${eventData.contactName ? `${eventData.contactName}` : ''}</div>
              <div class="contact-email">${eventData.contactEmail ? `<a href="mailto:${eventData.contactEmail}">${eventData.contactEmail}</a>` : ''}</div>
              <div class="contact-phone">${eventData.contactPhone ? `<a href="tel:${eventData.contactPhone}">${eventData.contactPhone}</a>` : ''}</div>
            </span>
          </div>
          <a href="#" class="export-calendar"><ion-icon name="calendar-outline"></ion-icon> Export to Calendar</a>
        </div>

      </section>
    </div>
  `;

  // eslint-disable-next-line no-use-before-define
  attachEventTypeFilter(block, eventData.fullStart?.split('T')[0], visibilityLevel, visibilityApproved, visibleRequested, visibleApproved);
  attachExport(block);
}

function attachEventTypeFilter(block, currentDateStr, visibilityLevel, visibilityApproved, visibleRequested, visibleApproved) {
  const link = block.querySelector('.event-type-filter-link');
  if (!link) return;

  link.addEventListener('click', async (e) => {
    e.preventDefault();

    const eventTypeId = link.dataset.eventtypeid;
    if (!eventTypeId) return;

    const date = currentDateStr || new Date().toISOString().split('T')[0];

    await loadAnnouncementsForDate(
      date,
      block,
      null,
      eventTypeId,
      null,
      visibilityLevel,
      visibilityApproved,
      visibleRequested,
      visibleApproved,
    );
  });
}

function attachHostFilter(block, currentDateStr, visibilityLevel, visibilityApproved, visibleRequested, visibleApproved) {
  block.querySelectorAll('.host-filter-link').forEach((link) => {
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const groupId = link.dataset.groupid;
      if (!groupId) return;

      const date = currentDateStr || new Date().toISOString().split('T')[0];

      await loadAnnouncementsForDate(
        date,
        block,
        groupId,
        null,
        null,
        visibilityLevel,
        visibilityApproved,
        visibleRequested,
        visibleApproved,
      );
    });
  });
}

function attachEventPageLinks(block, visibilityLevel, visibilityApproved, visibleRequested, visibleApproved) {
  block.querySelectorAll('.event-page-link').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();

      const eventDiv = link.closest('.au-event');

      renderEventDetail(block, {
        title: eventDiv.dataset.title,
        fullStart: eventDiv.dataset.fullstart,
        fullEnd: eventDiv.dataset.fullend,
        location: eventDiv.dataset.location,
        description: eventDiv.dataset.description,
        type: eventDiv.dataset.type,
        groupName: eventDiv.dataset.groupname,
        groupId: eventDiv.dataset.groupid,
        eventTypeId: eventDiv.dataset.eventtypeid,
        groupDisplayOnWeb: eventDiv.dataset.groupdisplayonweb === 'true',
        contactEmail: eventDiv.dataset.contactemail,
        contactName: eventDiv.dataset.contactname,
        contactPhone: eventDiv.dataset.contactphone,
        visibilityLevel,
        visibilityApproved,
        visibleRequested,
        visibleApproved,
      });
    });
  });
}

function parseDefaultValues(str) {
  if (!str || str.trim() === '') return 2;
  const num = parseInt(str.trim(), 10);
  return Number.isNaN(num) ? 2 : num;
}

function parseBoolean(str, defaultValue = true) {
  if (!str || str.trim() === '') return defaultValue;
  return str.trim().toLowerCase() === 'true';
}

function extractData(block) {
  const [groupIdObj, eventTypeIdObj, locationObj, visibilityLevelObj, visibilityApprovedObj, visibleRequestedObj, visibleApprovedObj] = block.children;
  const groupIdStr = groupIdObj ? groupIdObj.querySelector('p')?.textContent.trim() : '';
  const initialGroupIds = groupIdStr ? groupIdStr.split(',').map((s) => parseFloat(s.trim())).filter((n) => !Number.isNaN(n)) : [];
  const eventTypeIdStr = eventTypeIdObj ? eventTypeIdObj.querySelector('p')?.textContent.trim() : '';
  const initialEventTypeIds = eventTypeIdStr ? eventTypeIdStr.split(',').map((s) => parseFloat(s.trim())).filter((n) => !Number.isNaN(n)) : [];
  const location = locationObj ? locationObj.querySelector('p')?.innerHTML.trim() : '';
  const visibilityLevel = visibilityLevelObj ? visibilityLevelObj.querySelector('p')?.innerHTML.trim() : '';
  const visibilityApproved = visibilityApprovedObj ? visibilityApprovedObj.querySelector('p')?.innerHTML.trim() : '';
  const visibleRequested = visibleRequestedObj ? visibleRequestedObj.querySelector('p')?.innerHTML.trim() : '';
  const visibleApproved = visibleApprovedObj ? visibleApprovedObj.querySelector('p')?.innerHTML.trim() : '';

  return {
    initialGroupIds,
    initialEventTypeIds,
    location,
    visibilityLevel: parseDefaultValues(visibilityLevel),
    visibilityApproved: parseDefaultValues(visibilityApproved),
    visibleRequested: parseDefaultValues(visibleRequested),
    visibleApproved: parseBoolean(visibleApproved),
  };
}

export default async function decorate(block) {
  const data = extractData(block);
  const today = new Date().toISOString().split('T')[0];
  await loadAnnouncementsForDate(today, block, data.groupId, data.eventTypeId, data.location, data.visibilityLevel, data.visibilityApproved, data.visibleRequested, data.visibleApproved);

  document.addEventListener('calendar:dateSelected', (e) => {
    const selectedDate = e.detail.date;
    loadAnnouncementsForDate(selectedDate, block, data.groupId, data.eventTypeId, data.location, data.visibilityLevel, data.visibilityApproved, data.visibleRequested, data.visibleApproved);
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

async function fetchDynamic(query, variables = {}) {
  try {
    // const cacheBuster = `_cb=${Date.now()}`;

    const username = 'admin';
    const password = 'admin';
    const authHeader = `Basic ${btoa(`${username}:${password}`)}`;

    // Assuming GRAPHQL_ENDPOINT is defined globally in your project, e.g.:
    // const GRAPHQL_ENDPOINT = '/graphql/execute.json';
    // (Common AEM path for both persisted and ad-hoc queries)
    const GRAPHQL_DYNAMIC_ENDPOINT = 'http://localhost:4502/content/_cq_graphql/global/endpoint.json/graphql';
    const response = await fetch(GRAPHQL_DYNAMIC_ENDPOINT, {
      method: 'POST', // POST required for ad-hoc/dynamic queries
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`Network error: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      return { error: 'An error occurred during the GraphQL request.', data: null };
    }

    return { data: result.data };
  } catch (error) {
    console.error('fetchDynamic error:', error);
    return { error: 'An unexpected error occurred.', data: null };
  }
}

function buildDayQuery(groupIds = [], eventTypeIds = []) {
  const fixedBlock = `
    eventStart: { _expressions: [{ value: $eventStart, _operator: AFTER }] },
    eventEnd: { _expressions: [{ value: $eventEnd, _operator: BEFORE }] },
    visibilityLevel: { _expressions: [{ value: $visibilityLevel, _operator: EQUALS }] },
    visibilityApproved: { _expressions: [{ value: $visibilityApproved, _operator: EQUALS }] }
  `;

  const conditions = [`{ ${fixedBlock} }`];

  if (groupIds.length > 0) {
    if (groupIds.length === 1) {
      conditions.push(`groupId: { _expressions: [{ value: ${groupIds[0]}, _operator: EQUALS }] }`);
    } else {
      const orItems = groupIds.map((id) => `{ groupId: { _expressions: [{ value: ${id}, _operator: EQUALS }] } }`).join(',\n        ');
      conditions.push(`{ _or: [\n        ${orItems}\n      ] }`);
    }
  }

  if (eventTypeIds.length > 0) {
    if (eventTypeIds.length === 1) {
      conditions.push(`eventTypeId: { _expressions: [{ value: ${eventTypeIds[0]}, _operator: EQUALS }] }`);
    } else {
      const orItems = eventTypeIds.map((id) => `{ eventTypeId: { _expressions: [{ value: ${id}, _operator: EQUALS }] } }`).join(',\n        ');
      conditions.push(`{ _or: [\n        ${orItems}\n      ] }`);
    }
  }

  const filterStr = conditions.length === 1
    ? conditions[0]
    : `{ _and: [\n      ${conditions.join(',\n      ')}\n    ] }`;

  return `
query GetCalendarData(
  $eventStart: Calendar!,
  $eventEnd: Calendar!,
  $visibilityLevel: String!,
  $visibilityApproved: String!,
  $date: String!,
  $visbleRequested: String!,
  $visibleApproved: Boolean!
) {
  calendarEventsList(sort: "eventStart ASC", filter: ${filterStr}) {
    items {
      _path
      bookingId
      eventStart
      eventTypeId
      eventEnd
      eventName
      roomDescription { markdown }
      eventDescription { markdown }
      groupDisplayOnWeb
      groupId
      groupName
      eventTypeName
      calendarContactName
      calendarContactEmail
      calendarContactPhone
    }
  }
  announcementList(
    filter: {
      dates: { _expressions: [{ value: $date, _operator: EQUALS }] },
      visibility_approved: { _expressions: [{ value: $visibleApproved, _operator: EQUALS }] },
      visibility_requested: { _expressions: [{ value: $visbleRequested, _operator: EQUALS }] }
    }
  ) {
    items {
      _path
      announcement_text
      announcement_url
      organization_id
      announcementCollections
      visibility_requested
      visibility_approved
      dates
    }
  }
}
`.trim();
}

// Dynamic query builder for upcoming events
function buildUpcomingQuery(groupIds = [], eventTypeIds = []) {
  const fixedBlock = `
    eventStart: { _expressions: [{ value: $eventStart, _operator: AFTER }] },
    visibilityLevel: { _expressions: [{ value: $visibilityLevel, _operator: EQUALS }] },
    visibilityApproved: { _expressions: [{ value: $visibilityApproved, _operator: EQUALS }] }
  `;

  const conditions = [`{ ${fixedBlock} }`];

  if (groupIds.length > 0) {
    if (groupIds.length === 1) {
      conditions.push(`groupId: { _expressions: [{ value: ${groupIds[0]}, _operator: EQUALS }] }`);
    } else {
      const orItems = groupIds.map((id) => `{ groupId: { _expressions: [{ value: ${id}, _operator: EQUALS }] } }`).join(',\n        ');
      conditions.push(`{ _or: [\n        ${orItems}\n      ] }`);
    }
  }

  if (eventTypeIds.length > 0) {
    if (eventTypeIds.length === 1) {
      conditions.push(`eventTypeId: { _expressions: [{ value: ${eventTypeIds[0]}, _operator: EQUALS }] }`);
    } else {
      const orItems = eventTypeIds.map((id) => `{ eventTypeId: { _expressions: [{ value: ${id}, _operator: EQUALS }] } }`).join(',\n        ');
      conditions.push(`{ _or: [\n        ${orItems}\n      ] }`);
    }
  }

  const filterStr = conditions.length === 1
    ? conditions[0]
    : `{ _and: [\n      ${conditions.join(',\n      ')}\n    ] }`;

  return `
query GetUpcomingCalendarEvents(
  $eventStart: Calendar!,
  $visibilityLevel: String!,
  $visibilityApproved: String!
) {
  calendarEventsList(sort: "eventStart ASC", limit: 10, filter: ${filterStr}) {
    items {
      bookingId
      eventStart
      eventEnd
      eventName
      roomDescription { markdown }
      eventDescription { markdown }
      groupDisplayOnWeb
      groupId
      eventTypeId
      groupName
      eventTypeName
      calendarContactName
      calendarContactEmail
      calendarContactPhone
    }
  }
}
`.trim();
}
