/* global WebImporter */
import { cleanUpSrcUrl } from '../utils/image-utils.js';
import { img } from './dom-builder.js';
import {hasGlobalElement, getRawHTMLDOM} from '../utils/dom-utils.js';

const acalog = (main, document, params) => {

  const acalogElements = main.querySelectorAll('.acalog');
  const htmlString = params.html;
  const mainBody = getRawHTMLDOM(htmlString);
    const acalogSections = mainBody.querySelectorAll('.acalog');
  if (acalogElements) {
    acalogElements.forEach((acalogElement, index) => {
      const isGlobal = hasGlobalElement(acalogSections[index]) ? 'true' : 'false';
    const cells = [
      ['Acalog Course List'],
      [isGlobal],
      [''],
      [''],
      [''],
    ];

    const block = WebImporter.DOMUtils.createTable(cells, document);
    acalogElement.replaceWith(block);
    });
  }
};
export default acalog;
