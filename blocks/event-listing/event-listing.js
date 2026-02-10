/* eslint-disable no-restricted-globals */
/* eslint-disable func-names */
/* eslint-disable no-use-before-define */
/* eslint-disable max-len */
import {
  SERVER_URL, CAPTCHA_SITE_KEY, BROWSE_REVERSE_MAP,
} from '../../scripts/constants.js';
import { fetchCalendarData, fetchFilters } from '../../scripts/graphql-api.js';
import {
  resolveInitialDate, persistSelectedDate, updateUrlWithDateOnly, updateUrlWithBrowseOnly, getShowAllFromUrl, updateUrlWithSelectedId, updateUrlWithBookingId, getBookingIdFromUrl,
} from '../../scripts/util.js';

let hideAllSelector = false;
let captchaRendered = false;
let isAllViewActive = false;

function loadRecaptchaScript() {
  if (window.recaptchaLoading || window.grecaptcha) return;

  window.recaptchaLoading = true;

  window.onRecaptchaReady = function () {
    window.recaptchaReady = true;
  };

  const script = document.createElement('script');
  script.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaReady&render=explicit';
  script.async = true;
  script.defer = true;

  document.head.appendChild(script);
}

function waitForRecaptchaAndRender() {
  const interval = setInterval(() => {
    if (
      window.recaptchaReady && window.grecaptcha && document.getElementById('captcha')
    ) {
      clearInterval(interval);
      fireCaptcha();
    }
  }, 100);
}

function fireCaptcha() {
  if (
    captchaRendered || !window.recaptchaReady || !document.getElementById('captcha')
  ) {
    return;
  }

  // eslint-disable-next-line no-undef
  grecaptcha.render('captcha', {
    sitekey: CAPTCHA_SITE_KEY,
    callback: enableEmailSubmit,
    theme: 'light',
  });

  captchaRendered = true;
}

function enableEmailSubmit() {
  const btn = document.getElementById('class-submit-button');
  if (btn) btn.disabled = false;
}

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
            data-reservationid="${event.reservationId || ''}"
            data-bookingid="${event.bookingId || ''}"
            data-title="${escapeAttr(event.title)}"
            data-fullstart="${escapeAttr(event.fullStart)}"
            data-fullend="${escapeAttr(event.fullEnd)}"
            data-location="${escapeAttr(event.location || '')}"
            data-roomid="${event.roomId || ''}"
            data-description="${escapeAttr(event.eventDescription || '')}"
            data-eventtypeid="${event.eventTypeId || ''}"
            data-eventseriesid="${event.eventSeriesId || ''}"
            data-eventseriesname="${escapeAttr(event.eventSeriesName || '')}"
            data-type="${event.type || ''}"
            data-groupid="${event.groupId || ''}"
            data-groupname="${event.groupName || ''}"
            data-groupdisplayonweb="${event.groupDisplayOnWeb}"
            data-contactname="${event.contactName || ''}"
            data-contactemail="${event.contactEmail || ''}"
            data-contactphone="${event.contactPhone || ''}"
            data-lastsynced="${event.lastSynced || ''}"
            data-eventwebsite="${event.eventWebsite || ''}"
            data-rsvplink="${event.rsvpLink || ''}">
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
                    ${event.rsvpLink ? `
                      <div class="meta-row">
                        <span class="meta-label"><p>RSVP</p></span>
                        <span class="meta-value">
                          <a href="${event.rsvpLink}" target="_blank">${event.rsvpLink}</a>
                        </span>
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
                    <a href="javascript:void(0);" class="email-event-link"><ion-icon name="mail-outline"></ion-icon> Email this item</a>
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
  const todayStr = new Date().toISOString().split('T')[0];

  if (currentDateStr === todayStr) {
    return `
      <h2 class="au-upcoming-heading">
        Coming Soon
      </h2>
    `;
  }

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

function isDateBeforeToday(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selected = new Date(dateStr);
  selected.setHours(0, 0, 0, 0);

  return selected < today;
}

// eslint-disable-next-line default-param-last
export function renderCalendarFromApi(block, data, currentDateStr = new Date().toISOString().split('T')[0], visibilityLevel, visibilityApproved, visibleRequested, visibleApproved) {
  block.textContent = '';
  const showUpcoming = !isDateBeforeToday(currentDateStr);

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
      ${showUpcoming ? `
            <div class="calendar-coming-soon">
              ${buildUpcomingHeading(currentDateStr)}
              ${buildEvents({ ...data, events: data.upcomingEvents, isUpcoming: true })}
            </div>`
    : ''
}
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
  attachEmailEventHandler(block);
}

function buildCalendarByHostIdsUrl(dateStr, hostIds, visibilityLevel, visibilityApproved, visibleRequested, visibleApproved) {
  return `${SERVER_URL}/content/apis/au/calenderByMultipleHostIds.${`${dateStr}.${hostIds.join('$')}.${visibilityLevel}.${visibilityApproved}.${visibleRequested}.${visibleApproved}`}.json`;
}

async function loadUpcomingEvents(eventEndDateTime, visibilityLevel, visibilityApproved, visibleRequested, visibleApproved, eventTypeId, roomId, seriesId) {
  try {
    const json = await fetchCalendarData('GetUpcomingCalendarEvents', null, eventEndDateTime, visibilityLevel, visibilityApproved, null, visibleRequested, visibleApproved, eventTypeId, roomId, seriesId);
    return json?.calendarEventsList?.items || [];
  } catch (e) {
    return [];
  }
}

async function loadAnnouncementsForDate(dateStr, block, groupId, eventTypeId, locationId, seriesId, visibilityLevel, visibilityApproved, visibleRequested, visibleApproved) {
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
      calendarJson = await fetchCalendarData('GetCalendarData', `${dateStr}T00:00:00.000-05:00`, `${dateStr}T23:59:59.999-05:00`, visibilityLevel, visibilityApproved, dateStr, visibleRequested, visibleApproved, eventTypeId, locationId, seriesId);

      if (calendarJson && calendarJson.calendarEventsList && Array.isArray(calendarJson.calendarEventsList.items)) {
        rawEventsToday = calendarJson.calendarEventsList.items;
      }

      if (calendarJson && calendarJson.announcementList && Array.isArray(calendarJson.announcementList.items)) {
        rawItems = calendarJson.announcementList.items;
      }

      const lastEventEnd = rawEventsToday.length > 0 ? rawEventsToday[rawEventsToday.length - 1].eventEnd : `${dateStr}T23:59:59.999-05:00`;

      upcomingRawEvents = await loadUpcomingEvents(lastEventEnd, visibilityLevel, visibilityApproved, visibleRequested, visibleApproved, eventTypeId, locationId, seriesId);
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
        reservationId: item.reservationId || '',
        bookingId: item.bookingId || '',
        roomId: item.roomId || '',
        eventDescription,
        groupId: item.groupId || '',
        eventTypeId: item.eventTypeId || '',
        eventSeriesId: item.eventSeriesId || '',
        eventSeriesName: item.eventSeriesName || '',
        groupName: item.groupName || '',
        groupDisplayOnWeb: item.groupDisplayOnWeb || false,
        contactName: item.calendarContactName || '',
        contactEmail: item.calendarContactEmail || '',
        contactPhone: item.calendarContactPhone || '',
        lastSynced: item.lastSynced || '',
        eventWebsite: item.eventWebsite || '',
        rsvpLink: item.rsvpLink || '',
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

function formatUpdatedDate(dateStr) {
  if (!dateStr) return '';

  const [, month, day] = dateStr.split('T')[0].split('-');

  return `${Number(month)}/${Number(day)}`;
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

async function renderEventDetail(block, eventData, visibilityLevel, visibilityApproved, visibleRequested, visibleApproved) {
  const formattedDate = formatEventDate(eventData.fullStart);
  let alsoOnHtml = '';

  if (eventData.reservationId) {
    const alsoOnRaw = await loadAlsoOnEventsByReservation(
      eventData.reservationId,
      visibilityLevel,
      visibilityApproved,
    );

    const alsoOnEvents = alsoOnRaw
      .filter((e) => e.eventStart !== eventData.fullStart)
      .map(mapAlsoOnEvent);

    alsoOnHtml = alsoOnEvents.length
      ? `<h2>Also on…</h2>${buildAlsoOnHtml(alsoOnEvents)}`
      : '';
  }

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
          <p class="updated">Updated ${formatUpdatedDate(eventData.lastSynced)}</p>
        </footer>
        <div class="event-details">
          <div class="event-description">
            ${eventData.description}
          </div>
          ${eventData.type ? `
            <div class="meta-row">
              <span class="meta-label"><p>Type:</p></span>
              <span class="meta-value">
                <button
                  type="button"
                  class="event-type-filter-link"
                  data-eventtypeid="${eventData.eventTypeId}">
                  ${eventData.type}
                </button>
              </span>
            </div>
          ` : ''}
          ${eventData.groupName && eventData.groupDisplayOnWeb ? `
            <div class="meta-row">
              <span class="meta-label"><p>Host:</p></span>
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
          ${eventData.rsvpLink ? `
            <div class="meta-row">
              <span class="meta-label"><p>RSVP:</p></span>
              <span class="meta-value">
                <a href="${eventData.rsvpLink}" target="_blank">${eventData.rsvpLink}</a>
              </span>
            </div>
          ` : ''}
          <div class="meta-row">
            <span class="meta-label"><p>Contact:</p></span>
            <span class="meta-value">
              <div class="contact-name meta-value no-link">${eventData.contactName ? `${eventData.contactName}` : ''}</div>
              <p>${eventData.contactEmail ? `<a class="contact-email" href="mailto:${eventData.contactEmail}">${eventData.contactEmail}</a>` : ''}</p>
              <p>${eventData.contactPhone ? `<a class="contact-phone" href="tel:${eventData.contactPhone}">${eventData.contactPhone}</a>` : ''}</p>
            </span>
          </div>
          ${eventData.eventWebsite ? `
            <div class="meta-row">
              <span class="meta-label"><p>Event Website:</p></span>
              <span class="meta-value">
                <a href="${eventData.eventWebsite}" target="_blank">${eventData.eventWebsite}</a>
              </span>
            </div>
          ` : ''}
          <p><a href="#" class="export-calendar"><ion-icon name="calendar-outline"></ion-icon> Export to Calendar</a></p>
          ${alsoOnHtml}
        </div>

      </section>
    </div>
  `;

  // eslint-disable-next-line no-use-before-define
  attachEventTypeFilter(block, eventData.fullStart?.split('T')[0], visibilityLevel, visibilityApproved, visibleRequested, visibleApproved);
  attachHostFilter(block, eventData.fullStart?.split('T')[0], visibilityLevel, visibilityApproved, visibleRequested, visibleApproved);
  attachExport(block);
  attachEmailEventHandler(block);
  attachAlsoOnLinks(block, visibilityLevel, visibilityApproved, visibleRequested, visibleApproved);
}

function attachEventTypeFilter(block, currentDateStr, visibilityLevel, visibilityApproved, visibleRequested, visibleApproved) {
  const link = block.querySelector('.event-type-filter-link');
  if (!link) return;

  link.addEventListener('click', async (e) => {
    e.preventDefault();

    const eventTypeId = link.dataset.eventtypeid;
    if (!eventTypeId) return;

    const date = currentDateStr || new Date().toISOString().split('T')[0];
    updateUrlWithSelectedId('eventType', eventTypeId);

    await loadAnnouncementsForDate(
      date,
      block,
      null,
      eventTypeId,
      null,
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
      updateUrlWithSelectedId('host', groupId);

      await loadAnnouncementsForDate(
        date,
        block,
        groupId,
        null,
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
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      const eventDiv = link.closest('.au-event');
      const bookingId = eventDiv.dataset.bookingid;
      if (!bookingId) return;

      updateUrlWithBookingId(bookingId);

      await renderEventDetail(block, {
        title: eventDiv.dataset.title,
        fullStart: eventDiv.dataset.fullstart,
        fullEnd: eventDiv.dataset.fullend,
        location: eventDiv.dataset.location,
        roomId: eventDiv.dataset.roomid,
        description: eventDiv.dataset.description,
        type: eventDiv.dataset.type,
        groupName: eventDiv.dataset.groupname,
        groupId: eventDiv.dataset.groupid,
        eventTypeId: eventDiv.dataset.eventtypeid,
        eventSeriesId: eventDiv.dataset.eventseriesid,
        eventSeriesName: eventDiv.dataset.eventseriesname,
        groupDisplayOnWeb: eventDiv.dataset.groupdisplayonweb === 'true',
        contactEmail: eventDiv.dataset.contactemail,
        contactName: eventDiv.dataset.contactname,
        contactPhone: eventDiv.dataset.contactphone,
        lastSynced: eventDiv.dataset.lastsynced || '',
        eventWebsite: eventDiv.dataset.eventwebsite || '',
        rsvpLink: eventDiv.dataset.rsvplink || '',
        reservationId: eventDiv.dataset.reservationid,
        bookingId,
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
  const roomId = getMetaContent('location');

  return {
    initialGroupIds: hostIds
      ? hostIds
        .split(',')
        .map((s) => parseFloat(s.trim()))
        .filter((n) => !Number.isNaN(n))
      : [],

    eventTypeId: getMetaContent('eventtypeids'),

    roomId,

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

function attachSelectorEvents(block, type) {
  block.querySelectorAll('.selector-item').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const { id } = btn.dataset;
      if (id === 'all') {
        updateUrlWithBrowseOnly(type, true);
        handleUrlState(block);
        return;
      }

      updateUrlWithSelectedId(type, id);
      handleUrlState(block);
    });
  });
}

function attachRestoreMonthView(block) {
  const restoreBtn = block.querySelector('.restore-month-view');
  if (!restoreBtn) return;

  restoreBtn.addEventListener('click', async () => {
    const { type } = restoreBtn.dataset;
    updateUrlWithBrowseOnly(type, false);
    handleUrlState(block);

    // isAllViewActive = false;
    // hideAllSelector = false;

    // await loadSelectorList(block, type);
  });
}

function renderSelector(block, type, items) {
  const titleMap = {
    host: 'Browse by Host',
    location: 'Browse by Location',
    eventType: 'Browse by Event Type',
    series: 'Browse by Series',
  };

  const simpleTitleMap = {
    host: 'Hosts',
    location: 'Locations',
    eventType: 'Event Types',
    series: 'Series',
  };

  const subtitle = isAllViewActive
    ? `
      <h2 class="au-selector-subtitle">
        <span class="current-view">All ${simpleTitleMap[type]}</span>
        <button type="button"
                class="restore-month-view"
                data-type="${type}">
          ${simpleTitleMap[type]} for the next month
        </button>
      </h2>
    `
    : `
      <h2 class="au-selector-subtitle">
        ${simpleTitleMap[type]} with events in the next month
      </h2>
    `;

  block.innerHTML = `
    <div class="au-selector au-selector--${type}">
      <h1 class="au-selector-title">${titleMap[type]}</h1>
      ${subtitle}
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

      ${!hideAllSelector ? `
        <p class="au-selector-footer">
          <button
            type="button"
            class="selector-item selector-item-all"
            data-id="all">
            All ${titleMap[type].replace('Browse by ', '')}
          </button>
        </p>
      ` : ''}
    </div>
  `;

  // if (hideAllSelector) {
  //   const allBtn = block.querySelector('.selector-item-all');
  //   if (allBtn) {
  //     allBtn.style.display = 'none';
  //   }
  // }

  attachSelectorEvents(block, type);
  attachRestoreMonthView(block);
}

function getDateRange({ mode = 'MONTH' } = {}) {
  const now = new Date();

  const format = (d, isEnd = false) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T${isEnd ? '23:59:59.999' : '00:00:00.000'}-05:00`;
  };

  if (mode === 'MONTH') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return {
      start: format(start),
      end: format(end, true),
    };
  }

  if (mode === 'ALL') {
    const start = new Date(now);
    start.setFullYear(start.getFullYear() - 2);

    return {
      start: format(start),
      end: null,
    };
  }

  return {};
}

async function fetchHostsForCurrentMonth(data = extractData(), noEndDate = false) {
  const { start, end } = getDateRange({ mode: noEndDate ? 'ALL' : 'MONTH' });

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
  const { start, end } = getDateRange({ mode: noEndDate ? 'ALL' : 'MONTH' });

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
        .map((item) => ({
          id: item.roomId,
          title: item.roomDescription.markdown || '',
        }))
        .filter((item) => item.id && item.title)
        .map((item) => [item.id, item]),
    ).values(),
  ].sort((a, b) => a.title.localeCompare(b.title, 'en', { sensitivity: 'base' }));
}

async function fetchEventTypesForCurrentMonth(data = extractData(), noEndDate = false) {
  const { start, end } = getDateRange({ mode: noEndDate ? 'ALL' : 'MONTH' });

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

async function fetchSeriesForCurrentMonth(data = extractData(), noEndDate = false) {
  const { start, end } = getDateRange({ mode: noEndDate ? 'ALL' : 'MONTH' });

  const json = await fetchFilters(
    'GetSeries',
    start,
    end,
    data.visibilityLevel,
    data.visibilityApproved,
  );

  const items = json?.calendarEventsList?.items || [];

  const uniqueMap = new Map();

  items.forEach((item) => {
    const { eventSeriesId, eventSeriesName } = item;
    if (eventSeriesId && !uniqueMap.has(eventSeriesId)) {
      uniqueMap.set(eventSeriesId, {
        id: String(eventSeriesId),
        title: eventSeriesName,
      });
    }
  });

  return [
    ...new Map(
      items
        .map((item) => ({
          id: item.eventSeriesId,
          title: item.eventSeriesName || '',
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

    case 'series':
      items = await fetchSeriesForCurrentMonth(undefined, noEndDate);
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
  const response = await fetch(`${SERVER_URL}/libs/granite/csrf/token.json`);
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

function showEmailModal() {
  const modal = document.getElementById('emailEventModal');

  modal.style.display = 'block';
  modal.classList.add('in');
  modal.setAttribute('aria-hidden', 'false');

  if (!document.querySelector('[data-email-backdrop]')) {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop fade in au-calendar-backdrop';
    backdrop.dataset.emailBackdrop = 'true';
    document.body.appendChild(backdrop);
  }

  document.body.classList.add('modal-open');
}

function closeEmailModal() {
  const modal = document.getElementById('emailEventModal');
  const backdrop = document.querySelector('[data-email-backdrop]');

  modal.style.display = 'none';
  modal.classList.remove('in');
  modal.setAttribute('aria-hidden', 'true');

  if (backdrop) backdrop.remove();
  document.body.classList.remove('modal-open');

  if (window.grecaptcha) {
    // eslint-disable-next-line no-undef
    grecaptcha.reset();
  }

  captchaRendered = false;

  const btn = document.getElementById('emailSubmitBtn');
  if (btn) btn.disabled = true;
}

function ensureEmailModal() {
  if (document.getElementById('emailEventModal')) return;

  const modal = document.createElement('div');
  modal.id = 'emailEventModal';
  modal.className = 'au-calendar-modal modal fade';
  modal.setAttribute('tabindex', '-1');
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-hidden', 'true');

  modal.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close email-modal-close" aria-label="Close">x</button>
          <p class="modal-title" id="emailModalTitle"></p>
        </div>

        <div class="modal-body">
          <form id="emailFormFragment" action='${SERVER_URL}/content/apis/au/calenderEmailServlet.json' method="post">
            <input type="hidden" name="fuseaction" value="SendEmail">
            <input type="hidden" name="submitted" value="1">
            <input type="hidden" name="title" id="emailEventTitle">
            <input type="hidden" name="eURL" id="emailEventUrl">
            <input type="hidden" name="eventDate" id="emailEventDate">
            <fieldset>
              <div class="form-group">
                <label>Your email:</label>
                <input id="fromEmail" name="fromEmail" type="email" class="form-control" maxlength="255" value="" required="" placeholder="Please enter your email...">
              </div>

              <div class="form-group">
                <label>Recipient's email:</label>
                <input id="toEmail" name="toEmail" type="email" class="form-control" maxlength="255" required="" placeholder="Please enter recipient's email...">
              </div>

              <div class="form-group">
                <label>Comments:</label>
                <textarea id="emailComments" name="emailComments" cols="40" rows="4" class="form-control"></textarea>
              </div>
              <div id="captcha" class="g-recaptcha clearfix">
              </div>
              <div class="form-group">
                <button type="submit" id="class-submit-button" class="btn btn-primary" disabled>
                  Send Message
                </button>
              </div>
            </fieldset>
          </form>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-default email-modal-close" data-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

function openEmailModal(eventDiv) {
  ensureEmailModal();

  loadRecaptchaScript();

  const title = eventDiv.dataset.title || 'Event';
  const url = window.location.href;
  const startDate = eventDiv.dataset.fullstart;

  document.getElementById('emailModalTitle').textContent = `Email ${title} event to a friend`;

  document.getElementById('emailEventTitle').value = title;
  document.getElementById('emailEventUrl').value = url;
  document.getElementById('emailEventDate').value = startDate;

  showEmailModal();
  setTimeout(fireCaptcha, 0);
  waitForRecaptchaAndRender();
}

function attachEmailEventHandler(block) {
  block.addEventListener('click', (e) => {
    const link = e.target.closest('.email-event-link');
    if (!link) return;

    e.preventDefault();

    const eventDiv = link.closest('.au-event');
    if (!eventDiv) return;

    openEmailModal(eventDiv);
  });
}

document.addEventListener('click', (e) => {
  if (
    e.target.classList.contains('email-modal-close')
    || e.target.dataset.emailBackdrop === 'true'
  ) {
    closeEmailModal();
  }
});

window.addEventListener('popstate', () => {
  handleUrlState(document.querySelector('.block') || document.querySelector('.au-calendar'));
});

function getBrowseFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const browse = params.get('browse');
  return BROWSE_REVERSE_MAP[browse] || null;
}

async function handleUrlState(block) {
  const params = new URLSearchParams(window.location.search);

  const selectedHostId = params.get('h');
  const selectedEventTypeId = params.get('t');
  const selectedLocationId = params.get('l');
  const selectedSeriesId = params.get('s');
  const bookingId = getBookingIdFromUrl();

  const browseType = getBrowseFromUrl();
  const date = resolveInitialDate();
  const data = extractData();

  if (browseType) {
    const showAll = getShowAllFromUrl();
    hideAllSelector = showAll;
    isAllViewActive = showAll;

    await loadSelectorList(block, browseType, { noEndDate: showAll });
    return;
  }

  if (bookingId) {
    await renderEventDetailByBookingId(
      block,
      bookingId,
      data.visibilityLevel,
      data.visibilityApproved,
      data.visibleRequested,
      data.visibleApproved,
    );
    return;
  }

  hideAllSelector = false;
  isAllViewActive = false;
  const groupId = selectedHostId !== null ? selectedHostId : data.initialGroupIds;

  const eventTypeId = selectedEventTypeId !== null ? selectedEventTypeId : data.eventTypeId;

  const roomId = selectedLocationId !== null ? selectedLocationId : data.roomId;

  const seriesId = selectedSeriesId !== null ? selectedSeriesId : null;

  await loadAnnouncementsForDate(
    date,
    block,
    groupId,
    eventTypeId,
    roomId,
    seriesId,
    data.visibilityLevel,
    data.visibilityApproved,
    data.visibleRequested,
    data.visibleApproved,
  );
}

function buildAlsoOnHtml(events) {
  if (!events.length) return '';

  return `
    <nav aria-label="Other dates and times this event occurs on">
      <ol class="nobullet nopadding">
        ${events.map((e) => `
          <li class="row">
            <a href="?id=${e.bookingId}" class="also-on-link" data-bookingid="${e.bookingId}">
              <span class="col-xs-6 col-md-4">
                <span class="hidden-xs">
                  ${formatEventDate(e.fullStart)},
                </span>
                ${new Date(e.fullStart).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  })}
              </span>
              <span class="col-xs-6 col-md-4 no-bs-padding">
                ${formatEventTimeSpan(e.fullStart, e.fullEnd)}
              </span>
            </a>
          </li>
        `).join('')}
      </ol>
    </nav>
  `;
}

function mapAlsoOnEvent(item) {
  return {
    fullStart: item.eventStart,
    fullEnd: item.eventEnd,
    bookingId: item.bookingId,
  };
}

async function loadAlsoOnEventsByReservation(
  reservationId,
  visibilityLevel,
  visibilityApproved,
) {
  if (!reservationId) return [];

  try {
    const json = await fetchCalendarData(
      'GetAlsoOnData',
      null,
      null,
      visibilityLevel,
      visibilityApproved,
      null,
      null,
      null,
      null,
      null,
      null,
      reservationId,
    );

    return json?.calendarEventsList?.items || [];
  } catch (e) {
    console.error('Failed to load Also On events', e);
    return [];
  }
}

async function renderEventDetailByBookingId(
  block,
  bookingId,
  visibilityLevel,
  visibilityApproved,
  visibleRequested,
  visibleApproved,
) {
  const item = await loadEventByBookingId(
    bookingId,
    visibilityLevel,
    visibilityApproved,
  );

  if (!item) {
    block.innerHTML = '<p>Event not found.</p>';
    return;
  }

  await renderEventDetail(block, {
    title: item.eventName,
    fullStart: item.eventStart,
    fullEnd: item.eventEnd,
    location: item.roomDescription?.markdown || '',
    description: item.eventDescription?.markdown || '',
    bookingId: item.bookingId,
    reservationId: item.reservationId,
    groupId: item.groupId,
    groupName: item.groupName,
    groupDisplayOnWeb: item.groupDisplayOnWeb,
    eventTypeId: item.eventTypeId,
    type: item.eventTypeName,
    contactName: item.calendarContactName,
    contactEmail: item.calendarContactEmail,
    contactPhone: item.calendarContactPhone,
    lastSynced: item.lastSynced,
    eventWebsite: item.eventWebsite,
    rsvpLink: item.rsvpLink,
  }, visibilityLevel, visibilityApproved, visibleRequested, visibleApproved);
}

function attachAlsoOnLinks(block, visibilityLevel, visibilityApproved, visibleRequested, visibleApproved) {
  block.querySelectorAll('.also-on-link').forEach((link) => {
    link.addEventListener('click', async (e) => {
      e.preventDefault();

      const bookingId = link.dataset.bookingid;
      if (!bookingId) return;

      updateUrlWithBookingId(bookingId);
      await renderEventDetailByBookingId(
        block,
        bookingId,
        visibilityLevel,
        visibilityApproved,
        visibleRequested,
        visibleApproved,
      );
    });
  });
}

async function loadEventByBookingId(bookingId, visibilityLevel, visibilityApproved) {
  const json = await fetchCalendarData(
    'GetEventByBookingId',
    null,
    null,
    visibilityLevel,
    visibilityApproved,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    bookingId,
  );

  return json?.calendarEventsList?.items?.[0] || null;
}

export default async function decorate(block) {
  // const data = extractData(block);
  await handleUrlState(block);

  document.addEventListener('calendar:dateSelected', (e) => {
    const selectedDate = e.detail.date;
    // persistSelectedDate(selectedDate);
    // updateUrlWithDate(selectedDate);
    // loadAnnouncementsForDate(selectedDate, block, data.initialGroupIds, data.eventTypeId, data.roomId, null, data.visibilityLevel, data.visibilityApproved, data.visibleRequested, data.visibleApproved);
    persistSelectedDate(selectedDate);
    updateUrlWithDateOnly(selectedDate);
    handleUrlState(block);
  });

  document.addEventListener('calendar:filterSelected', (e) => {
    const { filterType } = e.detail;

    if (['host', 'eventType', 'location', 'series'].includes(filterType)) {
      updateUrlWithBrowseOnly(filterType, false);

      handleUrlState(block);
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
