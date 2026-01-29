import createItem from './rankListItem.js';
import {hasGlobalElement, getRawHTMLDOM} from '../utils/dom-utils.js';

const rankList = (main, document, params) => {

    let container  = params.rankListIcons;//main.querySelectorAll('#page-main-container .cs_control.CS_Element_Custom .nb-div')
    const htmlString = params.html;
  const mainBody = getRawHTMLDOM(htmlString);
  const rankListSection = mainBody.querySelectorAll('#page-main-container .cs_control.CS_Element_Custom .nb-div');
   
    for (let i = 0; i < container.length; i++) {
        const isGlobal = hasGlobalElement(rankListSection[i]) ? 'true' : 'false';
    let rank = container[i].querySelectorAll(':scope > ul > li');
    // Start array of items
    const rankBlock = [['Rank List']];
    rankBlock.push([isGlobal]);
    //const collapsibles = collapsiblesContainer ? collapsiblesContainer.children : [];
    let heading = container[i].querySelector('h3') ? container[i].querySelector('h3').textContent.trim() : '';
    let description = container[i].querySelector('p') ? container[i].querySelector('p').outerHTML.trim() : '';
    rankBlock.push([heading]);
    rankBlock.push([description]);
    for (let j = 0; j < rank.length; j++) {

        const rankParent = rank[j];
        if (rankParent) {
            let rankItem = createItem(rankParent, document);
            if (rankItem) {
                rankBlock.push(rankItem);
            }
        }
        
    }

    // Only create and append the table if there is at least one valid item
    if (rankBlock.length > 1) {
        const block = WebImporter.DOMUtils.createTable(rankBlock, document);
        main.append(block);
    }
}
};

export default rankList;