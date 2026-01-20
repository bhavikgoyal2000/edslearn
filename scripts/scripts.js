import {
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  readBlockConfig,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  loadScript,
} from './aem.js';
import createAdobeDataLayer from './analytics-util.js';

/**
 * Moves all the attributes from a given elmenet to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveAttributes(from, to, attributes) {
  if (!attributes) {
    // eslint-disable-next-line no-param-reassign
    attributes = [...from.attributes].map(({ nodeName }) => nodeName);
  }
  attributes.forEach((attr) => {
    const value = from.getAttribute(attr);
    if (value) {
      to.setAttribute(attr, value);
      from.removeAttribute(attr);
    }
  });
}

/**
 * Move instrumentation attributes from a given element to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveInstrumentation(from, to) {
  moveAttributes(
    from,
    to,
    [...from.attributes]
      .map(({ nodeName }) => nodeName)
      .filter((attr) => attr.startsWith('data-aue-') || attr.startsWith('data-richtext-')),
  );
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

function addContentSectionsWrapper(main) {
  if (main.children.length === 0) return;
  let contentSectionsWrapper = null;
  let leftRailSectionsWrapper = null;
  let structureWrapper = null;
  let mainContentWrapper = null;
  let section = main.children[0];
  while (section) {
    const nextSection = section.nextElementSibling;
    // if its a au content section ...
    if (section.classList.contains('content-section') || section.classList.contains('column')) {
      // ...and we dont have a au structure wrapper yet
      if (!mainContentWrapper) {
        mainContentWrapper = document.createElement('div');
        mainContentWrapper.classList.add('main-content-wrapper');
        section.replaceWith(mainContentWrapper);
        structureWrapper = document.createElement('div');
        structureWrapper.classList.add('structure-wrapper');
        mainContentWrapper.appendChild(structureWrapper);
        contentSectionsWrapper = document.createElement('div');
        contentSectionsWrapper.classList.add('content-sections-wrapper');
        structureWrapper.appendChild(contentSectionsWrapper);
      }

      // if its a left rail section
      if (section.classList.contains('left-rail')) {
        // add left rail class to the content sections wrapper
        contentSectionsWrapper.classList.add('content-sections-wrapper-with-left-rail');

        // ...and we dont have a left rail sections wrapper yet
        if (!leftRailSectionsWrapper) {
          leftRailSectionsWrapper = document.createElement('div');
          leftRailSectionsWrapper.classList.add('left-rail-sections-wrapper');
          structureWrapper.prepend(leftRailSectionsWrapper);
        }
        // append to left rail wrapper
        leftRailSectionsWrapper.appendChild(section);
      } else {
        // append to content sections wrapper
        contentSectionsWrapper.appendChild(section);
      }
    // if its not a au content section and we have an active wrapper
    } else {
      structureWrapper = null;
      leftRailSectionsWrapper = null;
      contentSectionsWrapper = null;
      mainContentWrapper = null;
    }
    section = nextSection;
  }
}

function decorateCollapsibleSections(main) {
  const contentSectionsWrapper = main.querySelector('.content-sections-wrapper');
  if (!contentSectionsWrapper || contentSectionsWrapper.children.length === 0) return;
  let section = contentSectionsWrapper.children[0];
  while (section) {
    if (section.classList.contains('collapsible-section')) {
      const sectionContent = section.innerHTML;
      section.innerHTML = '';
      section.classList.add('collapsed');

      // Create collapsible header
      const title = section.getAttribute('data-title') || 'Collapsible';
      const header = document.createElement('div');
      const ombreElement = document.createElement('div');
      ombreElement.classList.add('ombre-collapsible-section-wrap');
      const titleElement = document.createElement('h2');
      titleElement.textContent = title;
      header.classList.add('collapsible-section-header');
      header.setAttribute('tabindex', '0');
      header.setAttribute('role', 'button');
      header.setAttribute('aria-expanded', 'false');
      header.appendChild(ombreElement);
      header.appendChild(titleElement);
      section.appendChild(header);
      // Remove bg style and apply to header
      const bgClass = Array.from(section.classList).find((cls) => cls.startsWith('bg-'));
      if (bgClass) {
        section.classList.remove(bgClass);
        header.classList.add(bgClass);
      }

      // Create collapsible content
      const content = document.createElement('div');
      content.classList.add('collapsible-section-content');
      content.innerHTML = sectionContent;
      section.appendChild(content);
      const sectionRef = section;

      const setFocusableState = (container, isExpanded) => {
        const focusableElements = container.querySelectorAll(
          'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );

        focusableElements.forEach((el) => {
          if (isExpanded) {
            el.removeAttribute('tabindex');
            el.removeAttribute('aria-hidden');
          } else {
            el.setAttribute('tabindex', '-1');
            el.setAttribute('aria-hidden', 'true');
          }
        });
      };

      document.querySelectorAll('.collapsible-section.collapsed .collapsible-section-content').forEach((contentCollapsible) => {
        setFocusableState(contentCollapsible, false);
      });

      const toggleCollapse = () => {
        sectionRef.classList.toggle('collapsed');
        const expanded = !sectionRef.classList.contains('collapsed');
        header.setAttribute('aria-expanded', String(expanded));

        const contentCollapsible = sectionRef.querySelector('.collapsible-section-content');
        setFocusableState(contentCollapsible, expanded);
      };

      header.addEventListener('click', toggleCollapse);
      header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleCollapse();
        }
      });
    }
    section = section.nextElementSibling;
  }
}

function buildTabs(main) {
  function getTabLabel(section) {
    const metadataBlock = section.querySelector('.section-metadata');
    const metadata = metadataBlock ? readBlockConfig(metadataBlock) : {};
    return metadata['tab-label'];
  }

  for (let i = 0; i < main.children.length; i += 1) {
    const section = main.children[i];
    const tabLabel = getTabLabel(section);
    const previousSection = i > 0 ? main.children[i - 1] : null;
    const previousTabLabel = previousSection ? getTabLabel(previousSection) : null;

    if (tabLabel && !previousTabLabel) {
      // found first tab panel of a list of consecutive tab panels
      // create a tab list block if non exists as last child
      let previousBlock = previousSection?.lastElementChild;
      if (previousBlock?.matches('.section-metadata')) previousBlock = previousBlock.previousElementSibling;
      if (!previousBlock?.matches('.tab-list')) {
        const tabListBlock = document.createElement('div');
        tabListBlock.className = 'tab-list block';
        const newSection = document.createElement('div');
        newSection.className = 'section';
        newSection.appendChild(tabListBlock);
        section.before(newSection);
      }
    }
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    // TODO: add auto block, if needed
    buildTabs(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

function initAdobeDataLayer() {
  createAdobeDataLayer('load', 'pageview', () => ({}), window);
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  addContentSectionsWrapper(main);
  decorateCollapsibleSections(main);
  initAdobeDataLayer();
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    main.id = 'main-container';
    decorateMain(main);
    const path = window.location.pathname;
    const isMagazinePage = path.startsWith('/magazine') || path.includes('/magazine');
    if (path === '/' || path === 'index') {
      document.body.classList.add('appear', 'global-homepage');
    } else if (isMagazinePage) {
      document.body.classList.add('appear', 'global-magazine');
    } else {
      document.body.classList.add('appear', 'childpage');
    }
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * This method used to call the accessiblity js script to load accessibility changes.
 */
async function loadAccessibilityChanges() {
  await loadScript(`${window.hlx.codeBasePath}/scripts/loadAccessibilityChanges.js`);
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
  loadAccessibilityChanges();
}

const scriptMap = new Map();

export function loadScriptIfNotLoadedYet(url, attrs) {
  if (scriptMap.has(url)) {
    return scriptMap.get(url).promise;
  }

  const promise = loadScript(url, attrs);
  scriptMap.set(url, { url, attrs, promise });
  return promise;
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
