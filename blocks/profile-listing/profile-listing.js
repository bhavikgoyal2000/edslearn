import { createOptimizedPicture } from '../../scripts/aem.js';
import { SERVER_URL } from '../../scripts/constants.js';
import { cleanAEMUrl } from '../../scripts/util.js';

/* ==========================================================
   CREATE ALPHA BAR NAV
========================================================== */
function createAlphaBarNav(letters) {
  const nav = document.createElement('nav');
  nav.className = 'alpha-bar';
  nav.setAttribute('aria-label', 'Alphabetical jump list');

  const ul = document.createElement('ul');
  ul.className = 'pagination';

  letters.forEach((letter) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `#alpha-header-${letter}`;

    const sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = 'Jump to users whose last name starts with ';

    a.append(sr, letter);
    li.appendChild(a);
    ul.appendChild(li);
  });

  nav.appendChild(ul);
  return nav;
}

/* ==========================================================
   CREATE ALPHA SECTION
========================================================== */
function createAlphaSection(letter) {
  const section = document.createElement('section');
  section.className = 'row';
  section.id = `alpha-header-${letter}`;

  const headerCol = document.createElement('div');
  headerCol.className = 'col-12';

  const header = document.createElement('div');
  const h1 = document.createElement('h1');

  const sr = document.createElement('span');
  sr.className = 'sr-only';
  sr.textContent = 'Last name starts with ';

  h1.append(sr, letter);
  header.appendChild(h1);
  // section.appendChild(header);
  headerCol.appendChild(header);
  section.appendChild(headerCol);

  return section;
}

/* ==========================================================
   GROUP ITEMS ALPHABETICALLY
========================================================== */
function groupItemsAlphabetically(items, keyFn) {
  return items.reduce((acc, item) => {
    const raw = keyFn(item);
    if (!raw) return acc;

    const letter = raw.trim().charAt(0).toUpperCase();
    const key = /^[A-Z]$/.test(letter) ? letter : '#';

    acc[key] ||= [];
    acc[key].push(item);
    return acc;
  }, {});
}

/* ==========================================================
   LOADER
========================================================== */
function showLoader(msg) {
  const loader = document.createElement('div');
  loader.className = 'profile-listing-loader';
  loader.innerHTML = `
    <div class="spinner"></div>
    <p>Loading ${msg}...</p>
  `;
  return loader;
}

/* ==========================================================
   QUERY PARAM UTILS
========================================================== */
function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const query = {};

  params.forEach((value, key) => {
    query[key] = value;
  });

  return {
    page: parseInt(query.page, 10) || 1,
    filters: Object.keys(query).reduce((acc, key) => {
      if (key !== 'page') acc[key] = query[key];
      return acc;
    }, {}),
  };
}

/* ==========================================================
   BUILD QUERY STRING
========================================================== */
function buildQueryString(page, filters = {}) {
  const params = new URLSearchParams({ page });

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });

  return params.toString();
}

/* ==========================================================
   SERVER URL RESOLUTION
========================================================== */
function resolveServerUrl(finalServerUrl) {
  const isAuthor = /^author-p\d+-e\d+\.adobeaemcloud\.com$/.test(window.location.hostname);

  return isAuthor ? window.location.origin : finalServerUrl;
}

/* ==========================================================
   HEADERS / CSRF
========================================================== */
async function getHeaders(serverUrl) {
  const headers = { 'Content-Type': 'application/json' };

  if (serverUrl === window.location.origin) {
    const response = await fetch('/libs/granite/csrf/token.json');
    const json = await response.json();
    headers['CSRF-Token'] = json.token;
  }

  return headers;
}

/* ==========================================================
   IMAGE UTILS
========================================================== */
function getOptimizedImageUrl(src, alt = '') {
  if (!src) {
    return '/content/dam/au/assets/uploads/profiles/medium/au_profile.jpg';
  }
  const picture = createOptimizedPicture(src, alt, false, [{ width: '750' }]);
  const img = picture.querySelector('img');
  if (img) {
    img.loading = 'lazy';
    img.decoding = 'async';
    return img.src;
  }
  return src;
}

/* ==========================================================
   PAYLOAD BUILDER
========================================================== */
function buildPayload(multifieldData, resultsPerPage, filters) {
  let parsed = {};
  try {
    parsed = JSON.parse(multifieldData);
  } catch (e) {
    parsed = {};
  }

  return {
    condition: 'AND',
    'cq:tags': [],
    fields: parsed.fields || [],
    sortField: parsed.sortField || 'username',
    sortOrder: parsed.sortOrder || 'asc',
    filters,
    resultsPerPage,
  };
}

/* ==========================================================
   RENDER RESULTS (EXACT DOM)
========================================================== */
function renderVariation1Dom(block, results) {
  const ul = document.createElement('ul');
  ul.className = 'list-unstyled';

  results.forEach((item) => {
    const phoneAvailable = !!item.fso_phone;
    const emailAvailable = !!item.email;
    const facultyTitle = item.job_category === 'Faculty' ? item.faculty_title : item.staff_title;
    const facultyDeptName = item.job_category === 'Faculty' ? item.faculty_dept_name : item.staff_dept_name;
    const li = document.createElement('li');

    li.innerHTML = `
      <div>
        <div class="media profile-block">
          <div class="pull-left">
            <img src="${getOptimizedImageUrl(item.photo, item.first_name)}" alt="${item.first_name || ''}">
          </div>
          <div class="media-body">
            <div class="content">
              <h2>
                ${item.first_name}  ${item.last_name}<br>
              </h2>
              <span class="text-muted small">
                ${facultyTitle || ''}${facultyDeptName ? `, ${facultyDeptName}` : ''}<br>
              </span>
              <address>
                <div style="margin-bottom: 5px;">
                  ${facultyDeptName || ''}
                </div>
                ${item.fso_line1 || ''}<br>
                ${item.fso_line2 || ''}<br>
                ${item.city || ''}<br>
              </address>
            </div>
            <div class="contact">
              ${phoneAvailable ? `
                <div>
                    <i class='fa-light fa-phone'></i>
                    <a href="tel:${item.fso_phone}">
                        ${item.fso_phone}
                    </a>
                </div>
                ` : ''}
              ${emailAvailable ? `
                <div>
                    <i class='fa-light fa-envelope'></i>
                    <a href="mailto:${item.email}">
                        ${item.email}
                    </a>
                </div>
                ` : ''}
              <a href="${cleanAEMUrl(item.defaultProfilePage) || '#'}"
                 class="btn btn-cta btn-sm">
                View Profile
              </a>
            </div>
          </div>
        </div>
      </div>
    `;

    ul.appendChild(li);
  });

  block.appendChild(ul);
}

/* ==========================================================
   RENDER VARIATION 2 DOM
========================================================== */
function renderVariation2Dom(block, results, layout) {
  const fragment = document.createDocumentFragment();
  results.forEach((item, index) => {
    /* ==========================
       ARTICLE
    ========================== */
    const article = document.createElement('article');
    article.className = 'profile-item col-12 no-bs-padding flex-context';
    article.classList.add(layout === 'column2' ? 'col-md-5' : 'col-md-11');

    /* ==========================
      IMAGE COLUMN
    ========================== */
    const imgWrap = document.createElement('div');
    imgWrap.className = 'flex-1';

    const img = document.createElement('img');
    img.src = getOptimizedImageUrl(item.photo, item.first_name);
    img.alt = item.first_name || '';
    img.className = 'is-decorative';
    img.setAttribute('itemprop', 'image');

    imgWrap.appendChild(img);

    /* ==========================
       CONTENT COLUMN
    ========================== */
    const content = document.createElement('div');
    content.className = 'flex-3';

    /* ---- Name / Title / Office ---- */
    const h1 = document.createElement('h1');
    h1.className = 'profile-name';

    const nameSpan = document.createElement('span');
    nameSpan.textContent = `${item.first_name || ''} ${item.last_name || ''}`.trim();
    nameSpan.setAttribute('itemprop', 'name');
    h1.appendChild(nameSpan);

    if (item.faculty_title) {
      const titleSmall = document.createElement('small');
      titleSmall.textContent = item.faculty_title;
      titleSmall.setAttribute('itemprop', 'jobTitle');
      h1.appendChild(titleSmall);
    }

    if (item.faculty_dept_name) {
      const officeSmall = document.createElement('small');
      officeSmall.className = 'profile-office';
      officeSmall.textContent = item.faculty_dept_name;
      officeSmall.setAttribute('itemprop', 'worksFor');
      h1.appendChild(officeSmall);
    }

    content.appendChild(h1);

    /* ---- View Profile ---- */
    if (item.defaultProfilePage) {
      const profileP = document.createElement('p');
      profileP.className = 'profile-link';

      const profileA = document.createElement('a');
      profileA.href = cleanAEMUrl(item.defaultProfilePage);
      profileA.title = `Profile of ${item.first_name || ''}`;
      profileA.className = 'btn btn-cta btn-sm';
      profileA.textContent = 'View Profile';
      profileA.setAttribute('itemprop', 'url');

      profileP.appendChild(profileA);
      content.appendChild(profileP);
    }

    /* ---- Email (NULL SAFE) ---- */
    if (item.email) {
      const emailP = document.createElement('p');
      emailP.className = 'profile-email';

      const emailIcon = document.createElement('i');
      emailIcon.className = 'fa-light fa-envelope embassy-blue';
      emailIcon.setAttribute('aria-hidden', 'true');

      const emailLink = document.createElement('a');
      emailLink.href = `mailto:${item.email}`;

      const emailSpan = document.createElement('span');
      emailSpan.textContent = item.email;
      emailSpan.setAttribute('itemprop', 'email');

      emailLink.appendChild(emailSpan);
      emailP.append(emailIcon, ' ', emailLink);
      content.appendChild(emailP);
    }

    /* ---- Phone (NULL SAFE) ---- */
    if (item.fso_phone) {
      const phoneP = document.createElement('p');
      phoneP.className = 'profile-phone';

      const phoneIcon = document.createElement('i');
      phoneIcon.className = 'fa-light fa-phone embassy-blue';
      phoneIcon.setAttribute('aria-hidden', 'true');

      const phoneLink = document.createElement('a');
      phoneLink.href = `tel:${item.fso_phone}`;

      const phoneSpan = document.createElement('span');
      phoneSpan.textContent = item.fso_phone;
      phoneSpan.setAttribute('itemprop', 'telephone');

      phoneLink.appendChild(phoneSpan);
      phoneP.append(phoneIcon, ' ', phoneLink);
      content.appendChild(phoneP);
    }

    /* ==========================
       ASSEMBLE ARTICLE
    ========================== */
    article.append(imgWrap, content);
    fragment.appendChild(article);

    /* ---- Spacer column after each article ---- */
    if (index < results.length - 1) {
      const spacer = document.createElement('div');
      spacer.className = 'col-md-1';
      fragment.appendChild(spacer);
    }
  });

  block.appendChild(fragment);
}

/* ==========================================================
   RENDER VARIATION 2 WITH ALPHA BAR
========================================================== */
function renderVariation2WithAlpha(block, results, layout) {
  const wrapper = document.createElement('div');
  wrapper.className = 'profile-listing';
  block.appendChild(wrapper);

  const grouped = groupItemsAlphabetically(
    results,
    (item) => item.last_name || item.first_name,
  );

  const letters = Object.keys(grouped).sort();
  wrapper.appendChild(createAlphaBarNav(letters));

  letters.forEach((letter) => {
    const section = createAlphaSection(letter);
    wrapper.appendChild(section);
    renderVariation2Dom(section, grouped[letter], layout);
  });
}

/* ==========================================================
   RENDER VARIATION 2
========================================================== */
function renderVariation2(block, results, layout) {
  const wrapper = document.createElement('div');
  wrapper.className = 'profile-listing';

  const section = document.createElement('section');
  section.className = 'row';

  wrapper.appendChild(section);
  block.appendChild(wrapper);

  renderVariation2Dom(section, results, layout);
}

/* ==========================================================
   PAGINATION
========================================================== */
function createPaginationLinks(pageNum, totalCount, resultsPerPage, filters = {}) {
  const totalPages = Math.ceil(totalCount / resultsPerPage);
  // const start = (pageNum - 1) * resultsPerPage + 1;
  // const end = Math.min(pageNum * resultsPerPage, totalCount);

  // Create nav wrapper
  const nav = document.createElement('nav');
  nav.className = 'pagination-holder row page-numbers';
  nav.setAttribute('role', 'navigation');
  nav.setAttribute('aria-label', 'Results list pagination');

  // Create ul
  const ul = document.createElement('ul');
  ul.className = 'pagination justify-content-center col-md-12';

  // Results label
  // const labelLi = document.createElement('li');
  // labelLi.className = 'nav-label visible-md-inline visible-lg-inline col-md-6';
  // labelLi.innerHTML = `<span>Results ${start} - ${end} of ${totalCount}</span>`;
  // ul.appendChild(labelLi);

  // Previous arrow
  const prevLi = document.createElement('li');
  if (pageNum > 1) {
    const a = document.createElement('a');
    a.href = `${window.location.pathname}?${buildQueryString(pageNum - 1, filters)}`;
    a.setAttribute('aria-label', 'Previous Page');
    a.setAttribute('title', 'Previous Page');
    const sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = 'Previous';
    const icon = document.createElement('span');
    icon.className = 'ion-chevron-left';
    icon.setAttribute('aria-hidden', 'true');
    a.appendChild(sr);
    a.appendChild(icon);
    prevLi.appendChild(a);
  }
  ul.appendChild(prevLi);

  // Page numbers (show up to 4 pages for demo, can be expanded)
  for (let i = 1; i <= totalPages; i += 1) {
    // Only show first, last, current, and neighbors (for large sets, add ellipsis logic)
    if (
      i === 1
      || i === totalPages
      || (i >= pageNum - 1 && i <= pageNum + 2 && i <= totalPages)
    ) {
      const li = document.createElement('li');
      if (i === pageNum) {
        li.className = 'active';
        const sr = document.createElement('span');
        sr.className = 'sr-only';
        sr.textContent = 'You are on page ';
        const pageSpan = document.createElement('span');
        pageSpan.textContent = i;
        li.appendChild(sr);
        li.appendChild(pageSpan);
      } else {
        const a = document.createElement('a');
        a.href = i === 1
          ? `${window.location.pathname}?${buildQueryString(i, filters)}`
          : `${window.location.pathname}?${buildQueryString(i, filters)}`;
        a.setAttribute('aria-label', `Page ${i}`);
        a.setAttribute('title', `Page ${i}`);
        a.textContent = i;
        li.appendChild(a);
      }
      ul.appendChild(li);
    }
  }

  // Next arrow
  if (pageNum < totalPages) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `${window.location.pathname}?${buildQueryString(pageNum + 1, filters)}`;
    a.setAttribute('aria-label', 'Next Page');
    a.setAttribute('title', 'Next Page');
    const sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = 'Next';
    const icon = document.createElement('span');
    icon.className = 'ion-chevron-right';
    icon.setAttribute('aria-hidden', 'true');
    a.appendChild(sr);
    a.appendChild(icon);
    li.appendChild(a);
    ul.appendChild(li);
  }

  nav.appendChild(ul);
  return nav;
}

/* ==========================================================
   FETCH EXECUTOR
========================================================== */
async function executeFetch({
  block,
  multifieldData,
  variation,
  layout,
  isAlphaBarEnabled,
  resultsPerPage,
  serverUrl,
}) {
  /* Show loader */
  const loader = showLoader('Profiles');
  block.appendChild(loader);

  const { page, filters } = getQueryParams();
  const resolvedServerUrl = resolveServerUrl(serverUrl);

  const headers = await getHeaders(resolvedServerUrl);
  const payload = buildPayload(multifieldData, resultsPerPage, filters);
  const queryString = buildQueryString(page, filters);

  const response = await fetch(
    `${resolvedServerUrl}/bin/profile/dynamicFilter?${queryString}`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    },
  );

  const { results = [], total = 0, limit = resultsPerPage } = await response.json();

  block.textContent = '';

  if (!results.length) {
    block.innerHTML = '<p class="no-results">No results found</p>';
    return;
  }

  // Render DOM based on variation and layout
  if (variation === 'variation2' && !isAlphaBarEnabled) {
    block.classList.add('variation2');
    renderVariation2(block, results, layout);
  } else if (variation === 'variation2' && isAlphaBarEnabled) {
    block.classList.add('variation2', 'with-alpha-bar');
    renderVariation2WithAlpha(block, results, layout);
  } else {
    block.classList.add('variation1');
    renderVariation1Dom(block, results);
  }

  // Pagination
  const paginationDom = total > limit
    ? createPaginationLinks(page, total, limit, filters)
    : document.createElement('div');
  if (paginationDom) {
    block.appendChild(paginationDom);
  }
}

/* ==========================================================
   FORM RESTORE VALUES
========================================================== */
function restoreFormValues(formSelector) {
  const form = document.querySelector(formSelector);
  if (!form) return;

  const params = new URLSearchParams(window.location.search);

  const fieldMap = {
    q: '#person-dir-q',
    role: '#person-dir-role',
  };

  Object.entries(fieldMap).forEach(([paramKey, selector]) => {
    const el = form.querySelector(selector);
    if (!el) return;

    const value = params.get(paramKey);
    if (value === null || value.trim() === '') return;

    el.value = value;
  });
}

/* ==========================================================
   QUERY PARAM CHECKER
========================================================== */
function hasQueryParam(key) {
  if (!key) return false;

  const params = new URLSearchParams(window.location.search);
  const value = params.get(key);

  return value !== null && value.trim() !== '';
}

/* ==========================================================
   SINGLE INITIATOR
========================================================== */
function initProfileListing({
  block,
  multifieldData = '',
  variation = 'variation1',
  layout = 'column1',
  isAlphaBarEnabled = false,
  resultsPerPage = 10,
  trigger = 'auto',
  formSelector,
  serverUrl,
}) {
  // const loader = showLoader('Profiles');
  // block.appendChild(loader);
  if (trigger === 'button' && hasQueryParam('q')) {
    restoreFormValues(formSelector);
    executeFetch({
      block,
      multifieldData,
      variation,
      layout,
      isAlphaBarEnabled,
      resultsPerPage,
      serverUrl,
      trigger,
    });
  } else if (trigger === 'auto' && variation !== 'none') {
    executeFetch({
      block,
      multifieldData,
      variation,
      layout,
      isAlphaBarEnabled,
      resultsPerPage,
      serverUrl,
      trigger,
    });
  }
}

/* ==========================================================
   PEOPLE SEARCH MODE DETECTION @returns {"auto" | "button"}
========================================================== */
function getTriggerType() {
  const peopleForm = document.querySelector(
    '.directory-form-panel.people',
  );

  return peopleForm ? 'button' : 'auto';
}

/* ==========================================================
   AEM DECORATE ENTRY
========================================================== */
export default function decorate(block) {
  const children = Array.from(block.children);
  const variation = children[1]?.innerText.trim() || 'none';
  const layout = children[2]?.innerText.trim() || 'column1';
  const isAlphaBarEnabled = children[3]?.innerText.trim() === 'true';
  const multifieldData = children.at(-2)?.innerText || '';
  const resultsPerPage = parseInt(children.at(-1)?.innerText, 10) || 10;
  const triggerType = getTriggerType();
  block.textContent = '';

  initProfileListing({
    block,
    multifieldData,
    variation,
    layout,
    isAlphaBarEnabled,
    resultsPerPage,
    trigger: triggerType,
    formSelector: '.directory-form-panel.people form',
    serverUrl: SERVER_URL,
  });
}
