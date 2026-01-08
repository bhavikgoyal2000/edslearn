import {
  decorateBlock,
  decorateBlocks,
  decorateButtons,
  decorateIcons,
  decorateSections,
  loadBlock,
  loadScript,
  loadSections,
} from './aem.js';
import { decorateRichtext } from './editor-support-rte.js';
import { decorateMain, moveAttributes } from './scripts.js';

function showPercentage(main) {
  const columnSections = main.querySelectorAll('div.section.column');
  columnSections.forEach((section) => {
    const getColumnWidth = () => {
      if (section.classList.contains('width-10')) return '10%';
      if (section.classList.contains('width-20')) return '20%';
      if (section.classList.contains('width-30')) return '30%';
      if (section.classList.contains('width-40')) return '40%';
      if (section.classList.contains('width-50')) return '50%';
      if (section.classList.contains('width-60')) return '60%';
      if (section.classList.contains('width-70')) return '70%';
      if (section.classList.contains('width-80')) return '80%';
      if (section.classList.contains('width-90')) return '90%';
      return 'remaining space';
    };
    section.dataset.aueLabel = `Column (${getColumnWidth()})`;
  });
}

function preserveSectionAttributes(oldSection, newSection) {
  moveAttributes(oldSection, newSection, [
    'id',
    'role',
    'tabindex',
    'aria-labelledby',
    'hidden',
  ]);
}

function updateLabels(main) {
  setTimeout(() => {
    const tabPanels = main.querySelectorAll('[role="tabpanel"]');
    tabPanels.forEach((tabPanel) => {
      const label = tabPanel.dataset.tabLabel;
      const suffix = ` (${label})`;
      if (!tabPanel.dataset.aueLabel.endsWith(suffix)) {
        tabPanel.dataset.aueLabel += suffix;
      }
      const tabId = tabPanel.getAttribute('aria-labelledby');
      const tab = main.querySelector(`#${tabId}`);
      if (tab) {
        tab.textContent = label;
      }
    });
  }, 100);
}

function getFirstRowDiv(element) {
  const allRows = element.querySelectorAll('div[data-aue-model^="table-col-"], div[data-aue-model="table-row"]');
  if (!allRows.length) return undefined;
  const firstRow = element.querySelector('div[data-aue-label="Row"][data-aue-model^="table-col-"], div[data-aue-label="Row"][data-aue-model="table-row"]');
  if (!firstRow) return undefined;
  return allRows[0] === firstRow ? firstRow : undefined;
}

function updateTableHeaderLabels(main) {
  const tableBlock = main.querySelectorAll('div.table.block');
  tableBlock.forEach((table) => {
    const rowElement = getFirstRowDiv(table);
    if (rowElement) {
      rowElement.dataset.aueLabel = 'Table Header';
    }
  });
}

async function applyChanges(event) {
  // redecorate default content and blocks on patches (in the properties rail)
  const { detail } = event;

  const resource = detail?.request?.target?.resource // update, patch components
    || detail?.request?.target?.container?.resource // update, patch, add to sections
    || detail?.request?.to?.container?.resource; // move in sections
  if (!resource) return false;
  const updates = detail?.response?.updates;
  if (!updates.length) return false;
  const { content } = updates[0];
  if (!content) return false;

  // load dompurify
  await loadScript(`${window.hlx.codeBasePath}/scripts/dompurify.min.js`);

  const sanitizedContent = window.DOMPurify.sanitize(content, { USE_PROFILES: { html: true } });
  const parsedUpdate = new DOMParser().parseFromString(sanitizedContent, 'text/html');
  const element = document.querySelector(`[data-aue-resource="${resource}"]`);

  if (element) {
    if (element.matches('main')) {
      const newMain = parsedUpdate.querySelector(`[data-aue-resource="${resource}"]`);
      newMain.style.display = 'none';
      element.insertAdjacentElement('afterend', newMain);
      decorateMain(newMain);
      decorateRichtext(newMain);
      await loadSections(newMain);
      element.remove();
      newMain.style.display = null;
      // eslint-disable-next-line no-use-before-define
      attachEventListners(newMain);
      return true;
    }

    const block = element.parentElement?.closest('.block[data-aue-resource]') || element?.closest('.block[data-aue-resource]');
    if (block) {
      const blockResource = block.getAttribute('data-aue-resource');
      const newBlock = parsedUpdate.querySelector(`[data-aue-resource="${blockResource}"]`);
      if (newBlock) {
        newBlock.style.display = 'none';
        block.insertAdjacentElement('afterend', newBlock);
        decorateButtons(newBlock);
        decorateIcons(newBlock);
        decorateBlock(newBlock);
        decorateRichtext(newBlock);
        await loadBlock(newBlock);
        block.remove();
        newBlock.style.display = null;
        return true;
      }
    } else {
      // sections and default content, may be multiple in the case of richtext
      const newElements = parsedUpdate.querySelectorAll(`[data-aue-resource="${resource}"],[data-richtext-resource="${resource}"]`);
      if (newElements.length) {
        const { parentElement } = element;
        if (element.matches('.section')) {
          const [newSection] = newElements;
          newSection.style.display = 'none';
          element.insertAdjacentElement('afterend', newSection);
          preserveSectionAttributes(element, newSection);
          decorateButtons(newSection);
          decorateIcons(newSection);
          decorateRichtext(newSection);
          decorateSections(parentElement);
          decorateBlocks(parentElement);
          await loadSections(parentElement);
          element.remove();
          newSection.style.display = null;
        } else {
          element.replaceWith(...newElements);
          decorateButtons(parentElement);
          decorateIcons(parentElement);
          decorateRichtext(parentElement);
        }
        return true;
      }
    }
  }

  return false;
}

function handleSelection(event) {
  const { detail, target } = event;
  if (!detail.selected) return;

  const tabPanel = target.closest('[role="tabpanel"]');
  if (tabPanel) {
    // select the tab item that controls this tab panel
    const tabItem = document.querySelector(`[aria-controls="${tabPanel.id}"]`);
    if (tabItem) tabItem.click();
  }
}

function attachEventListners(main) {
  [
    'aue:content-patch',
    'aue:content-update',
    'aue:content-add',
    'aue:content-move',
    'aue:content-remove',
    'aue:content-copy',
  ].forEach((eventType) => main?.addEventListener(eventType, async (event) => {
    event.stopPropagation();
    const applied = await applyChanges(event);
    if (applied) {
      showPercentage(document.querySelector('main'));
      updateLabels(document.querySelector('main'));
      updateTableHeaderLabels(document.querySelector('main'));
    } else {
      window.location.reload();
    }
  }));

  main.addEventListener('aue:ui-select', handleSelection);
}

const m = document.querySelector('main');
attachEventListners(m);
updateLabels(m);
showPercentage(m);
updateTableHeaderLabels(m);
