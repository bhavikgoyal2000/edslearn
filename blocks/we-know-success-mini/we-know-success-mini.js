import { getConfig } from '../../scripts/scripts.js';

function createSelectProxy(realSelect) {
  const wrapper = document.createElement('div');
  wrapper.className = 'select-proxy';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'select-proxy-trigger';
  button.setAttribute('aria-haspopup', 'listbox');
  button.setAttribute('aria-expanded', 'false');
  button.textContent = realSelect.options[realSelect.selectedIndex]?.textContent || '';

  const list = document.createElement('ul');
  list.className = 'select-proxy-list';
  list.setAttribute('role', 'listbox');
  list.tabIndex = -1;

  function open() {
    wrapper.classList.add('open');
    button.setAttribute('aria-expanded', 'true');
    const selected = list.querySelector('.is-selected');
    selected?.focus();
  }

  function close() {
    wrapper.classList.remove('open');
    button.setAttribute('aria-expanded', 'false');
    button.focus();
  }

  Array.from(realSelect.options).forEach((opt) => {
    const li = document.createElement('li');
    li.textContent = opt.textContent;
    li.dataset.value = opt.value;
    li.setAttribute('role', 'option');
    li.tabIndex = -1;

    if (opt.selected) {
      li.classList.add('is-selected');
    }

    li.addEventListener('click', () => {
      realSelect.value = opt.value;
      realSelect.dispatchEvent(new Event('change', { bubbles: true }));

      button.textContent = opt.textContent;
      list.querySelectorAll('.is-selected').forEach((el) => el.classList.remove('is-selected'));
      li.classList.add('is-selected');

      close();
    });

    list.appendChild(li);
  });

  button.addEventListener('click', () => {
    // eslint-disable-next-line no-unused-expressions
    wrapper.classList.contains('open') ? close() : open();
  });

  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) {
      close();
    }
  });

  button.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      open();
    }
  });

  list.addEventListener('keydown', (e) => {
    const items = Array.from(list.querySelectorAll('li'));
    const current = document.activeElement;
    const idx = items.indexOf(current);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      items[Math.min(idx + 1, items.length - 1)]?.focus();
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      items[Math.max(idx - 1, 0)]?.focus();
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      current?.click();
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  });

  wrapper.append(button, list);
  realSelect.after(wrapper);

  return wrapper;
}

function syncProxy(realSelect, proxy) {
  const button = proxy.querySelector('.select-proxy-trigger');
  const items = proxy.querySelectorAll('li');

  button.textContent = realSelect.options[realSelect.selectedIndex]?.textContent || '';

  items.forEach((li) => {
    li.classList.toggle('is-selected', li.dataset.value === realSelect.value);
  });
}

export function createRadialPercentSVG({
  percent,
  size = 170,
  stroke = 12,
  trackColor = '#99a3a6',
  progressColor = '#a82860',
  textColor = '#182449',
}) {
  const clamped = Math.max(0, Math.min(100, Number(percent) || 0));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const svgNS = 'http://www.w3.org/2000/svg';

  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.classList.add('radial-svg');

  const track = document.createElementNS(svgNS, 'circle');
  track.setAttribute('cx', String(size / 2));
  track.setAttribute('cy', String(size / 2));
  track.setAttribute('r', String(radius));
  track.setAttribute('fill', 'none');
  track.setAttribute('stroke', trackColor);
  track.setAttribute('stroke-width', String(stroke));

  const progress = document.createElementNS(svgNS, 'circle');
  progress.setAttribute('cx', String(size / 2));
  progress.setAttribute('cy', String(size / 2));
  progress.setAttribute('r', String(radius));
  progress.setAttribute('fill', 'none');
  progress.setAttribute('stroke', progressColor);
  progress.setAttribute('stroke-width', String(stroke));
  progress.setAttribute('stroke-dasharray', String(circumference));
  progress.setAttribute('stroke-dashoffset', String(circumference));
  progress.setAttribute('stroke-linecap', 'butt');
  progress.style.transform = 'rotate(-90deg)';
  progress.style.transformOrigin = '50% 50%';

  const text = document.createElementNS(svgNS, 'text');
  text.setAttribute('x', String(size / 2));
  text.setAttribute('y', String(size / 2));
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('dominant-baseline', 'middle');
  text.setAttribute('fill', textColor);
  text.setAttribute('font-size', '34');
  text.setAttribute('font-weight', '700');
  text.textContent = '0%';

  svg.append(track, progress, text);

  svg.radialData = {
    percent: clamped,
    circumference,
    progress,
    text,
    animated: false,
  };

  return svg;
}

function animateRadial(svg, duration = 900) {
  const data = svg.radialData;
  if (!data) {
    return;
  }
  if (data.animated) {
    return;
  }

  data.animated = true;

  const {
    percent, circumference, progress, text,
  } = data;
  const start = performance.now();

  function tick(now) {
    const elapsed = now - start;
    const t = Math.min(1, elapsed / duration);

    const eased = 1 - (1 - t) ** 3;

    const currentPercent = Math.round(percent * eased);
    const offset = circumference * (1 - currentPercent / 100);

    progress.setAttribute('stroke-dashoffset', String(offset));
    text.textContent = `${currentPercent}%`;

    if (t < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}

function resetAndAnimateRadial(svg, newPercent, duration = 900) {
  const data = svg.radialData;
  if (!data) {
    return;
  }

  const clamped = Math.max(0, Math.min(100, Number(newPercent) || 0));

  data.percent = clamped;
  data.animated = false;

  data.progress.setAttribute(
    'stroke-dashoffset',
    String(data.circumference),
  );
  data.text.textContent = '0%';

  animateRadial(svg, duration);
}

export function observeAndAnimateRadialUpdate(
  containerEl,
  svg,
  getPercent,
  { threshold = 0.35, duration = 900 } = {},
) {
  if (!containerEl || !svg) {
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const percent = getPercent();
        resetAndAnimateRadial(svg, percent, duration);

        io.unobserve(entry.target);
      });
    },
    { threshold },
  );

  io.observe(containerEl);
}

function getInputValues(form) {
  const params = new URLSearchParams();

  const level = form.querySelector('[name="level"]')?.value;
  const school = form.querySelector('[name="school"]')?.value;
  const major = form.querySelector('[name="major"]')?.value;
  const category = form.querySelector('[name="category"]')?.value;
  const top = form.querySelector('[name="top"]')?.value;

  if (level) {
    params.set('level', level);
  }

  if (school && school !== 'all') {
    params.set('school', school);
  }

  if (major && major !== 'all') {
    params.set('major', major);
  }

  if (category) {
    params.set('category', category);
  }

  if (top) {
    params.set('top', top);
  }

  return params;
}

function buildLevelSelect(defaultLevel = 'GR', showPhds = false) {
  const select = document.createElement('select');
  select.name = 'level';
  select.id = 'level';
  select.className = 'filter';
  select.tabIndex = 1;
  select.autocomplete = 'off';

  const optionUG = document.createElement('option');
  optionUG.value = 'UG';
  optionUG.textContent = 'Undergraduates';

  const optionGR = document.createElement('option');
  optionGR.value = 'GR';
  optionGR.textContent = 'Masters';

  if (defaultLevel === 'GR') {
    optionGR.selected = true;
  } else if (defaultLevel === 'UG') {
    optionUG.selected = true;
  }

  select.append(optionUG, optionGR);

  if (showPhds) {
    const optionPHD = document.createElement('option');
    optionPHD.value = 'PHD';
    optionPHD.textContent = 'Doctorates';
    select.appendChild(optionPHD);
  }

  select.value = defaultLevel;
  return select;
}

function buildHiddenInput(name, value) {
  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = name;
  input.id = name;
  input.value = value;
  return input;
}

function buildSelectFromMap({
  name,
  options,
  selected = 'all',
  hidden = false,
}) {
  const select = document.createElement('select');
  select.name = name;
  select.id = name;
  select.className = 'filter';
  select.tabIndex = 1;
  select.autocomplete = 'off';

  if (hidden) {
    select.style.display = 'none';
  }

  Object.entries(options).forEach(([value, label]) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;

    if (value === selected) {
      option.selected = true;
    }

    select.appendChild(option);
  });

  return select;
}

function getTopByLevel(level) {
  if (level === 'UG') { return '5'; }
  if (level === 'GR') { return '10'; }
  return '5';
}

async function getMajorSelect(params) {
  const url = 'https://www.american.edu/customcf/knowsuccess/KnowSuccess.cfc?method=getMajors';

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
    body: params.toString(),
  });

  if (!res.ok) {
    throw new Error(`getMajors failed: ${res.status}`);
  }

  const html = await res.text();

  const doc = new DOMParser().parseFromString(html, 'text/html');
  const select = doc.querySelector('select[name="major"]');

  if (!select) {
    throw new Error('Major select not found');
  }

  return select;
}

export function updateNamesList(data, listEl) {
  listEl.replaceChildren();

  if (!data) {
    return;
  }

  const hasNames = typeof data.TOPLIST === 'string' && data.TOPLIST.trim().length > 0;

  if (!hasNames) {
    const li = document.createElement('li');
    li.className = 'we-know-success-names-empty';
    li.textContent = data.MESSAGE || 'No records found for your search.';
    listEl.appendChild(li);
    return;
  }

  const names = data.TOPLIST.split('|');

  names.forEach((name) => {
    const li = document.createElement('li');
    li.textContent = name;
    listEl.appendChild(li);
  });
}

async function callKnowSuccess(method, params) {
  const url = `https://www.american.edu/customcf/knowsuccess/KnowSuccess.cfc?method=${method}&returnFormat=json`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
    body: params.toString(),
  });

  if (!res.ok) {
    throw new Error(`${method} failed: ${res.status}`);
  }

  return res.json();
}

export function getNames(params) {
  return callKnowSuccess('getNames', params);
}

export function getWorkingPercentage(params) {
  return callKnowSuccess('getAfterAU', params)
    .then((data) => data.WORKINGALL);
}

export function getInternshipPercentage(params) {
  return callKnowSuccess('getExperiences', params)
    .then((data) => data.INTERNRESULTS);
}

function buildLearnMoreHref(block) {
  const level = block.querySelector('[name="level"]')?.value || 'UG';
  const major = block.querySelector('[name="major"]')?.value || 'all';
  const school = block.querySelector('[name="school"]')?.value || 'all';

  // return `/weknowsuccess/#${level},${major},${school}`;
  // Adding full; path below for test purposes TODO
  return `https://www.american.edu/weknowsuccess/#${level},${major},${school}`;
}

export default async function decorate(block) {
  const config = getConfig(block);
  const title = config[1] || '';
  const defaultLevel = config[2] || 'UG';
  const defaultSchool = config[3] || 'all';
  const defaultMajor = config[4] || 'all';
  const showPhds = config[5] === 'true';
  const doctoralInfo = config[6] || '';

  block.classList.add('we-know-success', 'mini');
  const categoryValue = 'employers';

  const titleEl = document.createElement('h2');
  titleEl.className = 'we-know-success-title';
  titleEl.textContent = title;
  block.appendChild(titleEl);

  const form = document.createElement('form');
  form.className = 'we-know-success-filters';
  form.noValidate = true;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
  });

  const categoryInput = buildHiddenInput('category', categoryValue);
  form.appendChild(categoryInput);

  const levelSelect = buildLevelSelect(defaultLevel, showPhds);
  form.append(levelSelect);

  const majorSelect = await getMajorSelect(
    getInputValues(form),
  );
  let majorSelectEl = majorSelect.cloneNode(true);
  majorSelectEl.classList.add('filter');
  majorSelectEl.tabIndex = 1;

  form.appendChild(majorSelectEl);

  if (defaultMajor && defaultMajor !== 'all') {
    const optionExists = majorSelectEl.querySelector(`option[value="${defaultMajor}"]`);
    if (optionExists) {
      majorSelectEl.value = defaultMajor;
    }
  }

  const SchoolData = {
    all: 'All Schools',
    cas: 'College of Arts and Sciences',
    kogod: 'Kogod School of Business',
    soc: 'School of Communication',
    soe: 'School of Education',
    sis: 'School of International Service',
    spa: 'School of Public Affairs',
  };

  const schoolSelect = buildSelectFromMap({
    name: 'school',
    options: SchoolData,
    selected: defaultSchool,
  });

  form.appendChild(schoolSelect);

  const topInput = buildHiddenInput('top', getTopByLevel(levelSelect.value));
  form.append(topInput);
  block.appendChild(form);

  const figuresWrap = document.createElement('div');
  figuresWrap.className = 'we-know-success-figures';
  block.appendChild(figuresWrap);

  const workFigure = document.createElement('figure');
  workFigure.className = 'we-know-success-figure know-success-figure-work';

  const workLabel = document.createElement('figcaption');
  workLabel.className = 'we-know-success-label';

  const workSvg = createRadialPercentSVG({
    percent: 0,
    progressColor: '#a82860',
  });

  workFigure.append(workSvg, workLabel);
  figuresWrap.appendChild(workFigure);

  const internshipsFigure = document.createElement('figure');
  internshipsFigure.className = 'we-know-success-figure know-success-figure-internships';

  const internshipsLabel = document.createElement('figcaption');
  internshipsLabel.className = 'we-know-success-label';

  const internshipsSvg = createRadialPercentSVG({
    percent: 0,
    progressColor: '#3c208c',
  });

  internshipsFigure.append(internshipsSvg, internshipsLabel);

  const namesWrap = document.createElement('div');
  namesWrap.className = 'we-know-success-names';
  block.appendChild(namesWrap);

  const namesListWrap = document.createElement('div');
  namesListWrap.className = 'we-know-success-names-list-wrap';

  const namesListTitle = document.createElement('h3');
  namesListTitle.className = 'we-know-success-names-title';
  namesListTitle.textContent = 'Top Employers';

  namesWrap.appendChild(namesListTitle);
  namesWrap.appendChild(namesListWrap);

  const namesList = document.createElement('ul');
  namesList.className = 'we-know-success-names-list';

  namesListWrap.appendChild(namesList);

  const learnMoreLink = document.createElement('a');
  learnMoreLink.id = 'miniLearnMoreLink';
  learnMoreLink.className = 'btn btn-colorbg bg-indigo-purple-color';
  learnMoreLink.textContent = 'Learn More >';
  namesWrap.appendChild(learnMoreLink);

  const levelProxy = createSelectProxy(levelSelect);
  let majorProxy = createSelectProxy(majorSelectEl);
  const schoolProxy = createSelectProxy(schoolSelect);

  let doctoralInfoWrap = null;

  if (showPhds && doctoralInfo) {
    doctoralInfoWrap = document.createElement('div');
    doctoralInfoWrap.className = 'we-know-success-doctoral-info';
    doctoralInfoWrap.style.display = 'none';
    doctoralInfoWrap.innerHTML = doctoralInfo;

    block.appendChild(doctoralInfoWrap);
  }

  function toggleDoctoralMode() {
    const isDoctoral = showPhds && levelSelect.value === 'PHD';

    figuresWrap.style.display = isDoctoral ? 'none' : '';
    namesWrap.style.display = isDoctoral ? 'none' : '';

    if (doctoralInfoWrap) {
      doctoralInfoWrap.style.display = isDoctoral ? '' : 'none';
    }
  }

  function toggleFiltersByLevel(fromChange = false) {
    const isDoctoral = levelSelect.value === 'PHD';

    if (majorProxy) {
      majorProxy.style.display = isDoctoral ? 'none' : '';
    }

    if (schoolProxy) {
      schoolProxy.style.display = isDoctoral ? 'none' : '';
    }

    if (fromChange) {
      schoolSelect.value = 'all';
      syncProxy(schoolSelect, schoolProxy);
    }
  }

  toggleFiltersByLevel();
  toggleDoctoralMode();

  async function render() {
    const level = levelSelect.value;
    toggleDoctoralMode();

    if (level === 'PHD') {
      return;
    }
    const noDataMessage = 'Not enough graduates in this program provided this information to display results.';
    let percentWork = 0;
    topInput.value = getTopByLevel(level);

    const params = getInputValues(form);

    try {
      percentWork = await getWorkingPercentage(params);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }

    if (percentWork > 0) {
      workSvg.style.display = '';
      observeAndAnimateRadialUpdate(
        workFigure,
        workSvg,
        () => percentWork,
      );
      workLabel.innerHTML = 'Working,<br>Grad School,<br> or Both';
      workFigure.style.display = '';
    } else {
      workSvg.style.display = 'none';
      workLabel.textContent = noDataMessage;
    }

    if (level === 'UG') {
      let percentInternships = 0;

      try {
        percentInternships = await getInternshipPercentage(params);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }

      figuresWrap.classList.add('is-two-figures');

      if (!internshipsFigure.isConnected) {
        figuresWrap.appendChild(internshipsFigure);
      }

      internshipsFigure.style.display = '';

      if (percentInternships > 0) {
        internshipsSvg.style.display = '';
        internshipsLabel.innerHTML = 'Participated in<br>an Internship';

        observeAndAnimateRadialUpdate(
          internshipsFigure,
          internshipsSvg,
          () => percentInternships,
        );
      } else {
        internshipsSvg.style.display = 'none';
        internshipsLabel.textContent = noDataMessage;
      }
    } else {
      figuresWrap.classList.remove('is-two-figures');

      if (internshipsFigure.isConnected) {
        internshipsFigure.remove();
      }
    }

    try {
      const data = await getNames(params);
      updateNamesList(data, namesList);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }

    learnMoreLink.href = buildLearnMoreHref(block);
  }

  render();

  majorSelectEl.addEventListener('change', () => {
    syncProxy(majorSelectEl, majorProxy);
    render();
  });

  schoolSelect.addEventListener('change', () => {
    syncProxy(schoolSelect, schoolProxy);
    render();
  });

  levelSelect.addEventListener('change', async () => {
    syncProxy(levelSelect, levelProxy);

    if (majorSelectEl) {
      majorSelectEl.remove();
    }

    if (majorProxy) {
      majorProxy.remove();
    }

    const newMajorSelect = await getMajorSelect(
      getInputValues(form),
    );
    majorSelectEl = newMajorSelect.cloneNode(true);
    majorSelectEl.classList.add('filter');
    majorSelectEl.tabIndex = 1;

    form.insertBefore(majorSelectEl, schoolSelect);

    majorProxy = createSelectProxy(majorSelectEl);
    toggleFiltersByLevel(true);
    toggleDoctoralMode();

    majorSelectEl.addEventListener('change', () => {
      syncProxy(majorSelectEl, majorProxy);
      render();
    });

    render();
  });
}
