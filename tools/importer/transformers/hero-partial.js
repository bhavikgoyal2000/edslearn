/* global WebImporter */
import { cleanUpSrcUrl, buildImageElement } from '../utils/image-utils.js';
import { hasGlobalElement, getRawHTMLDOM } from '../utils/dom-utils.js';
import { img } from './dom-builder.js';

const mkP = (text = '', fieldName) => {
  const div = document.createElement('div');
  if (fieldName) {
    const p = document.createElement('p');
    div.innerHTML = `<!-- field:${fieldName} -->`;
    if (text instanceof HTMLElement) {
      div.appendChild(text);
    } else {
      p.textContent = text;
      div.appendChild(p);
    }
  }
  return div;
};

const createPartialHero = (main, document, params) => {
  const { originalURL } = params;
  const htmlString = params.html;
  const mainBody = getRawHTMLDOM(htmlString);
  const heroSection = mainBody.querySelector('.hero-image.default-rh');
  const hero = main.querySelector('.hero-image.default-rh');

  if (!hero) return;

  // --- Global flag ---
  const isGlobal = hasGlobalElement(heroSection) ? 'true' : 'false';

  // --- Image handling ---
  const picImg = hero.querySelector(':scope > img, .hero-img-wrap img');
  let imgSrc = picImg?.src || '';
  let imgAlt = picImg?.alt || '';
  imgSrc = cleanUpSrcUrl(imgSrc, originalURL);

  const pictureEl = buildImageElement({ imgSrc, imgAlt });

  const firstDiv = document.createElement('div');
  firstDiv.append(mkP('var-partial-width-image', 'hero_variation'));
  firstDiv.append(mkP(pictureEl, 'hero_image'));

  // --- Text / message ---
  const heroMsgContainer = hero.querySelector('.message');
  const descriptionText =
    heroMsgContainer?.querySelector('.lede')?.textContent.trim() || '';
  firstDiv.append(mkP(descriptionText, 'hero_text'));

  // --- Background color ---
  const flexContext = hero.querySelector('.flex-context');
  const flexContentClasses = flexContext ? flexContext.classList : [];
  const bgColorDiv = document.createElement('div');

  if (flexContentClasses.contains('bg-intern-blue-color')) {
    bgColorDiv.textContent = 'bg-intern-blue-color';
  } else if (flexContentClasses.contains('bg-default-ombre-color')) {
    bgColorDiv.textContent = 'bg-default-ombre-color';
  } else {
    bgColorDiv.textContent = 'bg-district-gray';
  }
  firstDiv.append(mkP(bgColorDiv, 'hero_colorCode'));

  // --- Popout style ---
  const stylepTag = document.createElement('p');
  if (flexContentClasses.contains('flex-center')) {
    stylepTag.textContent = 'style-cross-fade';
  } else {
    stylepTag.textContent = 'style-default';
  }
  firstDiv.append(mkP(stylepTag, 'hero_popoutEffect'));

  // --- CTA handling ---
  const ctaLink =
    heroMsgContainer?.querySelector('.lede a, a.btn, a.button') || null;
  const ctaText = ctaLink?.textContent.trim() || '';
  const ctaHref = ctaLink?.href || '';

  firstDiv.append(mkP(ctaText, 'hero_btnCaption'));
  firstDiv.append(mkP(ctaHref, 'hero_btnLink'));

  let ctaType = 'button';
  if (ctaLink && ctaLink.classList.contains('btn-gradient')) {
    ctaType = 'link';
  }

  firstDiv.append(mkP(ctaType, 'hero_buttonVariation'));
  firstDiv.append(mkP('cta-bg-default-ombre-color', 'hero_ctaBackgroundColor'));

  // --- Title and subtitle ---
  let title = '';
  let subTitle = '';

  const titleHeader = hero.querySelector('.message header');
  if (titleHeader) {
    subTitle =
      titleHeader.querySelector('h1 > small')?.textContent.trim() || '';
    title = titleHeader.querySelector('h1')?.textContent.trim() || '';
  } else {
    // fallback: pull from lede or message text
    title =
      hero.querySelector('.message .lede')?.textContent.trim() ||
      hero.querySelector('.message')?.textContent.trim() ||
      '';
  }

  const secondDiv = document.createElement('div');
  const thirdDiv = document.createElement('div');
  const fourthDiv = document.createElement('div');

  secondDiv.append(mkP(title, 'title'));
  thirdDiv.append(mkP(subTitle, 'surtitle'));

  // --- Final table assembly ---
  const cells = [
    ['Hero'],
    [isGlobal],
    [firstDiv],
    [secondDiv],
    [thirdDiv],
    [fourthDiv],
  ];

  const block = WebImporter.DOMUtils.createTable(cells, document);
  hero.replaceWith(block);
};

export default createPartialHero;
