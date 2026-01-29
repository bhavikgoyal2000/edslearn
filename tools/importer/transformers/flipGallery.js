import createItem from './flipGalleryItem.js';
import {hasGlobalElement, getRawHTMLDOM} from '../utils/dom-utils.js';
const mkP = (text = '', fieldName, className) => {
    const div = document.createElement('div');
    if (fieldName) {
    const p = document.createElement('p');
    if (className) {
      p.className = className;
    }
    div.innerHTML = `<!-- field:${fieldName} -->`;
    p.append(text);
    div.appendChild(p);
    }
    return div;
  };

const flipGallery = (main, document, params) => {
  let groups = main.querySelectorAll('section[data-element="2016 Flip Gallery Container"]');

  // Group by parent of article (section/class/id)
  
  const htmlString = params.html;
  const mainBody = getRawHTMLDOM(htmlString);
  const flipGallerySection = mainBody.querySelectorAll('section[data-element="2016 Flip Gallery Container"]');
  

  for (let i = 0; i < groups.length; i++) {
  
    const flipGalleryParent = groups[i];
    const isGlobal = hasGlobalElement(flipGallerySection[i]) ? 'true' : 'false';
    const cards = [];
    const cells = [];
    if (flipGalleryParent) {
      createItem(flipGalleryParent, document, cards, params);
    }
    if (cards.length > 0) {
      cells.push(['Flip Image Cards']);
      cells.push([isGlobal]);
      cells.push([mkP('layout1','flipImageCards_layout')]);
      cells.push(...cards);
      const block = WebImporter.DOMUtils.createTable(cells, document);
      //main.append(block);
      flipGalleryParent.replaceWith(block);
    }
  }
};

export default flipGallery;