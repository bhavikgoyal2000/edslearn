import createItem from './flexFactsItem.js';
import {hasGlobalElement, getRawHTMLDOM} from '../utils/dom-utils.js';

const flexFacts = (main, document, params) => {

    let flexFactsContainer  = main.querySelectorAll('#page-main-container .cs_control.CS_Element_Custom div.flex-fact')
    
    const htmlString = params.html;
  const mainBody = getRawHTMLDOM(htmlString);
    const flexFactsSection = mainBody.querySelectorAll('#page-main-container .cs_control.CS_Element_Custom div.flex-fact');

    for (let i = 0; i < flexFactsContainer.length; i++) {
    //let flexFacts = flexFactsContainer[i].querySelectorAll('div.flex-fact');
    // Start array of items
    const flexFactsBlock = [['Flex Facts']];
    const flexFactsParent = flexFactsContainer[i];
    if (flexFactsParent) {
        const isGlobal = hasGlobalElement(flexFactsSection[i]) ? 'true' : 'false';
        flexFactsBlock.push([isGlobal]);
        let flexFactsItem = createItem(flexFactsParent, document);
        if (flexFactsItem) {
            flexFactsBlock.push(flexFactsItem);
        }
    }

    // Only create and append the table if there is at least one valid item
    if (flexFactsBlock.length > 1) {
        const block = WebImporter.DOMUtils.createTable(flexFactsBlock, document);
        //main.append(block);
        flexFactsParent.replaceWith(block);
    }
}
};

export default flexFacts;