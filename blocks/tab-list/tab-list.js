import { toClassName } from '../../scripts/aem.js';

let tabsIdx = 0;
const MOBILE_MAX = 600;

/* ---------------- Utilities ---------------- */

const isMobile = () => window.innerWidth <= MOBILE_MAX;
const debounce = (fn, wait = 120) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
};

// Safe CSS.escape fallback
const cssEscape = (id) => (window.CSS && CSS.escape ? CSS.escape(id) : id.replace(/([^\w-])/g, '\\$1'));

// Get only the original tab buttons (exclude any clones in the dropdown)
const getOriginalTabButtons = (tabListUl) => Array.from(tabListUl.querySelectorAll('li > button[role="tab"]'));

function handleTabKeydown(e) {
  const tab = e.target.closest('button[role="tab"]');
  if (!tab) return;

  const tabList = tab.closest('ul[role="tablist"]');
  if (!tabList) return;

  const tabs = getOriginalTabButtons(tabList);
  const currentIndex = tabs.indexOf(tab);
  if (currentIndex === -1) return;

  const moveFocus = (nextIndex) => {
    const next = tabs[nextIndex];
    if (next) next.focus();
  };

  if (e.key === 'ArrowRight') {
    e.preventDefault();
    moveFocus((currentIndex + 1) % tabs.length);
  }

  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    moveFocus((currentIndex - 1 + tabs.length) % tabs.length);
  }

  if (e.key === 'Home') {
    e.preventDefault();
    moveFocus(0);
  }

  if (e.key === 'End') {
    e.preventDefault();
    moveFocus(tabs.length - 1);
  }

  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    tab.click();
  }
}

/* ---------------- Tab switching ---------------- */

export function changeTabs(e) {
  const targetTab = e.target.closest('button[role="tab"]');
  if (!targetTab) return;

  const controls = (targetTab.getAttribute('aria-controls') || '').split(' ').filter(Boolean);
  if (!controls.length) return;

  const [tabGroupPrefix] = controls[0].split('-panel-');
  const tabList = targetTab.closest('ul[role="tablist"]');
  if (!tabList) return;

  // Update aria-selected on all buttons in this tablist
  getOriginalTabButtons(tabList).forEach((btn) => {
    btn.setAttribute('aria-selected', btn === targetTab ? 'true' : 'false');
    btn.tabIndex = btn === targetTab ? 0 : -1;
  });

  // Hide all panels of this group
  document
    .querySelectorAll(`[role="tabpanel"][id^="${tabGroupPrefix}-panel-"]`)
    .forEach((p) => p.setAttribute('hidden', true));

  // Show the target panels
  controls.forEach((id) => {
    const panel = document.getElementById(id);
    if (panel) panel.removeAttribute('hidden');
  });
}

function updateGradientBar(tabListContainer, tabList) {
  const gradientBar = tabListContainer.querySelector('.tab-list-gradient-bar');
  const selectedBtn = tabList.querySelector('button[role="tab"][aria-selected="true"]');
  if (!gradientBar || !selectedBtn) return;

  const btnRect = selectedBtn.getBoundingClientRect();
  const containerRect = tabListContainer.getBoundingClientRect();
  const selectedLi = selectedBtn.parentElement;
  const isLastTab = selectedLi?.classList.contains('tab-list-filler');

  const left = btnRect.left - containerRect.left;
  const width = isLastTab ? containerRect.width - left : btnRect.width;

  gradientBar.style.left = `${left}px`;
  gradientBar.style.width = `${width}px`;
}

/* ---------------- Mobile dropdown ---------------- */

// Build dropdown with only inactive tabs. Clones have no IDs to avoid duplicates.
function rebuildMobileDropdown(tabListUl, fillerLi) {
  const dropdown = fillerLi.querySelector('.tab-dropdown');
  if (!dropdown) return;
  dropdown.innerHTML = '';

  const originals = getOriginalTabButtons(tabListUl);
  const activeBtn = originals.find((b) => b.getAttribute('aria-selected') === 'true');

  originals
    .filter((b) => b !== activeBtn)
    .forEach((origBtn) => {
      const clone = origBtn.cloneNode(true);
      // Prevent ID/ARIA collisions and keep it a simple action button
      clone.removeAttribute('id');
      clone.removeAttribute('aria-controls');
      clone.setAttribute('role', 'button');
      clone.setAttribute('aria-selected', 'false');
      clone.dataset.targetId = origBtn.id;

      clone.addEventListener('click', (ev) => {
        ev.preventDefault();

        const realBtn = tabListUl.querySelector(`#${cssEscape(clone.dataset.targetId)}`);
        if (!realBtn) return;

        // Activate via the real button to reuse existing handlers
        realBtn.click();

        // Keep structure: active first, filler last
        const activeLi = realBtn.closest('li');
        if (activeLi && tabListUl.firstElementChild !== activeLi) {
          tabListUl.insertBefore(activeLi, tabListUl.firstElementChild);
        }
        tabListUl.appendChild(fillerLi);

        // Close dropdown and reset icon
        fillerLi.classList.remove('open');
        const fillerBtn = fillerLi.querySelector('button');
        if (fillerBtn) fillerBtn.innerHTML = '<span class="tab-filler-icon">...</span>';

        // Rebuild list for new inactive set
        rebuildMobileDropdown(tabListUl, fillerLi);
      });

      dropdown.appendChild(clone);
    });
}

function ensureDummyFiller(tabListUl) {
  let fillerLi = tabListUl.querySelector('.tab-list-filler-dummy');
  if (!fillerLi) {
    fillerLi = document.createElement('li');
    fillerLi.className = 'tab-list-filler-dummy';
    fillerLi.innerHTML = `
      <button type="button"><span class="tab-filler-icon">...</span></button>
      <div class="tab-dropdown"></div>
    `;
    tabListUl.appendChild(fillerLi);
  }

  const fillerBtn = fillerLi.querySelector('button');
  if (fillerBtn && !fillerBtn.dataset.wired) {
    fillerBtn.dataset.wired = '1';

    fillerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = fillerLi.classList.toggle('open');
      fillerBtn.innerHTML = open
        ? '<span class="tab-filler-icon">&times;</span>'
        : '<span class="tab-filler-icon">...</span>';
    });

    // Close on outside click (wire once per filler)
    const outside = (e) => {
      if (!fillerLi.contains(e.target)) {
        fillerLi.classList.remove('open');
        fillerBtn.innerHTML = '<span class="tab-filler-icon">...</span>';
      }
    };
    document.addEventListener('click', outside);
  }

  return fillerLi;
}

function setupMobileTabs(tabListUl) {
  // Clear any inline display changes (CSS controls visibility)
  Array.from(tabListUl.children).forEach((li) => li.style.removeProperty('display'));

  const mobile = isMobile();
  const existingDummy = tabListUl.querySelector('.tab-list-filler-dummy');

  if (!mobile) {
    // Desktop/tablet: remove dummy if present
    if (existingDummy) existingDummy.remove();
    return;
  }

  // Ensure active tab is first (so :first-child CSS logic works)
  const activeBtn = tabListUl.querySelector('button[role="tab"][aria-selected="true"]')
    || tabListUl.querySelector('button[role="tab"]');
  if (activeBtn) {
    const activeLi = activeBtn.closest('li');
    if (activeLi && tabListUl.firstElementChild !== activeLi) {
      tabListUl.insertBefore(activeLi, tabListUl.firstElementChild);
    }
  }

  // Ensure a single dummy filler exists and is last
  const fillerLi = ensureDummyFiller(tabListUl);
  if (fillerLi !== tabListUl.lastElementChild) tabListUl.appendChild(fillerLi);

  // Populate dropdown with inactive tabs
  rebuildMobileDropdown(tabListUl, fillerLi);
}

/* ---------------- Main decorate ---------------- */

export default async function decorate(block) {
  // Collect tab panels following this block
  const tabPanels = [];
  const section = block.closest('.section');
  let nextSection = section?.nextElementSibling;

  while (nextSection) {
    const { tabLabel } = nextSection.dataset;
    if (tabLabel) {
      tabPanels.push([tabLabel, nextSection]);
      nextSection = nextSection.nextElementSibling;
    } else {
      break;
    }
  }

  // Build the tab list
  tabsIdx += 1;
  const tabsPrefix = `tabs-${(tabsIdx)}`;
  const tabList = document.createElement('ul');
  tabList.setAttribute('role', 'tablist');
  tabList.id = `${tabsPrefix}-tablist`;

  tabPanels.forEach(([tabLabel, tabPanel], i) => {
    const tabId = `${tabsPrefix}-tab-${toClassName(tabLabel)}`;
    const tabPanelId = `${tabsPrefix}-panel-${toClassName(tabLabel)}`;

    const btn = document.createElement('button');
    btn.id = tabId;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    btn.tabIndex = i === 0 ? 0 : -1;
    btn.setAttribute('aria-controls', tabPanelId);
    btn.textContent = tabLabel;
    btn.title = tabLabel;
    btn.addEventListener('click', changeTabs);
    btn.addEventListener('keydown', handleTabKeydown);

    const li = document.createElement('li');
    li.appendChild(btn);

    // Last original tab acts as filler on desktop
    if (i === tabPanels.length - 1) {
      li.classList.add('tab-list-filler');
    }
    tabList.appendChild(li);

    // Setup the panel
    tabPanel.id = tabPanelId;
    tabPanel.setAttribute('aria-labelledby', tabId);
    tabPanel.setAttribute('role', 'tabpanel');
    tabPanel.tabIndex = 0;
    if (i > 0) tabPanel.setAttribute('hidden', '');
  });

  // Outer containers
  const contentBox = document.createElement('div');
  contentBox.className = 'tab-list-content-box';

  const tabListContainer = document.createElement('div');
  tabListContainer.className = 'tab-list';
  tabListContainer.appendChild(tabList);

  // Gradient bar
  const gradientBar = document.createElement('div');
  gradientBar.className = 'tab-list-gradient-bar';
  tabListContainer.appendChild(gradientBar);

  // Append to DOM
  contentBox.appendChild(tabListContainer);
  tabPanels.forEach(([, panel]) => contentBox.appendChild(panel));
  block.replaceChildren(contentBox);

  // Initial layout/setup
  const init = () => {
    setupMobileTabs(tabList);
    updateGradientBar(tabListContainer, tabList);
  };
  // Give fonts/layout a moment
  setTimeout(init, 0);

  // Keep gradient in sync on tab clicks
  tabList.addEventListener('click', () => updateGradientBar(tabListContainer, tabList));

  // Debounced resize
  const onResize = debounce(() => {
    setupMobileTabs(tabList);
    updateGradientBar(tabListContainer, tabList);
  }, 120);
  window.addEventListener('resize', onResize);
}
