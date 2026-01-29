/* global WebImporter */
import createItem from './spotlightDuoItem.js';
import { hasGlobalElement, getRawHTMLDOM } from '../utils/dom-utils.js';

/**
 * Main importer for Duo Spotlight blocks
 */
const duoSpotlight = (main, document, params) => {
  // Select all Duo blocks in the page
  const duoBlocks = main.querySelectorAll(
    '#page-main-container .cs_control.CS_Element_Custom .section-spotlight .duo'
  );

  // Parse source HTML
  const htmlString = params.html;
  const mainBody = getRawHTMLDOM(htmlString);

  // Select Duo blocks from source HTML
  const duoSections = mainBody.querySelectorAll(
    '#page-main-container .cs_control.CS_Element_Custom .section-spotlight .duo'
  );

  Array.from(duoBlocks).forEach((duoParent, i) => {
    const duoSource = duoSections[i];
    if (!duoParent || !duoSource) return; // skip if missing

    const isGlobal = hasGlobalElement(duoSource) ? 'true' : 'false';
    const layoutStyle = duoSource.getAttribute('data-spotlight-layout') || 'duo-static';

    // Build base block
    const duoBlock = [
      ['Duo Spotlight'], // Title
      [isGlobal],
      [layoutStyle]
    ];

    // Create the Duo item
    const duoItem = createItem(duoParent, document, params);

    // Safely serialize: ensure array of arrays

    if (duoSource) {
         if (duoItem) {
            duoBlock.push(duoItem);
      }

  }

    // Replace original content with table block
    if (duoBlock.length > 1) {
      const block = WebImporter.DOMUtils.createTable(duoBlock, document);
      duoParent.replaceWith(block);
    }
  });
};

export default duoSpotlight;
