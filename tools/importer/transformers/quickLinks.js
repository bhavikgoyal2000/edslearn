import {hasGlobalElement, getRawHTMLDOM} from '../utils/dom-utils.js';
import { removeCfm } from '../utils/link-utils.js';
// import utility for quickLinks
const quickLinks = (main, document) => {
  const figures = main.querySelectorAll('figure.list-group-container');
  if (!figures.length) return;

  figures.forEach(figure => {
    // --- Heading Text ---
    const isGlobal = hasGlobalElement(figure) ? 'true' : 'false';
    const caption = figure.querySelector('figcaption');
    const title = caption ? caption.textContent.trim() : '';

    // --- Detect list + style ---
    let listStyle = 'list-compact'; // default
    const list = figure.querySelector('ul, ol');

    if (list) {
      if (list.tagName.toLowerCase() === 'ol') {
        listStyle = 'list-ordered-task';
      } else {
        listStyle = 'list-unordered-task';
      }

      if (list.classList.contains('list-extra-compact')) {
        listStyle = 'list-extra-compact';
      }
    }

    // --- List Items ---
    const items = list ? Array.from(list.querySelectorAll('li')) : [];
    const joinedItems = items.map(li => li.innerHTML.trim()).join('\n');

    // --- Proper table structure ---
        const cells = [
          ['Quick Links'],
           [isGlobal],// block name
         // ['quickLinks_title', 'quickLinks_listStyle', 'quickLinks_listItem'], // header row
          [title, listStyle, items], // values row
        ];

    const block = WebImporter.DOMUtils.createTable(cells, document);
    figure.replaceWith(block);
  });
};

export default quickLinks;
