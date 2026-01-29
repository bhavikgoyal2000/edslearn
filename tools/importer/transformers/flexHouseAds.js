import createItem from './flexHouseAdsItem.js';
import {hasGlobalElement, getRawHTMLDOM} from '../utils/dom-utils.js';

const flexHouseAds = (main, document, params) => {
  let flexHouseAds = main.querySelectorAll('#page-main-container .cs_control.CS_Element_Custom .flex-house');  

  const htmlString = params.html;
  const mainBody = getRawHTMLDOM(htmlString);
  const flexHouseAdsSection = mainBody.querySelectorAll('#page-main-container .cs_control.CS_Element_Custom .flex-house');
  for (let i = 0; i < flexHouseAds.length; i++) {
    const flexHouseAdsParent = flexHouseAds[i];
    const isGlobal = hasGlobalElement(flexHouseAdsSection[i]) ? 'true' : 'false';
    const flexHouseAdsBlock = [['Flex House Ads'], [isGlobal]];
    if (flexHouseAdsParent) {
      let flexHouseAdsItem = createItem(flexHouseAdsParent, document, params);
      if (flexHouseAdsItem) {
        flexHouseAdsBlock.push(flexHouseAdsItem);
        }
      }
    if (flexHouseAdsBlock.length > 1) {
      const block = WebImporter.DOMUtils.createTable(flexHouseAdsBlock, document);
      //main.append(block);
      flexHouseAdsParent.replaceWith(block);
    }
  }
};

export default flexHouseAds;