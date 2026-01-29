import createCollapsibleItem from './collapsibleItem.js';
import { hasGlobalElement, getRawHTMLDOM } from '../utils/dom-utils.js';
const collapsible = (main, document) => {

   const allContainers = main.querySelectorAll('#page-main-container .cs_control.CS_Element_Custom');

   // Filter only containers that have an immediate child <section> with class "collapsible"
   const containers = Array.from(allContainers).filter(container =>
     Array.from(container.children).some(child => child.matches('section.collapsible'))
   );

    for (let i = 0; i < containers.length; i++) {
    let collapsibles = containers[i].querySelectorAll('section.collapsible');
    // Start array of items
        // Check if any collapsible is "global"
        const isGlobal = Array.from(collapsibles).some(el => hasGlobalElement(el)) ? 'true' : 'false';

        // Start table: first row = block name, second row = isGlobal
          const collapsiblesBlock = [['Collapsibles'], [isGlobal]];
    //const collapsibles = collapsiblesContainer ? collapsiblesContainer.children : [];

    for (let j = 0; j < collapsibles.length; j++) {

        const collapsibleParent = collapsibles[j];
        if (collapsibleParent) {
            let collapsibleItem = createCollapsibleItem(collapsibleParent, document);
            if (collapsibleItem) {
                collapsiblesBlock.push(collapsibleItem);
            }
        }

    }

    // Only create and append the table if there is at least one valid item
    if (collapsiblesBlock.length > 1) {
        const block = WebImporter.DOMUtils.createTable(collapsiblesBlock, document);
        containers[i].replaceWith(block);
    }
}
};

export default collapsible;