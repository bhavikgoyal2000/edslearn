import { moveInstrumentation } from './scripts.js';
/* eslint-disable max-len */
/**
 * Creates DOM element using provided params and returns the created element.
 * @param tagName the name of the element to be created.
 * @param classList comma separated string of class names (without spaces) to add on created element. e.g 'class1,class2,class3'
 * @param innerText text content of element.
 * @param attributesJson attributes to be added on element if any as Object in form of key value pairs.
 * key will attribute name, value will be attribute value. e.g {attr1: 'value1', attr2: 'value2'}
 */

/* eslint-enable max-len */
export function createDomElement(tagName, classList, innerText, attributesJson) {
  const element = document.createElement(tagName);
  if (classList) {
    element.classList.add(...classList.split(','));
  }
  if (innerText) {
    element.innerText = innerText;
  }
  if (attributesJson) {
    Object.keys(attributesJson).forEach((key) => {
      element.setAttribute(key, attributesJson[key]);
    });
  }
  return element;
}

function getTitleTypeHeadingTag(tags) {
  const reversedTagsArray = tags.reverse();
  for (let i = 0; i < reversedTagsArray.length; i += 1) {
    if (reversedTagsArray[i].startsWith('h')) {
      return reversedTagsArray[i];
    }
  }
  return '';
}

function excludeHeadings(tag) {
  return !tag.startsWith('h');
}

/**
 * Creates heading title with given title type tags (H1-H6, Bold, Italic, Underlined)
 * @param titleTypes Element having list of authored title types
 * @param titleElement Element having title text authored
 */
export function buildTitleWithTitleTypes(titleTypes, titleElement) {
  const otherTitleTypeTags = titleTypes.innerText.split(',').filter(excludeHeadings);
  let otherTagsRoot;
  if (otherTitleTypeTags.length) {
    otherTagsRoot = createDomElement(otherTitleTypeTags[0]);
    if (otherTitleTypeTags.length === 1) {
      otherTagsRoot.innerText = titleElement.innerText;
    } else {
      let currentElement = otherTagsRoot;
      for (let i = 1; i < otherTitleTypeTags.length; i += 1) {
        const newElement = document.createElement(otherTitleTypeTags[i]);
        currentElement.append(newElement);
        currentElement = newElement;
        if (i === otherTitleTypeTags.length - 1) {
          currentElement.innerText = titleElement.innerText;
        }
      }
    }
  }

  const titleTypeHeadingTag = getTitleTypeHeadingTag(titleTypes.innerText.split(','));
  let newTitleElement;
  if (titleTypeHeadingTag) {
    newTitleElement = createDomElement(titleTypeHeadingTag);
    moveInstrumentation(titleElement, newTitleElement);
    if (otherTagsRoot) {
      newTitleElement.append(otherTagsRoot);
    } else {
      newTitleElement.innerText = titleElement.innerText;
    }
  } else {
    moveInstrumentation(titleElement, otherTagsRoot);
  }
  return newTitleElement || otherTagsRoot;
}

/**
 * @param container   Container element where the modal links and close buttons are located.
 * This function adds click event listeners to elements with the data-toggle="modal" attribute
 */
export function openCloseModalOnclick(container) {
  // Open modal functionality
  const modalLinks = container.querySelectorAll('a[data-bs-toggle="modal"]');
  modalLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const targetId = link.getAttribute('data-bs-target');
      const modal = document.querySelector(targetId);
      if (modal) {
        if (modal.classList.contains('show')) {
          modal.classList.remove('show');
          modal.style.display = 'none';
          modal.setAttribute('aria-hidden', 'true');
        } else {
          modal.classList.add('show');
          modal.style.display = 'block';
          modal.setAttribute('aria-hidden', 'false');
        }
      }
    });
  });

  // Close modal functionality
  const closeButtons = container.querySelectorAll('.btn-close');
  closeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const modal = button.closest('.modal');
      if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
      }
    });
  });
}

export function importVimeoIframeAPI() {
  const tagID = 'vimeo-iframe-api-script-tag';
  if (!document.getElementById(tagID)) {
    const tag = document.createElement('script');
    tag.setAttribute('id', tagID);
    tag.src = 'https://player.vimeo.com/api/player.js';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }
}

export function importYTIframeAPI() {
  const tagID = 'yt-iframe-api-script-tag';
  if (!document.getElementById(tagID)) {
    const tag = document.createElement('script');
    tag.setAttribute('id', tagID);
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }
}

export default function createElement(tagName, options = {}) {
  const { classes = [], props = {} } = options;
  const elem = document.createElement(tagName);
  const isString = typeof classes === 'string';
  if (classes || (isString && classes !== '') || (!isString && classes.length > 0)) {
    const classesArr = isString ? [classes] : classes;
    elem.classList.add(...classesArr);
  }
  if (!isString && classes.length === 0) {
    elem.removeAttribute('class');
  }

  if (props) {
    Object.keys(props).forEach((propName) => {
      const isBooleanAttribute = propName === 'allowfullscreen' || propName === 'autoplay' || propName === 'muted' || propName === 'controls';

      // For boolean attributes, add the attribute without a value if it's truthy
      if (isBooleanAttribute) {
        if (props[propName]) {
          elem.setAttribute(propName, '');
        }
      } else {
        const value = props[propName];
        elem.setAttribute(propName, value);
      }
    });
  }

  return elem;
}

/** * Formats a date string into a more readable format.
 * @param {string} dateStr - The date string to format.
 * @returns {string} - The formatted date string.
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Adds flex parent classes to provided flex block container
 * Ignores isGlobal div in count
 * @param {Element} block - the flex block container
 * @param {int} count - number of flex elements in container
 */
export function addFlexParentClasses(block, count) {
  if (count <= 1) {
    block.parentNode.classList.add('flex-parent-1');
  } else if (count === 2) {
    block.parentNode.classList.add('flex-parent-2');
  } else if (count >= 3) {
    block.parentNode.classList.add('flex-parent-3');
  }
}

/**
 * Adds mini flex parent classes to provided flex block container
 * @param {Element} block - the flex block container
 * @param {int} count - number of flex elements in container
 */
export function addMiniFlexParentClasses(block, count) {
  if (count <= 1) {
    block.parentNode.classList.add('mini-flex-parent-1');
  } else if (count === 2) {
    block.parentNode.classList.add('mini-flex-parent-2');
  } else if (count === 3) {
    block.parentNode.classList.add('mini-flex-parent-3');
  } else if (count === 4) {
    block.parentNode.classList.add('mini-flex-parent-4');
  } else if (count === 5) {
    block.parentNode.classList.add('mini-flex-parent-5');
  } else if (count >= 6) {
    block.parentNode.classList.add('mini-flex-parent-6');
  }
}

/**
 * Cleans the AEM URL by removing the specified prefix.
 * @param {string} url - The URL to clean.
 * @returns {string} - The cleaned URL.
 */
export function cleanAEMUrl(url) {
  if (typeof url !== 'string') return url;

  const isAuthor = /^author-p\d+-e\d+\.adobeaemcloud\.com$/.test(window.location.hostname);

  if (isAuthor) {
    // Split query params if present
    const [baseUrl, query] = url.split('?');

    // Remove trailing slash if any (to avoid `/index/.html`)
    const sanitizedBase = baseUrl.replace(/\/$/, '');

    // Add .html only if not already present
    const finalBase = sanitizedBase.endsWith('.html') ? sanitizedBase : `${sanitizedBase}.html`;

    // Reattach query params if any
    return query ? `${finalBase}?${query}` : finalBase;
  }

  // For publish/preview: remove /content/au prefix and trailing /index
  return url
    .replace(/^\/content\/au(\/)?/, '/') // remove /content/au prefix
    .replace(/\/index(\.html)?$/, '/'); // replace trailing /index or /index.html with a slash
}

/**
 * Fetches data from a Google Sheets spreadsheet.
 * @param {*} dropdownListPath - The path to the spreadsheet JSON.
 * @returns {Promise<Object>} The fetched and formatted data.
 */
export async function fetchSpreadsheetData(dropdownListPath) {
  try {
    // Normalize path
    const path = dropdownListPath
      ? `${dropdownListPath.replace(/^\/content\/au/, '')}.json`
      : '';
    const response = await fetch(path);

    if (!response.ok) {
      throw new Error(`Failed to fetch JSON: ${response.statusText}`);
    }

    const jsonData = await response.json();

    // Validate structure
    if (!jsonData.data || !Array.isArray(jsonData.data)) {
      throw new Error('Invalid spreadsheet JSON format');
    }

    // ✅ Auto-map every key in item exactly as provided
    const formattedData = jsonData.data.map((item) => {
      const mapped = {};

      Object.keys(item).forEach((key) => {
        // Copy all key-value pairs as-is
        mapped[key] = item[key] ?? '';
      });

      return mapped;
    });

    return {
      total: formattedData.length,
      offset: 0,
      limit: formattedData.length,
      data: formattedData,
      ':type': 'sheet',
    };
  } catch (error) {
    return {
      total: 0,
      offset: 0,
      limit: 0,
      data: [],
      ':type': 'sheet',
    };
  }
}

export async function getCsrfToken() {
  const response = await fetch('/libs/granite/csrf/token.json');
  const json = await response.json();
  return json.token;
}

export async function getDateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('d');
}

export async function updateUrlWithDate(dateStr) {
  const url = new URL(window.location.href);
  url.searchParams.set('d', dateStr);
  window.history.pushState({}, '', url.toString());
}

export async function persistSelectedDate(dateStr) {
  sessionStorage.setItem('selectedCalendarDate', dateStr);
}

export async function getPersistedDate() {
  return sessionStorage.getItem('selectedCalendarDate');
}

export function resolveInitialDate() {
  const params = new URLSearchParams(window.location.search);
  const urlDate = params.get('d');

  if (urlDate && /^\d{4}-\d{2}-\d{2}$/.test(urlDate)) {
    return urlDate;
  }

  const storedDate = sessionStorage.getItem('selectedCalendarDate');
  if (storedDate && /^\d{4}-\d{2}-\d{2}$/.test(storedDate)) {
    return storedDate;
  }

  return new Date().toISOString().split('T')[0];
}
