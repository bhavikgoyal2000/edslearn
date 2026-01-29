import { removeCfm } from '../utils/link-utils.js';

const customTextBlock = (main, document) => {
  const textBlocks = main.querySelectorAll('section.text-block');
  if (!textBlocks.length) return;

  textBlocks.forEach(blockEl => {
    // Only process blocks containing form, dl, dt, or table
    const hasForm = blockEl.querySelector('form');
    const hasDl = blockEl.querySelector('dl');
    const hasDt = blockEl.querySelector('dt');
    const hasTable = blockEl.querySelector('table');
    const primaryButtons = blockEl.querySelectorAll('.btn.btn-primary');
    primaryButtons.forEach(button => {
      const text = button.textContent.trim();
      button.href = removeCfm(button.href.trim());
      button.innerHTML = `<strong>${text}</strong>`;
    });

    const defaultButtons = blockEl.querySelectorAll('.btn.btn-default');
    defaultButtons.forEach(button => {
      button.href = removeCfm(button.href.trim());
    });
    
    if (!hasForm && !hasDl && !hasDt && !hasTable) return;

    // Clean up form URLs if any 
    if (hasForm) {
      const allLinks = blockEl.querySelectorAll('form[action], form option[value]');
      allLinks.forEach(el => {
        if (el.hasAttribute('action')) {
          el.setAttribute('action', removeCfm(el.getAttribute('action')));
        }
        if (el.tagName.toLowerCase() === 'option' && el.hasAttribute('value')) {
          el.setAttribute('value', removeCfm(el.getAttribute('value')));
        }
      });
    }

    // Create table block
    const cells = [
      ['Text Block'],
      ['Contains: ' + [
        hasForm ? 'Form' : '',
        hasDl ? 'DL' : '',
        hasDt ? 'DT' : '',
        hasTable ? 'Table' : '',
      ].filter(Boolean).join(', ')]
    ];

    const block = WebImporter.DOMUtils.createTable(cells, document);
    blockEl.replaceWith(block);
  });
};

export default customTextBlock;
