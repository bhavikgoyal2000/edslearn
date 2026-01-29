import createItem from './flex3bulletsItem.js';
import {hasGlobalElement, getRawHTMLDOM} from '../utils/dom-utils.js';

const flex3bullets = (main, document, params) => {

    let flex3BulletsContainer  = main.querySelectorAll('#page-main-container .cs_control.CS_Element_Custom div.flex-three')
    const htmlString = params.html;
  const mainBody = getRawHTMLDOM(htmlString);
    const flex3BulletsSection = mainBody.querySelectorAll('#page-main-container .cs_control.CS_Element_Custom div.flex-three');

    for (let i = 0; i < flex3BulletsContainer.length; i++) {
    let flexFacts = flex3BulletsContainer[i];
    // Start array of items
    const flexFactsBlock = [['Flex 3 Bullets']];
     const isGlobal = hasGlobalElement(flex3BulletsSection[i]) ? 'true' : 'false';
        const flexFactsParent = flexFacts;
        flexFactsBlock.push([isGlobal]);
        if (flexFactsParent) {
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

export default flex3bullets;