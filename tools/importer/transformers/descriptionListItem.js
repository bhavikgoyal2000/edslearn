/* global WebImporter */
import { cleanUpSrcUrl, buildImageElement } from '../utils/image-utils.js';
import { removeCfm } from '../utils/link-utils.js';

const mkP = (text = '', fieldName) => {
    const div = document.createElement('div');
    if (fieldName) {
    const p = document.createElement('p');
    div.innerHTML = `<!-- field:${fieldName} -->`;
    p.append(text);
    div.appendChild(p);
    }
    return div;
  };

const createItem = (descriptionListParent, document, cards) => {
    const descriptionListItem = [];

const descriptionListChildren = descriptionListParent.querySelectorAll('dt'); 

descriptionListChildren.forEach((dt) => {
  const key = dt.textContent.trim(); // The value of the dt
  let descriptionText = '';
  
  // Collect all dd elements associated with this dt
  let dd = dt.nextElementSibling; // The dd element right after dt
  while (dd && dd.tagName.toLowerCase() === 'dd') {
    descriptionText += dd.textContent.trim() + '\n'; 
    dd = dd.nextElementSibling;
  }

  descriptionText = descriptionText.trim();

  if (key && key.length > 0 && descriptionText && descriptionText.length > 0) {
  const firstDiv = document.createElement('div');
  const secondDiv = document.createElement('div');
  firstDiv.append(mkP(key, 'key'));
  secondDiv.append(mkP(descriptionText, 'value'));
  cards.push([firstDiv, secondDiv]);
  }

});   
};

export default createItem;