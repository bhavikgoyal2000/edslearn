/* eslint-disable no-use-before-define */
/* eslint-disable default-param-last */
/* eslint-disable max-len */
import { SERVER_URL } from '../../scripts/constants.js';
import { fetchCalendarData, fetchFilters } from '../../scripts/graphql-api.js';

// eslint-disable-next-line no-unused-vars
let activeSelector = null;

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
    return '<div class="alert alert-info single"><p class="vertical-center">No events for this day.</p></div>';
  }

  return `
    <div class="au-events">
      ${data.events.map((event) => {
    const expandable = true;

    return `
          <div class="au-event ${expandable ? 'expandable' : ''}"
            data-title="${escapeAttr(event.title)}"
            data-fullstart="${escapeAttr(event.fullStart)}"
            data-fullend="${escapeAttr(event.fullEnd)}"
            data-location="${escapeAttr(event.location || '')}"
            data-description="${escapeAttr(event.eventDescription || '')}"
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
              <time
                class="col-xs-12 col-sm-6 col-md-3 calendar-event-time"
                datetime="${getDatetimeStr(event.fullStart)}"
                itemprop="startDate"
              >
                ${
  !isUpcoming
    ? formatEventTimeSpan(event.fullStart, event.fullEnd)
    : `${formatEventDay(event.fullStart)}<br>${formatEventTimeSpan(event.fullStart, event.fullEnd)}`
}
              </time>
              <div class="au-title">${event.title || ''}</div>
              <div class="au-location">${event.location || ''}</div>
            </div>
            ${expandable ? `
              <div class="au-details" style="display: none;">
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
                        <span class="meta-value no-link">${event.type}</span>
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
    <div class="calendar-todays-event">

      <!-- Header -->
      ${buildHeader(data, currentDateStr)}

      <!-- Announcement Box -->
      ${buildAnnouncements(data)}

      <!-- Events -->
      ${buildEvents({ ...data, events: data.events })}

      <!-- Popup -->
      ${buildPopup(data)}

      ${buildFooter(data, currentDateStr)}
      </div>
      <div class="calendar-coming-soon">

        ${buildUpcomingHeading(currentDateStr)}

      ${buildEvents({ ...data, events: data.upcomingEvents, isUpcoming: true })}
      </div>

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

function buildCalendarByHostIdsUrl(dateStr, hostIds, visibilityLevel, visibilityApproved, visibleRequested, visibleApproved) {
  return `${SERVER_URL}/content/apis/au/calenderByMultipleHostIds.${`${dateStr}.${hostIds.join('$')}.${visibilityLevel}.${visibilityApproved}.${visibleRequested}.${visibleApproved}`}.json`;
}

async function loadUpcomingEvents(eventEndDateTime, visibilityLevel, visibilityApproved, visibleRequested, visibleApproved, eventTypeId) {
  try {
    const json = await fetchCalendarData('GetUpcomingCalendarEvents', null, eventEndDateTime, visibilityLevel, visibilityApproved, null, visibleRequested, visibleApproved, eventTypeId);
    return json?.calendarEventsList?.items || [];
  } catch (e) {
    return [];
  }
}

async function loadAnnouncementsForDate(dateStr, block, groupId, eventTypeId, location, visibilityLevel, visibilityApproved, visibleRequested, visibleApproved) {
  let normalizedHostIds = [];
  if (Array.isArray(groupId)) {
    normalizedHostIds = groupId.filter(Boolean);
  } else if (groupId) {
    normalizedHostIds = [groupId];
  }
  const hasHostIds = normalizedHostIds && normalizedHostIds.length > 0;

  try {
    let calendarJson;
    let rawEventsToday = [];
    let upcomingRawEvents = [];
    let rawItems = [];

    if (normalizedHostIds.length === 0) {
      calendarJson = await fetchCalendarData('GetCalendarData', `${dateStr}T00:00:00.000-05:00`, `${dateStr}T23:59:59.999-05:00`, visibilityLevel, visibilityApproved, dateStr, visibleRequested, visibleApproved, eventTypeId, location);

      if (calendarJson && calendarJson.calendarEventsList && Array.isArray(calendarJson.calendarEventsList.items)) {
        rawEventsToday = calendarJson.calendarEventsList.items;
      }

      if (calendarJson && calendarJson.announcementList && Array.isArray(calendarJson.announcementList.items)) {
        rawItems = calendarJson.announcementList.items;
      }

      const lastEventEnd = rawEventsToday.length > 0 ? rawEventsToday[rawEventsToday.length - 1].eventEnd : `${dateStr}T23:59:59.999-05:00`;

      upcomingRawEvents = await loadUpcomingEvents(lastEventEnd, visibilityLevel, visibilityApproved, visibleRequested, visibleApproved, eventTypeId);
    } else {
      const servletUrl = buildCalendarByHostIdsUrl(dateStr, normalizedHostIds, visibilityLevel, visibilityApproved, visibleRequested, visibleApproved);
      const username = 'admin';
      const password = 'admin';
      const authHeader = `Basic ${btoa(`${username}:${password}`)}`;
      const response = await fetch(servletUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch calendar by hostIds');
      }

      calendarJson = await response.json();

      if (calendarJson && Array.isArray(calendarJson.calendarEventsList)) {
        rawEventsToday = calendarJson.calendarEventsList;
      }

      if (calendarJson && Array.isArray(calendarJson.upcomingCalendarEventsList)) {
        upcomingRawEvents = calendarJson.upcomingCalendarEventsList;
      }

      if (calendarJson && Array.isArray(calendarJson.announcementList)) {
        rawItems = calendarJson.announcementList;
      }
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

      let eventDescription = '';
      let locationDesc = '';
      if (hasHostIds) {
        eventDescription = item.eventDescription || '';
        locationDesc = item.roomDescription || '';
      } else {
        eventDescription = item.eventDescription?.markdown || '';
        locationDesc = item.roomDescription?.markdown || '';
      }

      return {
        time: `${startTime} – ${endTime}`,
        title: item.eventName || 'Untitled Event',
        location: locationDesc,
        eventDescription,
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
    };

    renderCalendarFromApi(block, data, dateStr, visibilityLevel, visibilityApproved, visibleRequested, visibleApproved);
  } catch (err) {
    block.textContent = 'Failed to load announcements and events.';
    block.style.color = 'red';
  }
}

function formatEventDate(dateStr) {
  if (!dateStr) return '';

  const date = new Date(dateStr);

  const formatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/New_York',
  });

  return formatter.format(date);
}

function renderEventDetail(block, eventData, visibilityLevel, visibilityApproved, visibleRequested, visibleApproved) {
  const formattedDate = formatEventDate(eventData.fullStart);
  block.innerHTML = `
    <div class="au-calendar">
      <section class="au-event-detail">
        <header>
          <h1>
            <small>
              <time datetime="${eventData.fullStart}" itemprop="startDate">${formattedDate}</time>
              <time datetime="${eventData.fullEnd}" itemprop="endDate" class="hidden">${formattedDate}</time>
            </small>
            <span itemprop="name">${eventData.title}</span>
          </h1>
        </header>
        <footer class="cal-time-loc-upd-ser">
          <p class="lede">
            <time datetime="${eventData.fullStart}">${formatEventTimeSpan(eventData.fullStart, eventData.fullEnd)}</time>,
            <span itemprop="name">${eventData.location}</span>
          </p>
          <p class="updated">Updated 1/9</p>
        </footer>
        <div class="event-content">
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
  attachHostFilter(block, eventData.fullStart?.split('T')[0], visibilityLevel, visibilityApproved, visibleRequested, visibleApproved);
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

      const groupId = parseDefaultValues(link.dataset.groupid);
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
      }, visibilityLevel, visibilityApproved, visibleRequested, visibleApproved);
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

function getMetaContent(name) {
  return document.querySelector(`meta[name="${name}"]`)?.getAttribute('content') || '';
}

function extractData() {
  const hostIds = getMetaContent('hostids');
  const location = getMetaContent('location');

  return {
    initialGroupIds: hostIds
      ? hostIds
        .split(',')
        .map((s) => parseFloat(s.trim()))
        .filter((n) => !Number.isNaN(n))
      : [],

    eventTypeId: getMetaContent('eventtypeids'),

    location,

    visibilityLevel: parseDefaultValues(
      getMetaContent('eventlistingvisibilitylevel'),
    ),

    visibilityApproved: parseDefaultValues(
      getMetaContent('eventlistingvisibilityapproved'),
    ),

    visibleRequested: parseDefaultValues(
      getMetaContent('announcementlistingvisiblerequested'),
    ),

    visibleApproved: parseBoolean(
      getMetaContent('announcementlistingvisibleapproved'),
    ),
  };
}

function attachSelectorEvents(block, type, data = extractData()) {
  block.querySelectorAll('.selector-item').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const { id } = btn.dataset;
      if (id === 'all') {
        await loadSelectorList(block, type, { noEndDate: true });
        return;
      }

      const date = new Date().toISOString().split('T')[0];

      let groupId = null;
      let eventTypeId = null;
      let location = null;

      if (type === 'host') groupId = id;
      if (type === 'eventType') eventTypeId = id;
      if (type === 'location') location = id;

      await loadAnnouncementsForDate(date, block, groupId, eventTypeId, location, data.visibilityLevel, data.visibilityApproved, data.visibleRequested, data.visibleApproved);
    });
  });
}

function renderSelector(block, type, items) {
  const titleMap = {
    host: 'Browse by Host',
    location: 'Browse by Location',
    eventType: 'Browse by Event Type',
    series: 'Browse by Series',
  };

  block.innerHTML = `
    <div class="au-selector au-selector--${type}">
      <h2 class="au-selector-title">${titleMap[type]}</h2>

      <ul class="au-selector-list">
        ${items.map((item) => `
          <li class="au-selector-item">
            <button
              type="button"
              class="selector-item"
              data-id="${item.id}">
              ${item.title}
            </button>
          </li>
        `).join('')}
      </ul>

      <div class="au-selector-footer">
        <button
          type="button"
          class="selector-item selector-item--all"
          data-id="all">
          All ${titleMap[type].replace('Browse by ', '')}
        </button>
      </div>
    </div>
  `;

  attachSelectorEvents(block, type);
}

function getCurrentMonthRange(date = new Date(), noEndDate = false) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  const format = (d, isEnd = false) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T${isEnd ? '23:59:59.999' : '00:00:00.000'}-05:00`;
  };

  return {
    start: format(start),
    end: noEndDate ? null : format(end, true),
  };
}

async function fetchHostsForCurrentMonth(data = extractData(), noEndDate = false) {
  const { start, end } = getCurrentMonthRange(new Date(), noEndDate);

  const json = await fetchFilters(
    'GetHosts',
    start,
    end,
    data.visibilityLevel,
    data.visibilityApproved,
  );

  const items = json?.calendarEventsList?.items || [];

  const uniqueMap = new Map();

  items.forEach((item) => {
    const { groupId, groupName } = item;
    if (groupId && !uniqueMap.has(groupId)) {
      uniqueMap.set(groupId, {
        id: String(groupId),
        title: groupName,
      });
    }
  });

  return Array.from(uniqueMap.values())
    .sort((a, b) => a.title.localeCompare(b.title));
}

async function fetchLocationsForCurrentMonth(data = extractData(), noEndDate = false) {
  const { start, end } = getCurrentMonthRange(new Date(), noEndDate);

  const json = await fetchFilters(
    'GetLocations',
    start,
    end,
    data.visibilityLevel,
    data.visibilityApproved,
  );

  const items = json?.calendarEventsList?.items || [];

  const uniqueMap = new Map();

  items.forEach((item) => {
    const { roomId, roomDescription } = item;
    if (roomId && !uniqueMap.has(roomId)) {
      uniqueMap.set(roomId, {
        id: String(roomId),
        title: roomDescription,
      });
    }
  });

  return [
    ...new Map(
      items
        .map((item) => {
          const title = typeof item.roomDescription === 'string'
            ? item.roomDescription
            : item.roomDescription?.markdown || '';

          return {
            id: title,
            title,
          };
        })
        .filter(
          (item) => typeof item.title === 'string' && item.title.trim().length > 0,
        )
        .map((item) => [
          item.title.trim().toLowerCase(),
          item,
        ]),
    ).values(),
  ].sort((a, b) => a.title.localeCompare(b.title, 'en', { sensitivity: 'base' }));
}

async function fetchEventTypesForCurrentMonth(data = extractData(), noEndDate = false) {
  const { start, end } = getCurrentMonthRange(new Date(), noEndDate);

  const json = await fetchFilters(
    'GetEventTypes',
    start,
    end,
    data.visibilityLevel,
    data.visibilityApproved,
  );

  const items = json?.calendarEventsList?.items || [];

  const uniqueMap = new Map();

  items.forEach((item) => {
    const { eventTypeId, eventTypeName } = item;
    if (eventTypeId && !uniqueMap.has(eventTypeId)) {
      uniqueMap.set(eventTypeId, {
        id: String(eventTypeId),
        title: eventTypeName,
      });
    }
  });

  return [
    ...new Map(
      items
        .map((item) => ({
          id: item.eventTypeId,
          title: item.eventTypeName || '',
        }))
        .filter((item) => item.id && item.title)
        .map((item) => [item.id, item]),
    ).values(),
  ].sort((a, b) => a.title.localeCompare(b.title, 'en', { sensitivity: 'base' }));
}

async function loadSelectorList(block, type, options = {}) {
  const { noEndDate = false } = options;
  let items = [];

  switch (type) {
    case 'host':
      items = await fetchHostsForCurrentMonth(undefined, noEndDate);
      break;

    case 'location':
      items = await fetchLocationsForCurrentMonth(undefined, noEndDate);
      break;

    case 'eventType':
      items = await fetchEventTypesForCurrentMonth(undefined, noEndDate);
      break;

    default:
      return;
  }

  renderSelector(block, type, items);
}

function formatEventDay(startDateStr) {
  const date = new Date(startDateStr);
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${weekday}, ${month}/${day}/${year}`;
}

function formatEventTimeSpan(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);

  function getTimeParts(date) {
    const options = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/New_York',
    };

    const parts = new Intl.DateTimeFormat('en-US', options).formatToParts(date);
    const hour = parts.find((p) => p.type === 'hour')?.value || '';
    const minute = parts.find((p) => p.type === 'minute')?.value || '';
    const dayPeriod = parts.find((p) => p.type === 'dayPeriod')?.value.toLowerCase() || '';

    if (hour === '12' && minute === '00' && dayPeriod === 'pm') {
      return { label: 'noon' };
    }
    if (hour === '12' && minute === '00' && dayPeriod === 'am') {
      return { label: 'midnight' };
    }
    return { hour, minute, dayPeriod };
  }

  const s = getTimeParts(startDate);
  const e = getTimeParts(endDate);

  const startText = s.label ? s.label : `${s.hour}:${s.minute}&nbsp;<span class="am-pm">${s.dayPeriod}</span>`;
  const endText = e.label ? e.label : `${e.hour}:${e.minute}&nbsp;<span class="am-pm">${e.dayPeriod}</span>`;
  return `${startText} - ${endText}`;
}

function getDatetimeStr(startDateStr) {
  // Returns "YYYY-MM-DDTHH:mm"
  const date = new Date(startDateStr);
  const yyyy = date.getFullYear();
  const mm = (date.getMonth() + 1).toString().padStart(2, '0');
  const dd = date.getDate().toString().padStart(2, '0');
  const hh = date.getHours().toString().padStart(2, '0');
  const min = date.getMinutes().toString().padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

function escapeAttr(str) {
  return (str || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function buildEventsDOM(events, wrapperClass = 'calendar-todays-event') {
  return `
${events.length > 0 ? `<h1>${wrapperClass === 'calendar-coming-soon' ? 'Coming Soon' : 'Today\'s Events'}</h1><div class="au-events">` : ''}
  ${events.map((event) => `
    <div class="au-event expandable"
      data-title="${escapeAttr(event.eventName)}"
      data-fullstart="${escapeAttr(event.eventStart)}"
      data-fullend="${escapeAttr(event.eventEnd)}"
      data-location="${escapeAttr(event.roomDescription || '')}"
      data-description="${escapeAttr(event.eventDescription || '')}">
      <div class="au-event-header">
        <span class="au-arrow"><ion-icon name="chevron-down-outline" role="img" class="md flip-rtl hydrated"></ion-icon></span>
        <time class="col-xs-12 col-sm-6 col-md-3 calendar-event-time" datetime="${getDatetimeStr(event.eventStart)}" itemprop="startDate">${formatEventDay(event.eventStart)} 
        <br>${formatEventTimeSpan(event.eventStart, event.eventEnd)}
        </time>
        <div class="au-title">${event.eventName || ''}</div>
        <div class="au-location">${event.roomDescription || ''}</div>
      </div>
      <div class="au-details" style="display: none;">
        <div class="au-left-column">
          <div class="au-metadata">
            <div class="au-description"><p>${event.eventDescription || ''}</p></div>
            <div class="meta-row">
              <span class="meta-label"><p>Host</p></span>
              <span class="meta-value"><a href="javascript:void(0);" target="_blank">${event.groupName || ''}</a></span>
            </div>
            <div class="meta-row">
              <span class="meta-label"><p>Type</p></span>
              <span class="meta-value">(none)</span>
            </div>
            <div class="meta-row">
              <span class="meta-label"><p>More Info</p></span>
              <span class="meta-value"><a href="javascript:void(0);" target="_blank">Event Page</a></span>
            </div>
          </div>
        </div>
        <div class="au-right-column">
          <div class="au-actions">
            <a href="#" class="export-calendar"><span class="ion-android-calendar"></span> Export to Calendar</a>
            <a href="#"><span class="ion-android-mail"></span> Email this item</a>
          </div>
        </div>
      </div>
    </div>
  `).join('')}
</div>
  `;
}

async function getCsrfToken() {
  const response = await fetch('/libs/granite/csrf/token.json');
  const json = await response.json();
  return json.token;
}

function getSearchResultsOnButtonClick(block) {
  const searchBtn = document.querySelector('.calendar-search-button');
  if (searchBtn) {
    searchBtn.addEventListener('click', async () => {
      const searchInput = document.getElementById('searchInput');
      const query = searchInput ? searchInput.value.trim() : '';
      const comingSoonDiv = block.querySelector('.calendar-coming-soon');
      if (comingSoonDiv) {
        // Show loader
        // Show loading spinner in the coming soon div
        comingSoonDiv.innerHTML = '<div class="calendar-loader" style="text-align:center;padding:2em;"><span class="loader-spinner"></span> Loading...</div>';
      }
      try {
        // Detect if running on author
        const isAuthor = /^author-p\d+-e\d+\.adobeaemcloud\.com$/.test(window.location.hostname);
        // Prepare headers
        const headers = {};
        let serverUrl = SERVER_URL;
        // If author, add CSRF token
        if (isAuthor) {
          const csrfToken = await getCsrfToken();
          headers['CSRF-Token'] = csrfToken;
          serverUrl = window.location.origin;
        }
        // Replace this with your actual fetch call
        const response = await fetch(`${serverUrl}/bin/calendar-search?q=${encodeURIComponent(query)}`, {
          method: 'GET',
          headers,
        });

        const data = await response.json();
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        const todaysEvents = [];
        const comingSoonEvents = [];

        data.results.forEach((event) => {
          if (!event.eventStart) return;
          const eventDate = new Date(event.eventStart);
          const eventDateStr = eventDate.toISOString().split('T')[0];
          if (eventDateStr === todayStr) {
            todaysEvents.push(event);
          } else if (eventDate.getTime() > Date.now()) {
            comingSoonEvents.push(event);
          }
        });

        // Insert only coming soon events into the .calendar-coming-soon div
        if (comingSoonDiv) {
          comingSoonDiv.innerHTML = buildEventsDOM(comingSoonEvents, 'calendar-coming-soon');
          attachAccordion(comingSoonDiv);
          attachExport(comingSoonDiv);
        }
        // Optionally, you can also update today's events if needed:
        // const todaysDiv = block.querySelector('.calendar-todays-event');
        // if (todaysDiv) {
        //   todaysDiv.innerHTML = buildEventsDOM(todaysEvents, 'calendar-todays-event');
        //   attachAccordion(todaysDiv);
        //   attachExport(todaysDiv);
        // }
      } catch (err) {
        if (comingSoonDiv) {
          comingSoonDiv.innerHTML = '<div style="color:red;text-align:center;">Failed to load events.</div>';
        }
        console.error('Error fetching search results:', err);
      }
    });
  }
}

export default async function decorate(block) {
  const data = extractData(block);
  const today = new Date().toISOString().split('T')[0];
  await loadAnnouncementsForDate(today, block, data.initialGroupIds, data.eventTypeId, data.location, data.visibilityLevel, data.visibilityApproved, data.visibleRequested, data.visibleApproved);

  document.addEventListener('calendar:dateSelected', (e) => {
    const selectedDate = e.detail.date;
    loadAnnouncementsForDate(selectedDate, block, data.initialGroupIds, data.eventTypeId, data.location, data.visibilityLevel, data.visibilityApproved, data.visibleRequested, data.visibleApproved);
  });

  document.addEventListener('calendar:filterSelected', async (e) => {
    const { filterType } = e.detail;

    activeSelector = filterType;

    switch (filterType) {
      case 'host':
      case 'location':
      case 'eventType':
      case 'series':
        await loadSelectorList(block, filterType);
        break;

      case 'today':
      default:
        await loadAnnouncementsForDate(new Date().toISOString().split('T')[0], block, null, null, null, data.visibilityLevel, data.visibilityApproved, data.visibleRequested, data.visibleApproved);
        break;
    }
  });

  getSearchResultsOnButtonClick(block);

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
