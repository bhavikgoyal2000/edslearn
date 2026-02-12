import { getConfig } from '../../scripts/scripts.js';
import {
  createRadialPercentSVG,
  getWorkingPercentage,
  getInternshipPercentage,
  updateNamesList,
  getNames,
  observeAndAnimateRadialUpdate,
} from '../we-know-success-mini/we-know-success-mini.js';

function buildMicroParams({
  level = 'UG',
  school = 'all',
  major = 'all',
  category = 'employers',
  top = '5',
}) {
  const params = new URLSearchParams();

  params.set('level', level);
  if (level !== 'UG') {
    params.set('school', school);
  }
  params.set('major', major);
  params.set('category', category);

  if (top) {
    params.set('top', top);
  }

  return params;
}

async function getMajorLabelByValue(params, majorValue) {
  if (!majorValue || majorValue === 'all') {
    return 'all majors & programs';
  }

  const res = await fetch(
    'https://www.american.edu/customcf/knowsuccess/KnowSuccess.cfc?method=getMajors',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      body: params.toString(),
    },
  );

  if (!res.ok) {
    return majorValue;
  }

  const html = await res.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const option = doc.querySelector(`option[value="${majorValue}"]`);

  return option?.textContent?.trim() || majorValue;
}

function applyMicroLayout(groupEl) {
  if (!groupEl) {
    return;
  }

  const wrappers = [
    ...groupEl.querySelectorAll('.we-know-success-micro-wrapper'),
  ];

  wrappers.forEach((el) => {
    el.classList.remove('is-last-in-run');
  });

  let i = 0;

  while (i < wrappers.length) {
    const current = wrappers[i];

    const widthClass = [...current.classList].find((c) => c.startsWith('width-'));

    if (!widthClass) {
      i += 1;
      // eslint-disable-next-line no-continue
      continue;
    }

    let j = i + 1;

    while (
      j < wrappers.length && wrappers[j].classList.contains(widthClass)
    ) {
      j += 1;
    }

    wrappers[j - 1].classList.add('is-last-in-run');

    i = j;
  }
}

export default async function decorate(block) {
  const config = getConfig(block);
  const title = config[0] || '';
  const defaultLevel = config[1] || 'UG';
  const defaultSchool = config[2] || 'all';
  const defaultMajor = config[3] || 'all';
  const dataToDisplay = config[4] || 'whereGradsLand';
  const layoutWidth = config[5] || '100';
  const exploreMoreText = config[6] || 'from the Graduation Census as of six months after graduation for May graduates from 2022—2024.';

  const params = buildMicroParams({
    level: defaultLevel,
    school: defaultSchool,
    major: defaultMajor,
    category: 'employers',
  });

  const majorParams = new URLSearchParams();
  majorParams.set('level', defaultLevel);

  const majorLabel = await getMajorLabelByValue(majorParams, defaultMajor);

  block.classList.add('we-know-success-micro');
  const wrapper = block.parentElement;
  if (wrapper) {
    wrapper.classList.add(`width-${layoutWidth}`);

    const group = wrapper.parentElement;
    applyMicroLayout(group);
  }

  const headerWrap = document.createElement('div');
  headerWrap.className = 'we-know-success-header';

  const titleEl = document.createElement('h2');
  titleEl.className = 'we-know-success-title';
  titleEl.textContent = title;

  const descriptionEl = document.createElement('p');
  descriptionEl.className = 'we-know-success-description';

  headerWrap.append(titleEl, descriptionEl);
  block.appendChild(headerWrap);

  const LEVEL_LABELS = {
    UG: 'Undergraduates',
    GR: 'Graduates',
    PHD: 'Doctoral graduates',
  };

  const SCHOOL_LABELS = {
    cas: 'College of Arts and Sciences',
    kogod: 'Kogod School of Business',
    sis: 'School of International Service',
    soc: 'School of Communication',
    soe: 'School of Education',
    spa: 'School of Public Affairs',
    all: 'All Schools',
  };

  descriptionEl.innerHTML = `
    Six months after graduation, AU 
    <strong>${LEVEL_LABELS[defaultLevel] || defaultLevel}</strong>
    with a degree in 
    <strong class="major-label">${majorLabel}</strong>
    from 
    <strong>${SCHOOL_LABELS[defaultSchool] || defaultSchool}</strong>:
  `;

  const figuresWrap = document.createElement('div');
  figuresWrap.className = 'we-know-success-figures';
  block.appendChild(figuresWrap);

  const figure = document.createElement('figure');
  figure.className = 'we-know-success-figure';

  const figureLabel = document.createElement('figcaption');
  figureLabel.className = 'we-know-success-label';

  const radialSVG = createRadialPercentSVG({
    percent: 0,
    progressColor: defaultLevel === 'UG' ? '#3c208c' : '#a82860',
  });

  figure.append(radialSVG, figureLabel);
  figuresWrap.appendChild(figure);

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

  function toggleMicroDisplay() {
    figuresWrap.style.display = '';
    namesWrap.style.display = '';

    if (dataToDisplay === 'employers') {
      figuresWrap.style.display = 'none';
    } else {
      namesWrap.style.display = 'none';
    }
  }

  toggleMicroDisplay();

  if (dataToDisplay === 'employers') {
    const data = await getNames(params);
    updateNamesList(data, namesList);
  }

  if (dataToDisplay === 'whereGradsLand') {
    const percent = await getWorkingPercentage(params);
    observeAndAnimateRadialUpdate(
      figure,
      radialSVG,
      () => percent,
    );
    figureLabel.innerHTML = 'Working,<br>Grad School,<br> or Both';
  }

  if (dataToDisplay === 'internship') {
    const percent = await getInternshipPercentage(params);
    observeAndAnimateRadialUpdate(
      figure,
      radialSVG,
      () => percent,
    );
    figureLabel.innerHTML = 'Participated in<br>an Internship';
  }

  const footer = document.createElement('div');
  footer.className = 'we-know-success-footer';
  block.appendChild(footer);

  const exploreLink = document.createElement('a');
  exploreLink.id = 'miniLearnMoreLink';
  exploreLink.className = 'decor';
  exploreLink.innerHTML = 'Explore more <strong>We Know Success</strong> results';
  exploreLink.href = `https://www.american.edu/weknowsuccess/#${defaultLevel},${defaultMajor},${defaultSchool}`;

  footer.appendChild(exploreLink);

  if (exploreMoreText) {
    footer.appendChild(
      document.createTextNode(` ${exploreMoreText}`),
    );
  }
}
