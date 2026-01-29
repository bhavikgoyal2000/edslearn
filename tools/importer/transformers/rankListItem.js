/* global WebImporter */

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

  const mkPHTML = (text = '', fieldName) => {
    const div = document.createElement('div');
    if (fieldName) {
    const p = document.createElement('p');
    div.innerHTML = `<!-- field:${fieldName} -->`;
    p.innerHTML = text;
    div.appendChild(p);
    }
    return div;
  };

const createItem = (rankParent, document) => {
    let rankItem = []; 
    let spanTag = rankParent.querySelector(':scope > span')?.textContent.trim() || '';
    const descTag = rankParent.querySelector(':scope > p')?.innerHTML.trim() || '';
  const firstDiv = document.createElement('div');
  firstDiv.append(mkP(spanTag,'rankListItem_figureTxt')); 
  firstDiv.append(mkPHTML(descTag,'rankListItem_description'));
  
  if (firstDiv.hasChildNodes()) {

    //rankItem.push([`size-standard`, factsAbove, flexFactsType, '', factsFocus, '',flexFactsBelow,'', flexFactsAttributionText]);
    rankItem.push([firstDiv]);
    return rankItem;
  }

    return undefined; // Return undefined if no valid content is found
};

export default createItem;