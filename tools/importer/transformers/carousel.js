import createItem from './carouselItem.js';

const carousel = (main, document) => {

    let container  = main.querySelectorAll('#page-main-container .cs_control.CS_Element_Custom .features-carousel-container')
    
    for (let i = 0; i < container.length; i++) {
    let carousel = container[i].querySelectorAll('div.swiper-slide');
    // Start array of items
    const carouselBlock = [['Carousel']];
    //const collapsibles = collapsiblesContainer ? collapsiblesContainer.children : [];

    for (let j = 0; j < carousel.length; j++) {

        const carouselParent = carousel[j];
        if (carouselParent) {
            let carouselItem = createItem(carouselParent, document);
            if (carouselItem) {
                carouselBlock.push(carouselItem);
            }
        }
        
    }

    // Only create and append the table if there is at least one valid item
    if (carouselBlock.length > 1) {
        const block = WebImporter.DOMUtils.createTable(carouselBlock, document);
        main.append(block);
    }
}
};

export default carousel;