/* global WebImporter */

function loadColorMap() {
    const myMap = new Map();
    myMap.set('bg-suffragist-purple','bg-suffragist-purple-color');
    myMap.set('bg-arboretum-green','bg-arboretum-green-color');
    myMap.set('bg-embassy-blue','bg-embassy-blue-color');
    myMap.set('bg-intern-blue','bg-intern-blue-color');
    myMap.set('bg-kays-flame-yellow','bg-kay-flame-yellow-color');
    myMap.set('bg-metro-silver','bg-metro-silver-color');
    myMap.set('bg-rowhouse-red','bg-rowhouse-red-color');
    myMap.set('bg-talon-gray','bg-talon-grey-color');
    myMap.set('bg-default-ombre','bg-default-ombre-color');
    return myMap;
}

function getColor(classList) {
    let colorMap = loadColorMap();
    for (const className of classList) {
        if (colorMap.has(className)) {
            return colorMap.get(className);
        }
    }
    return undefined;
}

const createCollapsibleItem = (collapsibleParent, document) => {
    let collapsibleItem = [];

    const collapsibles = collapsibleParent.querySelector('header');
    const classList = [...collapsibles.classList];

      // Find the class that starts with "collapse-" and map to schema value
      const gradClass = classList.find(c => c.startsWith('bg-')) || 'bg-default-ombre';
      const colorMap = loadColorMap();
      let colorName = colorMap.get(gradClass) || 'bg-default-ombre-color';;
    const titleElement = collapsibleParent.querySelector('h1, h2, h3, h4, h5, h6');
    const firstDiv = document.createElement('div');
    const title = titleElement.textContent;
    const descElement = collapsibleParent.querySelector(':scope > div.collapse');
    const descNodes = descElement.childNodes;

    // First div with color, title, and heading tag
    const firstDivPTag = document.createElement('p');
    firstDivPTag.append(colorName);
    const secondDivPTag = document.createElement('p');
    secondDivPTag.append(title);
    const thirdDivPTag = document.createElement('p');
    thirdDivPTag.append(titleElement.tagName.toLowerCase());
    firstDiv.append(firstDivPTag);
    firstDiv.append(secondDivPTag);
    firstDiv.append(thirdDivPTag);

    // Second div: preserve full HTML of h1-h6 and p elements
    const text = document.createElement('div');
    descNodes.forEach((node) => {
        text.append(node.cloneNode(true));
    });

    if (firstDiv.textContent.trim() !== '' && text.textContent.trim() !== '') {
        collapsibleItem.push([firstDiv]);
        collapsibleItem.push([text]);
        return collapsibleItem;
    }

    return undefined; // Return undefined if no valid content is found
};

export default createCollapsibleItem;