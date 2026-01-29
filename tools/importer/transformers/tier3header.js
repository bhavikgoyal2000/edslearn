import { cleanUpSrcUrl } from '../utils/image-utils.js';
import { img } from './dom-builder.js';
import {hasGlobalElement, getRawHTMLDOM} from '../utils/dom-utils.js';

// Wrap a row's content in an inner <div> to match the requested DOM structure
const wrapRow = (document, children = [], fieldName) => {
  const inner = document.createElement('div');
  children.forEach((child) => {
    // Coerce non-nodes (e.g., strings) into <p> nodes to avoid appendChild errors
    let node = child;
    if (!child || typeof child !== 'object' || !('nodeType' in child)) {
      const p = document.createElement('p');
      p.textContent = child != null ? String(child) : '';
      node = p;
    }
    inner.innerHTML = `<!-- field:${fieldName} -->`;
    inner.appendChild(node);
  });
  return inner;
};

function getSchoolCode(url) {
  try {
    const pathParts = new URL(url).pathname.split('/').filter(Boolean);
    return pathParts.length > 0 ? pathParts[0].toLowerCase() : null;
  } catch (e) {
    console.error("Invalid URL:", url);
    return null;
  }
}

const tier3header = (main, document, params) => {
  const { originalURL } = params;

  const header = main.querySelector('header.tier-3');
  if (!header) return;

  const htmlString = params.html;
    const mainBody = getRawHTMLDOM(htmlString);
    const tier3headerSection = mainBody.querySelector('header.tier-3');
    const isGlobal = hasGlobalElement(tier3headerSection) ? 'true' : 'false';

  // Cells represent rows of the Franklin block table
  const cells = [];

  // Block name row (lowercase to match data-block-name="tier3header")
  cells.push(['Tier3Header']);
  cells.push([isGlobal]);

  // --- TITLE ---
  const title = header.querySelector('.t3-page-header > .child');
  if (title) {
    const p = document.createElement('p');
    p.textContent = title.textContent.trim();
    cells.push([wrapRow(document, [p],'tier3headerTitleField')]);
  }


  let breadCrumbSpanTags = header.querySelectorAll('.t3-page-header > span[itemprop="itemListElement"]');
  let isMarketingPage = false;
  if (breadCrumbSpanTags && breadCrumbSpanTags.length > 0) {
    isMarketingPage = true;
  }

  if (isMarketingPage) {
    let showBreadCrumbs = false;
    cells.push([wrapRow(document, [isMarketingPage],'isMarketingPage')]);
    cells.push([wrapRow(document, [showBreadCrumbs],'showBreadCrumbs')]);
  }

  const pTag = document.createElement('p');
  let chatCTAFound = false;
  let chatIndex = -1;
  let ctaLis = header.querySelectorAll('.tier-3-cta > li');

  for (const [index, li] of ctaLis.entries()) {
  const a = li.querySelector('a');

  if (a && a.classList.contains('alive-chat')) {
    let pageURL = params.pageUrl;
    let schoolCode = getSchoolCode(pageURL);

    if (schoolCode) {
      schoolCode = schoolCode.toUpperCase();
      pTag.textContent = schoolCode;
      chatCTAFound = true;
      chatIndex = index;
    }
  }

  
}


if (ctaLis.length > 1) {

for (const [index, li] of ctaLis.entries()) {
const a = li.querySelector('a');

if (index === chatIndex) {
  
  if (chatIndex === 0) {
    cells.push([wrapRow(document)]);
    cells.push([wrapRow(document)]);
  } else if (chatIndex === 1) {
    cells.push([wrapRow(document)]);
  }

  cells.push([wrapRow(document, [pTag], 'chatChannel')]);
continue;
}
if (index === 0) {
    cells.push([wrapRow(document, [a], 'cta1')]);
  } else if (index === 1) {
    cells.push([wrapRow(document, [a], 'cta2')]);
  }
}
} else {

  if (chatCTAFound) {
    cells.push([wrapRow(document)]);
    cells.push([wrapRow(document)]);
    cells.push([wrapRow(document, [pTag], 'chatChannel')]);
  }
}



  const block = WebImporter.DOMUtils.createTable(cells, document);
  header.replaceWith(block);
};

export default tier3header;
