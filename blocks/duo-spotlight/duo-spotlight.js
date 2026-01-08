import createDataLayerEvent from '../../scripts/analytics-util.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function createDuoMainContainer() {
  const section = document.createElement('section');
  section.className = 'section-spotlight duo';
  section.id = 'duo-spotlight';
  return section;
}

function createHeader(tagline) {
  const header = document.createElement('header');
  const h1 = document.createElement('h1');
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

function createCloseButtonContainer() {
  const closeButtonContainer = document.createElement('p');
  closeButtonContainer.className = 'pull-right';

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'close';
  closeButton.setAttribute('data-dismiss', 'collapse');
  closeButton.setAttribute('aria-label', 'Close');

  const closeIcon = document.createElement('span');
  closeIcon.className = 'ion-close';
  closeIcon.setAttribute('aria-hidden', 'true');

  closeButton.appendChild(closeIcon);
  closeButtonContainer.appendChild(closeButton);
  return closeButtonContainer;
}

function createDuoPanelCollapse(data, direction) {
  const panelCollapse = document.createElement('div');
  panelCollapse.id = `panel-${direction}-${data.cookieId}`;
  panelCollapse.className = 'panel-collapse collapse width';
  panelCollapse.setAttribute('aria-labelledby', `heading-${direction}-${data.cookieId}`);

  const panelBody = document.createElement('div');
  panelBody.className = 'panel-body';
  panelBody.appendChild(createCloseButtonContainer());

  const bylineH1 = document.createElement('h2');
  bylineH1.className = 'byline';
  bylineH1.textContent = data.header;

  const bylineSub1 = document.createElement('p');
  bylineSub1.className = 'byline-sub';
  bylineSub1.textContent = data.subheading1;

  const bylineSub2 = document.createElement('p');
  bylineSub2.className = 'byline-sub-b';
  bylineSub2.textContent = data.subheading2;

  const blockquote = document.createElement('blockquote');
  blockquote.className = '';
  blockquote.textContent = data.pull_quote;

  const storyTextDiv = document.createElement('div');
  storyTextDiv.className = 'story-text';
  storyTextDiv.innerHTML = data.story_text;

  panelBody.append(bylineH1, bylineSub1, bylineSub2, blockquote, storyTextDiv);
  panelCollapse.appendChild(panelBody);
  return panelCollapse;
}

function createDuoImagePanelHeading(contentData, cookieId, direction) {
  if (!contentData) return null;

  const panelHeading = document.createElement('header');
  panelHeading.className = 'panel-heading';
  panelHeading.id = `heading-${direction}-${cookieId}`;

  // Ombre bar
  const ombreBar = createOmbreBar();
  if (ombreBar) panelHeading.appendChild(ombreBar);

  const panelTitle = document.createElement('div');
  panelTitle.className = 'panel-title';

  const anchor = document.createElement('a');
  anchor.setAttribute('role', 'button');
  anchor.setAttribute('data-toggle', 'collapse');
  anchor.setAttribute('data-parent', `#spotlight-${cookieId}`);
  anchor.setAttribute('href', `#panel-${direction}-${cookieId}`);
  anchor.setAttribute('aria-expanded', 'true');
  anchor.setAttribute('aria-controls', `panel-${direction}-${cookieId}`);

  // Only append image if valid
  if (contentData.spotlight_image?.src) {
    const img = document.createElement('img');
    img.src = contentData.spotlight_image.src;
    img.alt = contentData.spotlight_image.alt || '';
    img.className = 'is-decorative';
    anchor.appendChild(img);
  }

  // Only build overlay if pull_quote or cta_text exists
  if (contentData.pull_quote || contentData.cta_text) {
    const photoOverlay = document.createElement('div');
    photoOverlay.className = 'photo-overlay';

    const verticalAlign = document.createElement('div');
    verticalAlign.className = 'vertical-align';

    if (contentData.pull_quote) {
      const quote = document.createElement('h1');
      quote.textContent = contentData.pull_quote;
      verticalAlign.appendChild(quote);
    }

    if (contentData.cta_text) {
      const button = document.createElement('button');
      button.className = 'btn btn-outline';
      button.setAttribute('tabindex', '-1');
      button.textContent = contentData.cta_text;
      verticalAlign.appendChild(button);
    }

    photoOverlay.appendChild(verticalAlign);
    anchor.appendChild(photoOverlay);
  }

  panelTitle.appendChild(anchor);
  panelHeading.appendChild(panelTitle);

  return panelHeading;
}

function createDuoSpotlightArticle(cookieId, contentData, direction) {
  const panel = document.createElement('article');
  panel.className = 'panel panel-default';
  panel.id = `article-${direction}-${cookieId}`;

  panel.appendChild(createDuoPanelCollapse(contentData, direction));
  panel.appendChild(createDuoImagePanelHeading(contentData, cookieId, direction));

  return panel;
}

function createDuoSpotlightDOM(data, childBlock, length, direction) {
  const spotlightContent = createDuoSpotlightArticle(data.cookieId, data, direction);
  if (window.top.location.href.includes('universal-editor')) {
    moveInstrumentation(childBlock, spotlightContent);
  }
  return spotlightContent;
}

function labelSpotlightData(dataArray, displayStyle = '') {
  return {
    spotlightVariation: displayStyle || '',
    cookieId: dataArray[0] || '',
    tagline: dataArray[1] || '',
    left: {
      cookieId: dataArray[0] || '',
      header: dataArray[2] || '',
      subheading1: dataArray[3] || '',
      subheading2: dataArray[4] || '',
      pull_quote: dataArray[5] || '',
      spotlight_image: dataArray[6] || null,
      story_text: dataArray[7] || '',
      cta_text: dataArray[8] || '',
    },
    right: {
      cookieId: dataArray[0] || '',
      header: dataArray[9] || '',
      subheading1: dataArray[10] || '',
      subheading2: dataArray[11] || '',
      pull_quote: dataArray[12] || '',
      spotlight_image: dataArray[13] || null,
      story_text: dataArray[14] || '',
      cta_text: dataArray[15] || '',
    },
  };
}

function extractSpotlightContainerData(containerElement) {
  const children = Array.from(containerElement.children);

  const spotlight = children.map((child, index) => {
    if (index === 7 || index === 14) {
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

function getCookieIdAndTagline(parentDiv) {
  if (!parentDiv) return null;

  const children = parentDiv.querySelectorAll('div');
  if (children.length < 2) return null;

  const cookieId = children[0].innerText.trim();
  const tagline = children[1].innerText.trim();

  return { cookieId, tagline };
}

function setupSpotlightToggle(container, cookieId) {
  if (!container || !cookieId) return;

  const leftArticle = container.querySelector(`#article-left-${cookieId}`);
  const rightArticle = container.querySelector(`#article-right-${cookieId}`);

  if (!leftArticle || !rightArticle) return;

  const leftImg = leftArticle.querySelector('img');
  const leftOverlay = leftArticle.querySelector('.photo-overlay');
  const leftClose = leftArticle.querySelector('button.close');

  const rightImg = rightArticle.querySelector('img');
  const rightOverlay = rightArticle.querySelector('.photo-overlay');
  const rightClose = rightArticle.querySelector('button.close');

  // LEFT overlay → hide right
  if (leftOverlay) {
    leftOverlay.addEventListener('click', (e) => {
      e.preventDefault();
      rightArticle.style.display = 'none';
      leftArticle.style.display = 'block';
    });
  }

  // LEFT img → show right
  if (leftImg) {
    leftImg.addEventListener('click', (e) => {
      e.preventDefault();
      rightArticle.style.display = 'block';
    });
  }

  // LEFT close → show right
  if (leftClose) {
    leftClose.addEventListener('click', (e) => {
      e.preventDefault();
      rightArticle.style.display = 'block';
    });
  }

  // RIGHT overlay → hide left
  if (rightOverlay) {
    rightOverlay.addEventListener('click', (e) => {
      e.preventDefault();
      leftArticle.style.display = 'none';
      rightArticle.style.display = 'block';
    });
  }

  // RIGHT img → show left
  if (rightImg) {
    rightImg.addEventListener('click', (e) => {
      e.preventDefault();
      leftArticle.style.display = 'block';
    });
  }

  // RIGHT close → show left
  if (rightClose) {
    rightClose.addEventListener('click', (e) => {
      e.preventDefault();
      leftArticle.style.display = 'block';
    });
  }
}

function initializeDuoSpotlightCarousel(section) {
  // Handle clicks on panel images/links
  section.querySelectorAll('.panel-title a').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();

      const panelId = link.getAttribute('href').replace('#', '');
      const panel = document.getElementById(panelId);
      const overlay = link.querySelector('.photo-overlay');

      if (panel) {
        if (panel.classList.contains('in', 'show')) {
          // Already open → close it
          panel.classList.remove('in', 'show');
          if (overlay) overlay.style.display = 'block';
        } else {
          // Close all other panels first (accordion behavior)
          section.querySelectorAll('.panel-collapse.collapse.width').forEach((p) => {
            p.classList.remove('in', 'show');
          });

          // Restore overlays of other panels
          section.querySelectorAll('.panel-title .photo-overlay').forEach((ov) => {
            ov.style.display = 'block';
          });

          // Open the clicked one
          panel.classList.add('in', 'show');
          if (overlay) overlay.style.display = 'none';
        }
      }
    });
  });
  // Handle clicks on close buttons
  section.querySelectorAll('.panel-collapse .close').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      const panel = event.target.closest('.panel-collapse');
      if (panel) {
        panel.classList.remove('in', 'show');

        // Find related overlay (from the header link with same aria-labelledby id)
        const headingId = panel.getAttribute('aria-labelledby');
        if (headingId) {
          const header = document.getElementById(headingId);
          if (header) {
            const overlay = header.querySelector('.photo-overlay');
            if (overlay) {
              overlay.style.display = 'block';
            }
          }
        }
      }
    });
  });
  // section.querySelectorAll('.panel-collapse .close').forEach(function (btn) {
  //   btn.addEventListener('click', function () {
  //     const panel = this.closest('.panel-collapse');
  //     if (panel) {
  //       panel.classList.remove('in', 'show');

  //       // Find related overlay (from the header link with same aria-labelledby id)
  //       const headingId = panel.getAttribute('aria-labelledby');
  //       if (headingId) {
  //         const header = document.getElementById(headingId);
  //         if (header) {
  //           const overlay = header.querySelector('.photo-overlay');
  //           if (overlay) {
  //             overlay.style.display = 'block';
  //           }
  //         }
  //       }
  //     }
  //   });
  // });
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

function getSeenItems(storageKey = 'SpolightSeen') {
  try {
    const seenItemsString = localStorage.getItem(storageKey);
    return seenItemsString ? JSON.parse(seenItemsString) : [];
  } catch (e) {
    return [];
  }
}

function saveSeenItems(items, storageKey = 'SpolightSeen') {
  localStorage.setItem(storageKey, JSON.stringify(items));
}

function resetSeenItemsIfAllSeen(allCookieIds, seenItems, storageKey = 'SpolightSeen') {
  const allSeen = allCookieIds.every((id) => seenItems.includes(id));
  if (allSeen) {
    const filtered = seenItems.filter((id) => !allCookieIds.includes(id));
    saveSeenItems(filtered, storageKey);
    return filtered;
  }
  return seenItems;
}

function mergeAndEncode(str1, str2, separator = '|') {
  const merged = `${str1}${separator}${str2}`;
  const base64 = btoa(new TextEncoder().encode(merged)
    .reduce((data, byte) => data + String.fromCharCode(byte), ''));

  // Convert to Base64URL (ID-safe)
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Process all items and set encoded string to replace original cookie ID
function setEncodedText(allItems) {
  allItems.forEach((parent) => {
    const data = getCookieIdAndTagline(parent);
    if (!data) return;

    const { cookieId, tagline } = data;
    const encoded = mergeAndEncode(cookieId, tagline);

    const firstP = parent.querySelector(':scope > div > p');
    if (firstP) {
      firstP.textContent = encoded; // replace with encoded text
    }
  });
}

function findAndExtractFirstUnseenSpotlight(parentBlock, displayStyle) {
  const allItems = parentBlock.slice(1);
  if (allItems.length === 0) return null;

  // set the cookie IDs and taglines as encoded text to replace the original cookie IDs
  setEncodedText(allItems);

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

function initializeSpotlight(
  leftSpotlightContainer,
  rightSpotlightContainer,
  panelGroup,
  cookieId,
) {
  initializeDuoSpotlightCarousel(leftSpotlightContainer);
  initializeDuoSpotlightCarousel(rightSpotlightContainer);
  setupSpotlightToggle(panelGroup, cookieId);
}

export default function decorate(block) {
  const parentBlock = Array.from(block.children).slice(1);
  const firstBlock = parentBlock[0];
  const firstExtractedData = extractSpotlightContainerData(firstBlock);
  const displayStyle = firstExtractedData.spotlight[0] || '';
  const spotlightItemLength = parentBlock.length - 1;

  const section = document.createElement('div');
  section.className = 'spotlight-wrapper';

  if (displayStyle === 'duo-static' || (displayStyle === 'duo-cookie-based' && window.top.location.href.includes('universal-editor'))) {
    block.textContent = '';
    parentBlock.slice(1).forEach((childBlock, index) => {
      const extractedData = extractSpotlightContainerData(childBlock);
      const labeledData = labelSpotlightData(extractedData.spotlight, displayStyle);

      const result = getCookieIdAndTagline(parentBlock[index + 1]);
      result.cookieId = mergeAndEncode(result.cookieId, labeledData.tagline);
      labeledData.cookieId = result.cookieId;
      labeledData.left.cookieId = result.cookieId;
      labeledData.right.cookieId = result.cookieId;

      const container = createDuoMainContainer();
      const rowElement = document.createElement('div');
      rowElement.className = 'row row-center';

      const sectionDiv = document.createElement('div');
      sectionDiv.className = 'col-xs-12 spotlight-container no-bs-padding clearfix';
      rowElement.appendChild(sectionDiv);
      container.appendChild(rowElement);

      sectionDiv.appendChild(createHeader(result.tagline));

      const panelGroup = document.createElement('div');
      panelGroup.className = 'panel-group duo';
      panelGroup.id = `duo-spotlight-${result.cookieId}`;
      sectionDiv.appendChild(panelGroup);

      const leftSpotlightContainer = createDuoSpotlightDOM(labeledData.left, childBlock, spotlightItemLength, 'left');
      const rightSpotlightContainer = createDuoSpotlightDOM(labeledData.right, childBlock, spotlightItemLength, 'right');
      panelGroup.appendChild(leftSpotlightContainer);
      panelGroup.appendChild(rightSpotlightContainer);

      initializeSpotlight(
        leftSpotlightContainer,
        rightSpotlightContainer,
        panelGroup,
        result.cookieId,
      );
      sectionDiv.appendChild(panelGroup);
      section.appendChild(container);
    });
  } else if (displayStyle === 'duo-cookie-based') {
    block.textContent = '';
    const unSeenSpotlightData = findAndExtractFirstUnseenSpotlight(parentBlock, displayStyle);

    const container = createDuoMainContainer();
    const rowElement = document.createElement('div');
    rowElement.className = 'row row-center';

    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'col-xs-12 spotlight-container no-bs-padding clearfix';
    rowElement.appendChild(sectionDiv);
    container.appendChild(rowElement);

    sectionDiv.appendChild(createHeader(unSeenSpotlightData.tagline));

    const panelGroup = document.createElement('div');
    panelGroup.className = 'panel-group duo';
    panelGroup.id = `duo-spotlight-${unSeenSpotlightData.cookieId}`;
    sectionDiv.appendChild(panelGroup);

    const leftSpotlightContainer = createDuoSpotlightDOM(unSeenSpotlightData.left, sectionDiv, spotlightItemLength, 'left');
    const rightSpotlightContainer = createDuoSpotlightDOM(unSeenSpotlightData.right, sectionDiv, spotlightItemLength, 'right');
    panelGroup.appendChild(leftSpotlightContainer);
    panelGroup.appendChild(rightSpotlightContainer);

    initializeSpotlight(
      leftSpotlightContainer,
      rightSpotlightContainer,
      panelGroup,
      unSeenSpotlightData.cookieId,
    );
    sectionDiv.appendChild(panelGroup);
    section.appendChild(container);
  }
  block.appendChild(section);

  // Track all CTA buttons in the spotlight block
  const ctas = section.querySelectorAll('a[href]');
  ctas.forEach((cta) => {
    createDataLayerEvent('click', 'Spotlight:CTA', () => ({
      linkName: cta.textContent.trim(),
      linkType: 'cta',
      linkRegion: 'main',
      componentName: 'Duo Spotlight',
      componentId: 'duo-spotlight',
    }), cta);
  });
}
