import createDataLayerEvent from '../../scripts/analytics-util.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function createSoloMainContainer(data) {
  const section = document.createElement('section');
  section.className = 'section-spotlight spotlight-solo image-right spotlighted';
  if (data.image_layout === 'full-width') {
    section.classList.add('spotlight-fullwidth', 'one-third');
  }
  if (data.image_layout === 'one-third') {
    section.classList.add('one-third');
  }
  section.id = `solo-spotlight-${data.cookieId}`;
  return section;
}

function createHeader(tagline) {
  const header = document.createElement('div');
  const h1 = document.createElement('h1');
  header.className = 'spotlight-header';
  h1.className = '';
  h1.textContent = tagline;
  header.appendChild(h1);
  return header;
}

function createOmbreBar() {
  const ombreBar = document.createElement('div');
  ombreBar.className = 'spotlight-ombre-bar';
  return ombreBar;
}

function createImagePanelHeading(imageData, cookieId) {
  const panelHeading = document.createElement('div');
  panelHeading.className = 'panel-heading';
  panelHeading.id = `heading-left-${cookieId}`;

  const panelTitle = document.createElement('div');
  panelTitle.className = 'panel-title';

  const img = document.createElement('img');
  img.src = imageData.src;
  img.alt = imageData.alt;
  img.className = 'is-decorative';

  panelTitle.appendChild(img);
  panelHeading.appendChild(panelTitle);
  return panelHeading;
}

function createButtonElement(ctaData) {
  if (ctaData && Array.isArray(ctaData) && ctaData.length >= 2) {
    const [ctaText, ctaHref] = ctaData;
    const ctaButton = document.createElement('a');
    ctaButton.textContent = ctaText;
    ctaButton.className = 'btn btn-default';
    ctaButton.href = ctaHref;
    ctaButton.setAttribute('target', '_blank');
    ctaButton.setAttribute('rel', 'noopener noreferrer');
    ctaButton.setAttribute('aria-label', `Link to ${ctaText}`);
    return ctaButton;
  }
  return null;
}

function createPanelCollapse(data) {
  const panelCollapse = document.createElement('div');
  panelCollapse.id = `panel-left-${data.cookieId}`;
  panelCollapse.className = 'panel-collapse';
  panelCollapse.setAttribute('aria-labelledby', `heading-left-${data.cookieId}`);

  const panelBody = document.createElement('div');
  panelBody.className = 'panel-body';

  const bylineH1 = document.createElement('h1');
  bylineH1.className = 'byline';
  bylineH1.textContent = data.header;

  const bylineSub1 = document.createElement('p');
  bylineSub1.className = 'byline-sub';
  bylineSub1.textContent = data.subheading1;

  const bylineSub2 = document.createElement('p');
  bylineSub2.className = 'byline-sub-b';
  bylineSub2.textContent = data.subheading2;

  const blockquote = document.createElement('blockquote');
  blockquote.textContent = data.pull_quote;

  const storyTextDiv = document.createElement('div');
  storyTextDiv.className = 'story-text';
  storyTextDiv.innerHTML = data.story_text;

  // Check if data.cta2 exists before creating and appending the button
  if (data.cta2) {
    const ctaButton = createButtonElement(data.cta2);
    if (ctaButton) {
      storyTextDiv.appendChild(ctaButton);
    }
  }

  panelBody.append(bylineH1, bylineSub1, bylineSub2, blockquote, storyTextDiv);
  panelCollapse.appendChild(panelBody);
  return panelCollapse;
}

function createSpotlightContent(cookieId, contentData) {
  const spotlightContainer = document.createElement('div');
  spotlightContainer.className = 'col-xs-12 spotlight-container no-bs-padding clearfix';

  const panelGroup = document.createElement('div');
  panelGroup.className = 'panel-group';
  panelGroup.id = `spotlight-${cookieId}`;

  const panel = document.createElement('div');
  panel.className = 'panel panel-default';

  // Apply full-width background if needed
  if (contentData.image_layout === 'full-width' && contentData.spotlight_image) {
    panel.style.background = `
      linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), 
      url(${contentData.spotlight_image.src})
    `;
  }

  // Add image heading if available
  if (contentData.spotlight_image) {
    panel.appendChild(createImagePanelHeading(contentData.spotlight_image, cookieId));
  }

  // Add panel collapse content
  panel.appendChild(createPanelCollapse(contentData));

  panelGroup.appendChild(panel);
  spotlightContainer.appendChild(panelGroup);

  return spotlightContainer;
}

function createSwapButton(direction, cookieId) {
  const button = document.createElement('div');
  button.className = `col-xs-6 ${direction}-button`;
  button.id = `${direction}-swap-button-${cookieId}`;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  // svg.className = 'swap-arrow';
  svg.setAttribute('class', 'swap-arrow');
  svg.setAttribute('width', '40');
  svg.setAttribute('height', '20.57');
  svg.setAttribute('viewBox', '0 0 44.013 20.57');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.id = 'arrow';
  if (direction === 'left') {
    path.setAttribute('d', 'M9.657,20.288.283,10.967a.963.963,0,0,1,0-1.364L9.657.282a.967.967,0,0,1,1.366,0l.569.568a.963.963,0,0,1,0,1.364l-6.754,6.7H43.047a.965.965,0,0,1,.966.964v.8a.965.965,0,0,1-.966.964H4.838l6.754,6.7a.963.963,0,0,1,0,1.364l-.569.568A.967.967,0,0,1,9.657,20.288Z');
  } else {
    path.setAttribute('d', 'M34.355,20.288l9.375-9.321a.963.963,0,0,0,0-1.364L34.355.282a.967.967,0,0,0-1.366,0L32.42.851a.963.963,0,0,0,0,1.364l6.754,6.7H.966A.965.965,0,0,0,0,9.883v.8a.965.965,0,0,0,.966.964H39.175l-6.754,6.7a.963.963,0,0,0,0,1.364l.569.568A.967.967,0,0,0,34.355,20.288Z');
  }
  path.setAttribute('fill', '#fff');

  svg.appendChild(path);
  button.appendChild(svg);
  return button;
}

function createButtonContainer(cookieId) {
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'button-container row row-center';

  // Create and append the left and right buttons
  buttonContainer.appendChild(createSwapButton('left', cookieId));
  buttonContainer.appendChild(createSwapButton('right', cookieId));
  return buttonContainer;
}

function createSoloSpotlightDOM(data, childBlock, length) {
  const container = createSoloMainContainer(data);
  const rowElement = document.createElement('div');
  rowElement.className = 'row row-center';
  container.appendChild(rowElement);
  rowElement.appendChild(createHeader(data.tagline));
  rowElement.appendChild(createOmbreBar());

  const spotlightContent = createSpotlightContent(data.cookieId, data);

  if (data.spotlightVariation === 'solo-static' && length > 1) {
    spotlightContent.appendChild(createButtonContainer(data.cookieId));
  }

  if (window.top.location.href.includes('universal-editor')) {
    moveInstrumentation(childBlock, spotlightContent);
  }

  rowElement.appendChild(spotlightContent);
  return container;
}

function labelSpotlightData(dataArray, displayStyle = ' ') {
  return {
    spotlightVariation: displayStyle || '',
    cookieId: dataArray[0] || '',
    tagline: dataArray[1] || '',
    header: dataArray[2] || '',
    subheading1: dataArray[3] || '',
    subheading2: dataArray[4] || '',
    pull_quote: dataArray[5] || '',
    spotlight_image: dataArray[6] || null,
    image_layout: dataArray[7] || '',
    story_text: dataArray[8] || '',
    cta2: dataArray[9] || '',
  };
}

function extractSpotlightContainerData(containerElement) {
  const children = Array.from(containerElement.children);

  const spotlight = children.map((child, index) => {
    if (index === 8) {
      return child.innerHTML.trim();
    }
    const ps = child.querySelectorAll('p');
    const img = child.querySelector('picture img');
    if (img) {
      return {
        type: 'image',
        src: img.getAttribute('src'),
        alt: img.getAttribute('alt') || '',
      };
    }
    if (ps.length > 0) {
      const texts = Array.from(ps).map((p) => p.textContent.trim());
      return texts.length === 1 ? texts[0] : texts;
    }
    return null;
  });
  return { spotlight };
}

function initializeSpotlightCarousel(section) {
  const spotlightItems = Array.from(section.querySelectorAll('.section-spotlight'));

  if (spotlightItems.length === 0) {
    return;
  }

  let currentIndex = 0;

  const showItem = (index) => {
    spotlightItems.forEach((item) => {
      item.style.display = 'none';
    });
    spotlightItems[index].style.display = 'block';
    currentIndex = index;
  };

  const changeItem = (direction) => {
    const newIndex = (currentIndex + direction + spotlightItems.length) % spotlightItems.length;
    showItem(newIndex);
  };

  spotlightItems.forEach((item) => {
    const leftButton = item.querySelector('.left-button');
    const rightButton = item.querySelector('.right-button');

    if (leftButton) leftButton.addEventListener('click', () => changeItem(-1));
    if (rightButton) rightButton.addEventListener('click', () => changeItem(1));
  });

  // Initialize with the first item
  showItem(0);
}

function getAllCookieIds(items) {
  return items
    .map((item) => {
      const firstDiv = item.querySelector('div');
      const id = firstDiv ? firstDiv.textContent.trim() : null;
      return id && id.length > 0 ? id : null;
    })
    .filter((id) => id !== null);
}

// Validate uniqueness
function validateUniqueIds(ids) {
  const unique = new Set(ids);
  return unique.size === ids.length;
}

// Handle localStorage read
function getSeenItems(storageKey = 'SpolightSeen') {
  try {
    const seenItemsString = localStorage.getItem(storageKey);
    return seenItemsString ? JSON.parse(seenItemsString) : [];
  } catch (e) {
    return [];
  }
}

// Handle localStorage write
function saveSeenItems(items, storageKey = 'SpolightSeen') {
  localStorage.setItem(storageKey, JSON.stringify(items));
}

// Reset only block-specific IDs
function resetSeenItemsIfAllSeen(allCookieIds, seenItems, storageKey = 'SpolightSeen') {
  const allSeen = allCookieIds.every((id) => seenItems.includes(id));
  if (allSeen) {
    const filtered = seenItems.filter((id) => !allCookieIds.includes(id));
    saveSeenItems(filtered, storageKey);
    return filtered;
  }
  return seenItems;
}

function findAndExtractFirstUnseenSpotlight(parentBlock, displayStyle) {
  const allItems = parentBlock.slice(1);
  if (allItems.length === 0) return null;

  const allCookieIds = getAllCookieIds(allItems);

  let seenItems = getSeenItems();
  seenItems = resetSeenItemsIfAllSeen(allCookieIds, seenItems);

  const unseenItem = allItems.find((item) => {
    const firstDiv = item.querySelector('div');
    const uniqueId = firstDiv ? firstDiv.textContent.trim() : null;
    return !seenItems.includes(uniqueId);
  });

  if (unseenItem) {
    const firstDiv = unseenItem.querySelector('div');
    const uniqueId = firstDiv ? firstDiv.textContent.trim() : null;
    const extractedData = extractSpotlightContainerData(unseenItem);
    const labeledData = labelSpotlightData(extractedData.spotlight, displayStyle);

    seenItems.push(uniqueId);
    saveSeenItems(seenItems);

    return labeledData;
  }
  return null;
}

export default function decorate(block) {
  const parentBlock = Array.from(block.children).slice(1);
  const [firstBlock, ...childBlocks] = parentBlock;

  if (!firstBlock) return; // safety check

  const firstExtractedData = extractSpotlightContainerData(firstBlock);
  const displayStyle = firstExtractedData.spotlight?.[0] || '';
  const spotlightItemLength = childBlocks.length;

  const section = document.createElement('div');
  section.className = 'spotlight-wrapper';

  // ---- Utility: render multiple spotlight items ----
  const renderSpotlightItems = (children, style, length, container) => {
    children.forEach((childBlock) => {
      const extractedData = extractSpotlightContainerData(childBlock);
      const labeledData = labelSpotlightData(extractedData.spotlight, style);
      const spotlightContainer = createSoloSpotlightDOM(labeledData, childBlock, length);
      container.appendChild(spotlightContainer);
    });
  };

  // ---- Utility: show error ----
  const renderError = (msg, container) => {
    const errorTag = document.createElement('p');
    errorTag.className = 'no-results';
    errorTag.textContent = msg;
    container.appendChild(errorTag);
  };

  // ---- Case 1: solo-static ----
  if (displayStyle === 'solo-static') {
    renderSpotlightItems(childBlocks, displayStyle, spotlightItemLength, section);

    if (spotlightItemLength > 1) {
      initializeSpotlightCarousel(section);
    }

  // ---- Case 2: solo-cookie-based + editor mode ----
  } else if (displayStyle === 'solo-cookie-based' && window.top.location.href.includes('universal-editor')) {
    const allCookieIds = getAllCookieIds(childBlocks);

    if (!validateUniqueIds(allCookieIds)) {
      renderError('Duplicate cookie IDs found in spotlight items. Each item must have a unique ID.', section);

      // Still extract items (but don’t append in error mode unless needed)
      childBlocks.forEach((childBlock) => {
        const extractedData = extractSpotlightContainerData(childBlock);
        const labeledData = labelSpotlightData(extractedData.spotlight, displayStyle);
        createSoloSpotlightDOM(labeledData, childBlock, spotlightItemLength);
      });
    } else {
      renderSpotlightItems(childBlocks, displayStyle, spotlightItemLength, section);
    }

  // ---- Case 3: solo-cookie-based + live mode ----
  } else if (displayStyle === 'solo-cookie-based') {
    const unSeenSpotLightData = findAndExtractFirstUnseenSpotlight(parentBlock, displayStyle);

    if (unSeenSpotLightData) {
      if (unSeenSpotLightData.nodeType === Node.ELEMENT_NODE) {
        section.appendChild(unSeenSpotLightData);
      } else {
        const spotlightContainer = createSoloSpotlightDOM(
          unSeenSpotLightData,
          parentBlock,
          spotlightItemLength,
        );
        section.appendChild(spotlightContainer);
      }
    }
  }

  block.textContent = '';
  block.appendChild(section);

  // Track all CTA buttons in the spotlight block
  const ctas = section.querySelectorAll('a[href]');
  ctas.forEach((cta) => {
    createDataLayerEvent('click', 'Spotlight:CTA', () => ({
      linkName: cta.textContent.trim(),
      linkType: 'cta',
      linkRegion: 'main',
      componentName: 'Solo Spotlight',
      componentId: 'solo-spotlight',
    }), cta);
  });
}
