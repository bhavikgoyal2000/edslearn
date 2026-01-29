import createItem from './featuredEventsItem.js';

const featuredEvents = (main, document) => {
  let featuredEvents = main.querySelectorAll('#page-main-container .cs_control.CS_Element_Custom .flex-event');  
  featuredEvents.forEach(featuredEvent => {
    const featuredEventsBlock = [['Flex Events'],[false]];
      if (featuredEvent) {
        let featuredEventsItem = createItem(featuredEvent, document);
        if (featuredEventsItem) {
          featuredEventsBlock.push(featuredEventsItem);
        }
      }
    if (featuredEventsBlock.length > 1) {
      const block = WebImporter.DOMUtils.createTable(featuredEventsBlock, document);
      featuredEvent.replaceWith(block);
    }
  });
};

export default featuredEvents;