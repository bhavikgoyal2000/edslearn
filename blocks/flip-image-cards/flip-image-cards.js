import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
import { createDomElement, openCloseModalOnclick } from '../../scripts/util.js';

function extractParentDivsByKeywords(flipImageCardsBlocks) {
  const categorizedDivs = {
    squareDiv: [],
    bigSquareDiv: [],
    landscapeDiv: [],
    emptyDiv: [],
  };

  // Select all direct child divs of the container
  const childDivs = flipImageCardsBlocks;

  // Iterate through each child div
  childDivs.forEach((div) => {
    const pTags = div.querySelectorAll('p');

    // Check if the div contains "square"
    if (Array.from(pTags).some((p) => p.textContent.trim().toLowerCase() === 'square')) {
      categorizedDivs.squareDiv.push(div);
    }

    // Check if the div contains "bigsquare"
    if (Array.from(pTags).some((p) => p.textContent.trim().toLowerCase() === 'bigsquare')) {
      categorizedDivs.bigSquareDiv.push(div);
    }

    // Check if the div contains "landscape"
    if (Array.from(pTags).some((p) => p.textContent.trim().toLowerCase() === 'landscape')) {
      categorizedDivs.landscapeDiv.push(div);
    }

    if (pTags.length === 0) {
      // If no specific style is found, categorize it as "emptyDiv"
      categorizedDivs.emptyDiv.push(div);
    }
  });

  return categorizedDivs;
}

function extractFlipImageCardsFields(flipImageCardsBlocks) {
  const categorizedCards = {
    square: [],
    bigsquare: [],
    landscape: [],
  };

  flipImageCardsBlocks.forEach((cardContainer) => {
    const cardDivs = Array.from(cardContainer.children);
    const cardStyleDiv = cardDivs[0];
    const cardStyle = cardStyleDiv?.querySelector('p:nth-child(1)')?.textContent.trim();
    const flipText = cardStyleDiv?.querySelector('p:nth-child(2)')?.textContent.trim();

    // Validate card style
    if (!['square', 'bigsquare', 'landscape'].includes(cardStyle)) {
      return;
    }

    // Extract image src and alt from the second inner div
    const imageDiv = cardDivs[1];
    const img = imageDiv?.querySelector('picture img');
    const imgSrc = img?.getAttribute('src');
    const imgAlt = img?.getAttribute('alt');

    // Add card data to the appropriate category
    categorizedCards[cardStyle].push({
      cardStyle,
      flipText,
      image: {
        src: imgSrc,
        alt: imgAlt,
      },
    });
  });

  // Create the final JSON object
  const flipImageCardsJson = {
    cardsByStyle: categorizedCards,
  };

  return flipImageCardsJson;
}

function createModalDom(jsonData, index) {
  const container = document.createElement('div');
  const anchor = document.createElement('a');
  anchor.href = `#${index}`;
  anchor.className = 'visible-xs visible-sm bg-school-primary decor';
  anchor.setAttribute('role', 'button');
  anchor.setAttribute('data-bs-toggle', 'modal');
  anchor.setAttribute('data-bs-target', `#${index}`);
  anchor.setAttribute('title', '');

  const iconSpan = document.createElement('span');
  iconSpan.className = 'ion-information-circled';
  anchor.appendChild(iconSpan);

  const srOnlySpan = document.createElement('span');
  srOnlySpan.className = 'sr-only';
  srOnlySpan.textContent = 'Image info';
  anchor.appendChild(srOnlySpan);

  container.appendChild(anchor);

  // Create the modal structure
  const modalDiv = document.createElement('div');
  modalDiv.className = 'modal fade';
  modalDiv.setAttribute('tabindex', '-1');
  modalDiv.id = index;

  const modalDialogDiv = document.createElement('div');
  modalDialogDiv.className = 'modal-dialog';

  const modalContentDiv = document.createElement('div');
  modalContentDiv.className = 'modal-content';

  const modalHeaderDiv = document.createElement('div');
  modalHeaderDiv.className = 'modal-header';

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'btn-close';
  closeButton.setAttribute('data-bs-dismiss', 'modal');
  closeButton.setAttribute('aria-label', 'Close');

  modalHeaderDiv.appendChild(closeButton);
  modalContentDiv.appendChild(modalHeaderDiv);

  const modalBodyDiv = document.createElement('div');
  modalBodyDiv.className = 'modal-body';
  modalBodyDiv.textContent = jsonData.flipText;
  modalContentDiv.appendChild(modalBodyDiv);

  modalDialogDiv.appendChild(modalContentDiv);
  modalDiv.appendChild(modalDialogDiv);
  container.appendChild(modalDiv);

  return container;
}

function addFlipHoverEvent(element) {
  const figure = element.querySelector('figure');
  if (figure) {
    element.addEventListener('mouseenter', () => {
      figure.classList.add('hover');
    });

    element.addEventListener('mouseleave', () => {
      figure.classList.remove('hover');
    });
  }
}

function createFlipImageCardDom(cardData) {
  // Create the figure element
  const figure = document.createElement('figure');
  figure.className = 'tile';

  // Create the img element
  const img = createOptimizedPicture(
    cardData.image.src,
    cardData.image.alt || '',
    false,
    [{ width: '750' }],
  );
  figure.appendChild(img);

  // Create the figcaption element
  const figcaption = document.createElement('figcaption');
  figcaption.className = 'back has-blurb';

  // Create the div inside figcaption
  const div = document.createElement('div');
  div.className = 'flex-blurb';
  div.textContent = cardData.flipText;
  figcaption.appendChild(div);

  figure.appendChild(figcaption);

  return figure;
}

function createSquareDom(squareCardsData, squareDivsItem) {
  const squareCardDiv = document.createElement('div');
  squareCardDiv.classList.add('flipHover', squareCardsData.cardStyle);
  moveInstrumentation(squareDivsItem, squareCardDiv);

  const squareCardFlipDom = createFlipImageCardDom(squareCardsData);
  squareCardDiv.appendChild(squareCardFlipDom);

  const squareCardModalDom = createModalDom(squareCardsData, `modal-${Math.random().toString(5).substring(2, 7)}`);
  squareCardDiv.appendChild(squareCardModalDom);

  addFlipHoverEvent(squareCardDiv);

  return squareCardDiv;
}

function createSquareBigDom(cardData, bigSquareDivItem) {
  const squareBigCardDiv = document.createElement('div');
  squareBigCardDiv.classList.add('flipHover', cardData.cardStyle);
  moveInstrumentation(bigSquareDivItem, squareBigCardDiv);

  const squareCardBigFlipDom = createFlipImageCardDom(cardData);
  squareBigCardDiv.appendChild(squareCardBigFlipDom);

  const squareCardBigModalDom = createModalDom(cardData, `modal-${Math.random().toString(5).substring(2, 7)}`);
  squareBigCardDiv.appendChild(squareCardBigModalDom);

  addFlipHoverEvent(squareBigCardDiv);

  return squareBigCardDiv;
}

function createLandscapeDom(cardData, landscapeDivItem) {
  const landscapeCardDiv = document.createElement('div');
  landscapeCardDiv.classList.add('flipHover', cardData.cardStyle);
  moveInstrumentation(landscapeDivItem, landscapeCardDiv);

  const landscapeFlipDom = createFlipImageCardDom(cardData);
  landscapeCardDiv.appendChild(landscapeFlipDom);

  const landscapeModalDom = createModalDom(cardData, `modal-${Math.random().toString(5).substring(2, 7)}`);
  landscapeCardDiv.appendChild(landscapeModalDom);

  addFlipHoverEvent(landscapeCardDiv);

  return landscapeCardDiv;
}

function createFlex3Dom(jsonData, categorizedDivs) {
  const flex3div = createDomElement('div', 'flex-3');
  const flex3divInner = createDomElement('div', 'flex');

  const squareCards = jsonData.cardsByStyle.square;
  const landscapeCards = jsonData.cardsByStyle.landscape;
  const squareDivs = categorizedDivs.squareDiv;
  const landscapeDivs = categorizedDivs.landscapeDiv;

  if (landscapeCards.length > 0) {
    const flex3LandscapeDive = createLandscapeDom(landscapeCards[0], landscapeDivs[0]);
    flex3divInner.appendChild(flex3LandscapeDive);
  }

  if (squareCards.length > 0) {
    const flex3SquareDiv = createSquareDom(squareCards[0], squareDivs[0]);
    flex3divInner.appendChild(flex3SquareDiv);
  }

  if (squareCards.length > 1) {
    const flex3SquareDiv = createSquareDom(squareCards[1], squareDivs[1]);
    flex3divInner.appendChild(flex3SquareDiv);
  }

  if (landscapeCards.length > 1) {
    const flex3LandscapeDive = createLandscapeDom(landscapeCards[1], landscapeDivs[1]);
    flex3divInner.appendChild(flex3LandscapeDive);
  }
  flex3div.appendChild(flex3divInner);
  return flex3div;
}

function createFlex2Dom(jsonData, bigSquareDiv) {
  const flex2div = createDomElement('div', 'flex-2');
  if (jsonData.cardsByStyle.bigsquare.length > 0) {
    const squareBigCards = jsonData.cardsByStyle.bigsquare;
    const squareBigDiv = createSquareBigDom(squareBigCards[0], bigSquareDiv[0]);
    flex2div.appendChild(squareBigDiv);
  }
  return flex2div;
}

function createFlex1Dom(jsonData, squareDivs) {
  const flex1div = createDomElement('div', 'flex-1');
  if (jsonData.cardsByStyle.square.length > 0) {
    const squareCards = jsonData.cardsByStyle.square;

    // Process only the first two items
    const itemsToProcess = squareCards.slice(0, 2);
    itemsToProcess.forEach((item, index) => {
      const cardDiv = createSquareDom(item, squareDivs[index]);
      flex1div.appendChild(cardDiv);
    });
  }
  return flex1div;
}

function createFlipImageCardsDom(flipImageCardsJson, layoutType, categorizedDivs) {
  const flipImageCardsSection = createDomElement('section', 'el-gallery-grid,grid-1-2,clearfix');
  const flipImageCardsDiv = createDomElement('div', 'row,row-center');
  const flipImageCardsFlex = createDomElement('div', 'flex');

  const f1Dom = createFlex1Dom(flipImageCardsJson, categorizedDivs.squareDiv);

  // Remove the first two items from the "square" array
  flipImageCardsJson.cardsByStyle.square = flipImageCardsJson.cardsByStyle.square.slice(2);

  // Remove the first 2 items from the "squareDiv" array
  categorizedDivs.squareDiv = categorizedDivs.squareDiv.slice(
    2,
    categorizedDivs.squareDiv.length,
  );

  const f2Dom = createFlex2Dom(flipImageCardsJson, categorizedDivs.bigSquareDiv);
  const f3Dom = createFlex3Dom(flipImageCardsJson, categorizedDivs);

  if (layoutType === 'layout1') {
    flipImageCardsFlex.appendChild(f1Dom);
    flipImageCardsFlex.appendChild(f2Dom);
    flipImageCardsFlex.appendChild(f3Dom);
  } else if (layoutType === 'layout2') {
    flipImageCardsFlex.appendChild(f3Dom);
    flipImageCardsFlex.appendChild(f1Dom);
    flipImageCardsFlex.appendChild(f2Dom);
  }
  flipImageCardsDiv.appendChild(flipImageCardsFlex);
  flipImageCardsSection.appendChild(flipImageCardsDiv);

  return flipImageCardsSection;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const innerDivs = Array.from(block.children);
  const flipImageCardsBlocks = innerDivs.slice(1);
  const categorizedDivs = extractParentDivsByKeywords(flipImageCardsBlocks);

  // Extract layout type
  const layoutTypeDiv = flipImageCardsBlocks[0];
  const layoutType = layoutTypeDiv ? layoutTypeDiv.textContent.trim() : 'none';

  const flipImageCardsJson = extractFlipImageCardsFields(flipImageCardsBlocks);

  block.textContent = '';
  if (categorizedDivs.emptyDiv.length > 0) {
    categorizedDivs.emptyDiv.forEach((element) => {
      block.appendChild(element);
    });
  }
  if (
    flipImageCardsJson.cardsByStyle.square.length !== 0
    || flipImageCardsJson.cardsByStyle.bigsquare.length !== 0
    || flipImageCardsJson.cardsByStyle.landscape.length !== 0
  ) {
    const flipImageCardsContainer = createFlipImageCardsDom(
      flipImageCardsJson,
      layoutType,
      categorizedDivs,
    );
    openCloseModalOnclick(flipImageCardsContainer);
    block.appendChild(flipImageCardsContainer);
  }
}
