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

const createItem = (flex3BulletsParent, document) => {
    let flex3BulletsItem = []; 
    

    const flex3BulletsHeading = flex3BulletsParent.querySelector(':scope > header h1')?.textContent || '';

    const liElements = flex3BulletsParent.querySelectorAll(':scope > ul > li');
    const firstDiv = document.createElement('div');
    const secondDiv = document.createElement('div');
    const thirdDiv = document.createElement('div');
    firstDiv.append(mkP(flex3BulletsHeading,'flex3Bullets_headingTxt'));
    liElements.forEach((li, index) => {

      const element = li.querySelector('p')?.innerHTML || '';
      if (index === 0) {
        firstDiv.append(mkP(element,'flex3Bullets_headingTxt')); 
      } else if (index === 1) {
        secondDiv.append(mkP(element,'secondItem'));
      } else {
        thirdDiv.append(mkP(element,'thirdItem'));
      }
      
    });

    flex3BulletsItem.push([firstDiv]);
    flex3BulletsItem.push([secondDiv]);
    flex3BulletsItem.push([thirdDiv]);
    return flex3BulletsItem;
};

export default createItem;