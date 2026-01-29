import { cleanUpSrcUrl } from '../utils/image-utils.js';
import { removeCfm } from '../utils/link-utils.js';
import {hasGlobalElement, getRawHTMLDOM} from '../utils/dom-utils.js';
/* global WebImporter */

// --- Utility: Build CTA element ---
function buildCtaElement({ ctaEl, titleName }) {
  let ctaElement;
  let ctaTextElement;
  const wrapperDiv = document.createElement('div');

  let ctaText = '';
  let ctaUrl = '';

  if (ctaEl) {
    const isAnchorOnly = ctaEl.tagName?.toLowerCase() === 'a';
    const a = isAnchorOnly ? ctaEl.cloneNode(true) : ctaEl.querySelector('a')?.cloneNode(true);
    if (a) {
      ctaText = a.textContent.trim();
      ctaUrl = a ? a.getAttribute('href') : '';
      ctaUrl = removeCfm(ctaUrl);
      a.setAttribute('href', ctaUrl || '#');
      a.setAttribute('title', titleName || a.getAttribute('title') || '');
      a.setAttribute('aria-label', `Read more about ${titleName || a.textContent}`);
      a.className = a.className || 'btn btn-colorbg';

      if (isAnchorOnly) wrapperDiv.append(a);
      else {
        const p = document.createElement('p');
        p.className = 'promo-cta';
        p.append(a);
        wrapperDiv.append(p);
      }

      ctaElement = wrapperDiv;
      ctaTextElement = document.createElement('p');
      ctaTextElement.textContent = ctaText;
    }
  } else if (titleName) {
    const h2 = document.createElement('h2');
    h2.className = 'txt-embassy-blue-color';
    const a = document.createElement('a');
    a.setAttribute('href', '#');
    a.setAttribute('title', titleName);
    a.setAttribute('aria-label', `More about ${titleName}`);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    a.textContent = titleName;
    h2.append(a);
    ctaElement = h2;
    ctaTextElement = document.createTextNode('');
  }

  return { ctaElement, ctaTextElement, ctaText, ctaUrl };
}

// --- Utility: Build Image Element ---
function buildImageElement({ imgSrc, imgAlt }) {

  const wrapperDiv = document.createElement('div');
  if (!imgSrc) return wrapperDiv; // return empty div if no image

  const img = document.createElement('img');
  img.setAttribute('src', imgSrc);
  img.setAttribute('alt', imgAlt || '');
  wrapperDiv.append(img);

  return wrapperDiv;
}


// --- Main importer ---
const flexPromoWithImage = (main, document, params) => {
  // Select all promos, global and local
  const { originalURL } = params;
  const flexesContainer = main.querySelectorAll('div[data-element="Flex: Promo with Image (GLOBAL)"], .flex-promo-image');
  if (!flexesContainer) return;
  if (!flexesContainer.length) return;

  const htmlString = params.html;
  const mainBody = getRawHTMLDOM(htmlString);
  const flexPromoWithImageSection = mainBody.querySelectorAll('div[data-element="Flex: Promo with Image (GLOBAL)"], .flex-promo-image');

  flexesContainer.forEach((flex, index) => {
    //const isGlobal = !!flex.previousSibling?.textContent.includes('GLOBAL');
    const isGlobal = hasGlobalElement(flexPromoWithImageSection[index]) ? 'true' : 'false';
// --- Parent block ---
    let promoSize = flex.classList.contains('xl') ? 'xl' : '';
    // --- Block header ---

    const parentCells = [
      ['Flex Promo Image'],
      [isGlobal],
      [promoSize],
     // [isGlobal ? 'global' : 'local']
    ];

    // --- Title ---
    const titleEl = flex.querySelector('header h2');
    const title_name = titleEl ? titleEl.textContent.trim() : '';

    // --- Content ---
    const contentEl = flex.querySelector('.promo-content');
    const content = contentEl ? contentEl.innerHTML.trim() : '';

    // --- Image ---
    const imgEl = flex.querySelector('img');
    const imgSrcTemp = imgEl ? (imgEl.getAttribute('data-src') || imgEl.src) : '';
    const imgAlt = imgEl ? imgEl.alt || '' : '';
    const imgSrc = cleanUpSrcUrl(imgSrcTemp, originalURL);
// --- Example usage ---
const cardImgElement = buildImageElement({ imgSrc: imgSrc, imgAlt: imgAlt });


    // --- Image layout ---
    const imageLayout = flex.classList.contains('image-bottom') ? 'bottom' : 'top';

    // --- Determine variant ---
    let flexVariation = 'standard';
    let bgColor = '';
    let radio = '';

    if (flex.classList.contains('legacy')) {
      flexVariation = 'legacy';
      radio = 'cta_button'; // fallback, can be refined based on CTA presence
    } else {
      flexVariation = 'standard';
      if (flex.classList.contains('promo-blue')) bgColor = 'promo-blue';
      else if (flex.classList.contains('promo-grey')) bgColor = 'promo-grey';
      else if (flex.classList.contains('promo-ombre')) bgColor = 'promo-ombre';
    }

    // --- CTA handling ---
    const ctaEl = flex.querySelector('.promo-cta a, a');
    const { ctaElement, ctaTextElement, ctaText, ctaUrl } = buildCtaElement({ ctaEl, titleName: title_name });

    // --- First CTA ---
    const ctaEls = flex.querySelectorAll('.promo-cta a, a');
    let ctaElement1, ctaTextElement1, ctaText1 = '', ctaUrl1 = '';
    const ctaEl1 = ctaEls[0];
    if (ctaEl1) {
      ({ ctaElement: ctaElement1, ctaTextElement: ctaTextElement1, ctaText: ctaText1, ctaUrl: ctaUrl1 } = buildCtaElement({ ctaEl: ctaEl1, titleName: title_name }));

    }

    // --- Optional second CTA ---
    let ctaElement2, ctaTextElement2, cta2text = '', cta2url = '';
    const ctaEl2 = ctaEls[1];
    if (ctaEl2) {
      ({ ctaElement: ctaElement2, ctaTextElement: ctaTextElement2, ctaText: cta2text, ctaUrl: cta2url } = buildCtaElement({ ctaEl: ctaEl2, titleName: title_name }));

    }
  // --- Push all fields to match model ---
      parentCells.push([
        flexVariation,   // flexVariation
        bgColor,         // bgColor (standard only)
        radio,           // radio (legacy only)
        title_name,      // title_name
        content,         // content
        cardImgElement,   //img
        imageLayout,     // imageLayout
        [ctaTextElement1 || '', ctaElement1 || null],  // cta1url
        [ctaTextElement2 || '', ctaElement2 || '']  // cta2url
      ]);
    // --- Build table and replace ---
    const block = WebImporter.DOMUtils.createTable(parentCells, document);
    flex.replaceWith(block);
  });
};

export default flexPromoWithImage;
