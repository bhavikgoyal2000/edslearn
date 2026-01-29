/* global WebImporter */
import { cleanUpSrcUrl } from '../utils/image-utils.js';
import { img } from './dom-builder.js';

const render = (main, element, document) => {
   const allElements = element.querySelectorAll('.cs_control.CS_Element_Custom');
   allElements.forEach(ele => {
    const section = ele.querySelector('section');
    if (section) {
    if (section.classList.contains('text-block')) {
        main.append(section?.firstElementChild);
    }
}
});
};

const tabs = (main, document, params) => {
  
  const tabsContainers = main.querySelectorAll('div[data-element="2016 Tabbed Container"]');

  if (tabsContainers) {
    tabsContainers.forEach(tabsContainer => {

     const tabMenu = tabsContainer.querySelector('.tab-menu');
     const selectedTab = tabMenu.querySelector('.selected-tab');
     const allTabs = tabMenu.querySelectorAll('.tabs div');

     allTabs.forEach((tab, index) => {
        
        main.append(document.createElement('hr'));
        const sectionCells = [['Section Metadata'], ['blockModelId',  'tab-panel'], ['tab-label', tab.textContent]];

        tabsContainer.querySelectorAll('.content').forEach((contentDiv, contentIndex) => {
          if (index === contentIndex) {
            render(main, contentDiv, document);
          }
          });

        const sectionTable = WebImporter.DOMUtils.createTable(sectionCells, document);
        main.append(sectionTable);
        //if (index < allTabs.length - 1) {
       // main.append(document.createElement('hr'));
      //}
    });
    });
  }
};
  export default tabs;
