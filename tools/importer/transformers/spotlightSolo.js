import createItem from './spotlightSoloItem.js';
import {hasGlobalElement, getRawHTMLDOM} from '../utils/dom-utils.js';

const spotlightSolo = (main, document, params) => {
  let spotlightSolos = main.querySelectorAll('#page-main-container .cs_control.CS_Element_Custom .spotlight-solo');  

  const htmlString = params.html;
  const mainBody = getRawHTMLDOM(htmlString);
  const spotlightSoloSection = mainBody.querySelectorAll('#page-main-container .cs_control.CS_Element_Custom .spotlight-solo');
  for (let i = 0; i < spotlightSolos.length; i++) {
    const spotlightSoloParent = spotlightSolos[i];
    const isGlobal = hasGlobalElement(spotlightSoloSection[i]) ? 'true' : 'false';
    const spotlightSoloBlock = [['Solo Spotlight'], [isGlobal], ['solo-static']];
    if (spotlightSoloParent) {
      let spotlightSoloItem = createItem(spotlightSoloParent, document, params);
      if (spotlightSoloItem) {
        spotlightSoloBlock.push(spotlightSoloItem);
      }
    if (spotlightSoloBlock.length > 1) {
      const block = WebImporter.DOMUtils.createTable(spotlightSoloBlock, document);
      //main.append(block);
      spotlightSoloParent.replaceWith(block);
    }
  }
  }
};

export default spotlightSolo;