import { moveInstrumentation } from '../../scripts/scripts.js';
import { cleanAEMUrl } from '../../scripts/util.js';

function setupQueryOverlay(sectionElement) {
  if (!sectionElement) return;

  const queryInput = sectionElement.querySelector('#query');
  const queryLabel = sectionElement.querySelector('label[for="query"]');

  if (!queryInput || !queryLabel) return;

  queryInput.addEventListener('focus', () => {
    queryLabel.classList.remove('overlay');
  });

  queryInput.addEventListener('blur', () => {
    if (queryInput.value.length === 0) {
      queryLabel.classList.add('overlay');
    }
  });
}

function createElement(tag, attrs = {}, text = '') {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  if (text) el.textContent = text;
  return el;
}

function getVariationClass(variation) {
  return variation === 'variation1' ? 'bg-blue light' : 'bg-blue dark';
}

/* SECTION */
function createSection(config) {
  const sectionEle = createElement('section', {
    class: 'container-fluid clearfix',
    id: 'program-finder',
    'data-element': config.dataElement || '',
  });
  if (config.programVariation === 'variation2' && config.image?.src) {
    sectionEle.style.backgroundImage = `url(${config.image.src})`;
    sectionEle.classList.add('hero-img');
  }
  return sectionEle;
}

/** TEASER (ONLY FOR VARIATION 1) */
function createTeaser(config) {
  const div = createElement('div', { class: 'teaser-text' });

  // Title (H1)
  if (config.title) {
    div.append(createElement('h1', {}, config.title));
  }

  // Only build <h2><p>...</p></h2> when we have highlightedText or subtitle
  if (config.highlightedText || config.subtitle) {
    const h2 = createElement('h2');
    const p = createElement('p');

    // Add highlighted text inside span.hot-text
    if (config.highlightedText) {
      const span = createElement('span', { class: 'hot-text' }, config.highlightedText);
      p.append(span);
    }

    // Add subtitle text directly (no leading space if highlightedText missing)
    if (config.subtitle) {
      const textNode = document.createTextNode(
        config.highlightedText ? ` ${config.subtitle}` : config.subtitle,
      );
      p.append(textNode);
    }

    h2.append(p);
    div.append(h2);
  }

  return div;
}

/** FORM */
function buildForm(config, variationClass) {
  const item = createElement('div', { class: `item-form ${variationClass}` });

  const form = createElement('form', {
    class: 'dynamic-label',
    action: cleanAEMUrl(config.formAction) || '/programs/',
    method: 'get',
  });

  form.append(
    createElement('legend', { class: 'sr-only' }, config.legend || ''),
  );

  form.append(
    createElement('label', { for: 'query', class: 'overlay' }, config.placeholderText || ''),
  );

  const span = createElement('span');
  span.append(
    createElement('input', {
      id: 'query',
      class: config.programVariation === 'variation1'
        ? 'border-solid bottom-only'
        : 'border-gradient bottom-only',
      name: 'query',
      type: 'text',
      maxlength: '100',
    }),
  );

  form.append(span);

  const btn = createElement('button', { type: 'submit' });
  btn.append(createElement('span', { class: 'ion-ios-search-strong' }));
  btn.append(createElement('span', { class: 'sr-only' }, 'Search'));
  form.append(btn);

  item.append(form);

  return item;
}

/** BROWSE BY   */
function buildBrowseBy(config, variationClass) {
  const {
    programVariation,
    cta1,
    cta2,
    cta3,
  } = config;

  const variation = programVariation === 'variation1' ? 1 : 2;

  // Convert CTA arrays into usable list
  const ctas = [cta1, cta2, cta3].filter(Boolean);

  if (ctas.length === 0) return null;

  // Create outer wrapper for variation 1
  let wrapper = null;
  wrapper = document.createElement('div');
  wrapper.className = `item-browse-by ${variationClass}`;

  const h2 = document.createElement('h2');
  h2.textContent = 'Or browse by:';
  wrapper.appendChild(h2);

  // Always create grid
  const grid = document.createElement('div');
  grid.className = 'grid-browse-btn';

  wrapper.appendChild(grid);

  // Build CTA links
  ctas.forEach((ctaArr) => {
    const label = ctaArr[0];
    const url = cleanAEMUrl(ctaArr[1]);

    if (!label || !url) return;

    const a = document.createElement('a');

    // Variation 1 styling
    if (variation === 1) {
      a.className = 'btn btn-white lighttext';
      a.setAttribute('title', label);
      a.textContent = label;
    } else {
      a.className = 'btn btn-white';
      a.setAttribute('title', label);

      const words = label.split(' ');

      if (words.length > 1) {
        const first = words.shift();
        const rest = words.join(' ');

        a.innerHTML = `${first} <span class='preLB'>${rest}</span>`;
      } else {
        a.textContent = label;
      }
    }

    a.href = url;

    grid.appendChild(a);
  });

  return variation === 1 ? wrapper : wrapper;
}

/** SCHOOL LINKS  */
function buildSchoolLinks(config, sideItems, block) {
  const linkBlock = Array.from(block.children).slice(11);

  // sideItems is optional now
  const normalizedSideItems = Array.isArray(sideItems) ? sideItems : [];

  const themeClass = config.programVariation === 'variation1' ? 'bg-blue light' : 'bg-blue dark';

  const wrapper = document.createElement('div');
  wrapper.className = 'item-search-btns';

  // Total iterations = max of both arrays
  const total = Math.max(normalizedSideItems.length, linkBlock.length);

  for (let i = 0; i < total; i += 1) {
    const item = normalizedSideItems[i];

    const div = document.createElement('div');
    div.className = `${themeClass} item-cas`;

    if (item && item.text && item.url) {
      // Build actual link
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = cleanAEMUrl(item.url);
      a.textContent = item.text;
      p.appendChild(a);
      div.appendChild(p);
    } else {
      // No sideItem → empty placeholder
      div.classList.add('empty');
      div.textContent = 'Configure CTA';
    }

    wrapper.appendChild(div);

    // Always move instrumentation if linkBlock exists
    if (linkBlock[i]) {
      moveInstrumentation(linkBlock[i], div);
    }
  }
  return wrapper;
}

/** GRID (FORM + BROWSE + SCHOOL LINKS)   */
function buildGrid(config, variationClass, sideItems, block) {
  const grid = createElement('div', { class: 'grid-container' });

  grid.append(buildForm(config, variationClass));
  grid.append(buildBrowseBy(config, variationClass));
  grid.append(buildSchoolLinks(config, sideItems, block));

  return grid;
}

/** MAIN BUILDER  */
function buildProgramFinder(config, sideItems, block) {
  const variationClass = getVariationClass(config.programVariation);
  const section = createSection(config);

  if (config.programVariation === 'variation1') {
    const teaser = createTeaser(config);
    section.append(teaser);
  }

  const grid = buildGrid(config, variationClass, sideItems, block);
  section.append(grid);

  return section;
}

function labelBlockData(dataArray) {
  return {
    formAction: dataArray[0] || null,
    programVariation: dataArray[1] || null,
    title: dataArray[2] || null,
    highlightedText: dataArray[3] || null,
    subtitle: dataArray[4] || null,
    image: dataArray[5] || null,
    placeholderText: dataArray[6] || null,
    cta1: dataArray[7] || null,
    cta2: dataArray[8] || null,
    cta3: dataArray[9] || null,
  };
}

function labelBlockItemData(dataArray) {
  const sideItems = [];

  // Starting index 10 onwards
  for (let i = 10; i < dataArray.length; i += 1) {
    const item = dataArray[i];

    // Should be: ['text', 'url']
    if (Array.isArray(item) && item.length >= 2) {
      sideItems.push({
        text: item[0],
        url: item[1],
      });
    }
  }

  return sideItems;
}

function extractContainerData(containerElement) {
  const children = Array.from(containerElement.children).slice(1);

  const blockData = children.map((child) => {
    const ps = child.querySelectorAll('p');
    const img = child.querySelector('picture img');

    if (img) {
      return {
        type: 'image',
        src: img.getAttribute('src'),
        alt: img.getAttribute('alt') || '',
      };
    }

    if (ps.length > 0) {
      const texts = Array.from(ps).map((p) => p.textContent.trim());
      return texts.length === 1 ? texts[0] : texts;
    }

    return null;
  });

  return { blockData };
}

export default function decorate(block) {
  const extractedData = extractContainerData(block);
  const data = labelBlockData(extractedData.blockData);
  const sideItems = labelBlockItemData(extractedData.blockData);
  const section = buildProgramFinder(data, sideItems, block);
  moveInstrumentation(block, section);
  block.textContent = '';
  setupQueryOverlay(section);
  block.appendChild(section);
}

document.addEventListener('DOMContentLoaded', () => {
  const searchBtn = document.querySelector('button[type="submit"]');
  const queryInput = document.getElementById('query');
  const form = document.querySelector('form.dynamic-label');

  if (searchBtn && queryInput && form) {
    searchBtn.addEventListener('click', (e) => {
      e.preventDefault(); // Prevent default form submission

      const query = queryInput.value.trim();
      if (!query) return;

      // Get formAction from the form's action attribute
      const formAction = form.getAttribute('action') || '/programs/';
      // Build the redirect URL
      const redirectUrl = `${formAction}?query=${encodeURIComponent(query)}`;

      window.location.href = redirectUrl;
    });
  }
});
