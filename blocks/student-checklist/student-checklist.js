import { SERVER_URL } from '../../scripts/constants.js';
import { getCsrfToken } from '../../scripts/util.js';

const AdaptiveCardsCache = {
  newStudents: null,
  articles: {},
};

async function fetchNewStudents(refresh = false) {
  if (AdaptiveCardsCache.newStudents && !refresh) {
    return AdaptiveCardsCache.newStudents;
  }

  const res = await fetch(
    'https://myapps.american.edu/apps/notify/notifications.cfc?method=getCards&audience=RD',
  );

  if (!res.ok) {
    throw new Error('Failed to load cards');
  }

  const json = await res.json();
  AdaptiveCardsCache.newStudents = json;
  return json;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/\W+/g, '-')
    .replace(/--+/g, '-');
}

function monthOf(date) {
  return new Date(date).getMonth() + 1;
}

function downloadICS(title, isoDate, description) {
  const d = isoDate.replace(/[-:]/g, '').split('.')[0];

  const ics = `
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${title}
DESCRIPTION:${description}
DTSTART:${d}
DTEND:${d}
END:VEVENT
END:VCALENDAR
`.trim();

  const blob = new Blob([ics], { type: 'text/calendar' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${slugify(title)}.ics`;
  link.click();
}

function renderSection(title, id, content, open = false) {
  return `
<section class="collapsible clearfix bold-warm-blue narrow-margin">
  <header class="col-xs-12 bg-warm-blue">
    <a class="collapsible-toggle" data-target="collapse-${id}" aria-expanded="${open}" href="javascript:void(0)">
      <h1>${title}</h1>
    </a>
  </header>
  <div id="collapse-${id}"
       class="col-xs-12 collapse ${open ? 'in' : ''}">
    <ol class="decimal-bold blue">
      ${content}
    </ol>
  </div>
</section>
`;
}

function renderNewStudentCard(item) {
  let theBody = '';
  let icsBody = '';

  /* -------- BODY -------- */
  try {
    const body = typeof item.Body === 'string'
      ? JSON.parse(item.Body)
      : item.Body;

    if (Array.isArray(body)) {
      body.forEach((block) => {
        if (block.type === 'TextBlock') {
          theBody += `<p>${block.text}</p>`;
          icsBody += ` ${block.text}`;
        }

        if (block.type === 'FactSet') {
          theBody += '<dl class="tabular extra compact">';
          block.facts?.forEach((f) => {
            if (f?.title && f?.value) {
              theBody += `<dt>${f.title}</dt><dd>${f.value}</dd>`;
            }
          });
          theBody += '</dl>';
        }

        if (block.type === 'ColumnSet') {
          const cols = block.columns || [];
          const width = Math.floor(12 / cols.length);

          cols.forEach((c) => {
            const i = c.items?.[0];
            if (!i) return;

            theBody += `<div class="col-xs-12 col-md-${width}">`;

            if (i.type === 'Image') {
              const link = i.selectAction?.url;
              if (link) theBody += `<a href="${link}">`;
              theBody += `<img src="${i.url}" alt="${i.altText || ''}"/>`;
              if (link) theBody += '</a>';
            }

            if (i.type === 'TextBlock') {
              theBody += `<p>${i.text}</p>`;
            }

            theBody += '</div>';
          });
        }
      });
    } else {
      theBody += `<p>${item.Body}</p>`;
    }
  } catch {
    theBody += `<p>${item.Body}</p>`;
  }

  const now = new Date();
  const active = new Date(item.Active_x0020_Date);

  let availability = active <= now
    ? 'Available Now'
    : `Available ${active.toLocaleDateString('en-US', { dateStyle: 'long' })}`;

  let calendarHtml = '';

  if (item.Attention_x0020_Date) {
    const due = new Date(item.Attention_x0020_Date);

    availability += ` — Due ${due.toLocaleDateString('en-US', {
      dateStyle: 'long',
    })}`;

    calendarHtml = `
      &mdash; <span class="ion-calendar red"></span>
      <a href="#" class="add-to-calendar"
         data-title="${encodeURIComponent(item.Title)}"
         data-date="${due.toISOString()}"
         data-desc="${encodeURIComponent(icsBody)}">
        Add to calendar
      </a>
    `;
  }

  let learnMore = '';

  if (item.Learn_x0020_More?.Url) {
    if (item.Learn_x0020_More.Url.includes('kb_article')) {
      const modalId = `ac-modal-${slugify(item.Title)}`;
      learnMore = `
        <p class="text-right">
          <a href="javascript:void(0)"
             class="btn btn-default no-margin open-kb-modal"
             data-modal-id="${modalId}" data-kbhref="${item.Learn_x0020_More.Url}">
            Learn More<span class="sr-only"> about ${item.Title}</span>
          </a>
        </p>
        <div class="custom-modal" id="${modalId}" aria-modal="true" role="dialog" tabindex="-1">
          <div class="custom-modal-dialog">
            <div class="custom-modal-content">
              <div class="custom-modal-header">
                <button type="button" class="custom-modal-close" aria-label="Close">&times;</button>
                <h1>${item.Title}</h1>
              </div>
              <div class="custom-modal-body">
                <!-- KB content loaded separately -->
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      learnMore = `
        <p class="text-right">
          <a href="${item.Learn_x0020_More.Url}"
             class="btn btn-default no-margin">
            Read More<span class="sr-only"> about ${item.Title}</span>
          </a>
        </p>
      `;
    }
  }

  return `
<li class="student-checklist-card clearfix" id="ac-${slugify(item.Title)}">
  <p class="lede">
    ${item.Title}
    ${item.Required === false
    ? '<span class="pull-right student-checklist-badge bg-grey pale">Optional</span>'
    : ''}
  </p>

  <p class="no-margin ac-availability">
    ${availability}
    ${calendarHtml}
  </p>

  <div class="col-xs-12 col-md-9 no-bs-padding">
    ${theBody}
  </div>

  <div class="col-xs-12 col-md-3 no-bs-padding">
    ${learnMore}
  </div>
</li>
`;
}

async function renderNewStudents(containerId) {
  const items = await fetchNewStudents();

  const divisions = {
    spring: '',
    april: '',
    may: '',
    june: '',
    july: '',
    august: '',
  };

  items.forEach((item) => {
    const m = monthOf(item.Active_x0020_Date);
    const card = renderNewStudentCard(item);

    if (m < 4 || m === 12) {
      divisions.spring += card;
    } else if (m === 4) {
      divisions.april += card;
    } else if (m === 5) {
      divisions.may += card;
    } else if (m === 6) {
      divisions.june += card;
    } else if (m === 7) {
      divisions.july += card;
    } else if (m === 8) {
      divisions.august += card;
    }
  });

  const container = document.getElementById(containerId);

  container.innerHTML = [
    renderSection('Available January - March', 'spring', divisions.spring, true),
    renderSection('Available in April', 'april', divisions.april),
    renderSection('Available in May', 'may', divisions.may),
    renderSection('Available in June', 'june', divisions.june),
    renderSection('Available in July', 'july', divisions.july),
    divisions.august
      ? renderSection('Available in August', 'august', divisions.august)
      : '',
  ].join('');
}

export default async function decorate(block) {
  // Show loader
  block.innerHTML = '<div class="student-checklist-loader"><div class="spinner"></div><p>Loading results...</p></div>';

  try {
    if (!block.id) block.id = `student-checklist-${Math.random().toString(36).substring(2, 9)}`;
    await renderNewStudents(block.id);

    // Add collapsible toggle event listeners
    setTimeout(() => {
      // Collapsible toggle listeners
      document.querySelectorAll('.collapsible-toggle').forEach((el) => {
        el.addEventListener('click', function handleCollapsibleClick(e) {
          e.preventDefault();
          const targetId = this.getAttribute('data-target');
          const target = document.getElementById(targetId);
          if (target) {
            target.classList.toggle('in');
            this.setAttribute('aria-expanded', target.classList.contains('in'));
          }
        });
      });

      // Add to calendar listeners
      document.querySelectorAll('.add-to-calendar').forEach((link) => {
        link.addEventListener('click', function handleAddToCalendarClick(e) {
          e.preventDefault();
          downloadICS(
            decodeURIComponent(this.getAttribute('data-title')),
            this.getAttribute('data-date'),
            decodeURIComponent(this.getAttribute('data-desc')),
          );
        });
      });

      // Modal open/close and content loading (custom, not Bootstrap)
      document.querySelectorAll('.open-kb-modal').forEach((trigger) => {
        trigger.addEventListener('click', async function handleKbModalClick(e) {
          e.preventDefault();
          const modalId = this.getAttribute('data-modal-id');
          const modal = document.getElementById(modalId);
          if (modal) {
            modal.classList.add('show');
            // Load content
            const modalHeader = modal.querySelector('.custom-modal-header h1');
            const modalBody = modal.querySelector('.custom-modal-body');
            modalBody.innerHTML = '<div class="spinner"></div>Loading...';
            try {
              const kbhref = this.getAttribute('data-kbhref');
              // Extract the article parameter from the URL
              const urlObj = new URL(kbhref);
              const articleId = urlObj.searchParams.get('article');
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
              const response = await fetch(`${serverUrl}/content/apis/au/servicenowarticle.${articleId}.json`, {
                method: 'GET',
                headers,
              });

              const data = await response.json();
              if (modalHeader && data.title) {
                modalHeader.textContent = data.title;
              }
              modalBody.innerHTML = `<div>${data.desc}</div>`;
            } catch (err) {
              modalBody.innerHTML = `<div class="text-danger">Error loading KB: ${err.message}</div>`;
            }
          }
        });
      });

      // Modal close logic (close button or background click)
      document.addEventListener('click', (e) => {
        if (
          e.target.classList.contains('custom-modal-close')
          || (
            e.target.classList.contains('custom-modal')
            && e.target.classList.contains('show')
          )
        ) {
          const modal = e.target.closest('.custom-modal') || e.target;
          if (modal) { modal.classList.remove('show'); }
        }
      });
    }, 0);
  } catch (err) {
    block.innerHTML = `<div>Error loading results: ${err.message}</div>`;
  }
}
