/* global WebImporter */
import { getRawHTMLDOM, hasGlobalElement } from '../utils/dom-utils.js';
import { cleanUpSrcUrl } from '../utils/image-utils.js';
import { removeCfm } from '../utils/link-utils.js';



function buildImageElement({ imgSrc, imgAlt }) {

  const wrapperDiv = document.createElement('div');
  const picture = document.createElement('picture');
  if (!imgSrc) return wrapperDiv; // return empty div if no image

  const img = document.createElement('img');
  img.setAttribute('src', imgSrc);
  img.setAttribute('alt', imgAlt || '');
  picture.append(img);
   wrapperDiv.append(picture);

  return wrapperDiv;
}

// --- Build CTA element ---
function buildCtaElement({ ctaEl, titleName }) {
  let ctaElement = '';
  let ctaTextElement = '';
  let ctaText = '';
  let ctaUrl = '';

  if (ctaEl) {
    ctaText = ctaEl.textContent.trim();
    ctaUrl = removeCfm(ctaEl.getAttribute('href')) || '';

    const leftDiv = document.createElement('div');
    const p = document.createElement('p');
    p.className = 'promo-cta';

    const a = document.createElement('a');
    a.textContent = ctaText;
    a.setAttribute('href', ctaUrl);
    a.setAttribute('title', titleName);
    a.setAttribute('aria-label', `Read more about ${titleName}`);
    a.className = 'btn btn-colorbg';

    p.append(a);
    leftDiv.append(p);

    // This is the visible CTA element
    ctaElement = leftDiv;

    // Optional: just text version if needed
    const pText = document.createElement('p');
    pText.textContent = ctaText;
    ctaTextElement = pText;
  }

  return { ctaElement, ctaTextElement, ctaText, ctaUrl };
}

const singleImageQuote = (main, document, params) => {
  const section = main.querySelector('section.single-image-feature-container');
  if (!section) return;

  const htmlString = params?.html || '';
  const mainBody = getRawHTMLDOM(htmlString);
  const featureSection = mainBody.querySelector('section.single-image-feature-container');
  const { originalURL } = params || {};

  // --- isGlobal ---
  const isGlobal = hasGlobalElement(featureSection) ? 'true' : 'false';

  // --- Variation ---
  let variation = '';
  if (section.classList.contains('single-image-feature-container')) {
    variation = 'var-single-image';
  }

  // --- Background image ---
  const bgStyle = section.getAttribute('style') || '';
  const bgMatch = bgStyle.match(/url\(['"]?([^'"]+)['"]?\)/i);
  const imgSrc = bgMatch ? cleanUpSrcUrl(bgMatch[1], originalURL) : '';
  const imgAlt = section.querySelector('img')?.getAttribute('alt') || '';
  const quoteImgElement = buildImageElement({ imgSrc, imgAlt });

  // --- Texts ---
  const title = section.querySelector('h2')?.textContent.trim() || '';
  const subtitle = section.querySelector('h3')?.textContent.trim() || '';
  const summary = section.querySelector('p')?.textContent.trim() || '';

  // --- CTA ---
  const ctaEl = section.querySelector('.button-container a');
  let ctaElement1, ctaTextElement1, ctaText1 = '', ctaUrl1 = '';
  if (ctaEl) {
    ({
      ctaElement: ctaElement1,
      ctaTextElement: ctaTextElement1,
      ctaText: ctaText1,
      ctaUrl: ctaUrl1
    } = buildCtaElement({ ctaEl, titleName: title }));
  }

  // --- Photo Credit ---
  const photoCredit = section.querySelector('.info-box')?.textContent.trim() || '';

  // --- Gradient color ---
  let gradientColor = '';
  if (section.classList.contains('purple-translucent')) {
    gradientColor = 'grad-purple';
  } else if (section.classList.contains('green-translucent')) {
    gradientColor = 'grad-green';
  }

  // --- Build cells for WebImporter ---
  //[isGlobal,quote_variation,quote_image,quote_imageAlt,photoCredit,quote_quoteTxt,quote_quotee,subtitle,summary,quote_textAlignment,quote_gradientColor,quote_btnContainer]
  const cells = [
    ['Single Image | Quote'], // must match model id
                    [isGlobal],
                    [variation],
                    [quoteImgElement],
                    [photoCredit],
                    [title],
                    [subtitle],
                    [summary],
                    [gradientColor],
                    [ctaTextElement1 || '', ctaElement1 || null],
  ];


/*cells.push([
                 isGlobal,
                 variation,
                 quoteImgElement,
                 photoCredit,
                 title,
                 '',
                 subtitle,
                 summary,
                 gradientColor,
                 [ctaTextElement1 || '', ctaElement1 || null]
               ])*/
  const block = WebImporter.DOMUtils.createTable(cells, document);
  section.replaceWith(block);
};

export default singleImageQuote;
