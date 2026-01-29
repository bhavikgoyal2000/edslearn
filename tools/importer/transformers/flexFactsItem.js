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

const createItem = (flexFactsParent, document) => {
    let flexFactsItem = [];
    let ctaLinkElement = flexFactsParent.parentElement.querySelector('a.fact-link') || '';
    let classes = flexFactsParent.classList;
    let flexFactsType = '';
    if (classes.contains('fact-percentage')) {
        flexFactsType = 'ls-percentage';
    } else if (classes.contains('fact-big-number')) {
        flexFactsType = 'ls-big-number';
    } else if (classes.contains('fact-ranking')) {
        flexFactsType = 'ls-ranking ';
    }
    const flexFactsPTags = flexFactsParent.querySelector(':scope > .flex-center');
    let factsAbove = flexFactsPTags?.querySelector('.fact-above')?.textContent || '';
    const el = flexFactsPTags?.querySelector('.fact-focus');
    const factsFocus = el ? [...el.childNodes]
      .filter(n => n.nodeType === Node.TEXT_NODE)
      .map(n => n.textContent.trim())
      .join(' ') : '';

    const flexFactsBelow = flexFactsParent.querySelector(':scope > .fact-below')?.textContent || '';

    const flexFactsAttributionText = flexFactsParent.querySelector(':scope > .fact-attrib')?.textContent || '';

  const firstDiv = document.createElement('div');
  firstDiv.append(mkP('size-standard','flexFact_elementSize')); 
  firstDiv.append(mkP(factsAbove,'flexFact_textAboveFocus'));
  firstDiv.append(mkP(flexFactsType,'flexFact_layoutStyle'));
  firstDiv.append(mkP());           
  firstDiv.append(mkP(factsFocus,'flexFact_factFocalTxt'));
  firstDiv.append(mkP());            
  firstDiv.append(mkP(flexFactsBelow, 'flexFact_textbelowFocus'));
  firstDiv.append(mkP());
  firstDiv.append(mkP(flexFactsAttributionText,'flexFact_attributionTxt'));
  //firstDiv.append(mkP('footnote'));
  
  console.log(firstDiv);

  const linkWrap = mkP();
  linkWrap.classList.add('button-container');
  if (ctaLinkElement) {
    const a = document.createElement('a');
    a.href = removeCfm(ctaLinkElement.getAttribute('href')) || '';
    a.textContent = ctaLinkElement.textContent || '';
    linkWrap.append(a);
  }
  firstDiv.append(linkWrap);



  if (firstDiv.textContent.trim() !== '') {

    //flexFactsItem.push([`size-standard`, factsAbove, flexFactsType, '', factsFocus, '',flexFactsBelow,'', flexFactsAttributionText]);
    flexFactsItem.push([firstDiv]);
    return flexFactsItem;
  }

    return undefined; // Return undefined if no valid content is found
};

export default createItem;