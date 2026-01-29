import createItem from './descriptionListItem.js';
import {hasGlobalElement, getRawHTMLDOM} from '../utils/dom-utils.js';

const descriptionList = (main, document, params) => {

    let descriptionList  = main.querySelectorAll('#page-main-container .cs_control.CS_Element_Custom dl')

    const htmlString = params.html;
    const mainBody = getRawHTMLDOM(htmlString);
    const descriptionListSection = mainBody.querySelectorAll('#page-main-container .cs_control.CS_Element_Custom dl');

    for (let j = 0; j < descriptionList.length; j++) {
        const cards = [];
        const cells = [];
        const descriptionListParent = descriptionList[j];
        const isGlobal = hasGlobalElement(descriptionListSection[j]) ? 'true' : 'false';
        if (descriptionListParent) {
            createItem(descriptionListParent, document, cards);
        }
    
        
    // Only create and append the table if there is at least one valid item
    if (cards.length > 0) {
        cells.push(['Description List']);
        cells.push([isGlobal]);
        cells.push(...cards);
        const block = WebImporter.DOMUtils.createTable(cells, document);
        //main.append(block);
        descriptionListParent.replaceWith(block);
    }
}
};

export default descriptionList;